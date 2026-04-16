<script>
    import { onMount } from 'svelte'

    import decryptImg from '$lib/assets/images/decrypt.svg'
    import Decrypt from '$lib/components/fallback/Decrypt.svelte'
    import Settings from '$lib/components/fallback/Settings.svelte'

    import Icon from '@iconify/svelte'

    import { currSelected } from '$lib/components/fallback/stores.js'

    import { _ } from 'svelte-i18n'

    import EmailView from '$lib/components/fallback/EmailView.svelte'
    import ListView from '$lib/components/fallback/ListView.svelte'

    const LEFTMODES = { ListView: 'List', Settings: 'Settings' }
    let currLeft = $state(LEFTMODES.ListView)

    const RIGHTMODES = {
        Nothing: 'Nothing',
        MailView: 'MailView',
        Decrypt: 'Decrypt',
    }

    let hashMode = $state(false)
    let currRight = $state();
    $effect(() => {
        if (!hashMode) {
            currRight = $currSelected >= 0 ? RIGHTMODES.MailView : RIGHTMODES.Nothing
        }
    });

    let searchTerm = $state()
    let readable = $state()

    let unique = $state({})
    const onFile = async (event) => {
        const [inFile] = event.srcElement.files
        readable = inFile.stream()
        unique = {}
        currRight = RIGHTMODES.Decrypt
    }

    function fromUrlSafeBase64(urlSafe) {
        let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/')
        const pad = base64.length % 4
        if (pad === 2) base64 += '=='
        else if (pad === 3) base64 += '='
        return base64
    }

    onMount(async () => {
        const hash = window.location.hash
        if (hash && hash.length > 1) {
            try {
                const urlSafeBase64 = hash.substring(1)
                const base64 = fromUrlSafeBase64(urlSafeBase64)
                const binaryString = atob(base64)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                readable = new ReadableStream({
                    start(c) {
                        c.enqueue(bytes)
                        c.close()
                    },
                })

                hashMode = true
                unique = {}
                currRight = RIGHTMODES.Decrypt
            } catch (e) {
                console.error('[PostGuard] Failed to decode URL hash:', e)
            }
        }
    })
</script>

<div class="fallback-page">
    <div class="extension-banner">
        <span>{$_('fallback.extensionPrompt')}</span>
        <a href="/addons">{$_('fallback.extensionLink')}</a>
    </div>
    <div class="fallback-container">
        <div class="left-panel">
            <label class="upload-area">
                <Icon icon="mdi:upload-lock" width="28px" />
                <span>{$_('fallback.drop')}</span>
                <input type="file" onchange={onFile} />
            </label>

            <div class="search-bar">
                <div class="search-input-wrapper">
                    <Icon icon="mdi:magnify" class="search-icon" />
                    <input
                        type="search"
                        class="pg-input search-field"
                        placeholder={$_('fallback.search')}
                        bind:value={searchTerm}
                    />
                </div>
                <button
                    class="settings-button"
                    onclick={() =>
                        (currLeft =
                            currLeft === LEFTMODES.Settings
                                ? LEFTMODES.ListView
                                : LEFTMODES.Settings)}
                    type="button"
                >
                    <Icon icon="mdi:cog" width="24px" />
                </button>
            </div>

            <div class="email-list-area">
                {#if currLeft === LEFTMODES.ListView}
                    <ListView bind:rightMode={currRight} bind:searchTerm />
                {:else}
                    <Settings bind:currMode={currLeft} />
                {/if}
            </div>
        </div>

        <div class="right-panel">
            {#if currRight === RIGHTMODES.MailView}
                <EmailView />
            {:else if currRight === RIGHTMODES.Nothing}
                <div class="placeholder">
                    <img
                        src={decryptImg}
                        class="invert"
                        alt="decrypt"
                        width="280"
                        height="320"
                    />
                </div>
            {:else}
                {#key unique}
                    <Decrypt {readable} bind:rightMode={currRight} />
                {/key}
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .fallback-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem;
        height: calc(100vh - 52px);
        box-sizing: border-box;
    }

    .extension-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);

        a {
            color: var(--pg-primary);
            font-weight: var(--pg-font-weight-semibold);
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .fallback-container {
        display: flex;
        gap: 1.5rem;
        max-width: 1200px;
        width: 100%;
        height: 100%;
    }

    .left-panel {
        flex: 0 0 360px;
        display: flex;
        flex-direction: column;
        background: var(--pg-general-background);
        border: 1px solid var(--pg-input-normal);
        border-radius: var(--pg-border-radius-lg);
        overflow: hidden;
    }

    .upload-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1.5rem;
        margin: 1rem;
        border: 1.5px dashed var(--pg-input-normal);
        border-radius: var(--pg-border-radius-md);
        cursor: pointer;
        color: var(--pg-text-secondary);
        font-size: var(--pg-font-size-sm);
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--pg-primary);
            color: var(--pg-primary);
        }

        input[type='file'] {
            display: none;
        }
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 1rem;
        margin-bottom: 0.5rem;
    }

    .search-input-wrapper {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;

        :global(.search-icon) {
            position: absolute;
            left: 0.6rem;
            color: var(--pg-text-secondary);
            pointer-events: none;
        }
    }

    .search-field {
        padding-left: 2.2rem !important;
        height: 2.2rem !important;
        font-size: var(--pg-font-size-sm) !important;
    }

    .settings-button {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem;
        border-radius: var(--pg-border-radius-sm);
        color: var(--pg-text-secondary);
        transition: color 0.2s ease;
        flex-shrink: 0;

        &:hover {
            color: var(--pg-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--pg-primary);
            outline-offset: 2px;
        }
    }

    .email-list-area {
        flex: 1;
        overflow-y: auto;
        border-top: 1px solid var(--pg-input-normal);
    }

    .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--pg-general-background);
        border: 1px solid var(--pg-input-normal);
        border-radius: var(--pg-border-radius-lg);
        overflow: hidden;
        min-width: 0;
    }

    .placeholder {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media only screen and (max-width: 768px) {
        .fallback-page {
            height: auto;
            min-height: calc(100vh - 52px);
        }

        .fallback-container {
            flex-direction: column;
            height: auto;
        }

        .left-panel {
            flex: none;
            max-height: 40vh;
        }

        .right-panel {
            min-height: 50vh;
        }
    }
</style>
