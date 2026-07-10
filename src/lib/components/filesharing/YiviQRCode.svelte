<script lang="ts">
    import '@privacybydesign/yivi-css'
    import { onMount } from 'svelte'

    interface props {
        mode?: 'qr' | 'deeplink'
        id?: string
        responsive?: boolean
        /** Called once when the Yivi widget enters a terminal, recoverable
         *  state — the disclosure was cancelled, the Yivi app was closed
         *  mid-flow, or the session timed out. In all of these YiviWeb renders
         *  its own small "session cancelled / try again" screen (identified by
         *  the `.yivi-web-restart-button`) but the surrounding pg-js
         *  `encrypt()` promise never settles, so the send flow would otherwise
         *  hang silently. The parent uses this to surface a clear recovery
         *  action instead. See #294. */
        oninterrupted?: () => void
    }

    let {
        mode = 'qr',
        id = 'crypt-irma-qr',
        responsive = false,
        oninterrupted,
    }: props = $props()

    let qrLoaded = $state(false)
    let containerEl: HTMLDivElement

    onMount(() => {
        let autoClicked = false
        let interrupted = false

        const observer = new MutationObserver(() => {
            // Terminal recoverable states (Cancelled / TimedOut / Error) all
            // render a restart button. Detect it and hand control back to the
            // parent exactly once so it can offer a clear retry instead of
            // leaving the user stuck on Yivi's buried "try again" link.
            if (
                !interrupted &&
                containerEl.querySelector('.yivi-web-restart-button')
            ) {
                interrupted = true
                observer.disconnect()
                oninterrupted?.()
                return
            }

            // Check for a rendered QR code (Yivi renders it as a <canvas> or,
            // in newer versions, an inline <svg>). We keep observing after it
            // loads so the terminal-state detection above still fires if the
            // user later cancels or the session times out.
            if (
                containerEl.querySelector('canvas') ||
                containerEl.querySelector('.yivi-web-qr-code')
            ) {
                qrLoaded = true
                return
            }

            // On mobile, YiviWeb shows a button instead of a QR code.
            // Handle based on mode:
            if (!autoClicked) {
                if (mode === 'deeplink') {
                    // Deep link mode: auto-click the app button to open Yivi
                    const buttonLink = containerEl.querySelector<HTMLElement>(
                        '.yivi-web-button-link'
                    )
                    if (buttonLink) {
                        autoClicked = true
                        buttonLink.click()
                    }
                } else {
                    // QR mode: auto-click "show QR" to force QR rendering
                    const chooseQR = containerEl.querySelector<HTMLElement>(
                        '[data-yivi-glue-transition="chooseQR"]'
                    )
                    if (chooseQR) {
                        autoClicked = true
                        chooseQR.click()
                    }
                }
            }
        })
        observer.observe(containerEl, { childList: true, subtree: true })
        return () => observer.disconnect()
    })
</script>

<div {id} class="yivi-qr-container" class:responsive bind:this={containerEl}>
    {#if !qrLoaded}
        <svg class="spinner" viewBox="0 0 24 24" width="32" height="32">
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
    {/if}
</div>

<style>
    .yivi-qr-container {
        width: 330px;
        height: 330px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        background: white;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        padding: 4px;
    }

    .yivi-qr-container.responsive {
        width: 100%;
        max-width: 330px;
        aspect-ratio: 1 / 1;
        height: auto;
        min-height: 200px;
    }

    .yivi-qr-container.responsive :global(canvas),
    .yivi-qr-container.responsive :global(svg) {
        width: 100% !important;
        height: auto !important;
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
</style>
