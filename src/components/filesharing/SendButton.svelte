<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type {ISealOptions } from '@e4a/pg-wasm'

    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { EncryptionState, type EncryptState, Lang } from '$lib/lib/types/filesharing/attributes'
    import { RetrieveSignKeys } from '$lib/lib/yivi-tools'
    import Chunker, { withTransform } from '$lib/lib/filesharing/utils'
    import { createFileReadable, getFileStoreStream } from '$lib/lib/filesharing/FileProvider'
    import { browser } from '$app/environment'

    let Writer: Promise<any>
    if (browser) {
        Writer = import("@transcend-io/conflux");
    } else {
        Writer = Promise.resolve(null)
    }

    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE
    let UPLOAD_CHUNK_SIZE = import.meta.env.VITE_UPLOAD_CHUNK_SIZE
    let SMOOTH_TIME = 2

    interface props {
        encryptState: EncryptState;
    }

    let {encryptState = $bindable()}: props = $props()

    let canEncrypt: boolean = $state(false)
    $effect(() => {
        if (encryptState.files.length === 0 || encryptState.recipients.length === 0) {
            canEncrypt = false
            return
        }

        const totalSize = encryptState.files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0)

        const regex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        const addressesValid =
            encryptState.recipients.every(({ email }) => regex.test(email))

        canEncrypt = totalSize < MAX_UPLOAD_SIZE &&
            encryptState.recipients.length > 0 &&
            addressesValid
    })

    async function onSign(): Promise<void> {
        if (!canEncrypt) return
        encryptState.encryptionState = EncryptionState.Sign

        const pubSignId = [
            { t: 'pbdf.sidn-pbdf.email.email' },
        ]

        const keys = await RetrieveSignKeys(
            pubSignId,
            encryptState.senderAttributes,
        )

        if (keys.privSignKey) encryptState.privSignKey = keys.privSignKey

        encryptState.pubSignKey = keys.pubSignKey

        await onEncrypt()
    }

    async function onEncrypt() {
        // TODO: Simplify this error handling logic.
        // For some reason stream errors are not caught
        // Which means when the user aborts
        // exceptions spill into the console...

        encryptState.encryptionState = EncryptionState.Encrypting
        encryptState.encryptStartTime = Date.now()

        try {
            await applyEncryption();
            encryptState.encryptionState = EncryptionState.Done
            encryptState.selfAborted = false
        } catch (e) {
            console.error("Error occured during encryption: ", e);
            if (encryptState.selfAborted === false) {
                encryptState.encryptionState = EncryptionState.Error
            } else {
                encryptState.percentages = encryptState.files.map(() => 0)
                encryptState.done = encryptState.files.map(() => false)
                encryptState.encryptionState = EncryptionState.FileSelection
                encryptState.selfAborted = false
                encryptState.encryptStartTime = 0
            }
        }
    }

    async function applyEncryption() {
        if (!canEncrypt) return;

        // make sure these are fulfilled
        const pk = await encryptState.pkPromise;
        const { sealStream } = await encryptState.pkPromise;

        const ts = Math.round(Date.now() / 1000);
        const enc_policy = {};

        encryptState.recipients.forEach(({ email, extra }) => {
            enc_policy[email] = {
                ts,
                con: [{ t: "pbdf.sidn-pbdf.email.email", v: email }, ...extra],
            };
        });

        // also encrypt for the sender
        if (encryptState.senderConfirm)
            enc_policy[encryptState.sender] = {
                ts,
                con: [
                    { t: "pbdf.sidn-pbdf.email.email", v: encryptState.sender },
                    ...encryptState.senderAttributes,
                ],
            };

        if (!encryptState.pubSignKey) {
            encryptState.encryptionState = EncryptionState.Error;
            return;
        }

        const options: ISealOptions = {
            policy: enc_policy,
            pubSignKey: encryptState.pubSignKey,
            ...(encryptState.privSignKey && { privSignKey: encryptState.privSignKey }),
        };

        const uploadChunker = new Chunker(UPLOAD_CHUNK_SIZE) as TransformStream;

        // Create streams that takes all input files and zips them into an output stream.
        const zipTf = new (await Writer)();
        const readable = zipTf.readable as ReadableStream;
        const writeable = zipTf.writable;

        const writer = writeable.getWriter();

        encryptState.files.forEach((f, i) => {
            const s = createFileReadable(f);

            writer.write({
                name: f.name,
                lastModified: f.lastModified,
                stream: () => s,
            });
        });

        writer.close();

        let selectedLang: String = localStorage.getItem('preferredLanguage') ?? 'en-US';
        const lang:Lang = (selectedLang === 'nl-NL') ? Lang.NL : Lang.EN;

        // This is not 100% accurate due to zip and irmaseal
        // header but it's close enough for the UI.
        const finished = new Promise<void>(async (resolve, reject) => {
            const [fileStream, sender] = getFileStoreStream(
                encryptState.abort,
                encryptState.sender,
                encryptState.senderConfirm,
                encryptState.recipients.map(({ email }) => email).join(", "),
                encryptState.message,
                lang,
                (n, last) => reportProgress(resolve, n, last)
            ) as [WritableStream, string];

            encryptState.sender = sender;

            sealStream(
                pk,
                options,
                readable,
                withTransform(fileStream, uploadChunker, encryptState.abort.signal)
            );
        });

        await finished;
    }

    function reportProgress(resolve: () => void, uploaded: number, done: boolean) {
        let offset = 0;
        let percentages = encryptState.percentages.map((p) => p);
        let timeouts: number[] | undefined[] = encryptState.percentages.map(
            (_) => undefined
        );

        encryptState.files.forEach((f, i) => {
            const startFile = offset;
            const endFile = offset + f.size;
            if (uploaded < startFile) {
                percentages[i] = 0;
            } else if (uploaded >= endFile) {
                // We update to done after some time
                // To allow smoothing of progress.
                if (timeouts[i] === undefined) {
                    timeouts[i] = window.setTimeout(() => {
                        const dones = encryptState.done.map((d) => d);
                        dones[i] = true;
                        encryptState.done = dones;
                    }, 1000 * SMOOTH_TIME);
                }
                percentages[i] = 100;
            } else {
                const uploadedOfFile = (uploaded - startFile) / f.size;
                percentages[i] = Math.round(100 * uploadedOfFile);
            }

            offset = endFile;
        });

        encryptState.percentages = percentages;

        if (done) {
            window.setTimeout(() => resolve(), 1000 * SMOOTH_TIME);
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
  .crypt-btn-main {
    width: 14em;
  }

  @media only screen and (max-width: 400px) {
    .crypt-btn-main {
      width: 13em;
    }

    .crypt-btn-cancel {
      width: 13em !important;
    }
  }

  .crypt-btn {
    border: none;
    border-radius: 2.6em;
    background: #000000;
    cursor: pointer;
    color: white;
    font-weight: bold;
    font-size: 1.15em;
    line-height: 1.6em;
    padding: 0.25em 0;
    text-align: center;
  }

  .crypt-btn:disabled,
  .crypt-btn[disabled],
  .crypt-btn-disabled {
    background: #e8e8e8;
    color: #424242;
    cursor: not-allowed;
  }

  .yivi-btn-logo {
    display: flex;
    padding-right: 1em;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
  }

  .crypt-btn-main {
    display: block;
    padding-left: 0.25em;
    width: 15em;
    margin: 1em auto;
  }
</style>