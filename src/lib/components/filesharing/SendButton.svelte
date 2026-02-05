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

        const pubSignId = [
            { t: 'pbdf.sidn-pbdf.email.email' },
        ]

        const keys = await RetrieveSignKeys(
            pubSignId,
            EncryptState.senderAttributes,
        )

        if (keys.privSignKey) EncryptState.privSignKey = keys.privSignKey

        EncryptState.pubSignKey = keys.pubSignKey

        await onEncrypt()
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

        EncryptState.files.forEach((f, i) => {
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
        let timeouts: number[] | undefined[] = EncryptState.percentages.map(
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
</script>
<div class="button-container">
    <button
        class="crypt-btn-main crypt-btn yivi-btn-logo {canEncrypt() ? '' : ' crypt-btn-disabled'}"
        onclick={onSign}
        disabled={!canEncrypt()}
    >
        <img src={canEncrypt() ? yiviLogoDark : yiviLogo} alt="yivi-logo" width={50} height={27} />
        {$_('filesharing.encryptPanel.encryptSend')}
    </button>

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
    margin: 0 0 1em 1.5em;
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
</style>
