<script lang="ts">
    import { onMount, tick } from 'svelte'
    import { fade, slide } from 'svelte/transition'
    import { browser, dev } from '$app/environment'
    import { _ } from 'svelte-i18n'
    import { pg, retryStatus } from '$lib/postguard'
    import {
        IdentityMismatchError,
        NetworkError,
        UploadSessionExpiredError,
    } from '@e4a/pg-js'
    import type {
        DecryptFileResult,
        FriendlySender,
        InspectResult,
    } from '@e4a/pg-js'
    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import FileList from '$lib/components/filesharing/FileList.svelte'
    import DecryptionProgress from '$lib/components/filesharing/DecryptionProgress.svelte'
    import ReportErrorButton from '$lib/components/filesharing/ReportErrorButton.svelte'
    import { isMobile } from '$lib/browser-detect'
    import Chip from '$lib/components/Chip.svelte'
    import HelpToggle from '$lib/components/HelpToggle.svelte'

    type DownloadState =
        | 'Downloading'
        | 'Recipients'
        | 'Ready'
        | 'Decrypting'
        | 'Done'
        | 'Fail'
        | 'ServerError'
        | 'IdentityMismatch'
        | 'SessionExpired'

    let downloadState: DownloadState = $state('Downloading')

    let uuid = ''
    let recipientParam = ''

    let keylist: string[] = $state([])
    let key = $state('')
    let senderIdentity: FriendlySender | null = $state(null)
    let fileList: string[] = $state([])
    let decryptPct: number | undefined = $state(undefined)
    let lastError: unknown = $state(null)

    let opened: Awaited<ReturnType<typeof pg.open>> | null = null

    // Hold on the QR card briefly after Yivi succeeds so its success
    // animation can finish before we swap in the progress banner.
    const YIVI_SUCCESS_HOLD_MS = 1400
    let pendingDecryptFlip: ReturnType<typeof setTimeout> | null = null

    let isMobileDevice = isMobile()

    onMount(() => {
        if (!browser) return
        const params = new URLSearchParams(window.location.search)
        uuid = params.get('uuid') ?? ''
        recipientParam = params.get('recipient') ?? ''

        if (!uuid) {
            downloadState = 'Fail'
        } else {
            startDownload()
        }
    })

    async function startDownload() {
        downloadState = 'Downloading'
        retryStatus.set(null)
        try {
            opened = pg.open({ uuid })
            const info: InspectResult = await opened.inspect()

            if (dev)
                console.debug('[download] header recipients:', info.recipients)

            senderIdentity = info.sender

            retryStatus.set(null)
            checkRecipients(info.recipients)
        } catch (e) {
            retryStatus.set(null)
            lastError = e
            if (e instanceof UploadSessionExpiredError) {
                downloadState = 'SessionExpired'
            } else if (e instanceof NetworkError && e.status >= 500) {
                downloadState = 'ServerError'
            } else {
                downloadState = 'Fail'
            }
        }
    }

    function checkRecipients(recipients: string[]) {
        const nonEmpty = recipients.filter((k) => k)

        if (recipientParam && nonEmpty.includes(recipientParam)) {
            key = recipientParam
            startDecryption()
            return
        }

        if (nonEmpty.length === 1) {
            key = nonEmpty[0]
            startDecryption()
        } else {
            keylist = nonEmpty
            downloadState = 'Recipients'
        }
    }

    function onRecipientSelected() {
        startDecryption()
    }

    async function startDecryption() {
        downloadState = 'Ready'
        decryptPct = undefined
        retryStatus.set(null)
        await tick()

        try {
            if (!opened) throw new Error('No opened instance')

            const result = (await opened.decrypt({
                element: '#yivi-download',
                recipient: key,
                enableCache: true,
                onDownloadProgress: (pct) => {
                    decryptPct = pct
                    if (
                        downloadState !== 'Decrypting' &&
                        pendingDecryptFlip === null
                    ) {
                        pendingDecryptFlip = setTimeout(() => {
                            pendingDecryptFlip = null
                            if (downloadState === 'Ready') {
                                downloadState = 'Decrypting'
                            }
                        }, YIVI_SUCCESS_HOLD_MS)
                    }
                },
            })) as DecryptFileResult

            senderIdentity = result.sender
            fileList = result.files.map((f) => f.name)

            // Trigger automatic download (one browser download per file)
            result.download()

            retryStatus.set(null)
            downloadState = 'Done'
        } catch (e) {
            if (dev) console.error('[download] decrypt error:', e)
            retryStatus.set(null)
            lastError = e
            if (e instanceof IdentityMismatchError) {
                downloadState = 'IdentityMismatch'
            } else if (e instanceof UploadSessionExpiredError) {
                downloadState = 'SessionExpired'
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
            {:else if downloadState === 'SessionExpired'}
                {$_('filesharing.decryptpanel.sessionExpiredTitle')}
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
            {#if $retryStatus}
                <p class="retry-status" role="status">
                    {$_('filesharing.encryptPanel.retrying', {
                        values: {
                            attempt: $retryStatus.attempt + 1,
                            max: $retryStatus.maxAttempts,
                        },
                    })}
                </p>
            {/if}
        {:else if downloadState === 'Recipients'}
            <p class="description">
                {$_('filesharing.decryptpanel.pageDescription')}
            </p>
            <div class="decrypt-card">
                <h3>
                    {$_('filesharing.decryptpanel.irmaInstructionHeaderQr')}
                </h3>
                <p class="card-subtitle">
                    Please select which email belongs to you:
                </p>
                <select bind:value={key} class="recipient-select">
                    <option value="" disabled selected
                        >Select your email…</option
                    >
                    {#each keylist as k (k)}
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
            <div
                class="state-wrap"
                in:fade={{ duration: 250, delay: 200 }}
                out:fade={{ duration: 200 }}
            >
                <p class="description">
                    {$_('filesharing.decryptpanel.pageDescription')}
                </p>
                <div class="decrypt-card">
                    <h3>
                        {isMobileDevice
                            ? $_(
                                  'filesharing.decryptpanel.irmaInstructionHeaderMobile'
                              )
                            : $_(
                                  'filesharing.decryptpanel.irmaInstructionHeaderQr'
                              )}
                    </h3>
                    <p class="card-subtitle">
                        {isMobileDevice
                            ? $_(
                                  'filesharing.decryptpanel.irmaInstructionMobile'
                              )
                            : $_('filesharing.decryptpanel.irmaInstructionQr')}
                    </p>
                    <YiviQRCode
                        id="yivi-download"
                        responsive
                        mode={isMobileDevice ? 'deeplink' : 'qr'}
                        showInstructions={!isMobileDevice}
                    />
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
                        <svg
                            class="checkmark"
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 5L4.5 8.5L11 1"
                                stroke="currentColor"
                                stroke-width="1.75"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <p class="sender-label">
                            {$_('filesharing.decryptpanel.verifiedEmail')}
                        </p>
                        <strong class="sender-email"
                            >{senderIdentity.email}</strong
                        >
                    </div>
                {/if}
            </div>
        {:else if downloadState === 'Decrypting' || downloadState === 'Done'}
            <div
                class="state-wrap"
                in:fade={{ duration: 300, delay: 200 }}
                out:fade={{ duration: 200 }}
            >
                <div class="success-banner">
                    <div class="banner-row">
                        {#if downloadState === 'Done'}
                            <svg
                                class="banner-check"
                                viewBox="0 0 12 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                in:fade={{ duration: 250, delay: 100 }}
                            >
                                <path
                                    d="M1 5L4.5 8.5L11 1"
                                    stroke="currentColor"
                                    stroke-width="1.75"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        {/if}
                        <p role="status">
                            {downloadState === 'Done'
                                ? $_(
                                      'filesharing.decryptpanel.doneMessageComplete'
                                  )
                                : $_('filesharing.decryptpanel.doneMessage')}
                        </p>
                    </div>
                    {#if downloadState === 'Decrypting'}
                        <div transition:slide={{ duration: 280 }}>
                            <DecryptionProgress percentage={decryptPct} />
                        </div>
                    {/if}
                </div>
                {#if downloadState === 'Decrypting' && $retryStatus}
                    <p class="retry-status" role="status">
                        {$_('filesharing.encryptPanel.retrying', {
                            values: {
                                attempt: $retryStatus.attempt + 1,
                                max: $retryStatus.maxAttempts,
                            },
                        })}
                    </p>
                {/if}

                {#if downloadState === 'Done'}
                    <div in:fade={{ duration: 300, delay: 200 }}>
                        <FileList files={fileList} />
                    </div>
                {/if}

                {#if downloadState === 'Done' && senderIdentity?.email}
                    <div
                        class="sender-section"
                        in:fade={{ duration: 300, delay: 280 }}
                    >
                        <svg
                            class="checkmark"
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 5L4.5 8.5L11 1"
                                stroke="currentColor"
                                stroke-width="1.75"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <p class="sender-label">
                            {$_('filesharing.decryptpanel.verifiedEmail')}
                        </p>
                        <strong class="sender-email"
                            >{senderIdentity.email}</strong
                        >
                        {#if senderIdentity.attributes.filter((a) => !a.type.includes('email') && a.value).length > 0}
                            <div class="attr-chips">
                                {#each senderIdentity.attributes.filter((a) => !a.type.includes('email') && a.value) as attr (attr.type)}
                                    <span class="attr-chip">{attr.value}</span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {:else if downloadState === 'SessionExpired'}
            <p class="error-description">
                {$_('filesharing.decryptpanel.sessionExpiredSubtitle')}
            </p>
            <p class="error-description">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html $_('filesharing.decryptpanel.sessionExpiredMessage')}
            </p>
        {:else if downloadState === 'ServerError'}
            <p class="error-description">
                {$_('filesharing.decryptpanel.serverErrorSubtitle')}
            </p>
            <p class="error-description">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html $_('filesharing.decryptpanel.serverErrorMessage')}
            </p>
            <div class="report-wrapper">
                <ReportErrorButton
                    error={lastError}
                    context={{ source: 'download', state: 'ServerError' }}
                />
            </div>
        {:else if downloadState === 'Fail'}
            <p class="error-description">
                {$_('filesharing.decryptpanel.notFoundSubtitle')}
            </p>
            <p class="error-description">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html $_('filesharing.decryptpanel.notFoundMessage')}
            </p>
        {:else if downloadState === 'IdentityMismatch'}
            <p class="error-description">
                {$_('filesharing.decryptpanel.identityMismatchSubtitle')}
            </p>
            <p class="error-description">
                {$_('filesharing.decryptpanel.identityMismatchMessage')}
            </p>
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

    .retry-status {
        text-align: center;
        margin: 0 0 1rem 0;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
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
        flex-direction: column;
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

    .banner-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        position: relative;

        p {
            margin: 0;
        }
    }

    .state-wrap {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .success-banner :global(.container) {
        padding: 0;
    }

    .success-banner :global(.container .label) {
        display: none;
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

    .retry-wrapper,
    .report-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 0.5rem;
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
