<script>
    import { run } from 'svelte/legacy'

    import { tick } from 'svelte'

    import { currSelected, currentId, nextId, emails } from './stores'

    import * as decrypt from './decrypt.js'
    import * as email from './email'

    import { _ } from 'svelte-i18n'

    import { pg } from '$lib/postguard'

    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import Chip from '$lib/components/Chip.svelte'

    const STATES = {
        Uninit: 'Uninit',
        Init: 'Init',
        Recipients: 'Recipients',
        Qr: 'Qr',
        Decrypting: 'Decrypting',
        Show: 'Show',
        Fail: 'Fail',
    }

    let decryptState = $state(STATES.Uninit)

    let policies = $state()
    let keylist = $state()
    let key = $state()

    let showHints = $state(false)
    let hints = $state([])

    let decryptedMail
    let err = $state()

    /** @type {{rightMode: any, readable?: any, uuid?: string, recipient?: string}} */
    // eslint-disable-next-line no-useless-assignment
    let { rightMode = $bindable(), readable, uuid, recipient } = $props()

    let opened = $state()

    function checkRecipients() {
        const recipients = [...policies.keys()].filter((k) => k)
        // Optional hint from the URL: if the caller passed a recipient
        // and it matches one of the encryption policy keys, skip the
        // picker and go straight to that key. Mirrors the /download
        // page's ?recipient= parameter.
        if (recipient && recipients.includes(recipient)) {
            key = recipient
            return
        }
        if (recipients.length === 1) {
            key = recipients[0]
        } else {
            keylist = recipients
            decryptState = STATES.Recipients
        }
    }

    function processCredentials() {
        const policy = policies.get(key)
        if (!policy?.con) return
        for (const c of policy.con) {
            if (c.t === 'pbdf.sidn-pbdf.mobilenumber.mobilenumber' && c.v) {
                showHints = true
                hints.push('Mobile number: ' + c.v)
            } else if (c.t === 'pbdf.pbdf.surfnet-2.id' && c.v) {
                showHints = true
                hints.push('Student ID: ' + c.v)
            }
        }
    }

    function retry() {
        err = undefined
        showHints = false
        hints = []
        decryptState = STATES.Qr
        tick().then(() => startDecryption())
    }

    async function startDecryption() {
        try {
            const result = await opened.decrypt({
                element: '#yivi-fallback',
                recipient: key,
                enableCache: true,
            })

            decryptState = STATES.Decrypting

            // pg-js wraps `data:`-mode uploads as a single-file zip
            // (`data.bin` = the raw bytes) before encrypting, because the
            // upload pipeline always works on Files. uuid-mode decrypts
            // therefore yield DecryptFileResult{blob, files} and not
            // DecryptDataResult{plaintext}. Unwrap the zip here so the
            // downstream parseMail sees real MIME bytes.
            const plaintext = result.plaintext
                ? result.plaintext
                : await extractFromZip(result.blob, 'data.bin')

            const outStream = new TextDecoder().decode(plaintext)
            decryptedMail = await email.parseMail(outStream)
            await storeMail(outStream)
        } catch (e) {
            err = e
            decryptState = STATES.Fail
        }
    }

    /** Extract a single file from a ZIP blob and return its uncompressed
     *  bytes. Reads via the central directory (where conflux — pg-js's zip
     *  writer — records the real sizes) because the local file headers in
     *  streaming-mode zips carry zeros. Supports stored (method 0) and
     *  deflate (method 8); DecompressionStream('deflate-raw') is the right
     *  decoder for ZIP-embedded deflate. */
    async function extractFromZip(blob, filename) {
        const buf = await blob.arrayBuffer()
        const view = new DataView(buf)
        const bytes = new Uint8Array(buf)
        const decoder = new TextDecoder('utf-8')

        // Find EOCD (End of Central Directory): signature 0x06054b50,
        // located in the last ~64 KB of the file.
        let eocdOffset = -1
        for (
            let i = bytes.length - 22;
            i >= Math.max(0, bytes.length - 65557);
            i--
        ) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i
                break
            }
        }
        if (eocdOffset === -1) throw new Error('ZIP EOCD record not found')

        const cdOffset = view.getUint32(eocdOffset + 16, true)
        const numEntries = view.getUint16(eocdOffset + 10, true)

        let pos = cdOffset
        for (let i = 0; i < numEntries; i++) {
            if (view.getUint32(pos, true) !== 0x02014b50) break // CDR signature

            const method = view.getUint16(pos + 10, true)
            const compressedSize = view.getUint32(pos + 20, true)
            const nameLen = view.getUint16(pos + 28, true)
            const extraLen = view.getUint16(pos + 30, true)
            const commentLen = view.getUint16(pos + 32, true)
            const lfhOffset = view.getUint32(pos + 42, true)
            const name = decoder.decode(
                bytes.slice(pos + 46, pos + 46 + nameLen)
            )

            if (name === filename) {
                // Re-parse the local file header to find the data start;
                // its name + extra fields can differ in length from the
                // CDR entry.
                const lfhNameLen = view.getUint16(lfhOffset + 26, true)
                const lfhExtraLen = view.getUint16(lfhOffset + 28, true)
                const dataStart = lfhOffset + 30 + lfhNameLen + lfhExtraLen
                const compressed = bytes.slice(
                    dataStart,
                    dataStart + compressedSize
                )

                if (method === 0) return compressed
                if (method === 8) {
                    const stream = new Blob([compressed])
                        .stream()
                        .pipeThrough(new DecompressionStream('deflate-raw'))
                    return new Uint8Array(
                        await new Response(stream).arrayBuffer()
                    )
                }
                throw new Error(
                    `Unsupported zip compression method ${method} for ${filename}`
                )
            }

            pos += 46 + nameLen + extraLen + commentLen
        }

        throw new Error(`File "${filename}" not found in zip`)
    }

    async function storeMail(unparsed) {
        const hash = await decrypt.digestMessage(unparsed)
        const found = $emails.find((e) => e.hash === hash)
        if (found) {
            currSelected.set(found.id)
            await tick()
            rightMode = 'MailView'
            return
        }

        // postal-mime exposes the parsed Date directly; falling back to the
        // raw headers array would break for messages where postal-mime
        // returns headers: [] (we hit "headers[0] is undefined" in the wild
        // on Outlook-encrypted MIME).
        const parsedDate =
            decryptedMail.date ?? decryptedMail.headers?.[0]?.value ?? ''

        $emails = [
            {
                id: $nextId,
                from: decryptedMail.from,
                to: decryptedMail.to,
                date: parsedDate,
                subject: decryptedMail.subject,
                raw: unparsed,
                hash,
            },
            ...$emails,
        ]

        currSelected.set($currentId)
        await tick()
        rightMode = 'MailView'
    }

    run(() => {
        if (decryptState === STATES.Uninit && (readable || uuid)) {
            // pg.open accepts either raw bytes (file upload / URL hash) or
            // a Cryptify uuid (tier 2/3 envelopes from pg-js >= 1.1.0 in
            // `data: mime` mode point recipients here with ?uuid=...).
            const o = uuid ? pg.open({ uuid }) : pg.open({ data: readable })
            opened = o
            o.inspect()
                .then((info) => {
                    decryptState = STATES.Init
                    policies = info.policies
                    checkRecipients()
                })
                .catch((e) => {
                    err = e
                    decryptState = STATES.Fail
                })
        }
    })
    run(() => {
        if (
            (decryptState === STATES.Init ||
                decryptState === STATES.Recipients) &&
            key
        ) {
            processCredentials()
            decryptState = STATES.Qr
            tick().then(() => startDecryption())
        }
    })
</script>

<div class="decrypt-wrapper">
    {#if decryptState === STATES.Uninit || decryptState === STATES.Init}
        <div class="spinner-wrapper">
            <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                <circle
                    class="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                ></circle>
            </svg>
        </div>
        <p class="status-text">
            {$_('fallback.decrypt.init', { default: 'Initializing...' })}
        </p>
    {:else if decryptState === STATES.Recipients}
        <div class="decrypt-card">
            <h3>
                {$_('fallback.decrypt.selectRecipient', {
                    default: 'Select recipient',
                })}
            </h3>
            <p class="card-subtitle">
                {$_('fallback.decrypt.selectRecipientDesc', {
                    default: 'Please select which email belongs to you:',
                })}
            </p>
            <select bind:value={key} class="recipient-select">
                <option value=""></option>
                {#each keylist as k (k)}
                    <option value={k}>{k}</option>
                {/each}
            </select>
        </div>
    {:else if decryptState === STATES.Qr}
        <div class="decrypt-card">
            <h3>
                {$_('fallback.decrypt.scanQr', { default: 'Scan QR code' })}
            </h3>
            {#if showHints}
                <div class="hints">
                    {#each hints as hint (hint)}
                        <span class="hint-chip">{hint}</span>
                    {/each}
                </div>
            {/if}
            <YiviQRCode id="yivi-fallback" responsive />
        </div>
    {:else if decryptState === STATES.Decrypting}
        <div class="spinner-wrapper">
            <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                <circle
                    class="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                ></circle>
            </svg>
        </div>
        <p class="status-text">
            {$_('fallback.decrypt.decrypting', { default: 'Decrypting...' })}
        </p>
    {:else if decryptState === STATES.Fail}
        <div class="decrypt-card error-card">
            <p class="error-text">
                {$_('fallback.decrypt.failure', {
                    default: 'Decryption failed',
                })}
            </p>
            <p class="error-detail">{err}</p>
            <Chip
                text={$_('fallback.decrypt.retry')}
                onclick={retry}
                size="lg"
                variant="dark"
            />
        </div>
    {/if}
</div>

<style lang="scss">
    .decrypt-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        max-width: 400px;
        margin: 0 auto;
        gap: 1rem;
    }

    .spinner-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0;
    }

    .spinner {
        animation: spin 1s linear infinite;
        color: var(--pg-text-secondary);
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

    .status-text {
        margin: 0;
        color: var(--pg-text-secondary);
        font-size: var(--pg-font-size-md);
        text-align: center;
    }

    .decrypt-card {
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;

        h3 {
            font-weight: var(--pg-font-weight-bold);
            font-size: var(--pg-font-size-lg);
            margin: 0;
        }
    }

    .card-subtitle {
        margin: 0;
        color: var(--pg-text);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
    }

    .recipient-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        background: var(--pg-general-background);
        color: var(--pg-text);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-base);
    }

    .hints {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .hint-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        background: var(--pg-general-background);
    }

    .error-card {
        align-items: center;
        text-align: center;
    }

    .error-text {
        margin: 0;
        font-weight: var(--pg-font-weight-bold);
        font-size: var(--pg-font-size-md);
        color: var(--pg-input-error);
    }

    .error-detail {
        margin: 0;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        word-break: break-word;
    }
</style>
