<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import type { ISealOptions } from '@e4a/pg-wasm'

    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import yiviLogoDark from '$lib/assets/images/non-free/yivi-logo-dark.svg'
    import { EncryptionState, type EncryptState, Lang } from '$lib/types/filesharing/attributes'
    import { RetrieveSignKeys } from '$lib/yivi-tools'
    import Chunker, { withTransform } from '$lib/filesharing/utils'
    import { createFileReadable, getFileStoreStream } from '$lib/filesharing/FileProvider'
    import { browser } from '$app/environment'
    import { isMobile } from '$lib/browser-detect'
    import YiviQRCode from './YiviQRCode.svelte'

    let Writer: Promise<any>
    if (browser) {
        Writer = import('@transcend-io/conflux')
    } else {
        Writer = Promise.resolve(null)
    }

    interface props {
        EncryptState: EncryptState;
    }

    let { EncryptState = $bindable() }: props = $props()

    let isMobileDevice = isMobile()

    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE
    let UPLOAD_CHUNK_SIZE = import.meta.env.VITE_UPLOAD_CHUNK_SIZE
    let SMOOTH_TIME = 2

    let canEncrypt = $derived(() => {
        if (EncryptState.files.length === 0 || EncryptState.recipients.length === 0) return false

        const totalSize = EncryptState.files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0)

        if (totalSize >= MAX_UPLOAD_SIZE) return false

        const regex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        if (EncryptState.recipients.length <= 0) return false

        const addressesValid =
            EncryptState.recipients.every(({ email }) => regex.test(email))
        if (!addressesValid) return false


        const optionalsFilled =
            EncryptState.recipients.every(({ extra }) =>
                extra.every((att) => att.v && att.v.length > 0),
            )
        if (!optionalsFilled) return false

        return true
    })

    async function onSign(): Promise<void> {
        if (!canEncrypt) return
        EncryptState.encryptionState = EncryptionState.Sign

        try {
            const pubSignId = [
                { t: 'pbdf.sidn-pbdf.email.email' },
            ]

            const keys = await RetrieveSignKeys(
                pubSignId,
                EncryptState.senderAttributes,
            )

            if (!keys || !keys.pubSignKey) {
                console.error('Failed to retrieve sign keys')
                EncryptState.encryptionState = EncryptionState.Error
                return
            }

            if (keys.privSignKey) EncryptState.privSignKey = keys.privSignKey

            EncryptState.pubSignKey = keys.pubSignKey

            await onEncrypt()
        } catch (e) {
            console.error('Error occurred during signing: ', e)
            EncryptState.encryptionState = EncryptionState.Error
        }
    }

    async function onEncrypt() {
        // TODO: Simplify this error handling logic.
        // For some reason stream errors are not caught
        // Which means when the user aborts
        // exceptions spill into the console...

        EncryptState.encryptionState = EncryptionState.Encrypting
        EncryptState.encryptStartTime = Date.now()

        try {
            await applyEncryption()
            EncryptState.encryptionState = EncryptionState.Done
            EncryptState.selfAborted = false
        } catch (e) {
            console.error('Error occured during encryption: ', e)
            if (EncryptState.selfAborted === false) {
                EncryptState.encryptionState = EncryptionState.Error
            } else {
                EncryptState.percentages = EncryptState.files.map(() => 0)
                EncryptState.done = EncryptState.files.map(() => false)
                EncryptState.encryptionState = EncryptionState.FileSelection
                EncryptState.selfAborted = false
                EncryptState.encryptStartTime = 0
            }
        }
    }

    async function applyEncryption() {
        if (!canEncrypt) return

        // make sure these are fulfilled
        const pk = await EncryptState.pkPromise
        const { sealStream } = await EncryptState.modPromise

        const ts = Math.round(Date.now() / 1000)
        const enc_policy = {}

        EncryptState.recipients.forEach(({ email, extra }) => {
            enc_policy[email] = {
                ts,
                con: [{ t: 'pbdf.sidn-pbdf.email.email', v: email }, ...extra],
            }
        })

        // also encrypt for the sender
        if (EncryptState.senderConfirm)
            enc_policy[EncryptState.sender] = {
                ts,
                con: [
                    { t: 'pbdf.sidn-pbdf.email.email', v: EncryptState.sender },
                    ...EncryptState.senderAttributes,
                ],
            }

        if (!EncryptState.pubSignKey) {
            EncryptState.encryptionState = EncryptionState.Error
            return
        }

        const options: ISealOptions = {
            policy: enc_policy,
            pubSignKey: EncryptState.pubSignKey,
            ...(EncryptState.privSignKey && { privSignKey: EncryptState.privSignKey }),
        }

        const uploadChunker = new Chunker(UPLOAD_CHUNK_SIZE)


        // extremely jank way import the Conflux module and instantiate its Writer export because SSR is sometimes annoying
        const ConfluxModule = await Writer
        const { Writer: ConfluxWriter } = ConfluxModule ?? {}
        if (!ConfluxWriter) {
            throw new Error('Conflux Writer is not available')
        }
        // Create streams that takes all input files and zips them into an output stream.

        const zipTf = new ConfluxWriter()
        const readable = zipTf.readable as ReadableStream
        const writeable = zipTf.writable

        const writer = writeable.getWriter()

        EncryptState.files.forEach((f) => {
            const s = createFileReadable(f)

            writer.write({
                name: f.name,
                lastModified: f.lastModified,
                stream: () => s,
            })
        })

        writer.close()

        let selectedLang: String = localStorage.getItem('preferredLanguage') ?? 'en-US'
        const lang: Lang = (selectedLang === 'nl-NL') ? Lang.NL : Lang.EN

        // This is not 100% accurate due to zip and irmaseal
        // header but it's close enough for the UI.
        const finished = new Promise<void>(async (resolve, reject) => {
            try {
                const [fileStream, sender] = getFileStoreStream(
                    EncryptState.abort,
                    EncryptState.sender,
                    EncryptState.senderConfirm,
                    EncryptState.recipients.map(({ email }) => email).join(', '),
                    EncryptState.message,
                    lang,
                    (n, last) => reportProgress(resolve, n, last),
                )

                EncryptState.sender = sender

                await sealStream(
                    pk,
                    options,
                    readable,
                    withTransform(fileStream, uploadChunker, EncryptState.abort.signal),
                )
            } catch (err) {
                reject(err)
            }
        })

        await finished
    }

    function reportProgress(resolve: () => void, uploaded: number, done: boolean) {
        let offset = 0
        let percentages = EncryptState.percentages.map((p) => p)
        let timeouts: (number | undefined)[] = EncryptState.percentages.map(
            (_) => undefined,
        )

        EncryptState.files.forEach((f, i) => {
            const startFile = offset
            const endFile = offset + f.size
            if (uploaded < startFile) {
                percentages[i] = 0
            } else if (uploaded >= endFile) {
                // We update to done after some time
                // To allow smoothing of progress.
                if (timeouts[i] === undefined) {
                    timeouts[i] = window.setTimeout(() => {
                        const dones = EncryptState.done.map((d) => d)
                        dones[i] = true
                        EncryptState.done = dones
                    }, 1000 * SMOOTH_TIME)
                }
                percentages[i] = 100
            } else {
                const uploadedOfFile = (uploaded - startFile) / f.size
                percentages[i] = Math.round(100 * uploadedOfFile)
            }

            offset = endFile
        })

        EncryptState.percentages = percentages

        if (done) {
            window.setTimeout(() => resolve(), 1000 * SMOOTH_TIME)
        }
    }

    let lang = $state('nl')
    if (browser) {
        lang = (localStorage.getItem('preferredLanguage') ?? 'nl-NL').substring(0, 2)
    }

    let yiviInfoExpanded = $state(false)
    let buttonRef: HTMLButtonElement | null = $state(null)
</script>
<div class="button-container">
    {#if EncryptState.encryptionState === EncryptionState.Encrypting}
        <!-- Loading info box during upload -->
        {@const totalProgress = EncryptState.percentages.length > 0
            ? Math.round(EncryptState.percentages.reduce((a, b) => a + b, 0) / EncryptState.percentages.length)
            : 0}
        <div class="upload-info-box">
            <div class="progress-bar" class:complete={totalProgress >= 100} style="width: {totalProgress >= 100 ? '100%' : totalProgress + '%'}"></div>
            <div class="upload-info-content">
                <svg class="spinner" viewBox="0 0 24 24" width="24" height="24">
                    <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
                </svg>
                {$_('filesharing.encryptPanel.sending')}
            </div>
        </div>
    {:else}
        <!-- Normal button -->
        <button
            bind:this={buttonRef}
            class="crypt-btn-main crypt-btn yivi-btn-logo {canEncrypt() ? '' : ' crypt-btn-disabled'}"
            onclick={onSign}
            disabled={!canEncrypt()}
        >
            <img src={canEncrypt() ? yiviLogoDark : yiviLogo} alt="yivi-logo" width={50} height={27} />
            {$_('filesharing.encryptPanel.encryptSend')}
        </button>
    {/if}

    <p class="yivi-tip">
        {$_('filesharing.encryptPanel.yiviTip')}
    </p>

    <button class="yivi-info-toggle" type="button" onclick={() => yiviInfoExpanded = !yiviInfoExpanded}>
        <span class="arrow" class:expanded={yiviInfoExpanded}>▶</span>
        <span class="toggle-label">{$_('filesharing.encryptPanel.yiviInfo')}</span>
    </button>
    {#if yiviInfoExpanded}
        <p class="yivi-info-content">
            {$_('filesharing.encryptPanel.yiviInfoText')}
            <a href={"https://yivi.app/" + lang} target="_blank" class="yivi-link">
                {$_('filesharing.encryptPanel.yiviInfoLink')}
            </a>
        </p>
    {/if}

    <!-- Desktop Yivi popup above the button -->
    {#if !isMobileDevice && EncryptState.encryptionState === EncryptionState.Sign && buttonRef}
        <div class="desktop-backdrop" onclick={() => {EncryptState.encryptionState = EncryptionState.FileSelection}}></div>
        <div
            class="desktop-yivi-popup"
            style="
                left: {buttonRef.getBoundingClientRect().left + buttonRef.offsetWidth / 2}px;
                top: {buttonRef.getBoundingClientRect().top - 15}px;
            "
        >
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="popup-title">{$_('filesharing.encryptPanel.encryptSend')}</h2>
                    <button
                        class="close-btn"
                        onclick={() => {EncryptState.encryptionState = EncryptionState.FileSelection}}
                    >
                        ✕ {$_('filesharing.sign.close')}
                    </button>
                </div>

                <p class="popup-instruction">{$_('filesharing.sign.scanQR')}</p>

                <div class="qr-code-wrapper">
                    <YiviQRCode />
                </div>
            </div>
            <div class="popup-arrow"></div>
        </div>
    {/if}
</div>
<style lang="scss">
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-left: 1.25em;
    position: relative;
  }

  .crypt-btn-main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75em;
    padding: 0.5em 1.5em;
    width: fit-content;
    text-wrap: nowrap;
    font-size: 1.05em;
    font-weight: 600;
    border-radius: var(--pg-border-radius-sm);
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    transition: all 0.2s ease;
    margin-bottom: 0.75em;
  }

  .crypt-btn-main:hover:not(.crypt-btn-disabled):not(:disabled) {
    background: linear-gradient(135deg, #5a6578 0%, #3d4758 100%) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
    transform: translateY(-1px);
  }

  .crypt-btn-main:disabled,
  .crypt-btn-main.crypt-btn-disabled {
    background: #e8e8e8 !important;
    color: #9ca3af !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    opacity: 0.6;
  }

  .crypt-btn-main:disabled img,
  .crypt-btn-main.crypt-btn-disabled img {
    opacity: 0.5;
  }

  .upload-info-box {
    position: relative;
    width: 100%;
    border-radius: var(--pg-border-radius-sm);
    background: #cbe1f4;
    margin-bottom: 0.75em;
    box-sizing: border-box;
    overflow: hidden;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: #2579b8;
    transition: width 0.3s ease;
  }

  .upload-info-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75em;
    padding: 1em 1em;
    font-size: 1em;
    font-weight: 400;
    font-family: var(--pg-font-family);
    color: #000;
    z-index: 1;
  }

  .upload-info-box .spinner-circle {
    stroke: #000;
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5em;
  }

  .spinner-circle {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 60;
    }
    50% {
      stroke-dashoffset: 15;
    }
    100% {
      stroke-dashoffset: 60;
    }
  }

  .yivi-info-toggle {
    all: unset;
    display: flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    margin-top: 0.5em;
    user-select: none;
    background: transparent;
  }

  .arrow {
    font-size: 0.7em;
    color: var(--pg-text-secondary);
    transition: transform 0.2s ease;
    display: inline-block;
  }

  .arrow.expanded {
    transform: rotate(90deg);
  }

  .toggle-label {
    font-size: 0.9em;
    color: var(--pg-text-secondary);
    font-weight: 600;
    font-family: var(--pg-font-family);
  }

  .yivi-info-content {
    font-size: 0.85em;
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    padding: 0 0 1em 1.5em;
    line-height: 1.4;
  }

  .yivi-link {
    color: #3095de !important;
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  .yivi-link:hover {
    color: #1e7ac7 !important;
  }

  .yivi-tip {
    font-size: 0.85em;
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    margin: 0;
    line-height: 1.4;
  }

  /* Desktop Yivi popup styles */
  .desktop-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(48, 149, 150, 0.10);
    z-index: 999;
    cursor: pointer;
  }

  .desktop-yivi-popup {
    --qr-size: 230px;
    --qr-container-size: calc(var(--qr-size) / 0.96);
    --popup-width: calc(var(--qr-container-size) );

    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--pg-strong-background);
    border-radius: var(--pg-border-radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 1em 1.5em 1.5em 1.5em;
    width: var(--popup-width);
    z-index: 10000;
  }

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5em;
  }

  .popup-title {
    font-size: 0.85em;
    font-weight: bold;
    margin: 0;
    text-align: left;
    color: var(--pg-text-primary, #000);
    font-family: var(--pg-font-family);
    flex: 1;
  }

  .popup-instruction {
    font-size: 0.75em;
    margin: 0 0 0.5em 0;
    text-align: left;
    color: var(--pg-text-secondary, #333);
    font-family: var(--pg-font-family);
    width: 100%;
  }

  .qr-code-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .close-btn {
    background: white;
    border: 1px solid #000;
    border-radius: var(--pg-border-radius-sm);
    padding: 0.25em 0.5em;
    cursor: pointer;
    font-size: 0.75em;
    font-family: var(--pg-font-family);
    color: #000;
    font-weight: 500;
    transition: all 0.2s ease;
    line-height: 1;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: #f5f5f5;
  }

  .popup-arrow {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid var(--pg-strong-background);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
</style>
