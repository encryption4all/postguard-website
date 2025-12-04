<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { ISealOptions } from '@e4a/pg-wasm'

    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { EncryptionState, type EncryptState, Lang } from '$lib/lib/types/filesharing/attributes'
    import { RetrieveSignKeys } from '$lib/lib/yivi-tools'
    import Chunker, { withTransform } from '$lib/lib/filesharing/utils'
    import { createFileReadable, getFileStoreStream } from '$lib/lib/filesharing/FileProvider'
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

    let canEncrypt: boolean = $state(false)
    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE
    let UPLOAD_CHUNK_SIZE = import.meta.env.VITE_UPLOAD_CHUNK_SIZE
    let SMOOTH_TIME = 2

    $effect(() => {
        if (EncryptState.files.length === 0 || EncryptState.recipients.length === 0) {
            canEncrypt = false
            return
        }

        const totalSize = EncryptState.files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0)

        const regex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        const addressesValid =
            EncryptState.recipients.every(({ email }) => regex.test(email))

        canEncrypt = totalSize < MAX_UPLOAD_SIZE &&
            EncryptState.recipients.length > 0 &&
            addressesValid
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

        const uploadChunker = new Chunker(UPLOAD_CHUNK_SIZE) as TransformStream


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
            const [fileStream, sender] = getFileStoreStream(
                EncryptState.abort,
                EncryptState.sender,
                EncryptState.senderConfirm,
                EncryptState.recipients.map(({ email }) => email).join(', '),
                EncryptState.message,
                lang,
                (n, last) => reportProgress(resolve, n, last),
            ) as [WritableStream, string]

            EncryptState.sender = sender

            sealStream(
                pk,
                options,
                readable,
                withTransform(fileStream, uploadChunker, EncryptState.abort.signal),
            )
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
</script>

<button
    class="crypt-btn-main crypt-btn yivi-btn-logo {canEncrypt ? '' : ' crypt-btn-disabled'}"
    onclick={onSign}
>
    <img src={yiviLogo} alt="yivi-logo" width={36} height={20} />
    {$_('filesharing.encryptPanel.encryptSend')}
</button>

<style lang="scss">
  @use "shared-styles";
</style>