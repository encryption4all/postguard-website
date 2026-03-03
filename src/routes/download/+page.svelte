<script lang="ts">
    import { onMount, tick } from 'svelte'
    import { browser } from '$app/environment'
    import { _ } from 'svelte-i18n'
    import YiviCore from '@privacybydesign/yivi-core'
    import YiviClient from '@privacybydesign/yivi-client'
    import YiviWeb from '@privacybydesign/yivi-web'
    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import FileList from '$lib/components/filesharing/FileList.svelte'
    import { isMobile } from '$lib/browser-detect'
    import { secondsTill4AM, sortPolicies } from '$lib/components/fallback/decrypt.js'
    import Chip from '$lib/components/Chip.svelte'
    import HelpToggle from '$lib/components/HelpToggle.svelte'

    type DownloadState = 'Downloading' | 'Recipients' | 'Ready' | 'Decrypting' | 'Done' | 'Fail'

    // public_identity() returns a Policy: { ts: number, con: [{t: string, v?: string}] }
    function getSenderEmail(identity: any): string {
        if (!identity?.con?.length) return ''
        return (
            identity.con.find((a: any) => a.t?.includes('email') && a.v)?.v ??
            identity.con.find((a: any) => a.v)?.v ??
            ''
        ) 
    }

    function getSenderDisplay(identity: any): string {
        return getSenderEmail(identity)
    }

    function getSenderExtras(identity: any): string[] {
        if (!identity?.con?.length) return []
        return identity.con
            .filter((a: any) => !a.t?.includes('email') && a.v)
            .map((a: any) => a.v as string)
    }

    // Reads filenames from a ZIP file's central directory (no decompression needed)
    async function readZipFilenames(blob: Blob): Promise<string[]> {
        const buf = await blob.arrayBuffer()
        const view = new DataView(buf)
        const bytes = new Uint8Array(buf)

        // Find End of Central Directory signature (PK\x05\x06)
        let eocdOffset = -1
        for (let i = bytes.length - 22; i >= 0; i--) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i
                break
            }
        }
        if (eocdOffset === -1) return []

        const cdOffset = view.getUint32(eocdOffset + 16, true)
        const numEntries = view.getUint16(eocdOffset + 10, true)
        const decoder = new TextDecoder('utf-8')
        const filenames: string[] = []
        let pos = cdOffset

        for (let i = 0; i < numEntries; i++) {
            if (view.getUint32(pos, true) !== 0x02014b50) break
            const filenameLen = view.getUint16(pos + 28, true)
            const extraLen = view.getUint16(pos + 30, true)
            const commentLen = view.getUint16(pos + 32, true)
            const filename = decoder.decode(bytes.slice(pos + 46, pos + 46 + filenameLen))
            if (!filename.endsWith('/')) filenames.push(filename)
            pos += 46 + filenameLen + extraLen + commentLen
        }
        return filenames
    }

    let downloadState: DownloadState = $state('Downloading')
    let err = $state('')

    let uuid = ''
    let recipientParam = ''

    let policies: Map<string, any>
    let keylist: string[] = $state([])
    let key = $state('')
    let timestamp: number
    let recipientAndCreds: any[]
    let recipientStripped: any[]
    let keyRequest: any
    let usk: any
    let unsealer: any

    let decryptedBlobUrl = $state('')
    let senderIdentity: any = $state(null)
    let fileList: string[] = $state([])

    let isMobileDevice = isMobile()

    onMount(() => {
        if (!browser) return
        const params = new URLSearchParams(window.location.search)
        uuid = params.get('uuid') ?? ''
        recipientParam = params.get('recipient') ?? ''

        if (!uuid) {
            err = 'Missing uuid parameter'
            downloadState = 'Fail'
        } else {
            startDownload()
        }
    })

    async function startDownload() {
        downloadState = 'Downloading'
        try {
            const { FILEHOST_URL, PKG_URL } = await import('$lib/env')

            const vk = await fetch(`${PKG_URL}/v2/sign/parameters`)
                .then((r) => r.json())
                .then((j) => j.publicKey)

            const response = await fetch(`${FILEHOST_URL}/filedownload/${uuid}`)
            if (!response.ok) throw new Error(`Failed to download file: ${response.status}`)

            if (!response.body) throw new Error('Response body is null')
            const { StreamUnsealer } = await import('@e4a/pg-wasm')
            unsealer = await StreamUnsealer.new(response.body, vk)
            policies = unsealer.inspect_header()

            try {
                senderIdentity = unsealer.public_identity()
            } catch {
                // public_identity may not be available before unsealing
            }

            checkRecipients()
        } catch (e) {
            err = String(e)
            downloadState = 'Fail'
        }
    }

    function checkRecipients() {
        if (recipientParam && policies.has(recipientParam)) {
            key = recipientParam
            processPolicy()
            return
        }

        if (policies.size === 1) {
            key = policies.keys().next().value!
            processPolicy()
        } else {
            keylist = [...policies.keys()]
            downloadState = 'Recipients'
        }
    }

    function processPolicy() {
        const policy = policies.get(key)
        timestamp = policy.ts
        recipientAndCreds = sortPolicies(policy.con)

        recipientStripped = JSON.parse(JSON.stringify(recipientAndCreds))
        for (const c of recipientStripped) {
            delete c.v
        }

        keyRequest = {
            con: recipientStripped,
            validity: secondsTill4AM(),
        }

        downloadState = 'Ready'
        tick().then(() => startYiviSession())
    }

    async function startYiviSession() {
        try {
            const { PKG_URL } = await import('$lib/env')

            const session = {
                url: PKG_URL,
                start: {
                    url: (o: any) => `${o.url}/v2/request/start`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(keyRequest),
                },
                result: {
                    url: (o: any, { sessionToken }: any) =>
                        `${o.url}/v2/request/jwt/${sessionToken}`,
                    parseResponse: (r: Response) => {
                        return r
                            .text()
                            .then((jwt) =>
                                fetch(`${PKG_URL}/v2/request/key/${timestamp.toString()}`, {
                                    headers: { Authorization: `Bearer ${jwt}` },
                                }),
                            )
                            .then((r) => r.json())
                            .then((json) => {
                                if (json.status !== 'DONE' || json.proofStatus !== 'VALID')
                                    throw new Error('not done and valid')
                                return json.key
                            })
                    },
                },
            }

            let selectedLang = localStorage.getItem('preferredLanguage') ?? 'en'
            if (selectedLang.includes('-')) selectedLang = selectedLang.split('-')[0]

            const yivi = new YiviCore({
                debugging: false,
                session,
                element: '#yivi-download',
                language: selectedLang.toLowerCase(),
                state: {
                    serverSentEvents: false,
                    polling: {
                        endpoint: 'status',
                        interval: 500,
                        startState: 'INITIALIZED',
                    },
                },
            })

            // Wait for the DOM to be ready before YiviWeb queries the element
            await new Promise((resolve) => setTimeout(resolve, 500))

            yivi.use(YiviWeb)
            yivi.use(YiviClient)

            usk = await yivi.start()
            downloadState = 'Decrypting'
            await decryptFiles()
        } catch (e) {
            err = String(e)
            downloadState = 'Fail'
        }
    }

    async function decryptFiles() {
        const chunks: BlobPart[] = []
        const writable = new WritableStream({
            write: (chunk) => {
                chunks.push(chunk as BlobPart)
            },
        })

        await unsealer.unseal(key, usk, writable)
        if (!senderIdentity) {
            senderIdentity = unsealer.public_identity()
        }

        const blob = new Blob(chunks, { type: 'application/zip' })
        decryptedBlobUrl = URL.createObjectURL(blob)
        fileList = await readZipFilenames(blob)

        // Trigger automatic download
        const a = document.createElement('a')
        a.href = decryptedBlobUrl
        a.download = 'files.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        downloadState = 'Done'
    }
</script>

<div class="page-wrapper">
    <div class="content">
        <h2>{downloadState === 'Fail' ? $_('filesharing.decryptpanel.notFoundTitle') : $_('filesharing.decryptpanel.header')}</h2>

        {#if downloadState === 'Downloading'}
            <div class="spinner-wrapper">
                <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                    <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
                </svg>
            </div>

        {:else if downloadState === 'Recipients'} 
            <p class="description">{$_('filesharing.decryptpanel.pageDescription')}</p>
            <div class="decrypt-card">
                <h3>{$_('filesharing.decryptpanel.irmaInstructionHeaderQr')}</h3>
                <p class="card-subtitle">Please select which email belongs to you:</p>
                <select bind:value={key} class="recipient-select">
                    <option value=""></option>
                    {#each keylist as k}
                        <option value={k}>{k}</option>
                    {/each}
                </select>
                <Chip
                    text={$_('filesharing.decryptpanel.askDownload')}
                    onclick={processPolicy}
                    size="lg"
                    variant="dark"
                    disabled={!key}
                />
            </div>

        {:else if downloadState === 'Ready'}
            <p class="description">{$_('filesharing.decryptpanel.pageDescription')}</p>
            <div class="decrypt-card">
                <h3>
                    {isMobileDevice
                        ? $_('filesharing.decryptpanel.irmaInstructionHeaderMobile')
                        : $_('filesharing.decryptpanel.irmaInstructionHeaderQr')}
                </h3>
                <p class="card-subtitle">
                    {isMobileDevice
                        ? $_('filesharing.decryptpanel.irmaInstructionMobile')
                        : $_('filesharing.decryptpanel.irmaInstructionQr')}
                </p>
                <YiviQRCode id="yivi-download" responsive mode={isMobileDevice ? 'deeplink' : 'qr'} />
            </div>
            <HelpToggle
                title={$_('filesharing.encryptPanel.yiviInfo')}
                content={$_('filesharing.encryptPanel.yiviInfoText')}
                linkText={$_('filesharing.encryptPanel.yiviInfoLink')}
                linkUrl="https://yivi.app"
                bordered
            />
            {#if getSenderDisplay(senderIdentity)}
                <div class="sender-section">
                    <svg class="checkmark" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="sender-label">{$_('filesharing.decryptpanel.verifiedEmail')}</p>
                    <strong class="sender-email">{getSenderDisplay(senderIdentity)}</strong>
                </div>
            {/if}

        {:else if downloadState === 'Decrypting'}
            <div class="spinner-wrapper">
                <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                    <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
                </svg>
            </div>
            <p class="description">{$_('filesharing.decryptpanel.decrypting')}</p>

        {:else if downloadState === 'Done'}
            <div class="success-banner">
                <svg class="banner-check" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>{$_('filesharing.decryptpanel.doneMessage')}</p>
            </div> 

            <FileList files={fileList} />

            {#if getSenderEmail(senderIdentity)}
                <div class="sender-section"> 
                    <svg class="checkmark" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="sender-label">{$_('filesharing.decryptpanel.verifiedEmail')}</p>
                    <strong class="sender-email">{getSenderEmail(senderIdentity)}</strong>
                    {#if getSenderExtras(senderIdentity).length > 0}
                        <div class="attr-chips">
                            {#each getSenderExtras(senderIdentity) as extra}
                                <span class="attr-chip">{extra}</span>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}

        {:else if downloadState === 'Fail'}
            <p class="error-description">{$_('filesharing.decryptpanel.notFoundSubtitle')}</p>
            <p class="error-description">{@html $_('filesharing.decryptpanel.notFoundMessage')}</p>
        {/if}
    </div>
</div>

<style lang="scss">
    .page-wrapper {
        min-height: calc(100vh - 52px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 3rem 1rem 2rem;
    }

    .content {
        width: calc(250px + 3rem);
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    h2 {
        text-align: center;
        font-size: var(--pg-font-size-xl);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-text);
        margin: 0 0 0.25rem;
    }

    .description {
        margin: 0;
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
    }

    .decrypt-card {
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .decrypt-card h3 {
        font-weight: var(--pg-font-weight-bold);
        font-size: var(--pg-font-size-lg);
        margin: 0;
        color: var(--pg-text);
    }

    .card-subtitle {
        margin: 0;
        color: var(--pg-text);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
    }

    .spinner-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem 0;
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
        to { transform: rotate(360deg); }
    }

    @keyframes dash {
        0% { stroke-dashoffset: 60; }
        50% { stroke-dashoffset: 15; }
        100% { stroke-dashoffset: 60; }
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

    .sender-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        padding: 0.5rem 0;
        text-align: center;
    }

    .checkmark {
        width: 14px;
        height: 14px;
        color: var(--pg-text-secondary);
        flex-shrink: 0;
    }

    .sender-label {
        margin: 0;
        font-size: var(--pg-font-size-md);
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
    }

    .sender-email {
        font-size: var(--pg-font-size-md);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-text);
        font-family: var(--pg-font-family);
    }

    .success-banner {
        display: flex;
        align-items: flex-start; 
        gap: 0.75rem;
        background: var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
        padding: 1rem 1.25rem;

        p {
            margin: 0;
            font-family: var(--pg-font-family);
            font-size: var(--pg-font-size-md);
            line-height: 1.4;
            color: var(--pg-text);
        }
    }

    .banner-check {
        width: 14px;
        height: 14px;
        color: var(--pg-text-secondary);
        flex-shrink: 0;
        margin-top: 0.1rem;
    }

    .attr-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        justify-content: center;
    }

    .attr-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border: 1px solid var(--pg-strong-background);
        border-radius: 4px;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
        background: var(--pg-general-background);
    }

    .error-description {
        margin: 0;
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
        text-align: center;
        color: var(--pg-text);
    }
</style>
