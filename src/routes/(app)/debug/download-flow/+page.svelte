<script lang="ts">
    import { onDestroy } from 'svelte'
    import { fade, slide } from 'svelte/transition'
    import { _ } from 'svelte-i18n'
    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import FileList from '$lib/components/filesharing/FileList.svelte'
    import DecryptionProgress from '$lib/components/filesharing/DecryptionProgress.svelte'
    import ReportErrorButton from '$lib/components/filesharing/ReportErrorButton.svelte'
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

    const ALL_STATES: DownloadState[] = [
        'Downloading',
        'Recipients',
        'Ready',
        'Decrypting',
        'Done',
        'Fail',
        'ServerError',
        'IdentityMismatch',
        'SessionExpired',
    ]

    // ---- Live preview state (mirrors download/+page.svelte) ----
    let downloadState: DownloadState = $state('Downloading')
    let decryptPct: number | undefined = $state(undefined)
    let showRetry = $state(false)
    let retryAttempt = $state(0)
    const retryMax = 5

    const mockSenderIdentity = {
        email: 'alice@example.com',
        attributes: [
            { type: 'pbdf.sidn-pbdf.email.email', value: 'alice@example.com' },
            {
                type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                value: '+31612345678',
            },
            {
                type: 'pbdf.nijmegen.personalData.fullname',
                value: 'Alice Jansen',
            },
        ],
    }

    let showSenderIdentity = $state(true)
    let multipleRecipients = $state(false)
    let recipientKey = $state('')
    const recipientList = [
        'alice@example.com',
        'bob@example.com',
        'carol@example.com',
    ]
    const fileList = ['holiday-photos.zip', 'contract-2026.pdf', 'notes.md']

    // ---- Auto-play scenarios ----
    let scenarioTimer: ReturnType<typeof setInterval> | null = null
    let scenarioTimeouts: ReturnType<typeof setTimeout>[] = []
    let activeScenario: string | null = $state(null)

    function clearScenario() {
        if (scenarioTimer) clearInterval(scenarioTimer)
        scenarioTimer = null
        for (const t of scenarioTimeouts) clearTimeout(t)
        scenarioTimeouts = []
        activeScenario = null
    }

    function defer(ms: number, fn: () => void) {
        scenarioTimeouts.push(setTimeout(fn, ms))
    }

    function reset() {
        clearScenario()
        downloadState = 'Downloading'
        decryptPct = undefined
        showRetry = false
        retryAttempt = 0
        recipientKey = ''
    }

    function runDeterminateHappyPath() {
        clearScenario()
        activeScenario = 'determinate-happy'
        downloadState = 'Downloading'
        decryptPct = undefined
        defer(1200, () => {
            downloadState = 'Ready'
        })
        defer(3000, () => {
            downloadState = 'Decrypting'
            decryptPct = 0
            let pct = 0
            scenarioTimer = setInterval(() => {
                pct += 4
                if (pct >= 100) {
                    decryptPct = 100
                    if (scenarioTimer) clearInterval(scenarioTimer)
                    scenarioTimer = null
                    defer(500, () => {
                        downloadState = 'Done'
                        activeScenario = null
                    })
                } else {
                    decryptPct = pct
                }
            }, 120)
        })
    }

    function runIndeterminateThenDeterminate() {
        clearScenario()
        activeScenario = 'indet-then-det'
        downloadState = 'Downloading'
        decryptPct = undefined
        defer(1000, () => {
            downloadState = 'Ready'
        })
        defer(2500, () => {
            downloadState = 'Decrypting'
            decryptPct = undefined
        })
        defer(5500, () => {
            decryptPct = 0
            let pct = 0
            scenarioTimer = setInterval(() => {
                pct += 5
                if (pct >= 100) {
                    decryptPct = 100
                    if (scenarioTimer) clearInterval(scenarioTimer)
                    scenarioTimer = null
                    defer(500, () => {
                        downloadState = 'Done'
                        activeScenario = null
                    })
                } else {
                    decryptPct = pct
                }
            }, 100)
        })
    }

    function runPureIndeterminate() {
        clearScenario()
        activeScenario = 'pure-indet'
        downloadState = 'Downloading'
        decryptPct = undefined
        defer(1000, () => {
            downloadState = 'Ready'
        })
        defer(2500, () => {
            downloadState = 'Decrypting'
            decryptPct = undefined
        })
        defer(8000, () => {
            downloadState = 'Done'
            activeScenario = null
        })
    }

    function runRetryScenario() {
        clearScenario()
        activeScenario = 'retry'
        downloadState = 'Decrypting'
        decryptPct = undefined
        showRetry = true
        retryAttempt = 0
        scenarioTimer = setInterval(() => {
            retryAttempt += 1
            if (retryAttempt >= retryMax) {
                if (scenarioTimer) clearInterval(scenarioTimer)
                scenarioTimer = null
                defer(800, () => {
                    showRetry = false
                    decryptPct = 0
                    let pct = 0
                    scenarioTimer = setInterval(() => {
                        pct += 8
                        if (pct >= 100) {
                            decryptPct = 100
                            if (scenarioTimer) clearInterval(scenarioTimer)
                            scenarioTimer = null
                            defer(400, () => {
                                downloadState = 'Done'
                                activeScenario = null
                            })
                        } else {
                            decryptPct = pct
                        }
                    }, 80)
                })
            }
        }, 1200)
    }

    function setStateManual(s: DownloadState) {
        clearScenario()
        downloadState = s
        if (s === 'Decrypting') {
            // leave pct as-is so the slider value persists
        } else {
            decryptPct = undefined
        }
        if (s === 'Recipients') {
            multipleRecipients = true
            recipientKey = ''
        }
    }

    function setPctNumber(v: number) {
        decryptPct = v
    }
    function setPctUndefined() {
        decryptPct = undefined
    }

    onDestroy(clearScenario)
</script>

<div class="debug-shell">
    <aside class="devtools">
        <div class="devtools-inner">
            <header class="devtools-header">
                <h1>Download Flow Sandbox</h1>
                <p>Dev-only. Drive the download page state machine by hand.</p>
            </header>

            <section class="dev-section">
                <h2>Scenarios</h2>
                <div class="btn-grid">
                    <button
                        class="dev-btn primary"
                        class:active={activeScenario === 'determinate-happy'}
                        onclick={runDeterminateHappyPath}
                    >
                        ▶ Happy path (determinate)
                    </button>
                    <button
                        class="dev-btn primary"
                        class:active={activeScenario === 'indet-then-det'}
                        onclick={runIndeterminateThenDeterminate}
                    >
                        ▶ Indeterminate → determinate
                    </button>
                    <button
                        class="dev-btn primary"
                        class:active={activeScenario === 'pure-indet'}
                        onclick={runPureIndeterminate}
                    >
                        ▶ Pure indeterminate (no %)
                    </button>
                    <button
                        class="dev-btn primary"
                        class:active={activeScenario === 'retry'}
                        onclick={runRetryScenario}
                    >
                        ▶ Decrypt with retries
                    </button>
                    <button class="dev-btn" onclick={reset}>↺ Reset</button>
                </div>
            </section>

            <section class="dev-section">
                <h2>Force state</h2>
                <div class="btn-grid">
                    {#each ALL_STATES as s (s)}
                        <button
                            class="dev-btn"
                            class:active={downloadState === s &&
                                !activeScenario}
                            onclick={() => setStateManual(s)}
                        >
                            {s}
                        </button>
                    {/each}
                </div>
            </section>

            <section class="dev-section">
                <h2>Decrypt progress</h2>
                <div class="row">
                    <label for="pct-slider">
                        Percentage:
                        <strong
                            >{decryptPct === undefined
                                ? 'undefined'
                                : `${decryptPct}%`}</strong
                        >
                    </label>
                </div>
                <input
                    id="pct-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={decryptPct ?? 0}
                    oninput={(e) =>
                        setPctNumber(
                            Number((e.currentTarget as HTMLInputElement).value)
                        )}
                />
                <div class="btn-row">
                    <button class="dev-btn small" onclick={setPctUndefined}>
                        Set undefined (indeterminate)
                    </button>
                    <button
                        class="dev-btn small"
                        onclick={() => setPctNumber(0)}
                    >
                        0%
                    </button>
                    <button
                        class="dev-btn small"
                        onclick={() => setPctNumber(50)}
                    >
                        50%
                    </button>
                    <button
                        class="dev-btn small"
                        onclick={() => setPctNumber(100)}
                    >
                        100%
                    </button>
                </div>
            </section>

            <section class="dev-section">
                <h2>Toggles</h2>
                <label class="toggle">
                    <input type="checkbox" bind:checked={showRetry} />
                    Show retry status
                </label>
                {#if showRetry}
                    <div class="row indented">
                        <label for="retry-slider">
                            Attempt: <strong
                                >{retryAttempt + 1} / {retryMax}</strong
                            >
                        </label>
                        <input
                            id="retry-slider"
                            type="range"
                            min="0"
                            max={retryMax - 1}
                            step="1"
                            bind:value={retryAttempt}
                        />
                    </div>
                {/if}
                <label class="toggle">
                    <input type="checkbox" bind:checked={showSenderIdentity} />
                    Show verified sender identity
                </label>
                <label class="toggle">
                    <input type="checkbox" bind:checked={multipleRecipients} />
                    Recipients list has multiple entries
                </label>
            </section>

            <section class="dev-section status">
                <h2>State</h2>
                <dl>
                    <dt>downloadState</dt>
                    <dd>{downloadState}</dd>
                    <dt>decryptPct</dt>
                    <dd>
                        {decryptPct === undefined
                            ? 'undefined (indeterminate)'
                            : `${decryptPct}`}
                    </dd>
                    <dt>scenario</dt>
                    <dd>{activeScenario ?? '—'}</dd>
                </dl>
            </section>
        </div>
    </aside>

    <main class="preview">
        <!-- This block mirrors download/+page.svelte 1:1 in markup -->
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
                        <svg
                            class="spinner"
                            viewBox="0 0 24 24"
                            width="36"
                            height="36"
                        >
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
                    {#if showRetry}
                        <p class="retry-status" role="status">
                            {$_('filesharing.encryptPanel.retrying', {
                                values: {
                                    attempt: retryAttempt + 1,
                                    max: retryMax,
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
                            {$_(
                                'filesharing.decryptpanel.irmaInstructionHeaderQr'
                            )}
                        </h3>
                        <p class="card-subtitle">
                            Please select which email belongs to you:
                        </p>
                        <select
                            bind:value={recipientKey}
                            class="recipient-select"
                        >
                            <option value="" disabled selected>
                                Select your email…
                            </option>
                            {#each multipleRecipients ? recipientList : recipientList.slice(0, 1) as k (k)}
                                <option value={k}>{k}</option>
                            {/each}
                        </select>
                        <Chip
                            text={$_('filesharing.decryptpanel.askDownload')}
                            onclick={() => setStateManual('Ready')}
                            size="lg"
                            variant="dark"
                            disabled={!recipientKey}
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
                                {$_(
                                    'filesharing.decryptpanel.irmaInstructionHeaderQr'
                                )}
                            </h3>
                            <p class="card-subtitle">
                                {$_(
                                    'filesharing.decryptpanel.irmaInstructionQr'
                                )}
                            </p>
                            <YiviQRCode
                                id="yivi-debug-flow"
                                responsive
                                mode="qr"
                            />
                        </div>
                        <HelpToggle
                            title={$_('filesharing.encryptPanel.yiviInfo')}
                            content={$_(
                                'filesharing.encryptPanel.yiviInfoText'
                            )}
                            linkText={$_(
                                'filesharing.encryptPanel.yiviInfoLink'
                            )}
                            linkUrl="https://yivi.app"
                            bordered
                        />
                        {#if showSenderIdentity}
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
                                    {$_(
                                        'filesharing.decryptpanel.verifiedEmail'
                                    )}
                                </p>
                                <strong class="sender-email">
                                    {mockSenderIdentity.email}
                                </strong>
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
                                        : $_(
                                              'filesharing.decryptpanel.doneMessage'
                                          )}
                                </p>
                            </div>
                            {#if downloadState === 'Decrypting'}
                                <div transition:slide={{ duration: 280 }}>
                                    <DecryptionProgress
                                        percentage={decryptPct}
                                    />
                                </div>
                            {/if}
                        </div>
                        {#if downloadState === 'Decrypting' && showRetry}
                            <p class="retry-status" role="status">
                                {$_('filesharing.encryptPanel.retrying', {
                                    values: {
                                        attempt: retryAttempt + 1,
                                        max: retryMax,
                                    },
                                })}
                            </p>
                        {/if}

                        {#if downloadState === 'Done'}
                            <div in:fade={{ duration: 300, delay: 200 }}>
                                <FileList files={fileList} />
                            </div>
                        {/if}

                        {#if downloadState === 'Done' && showSenderIdentity}
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
                                    {$_(
                                        'filesharing.decryptpanel.verifiedEmail'
                                    )}
                                </p>
                                <strong class="sender-email">
                                    {mockSenderIdentity.email}
                                </strong>
                                <div class="attr-chips">
                                    {#each mockSenderIdentity.attributes.filter((a) => !a.type.includes('email') && a.value) as attr (attr.type)}
                                        <span class="attr-chip">
                                            {attr.value}
                                        </span>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {:else if downloadState === 'SessionExpired'}
                    <p class="error-description">
                        {$_('filesharing.decryptpanel.sessionExpiredSubtitle')}
                    </p>
                    <p class="error-description">
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html $_(
                            'filesharing.decryptpanel.sessionExpiredMessage'
                        )}
                    </p>
                {:else if downloadState === 'ServerError'}
                    <p class="error-description">
                        {$_('filesharing.decryptpanel.serverErrorSubtitle')}
                    </p>
                    <p class="error-description">
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html $_(
                            'filesharing.decryptpanel.serverErrorMessage'
                        )}
                    </p>
                    <div class="report-wrapper">
                        <ReportErrorButton
                            error={new Error(
                                'Simulated 500 from debug sandbox'
                            )}
                            context={{
                                source: 'download',
                                state: 'ServerError',
                                simulated: true,
                            }}
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
                        {$_(
                            'filesharing.decryptpanel.identityMismatchSubtitle'
                        )}
                    </p>
                    <p class="error-description">
                        {$_('filesharing.decryptpanel.identityMismatchMessage')}
                    </p>
                    <div class="retry-wrapper">
                        <Chip
                            text={$_('filesharing.decryptpanel.tryAgain')}
                            onclick={() => setStateManual('Ready')}
                            size="lg"
                            variant="dark"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </main>
</div>

<style lang="scss">
    .debug-shell {
        display: grid;
        grid-template-columns: 360px 1fr;
        min-height: calc(100vh - 52px);
    }

    .devtools {
        background: var(--pg-soft-background);
        border-right: 2px solid var(--pg-primary-contrast);
        overflow-y: auto;
        max-height: calc(100vh - 52px);
        position: sticky;
        top: 52px;
    }

    .devtools-inner {
        padding: 1rem 1.25rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .devtools-header {
        h1 {
            margin: 0 0 0.25rem;
            font-size: var(--pg-font-size-lg);
            color: var(--pg-primary-contrast);
        }
        p {
            margin: 0;
            font-size: var(--pg-font-size-xs);
            color: var(--pg-text-secondary);
        }
    }

    .dev-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--pg-strong-background);

        h2 {
            margin: 0;
            font-size: var(--pg-font-size-xs);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--pg-text-secondary);
            font-weight: var(--pg-font-weight-medium);
        }
    }

    .dev-section.status dl {
        margin: 0;
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.25rem 0.75rem;
        font-size: var(--pg-font-size-xs);
        font-family: var(--pg-font-family);

        dt {
            color: var(--pg-text-secondary);
        }
        dd {
            margin: 0;
            color: var(--pg-text);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
    }

    .btn-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.4rem;
    }

    .btn-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .dev-btn {
        appearance: none;
        border: 1px solid var(--pg-strong-background);
        background: var(--pg-general-background);
        color: var(--pg-text);
        padding: 0.45rem 0.6rem;
        border-radius: var(--pg-border-radius-sm);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-xs);
        cursor: pointer;
        text-align: center;
        line-height: 1.2;

        &:hover {
            background: var(--pg-strong-background);
        }

        &.primary {
            border-color: var(--pg-primary-contrast);
            color: var(--pg-primary-contrast);
            font-weight: var(--pg-font-weight-medium);
        }

        &.small {
            padding: 0.3rem 0.5rem;
        }

        &.active {
            background: var(--pg-primary-contrast);
            color: white;
            border-color: var(--pg-primary-contrast);
        }
    }

    .row {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: var(--pg-font-size-xs);
        font-family: var(--pg-font-family);
        color: var(--pg-text);

        label {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
        }

        &.indented {
            padding-left: 1.25rem;
        }
    }

    input[type='range'] {
        width: 100%;
    }

    .toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--pg-font-size-xs);
        font-family: var(--pg-font-family);
        color: var(--pg-text);
        cursor: pointer;
    }

    .preview {
        background: var(--pg-general-background);
        overflow-y: auto;
        max-height: calc(100vh - 52px);
    }

    /* ---- The block below is copy-pasted from download/+page.svelte ---- */

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
        font-size: var(--pg-font-size-xs);
        font-family: var(--pg-font-family);
        color: var(--pg-text-secondary);
        background: var(--pg-soft-background);
    }

    .error-description {
        margin: 0;
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
        text-align: center;
        color: var(--pg-text);
    }

    .retry-wrapper,
    .report-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 0.5rem;
    }

    @media (max-width: 900px) {
        .debug-shell {
            grid-template-columns: 1fr;
        }
        .devtools {
            position: static;
            max-height: none;
        }
    }
</style>
