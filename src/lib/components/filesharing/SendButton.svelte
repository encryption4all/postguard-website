<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import type { ISealOptions } from '@e4a/pg-wasm'

    import yiviLogoDark from '$lib/assets/images/non-free/yivi-logo-dark.svg'
    import { EncryptionState, type EncryptState, Lang } from '$lib/types/filesharing/attributes'
    import { RetrieveSignKeys } from '$lib/yivi-tools'
    import Chunker, { withTransform } from '$lib/filesharing/utils'
    import { createFileReadable, getFileStoreStream } from '$lib/filesharing/FileProvider'
    import { browser } from '$app/environment'
    import { isMobile } from '$lib/browser-detect'
    import YiviQRCode from './YiviQRCode.svelte'
    import HelpToggle from '../HelpToggle.svelte'
    import Chip from '../Chip.svelte'

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
    let mobilePopupMode: 'none' | 'direct' | 'qr' = $state('none')
    let showValidationModal = $state(false)
    let validationErrors: string[] = $state([])

    import { MAX_UPLOAD_SIZE, UPLOAD_CHUNK_SIZE } from '$lib/env'
    let SMOOTH_TIME = 2

    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    let canEncrypt = $derived(() => {
        if (EncryptState.files.length === 0) return false
        const totalSize = EncryptState.files.reduce((a, f) => a + f.size, 0)
        if (totalSize >= MAX_UPLOAD_SIZE) return false
        if (!EncryptState.recipients.every(({ email }) => emailRegex.test(email))) return false
        if (!EncryptState.recipients.every(({ extra }) => extra.every((att) => att.v && att.v.length > 0))) return false
        return true
    })

    function getValidationErrors(): string[] {
        const errors: string[] = []
        if (EncryptState.files.length === 0) {
            errors.push($_('filesharing.encryptPanel.validation.noFiles'))
        }
        const totalSize = EncryptState.files.reduce((a, f) => a + f.size, 0)
        if (totalSize >= MAX_UPLOAD_SIZE) {
            errors.push($_('filesharing.encryptPanel.validation.filesTooLarge', {
                values: { max: (MAX_UPLOAD_SIZE / (1024 ** 3)).toFixed(0) }
            }))
        }
        EncryptState.recipients.forEach(({ email, extra }) => {
            if (!email || email.trim() === '') {
                errors.push($_('filesharing.encryptPanel.validation.noEmail'))
            } else if (!emailRegex.test(email)) {
                errors.push($_('filesharing.encryptPanel.validation.invalidEmail', { values: { email } }))
            } else {
                extra.forEach(({ t, v }) => {
                    if (!v || v.length === 0) {
                        const attrName = $_(`filesharing.attributes.${t}`)
                        errors.push($_('filesharing.encryptPanel.validation.missingAttribute', { values: { attribute: attrName, email } }))
                    }
                })
            }
        })
        return errors
    }

    async function onSign(): Promise<void> {
        const errors = getValidationErrors()
        if (errors.length > 0) {
            validationErrors = errors
            showValidationModal = true
            return
        }
        if (isMobileDevice && mobilePopupMode === 'none') {
            mobilePopupMode = 'direct'
        }
        await startSigning()
    }

    async function startSigning(): Promise<void> {
        EncryptState.encryptionState = EncryptionState.Sign

        try {
            const pubSignId = [
                { t: 'pbdf.sidn-pbdf.email.email' },
            ]

            const keys = await RetrieveSignKeys(
                pubSignId,
                EncryptState.senderAttributes
            )

            if (!keys || !keys.pubSignKey) {
                console.error('Failed to retrieve sign keys')
                EncryptState.encryptionState = EncryptionState.Error
                return
            }

            if (keys.privSignKey) EncryptState.privSignKey = keys.privSignKey

            EncryptState.pubSignKey = keys.pubSignKey

            await onEncrypt()
            mobilePopupMode = 'none'
        } catch (e) {
            console.error('Error occurred during signing: ', e)
            EncryptState.encryptionState = EncryptionState.Error
            mobilePopupMode = 'none'
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
        if (!canEncrypt()) return

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
            class="primary-btn"
            style="--primary-btn-padding: 0.8rem 1.5rem"
            onclick={onSign}
        >
            <img src={yiviLogoDark} alt="yivi-logo" width={50} height={27} />
            {$_('filesharing.encryptPanel.encryptSend')}
        </button>

        <!-- Mobile: Always show QR option when button is enabled -->
        {#if isMobileDevice && canEncrypt()}
            <Chip
                text={$_('filesharing.sign.signOtherDevice')}
                onclick={() => {
                    mobilePopupMode = 'qr'
                    onSign()
                }}
                size="md"
                variant="default"
            />
        {/if}
    {/if}

    <p class="yivi-tip">
        {$_('filesharing.encryptPanel.yiviTip')}
    </p>


    <HelpToggle
        title={$_('filesharing.encryptPanel.yiviInfo')}
        content={$_('filesharing.encryptPanel.yiviInfoText')}
        linkText={$_('filesharing.encryptPanel.yiviInfoLink')}
        linkUrl="https://yivi.app"
        bordered
    />

    <!-- Desktop Yivi popup above the button -->
    {#if !isMobileDevice && EncryptState.encryptionState === EncryptionState.Sign && buttonRef}
        <div class="desktop-backdrop" onclick={() => {
            EncryptState.encryptionState = EncryptionState.FileSelection
        }}></div>
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
                    <Chip
                        text={$_('filesharing.sign.close')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                        }}
                        icon="×"
                        size="md"
                        variant="default"
                    />
                </div>

                <p class="popup-instruction">{$_('filesharing.sign.scanQR')}</p>

                <div class="qr-code-wrapper">
                    <YiviQRCode />
                </div>
            </div>
            <div class="popup-arrow"></div>
        </div>
    {/if}

    <!-- Mobile bottom sheet -->
    {#if isMobileDevice && mobilePopupMode !== 'none' && EncryptState.encryptionState === EncryptionState.Sign}
        <div class="mobile-backdrop" onclick={() => {
            EncryptState.encryptionState = EncryptionState.FileSelection
            mobilePopupMode = 'none'
        }}></div>
        <div class="mobile-bottom-sheet">
            <div class="bottom-sheet-content">
                {#if mobilePopupMode === 'qr'}
                    <h2 class="bottom-sheet-title">{$_('filesharing.encryptPanel.encryptSend')}</h2>
                    <p class="bottom-sheet-instruction">{$_('filesharing.sign.scanQR')}</p>
                    <div class="qr-code-wrapper"><YiviQRCode /></div>
                    <Chip
                        text={$_('filesharing.sign.close')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                            mobilePopupMode = 'none'
                        }}
                        icon="×"
                        size="md"
                        variant="dark"
                    />
                {:else}
                    <p class="bottom-sheet-instruction">{$_('filesharing.sign.followSteps')}</p>
                    <div style="display: none;"><YiviQRCode mode="deeplink" /></div>
                    <Chip
                        text={$_('filesharing.sign.cancel')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                            mobilePopupMode = 'none'
                        }}
                        icon="×"
                        size="md"
                        variant="dark"
                    />
                {/if}
            </div>
        </div>
    {/if}
</div>

{#if showValidationModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="validation-backdrop" role="button" tabindex="-1" onclick={() => showValidationModal = false}></div>
    <div class="validation-modal" role="dialog" aria-modal="true">
        <h2 class="validation-title">{$_('filesharing.encryptPanel.validation.title')}</h2>
        <ul class="validation-errors">
            {#each validationErrors as error}
                <li>{error}</li>
            {/each}
        </ul>
        <button class="primary-btn" onclick={() => showValidationModal = false}>
            {$_('filesharing.encryptPanel.validation.continueButton')}
        </button>
    </div>
{/if}

<style lang="scss">
  @import "$lib/components/primaryButton.css";

  /* Fade the Yivi logo when the button is disabled */
  .primary-btn:disabled img {
    opacity: 0.5;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-left: 1.25rem;
    position: relative;
  }

  .upload-info-box {
    position: relative;
    width: 100%;
    border-radius: var(--pg-border-radius-sm);
    background: var(--pg-strong-background);
    margin-bottom: 0.75rem;
    box-sizing: border-box;
    overflow: hidden;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: var(--pg-primary-contrast);
    transition: width 0.3s ease;
  }

  .upload-info-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 1rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    font-family: var(--pg-font-family);
    color: var(--pg-text);
    z-index: 1;
  }

  .upload-info-box .spinner-circle {
    stroke: var(--pg-text);
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
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

  .yivi-tip {
    font-size: 0.85rem;
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
    background: rgba(3, 14, 23, 0.09);
    z-index: 3;
    cursor: pointer;
  }

  .desktop-yivi-popup {
    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--pg-soft-background);
    border-radius: var(--pg-border-radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    width: var(--popup-width);
    z-index: 4;
  }

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }

  .popup-title {
    font-size: 0.85rem;
    font-weight: bold;
    margin: 0;
    text-align: left;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
    flex: 1;
  }

  .popup-instruction {
    font-size: 0.75rem;
    margin: 0 0 0.5rem 0;
    text-align: left;
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    width: 100%;
  }

  .qr-code-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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
    border-top: 10px solid var(--pg-soft-background);
  }

  /* Mobile bottom sheet styles */
  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 3;
  }

  .mobile-bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--pg-soft-background);
    border-radius: var(--pg-border-radius-lg) var(--pg-border-radius-lg) 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
    padding: 1.5rem;
    z-index: 4;
  }

  .bottom-sheet-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .bottom-sheet-title {
    font-size: 0.85rem;
    font-weight: bold;
    margin: 0;
    text-align: center;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
  }

  .bottom-sheet-instruction {
    font-size: 0.75rem;
    margin: 0;
    text-align: center;
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
  }

  /* Validation modal */
  .validation-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 10;
    cursor: pointer;
  }

  .validation-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--pg-general-background);
    border-radius: var(--pg-border-radius-lg);
    padding: 1.75rem 1.5rem 1.5rem;
    z-index: 11;
    width: 90%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .validation-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
  }

  .validation-errors {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .validation-errors li {
    font-size: 0.9rem;
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    line-height: 1.4;
  }

  .validation-modal .primary-btn {
    align-self: stretch;
    justify-content: center;
  }
</style>
