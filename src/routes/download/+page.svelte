<script lang="ts">
    import { onMount, tick } from 'svelte'
    import { browser, dev } from '$app/environment'
    import { _ } from 'svelte-i18n'
    import { getPostGuard } from '$lib/postguard'
    import type { DecryptFileResult, FriendlySender, InspectResult } from '@e4a/pg-js'
    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import FileList from '$lib/components/filesharing/FileList.svelte'
    import { isMobile } from '$lib/browser-detect'
    import Chip from '$lib/components/Chip.svelte'
    import HelpToggle from '$lib/components/HelpToggle.svelte'

    type DownloadState = 'Downloading' | 'Recipients' | 'Ready' | 'Decrypting' | 'Done' | 'Fail' | 'ServerError' | 'IdentityMismatch'

    let downloadState: DownloadState = $state('Downloading')
    let err = $state('')

    let uuid = ''
    let recipientParam = ''

    let keylist: string[] = $state([])
    let key = $state('')
    let senderIdentity: FriendlySender | null = $state(null)
    let fileList: string[] = $state([])
    let decryptedBlobUrl = $state('')

    let opened: Awaited<ReturnType<typeof pg.open>> | null = null

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
            const pg = await getPostGuard()
            opened = pg.open({ uuid })
            const info: InspectResult = await opened.inspect()

            if (dev) console.debug('[download] header recipients:', info.recipients)

            senderIdentity = info.sender

            checkRecipients(info.recipients)
        } catch (e) {
            const { NetworkError } = await import('@e4a/pg-js')
            if (e instanceof NetworkError && e.status >= 500) {
                downloadState = 'ServerError'
            } else {
                err = String(e)
                downloadState = 'Fail'
            }
        }
    }

    function checkRecipients(recipients: string[]) {
        if (recipientParam && recipients.includes(recipientParam)) {
            key = recipientParam
            startDecryption()
            return
        }

        if (recipients.length === 1) {
            key = recipients[0]
            startDecryption()
        } else {
            keylist = recipients.filter((k) => k)
            downloadState = 'Recipients'
        }
    }

    function onRecipientSelected() {
        startDecryption()
    }

    async function startDecryption() {
        downloadState = 'Ready'
        await tick()

        try {
            if (!opened) throw new Error('No opened instance')

            const result = await opened.decrypt({
                element: '#yivi-download',
                recipient: key,
                enableCache: true,
            }) as DecryptFileResult

            senderIdentity = result.sender
            fileList = result.files

            // Trigger automatic download
            result.download('files.zip')

            downloadState = 'Done'
        } catch (e) {
            if (dev) console.error('[download] decrypt error:', e)
            err = String(e)
            const { IdentityMismatchError, NetworkError } = await import('@e4a/pg-js')
            if (e instanceof IdentityMismatchError) {
                downloadState = 'IdentityMismatch'
            } else if (e instanceof NetworkError && e.status >= 500) {
                downloadState = 'ServerError'
            } else {
                downloadState = 'Fail'
            }
        }
    }

    function retry() {
        startDecryption()
    }
</script>

<div class="page-wrapper">
    <div class="content">
        <h2>
            {#if downloadState === 'Fail'}
                {$_('filesharing.decryptpanel.notFoundTitle')}
            {:else if downloadState === 'ServerError'}
                {$_('filesharing.decryptpanel.serverErrorTitle')}
            {:else if downloadState === 'IdentityMismatch'}
                {$_('filesharing.decryptpanel.identityMismatchTitle')}
            {:else}
                {$_('filesharing.decryptpanel.header')}
            {/if}
        </h2>

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
                    onclick={onRecipientSelected}
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
            {#if senderIdentity?.email}
                <div class="sender-section">
                    <svg class="checkmark" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="sender-label">{$_('filesharing.decryptpanel.verifiedEmail')}</p>
                    <strong class="sender-email">{senderIdentity.email}</strong>
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

            {#if senderIdentity?.email}
                <div class="sender-section">
                    <svg class="checkmark" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="sender-label">{$_('filesharing.decryptpanel.verifiedEmail')}</p>
                    <strong class="sender-email">{senderIdentity.email}</strong>
                    {#if senderIdentity.attributes.filter(a => !a.type.includes('email') && a.value).length > 0}
                        <div class="attr-chips">
                            {#each senderIdentity.attributes.filter(a => !a.type.includes('email') && a.value) as attr}
                                <span class="attr-chip">{attr.value}</span>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}

        {:else if downloadState === 'ServerError'}
            <p class="error-description">{$_('filesharing.decryptpanel.serverErrorSubtitle')}</p>
            <p class="error-description">{@html $_('filesharing.decryptpanel.serverErrorMessage')}</p>

        {:else if downloadState === 'Fail'}
            <p class="error-description">{$_('filesharing.decryptpanel.notFoundSubtitle')}</p>
            <p class="error-description">{@html $_('filesharing.decryptpanel.notFoundMessage')}</p>

        {:else if downloadState === 'IdentityMismatch'}
            <p class="error-description">{$_('filesharing.decryptpanel.identityMismatchSubtitle')}</p>
            <p class="error-description">{$_('filesharing.decryptpanel.identityMismatchMessage')}</p>
            <div class="retry-wrapper">
                <Chip
                    text={$_('filesharing.decryptpanel.tryAgain')}
                    onclick={retry}
                    size="lg"
                    variant="dark"
                />
            </div>
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
        align-items: center;
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

    .retry-wrapper {
        display: flex;
        justify-content: center;
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
