<script lang="ts">
    import '@privacybydesign/yivi-css'
    import { onMount } from 'svelte'

    interface props {
        mode?: 'qr' | 'deeplink'
    }

    let { mode = 'qr' }: props = $props()

    let qrLoaded = $state(false)
    let containerEl: HTMLDivElement

    onMount(() => {
        let autoClicked = false

        const observer = new MutationObserver(() => {
            // Check for QR canvas (Yivi renders QR codes as canvas elements)
            if (containerEl.querySelector('canvas')) {
                qrLoaded = true
                observer.disconnect()
                return
            }

            // On mobile, YiviWeb shows a button instead of a QR code.
            // Handle based on mode:
            if (!autoClicked) {
                if (mode === 'deeplink') {
                    // Deep link mode: auto-click the app button to open Yivi
                    const buttonLink = containerEl.querySelector<HTMLElement>('.yivi-web-button-link')
                    if (buttonLink) {
                        autoClicked = true
                        buttonLink.click()
                    }
                } else {
                    // QR mode: auto-click "show QR" to force QR rendering
                    const chooseQR = containerEl.querySelector<HTMLElement>('[data-yivi-glue-transition="chooseQR"]')
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

<div id="crypt-irma-qr" class="yivi-qr-container" bind:this={containerEl}>
    {#if !qrLoaded}
        <svg class="spinner" viewBox="0 0 24 24" width="32" height="32">
            <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
        </svg>
    {/if}
</div>

<style>
    .yivi-qr-container {
        --qr-size: 230px;
        --container-size: calc(var(--qr-size) / 0.96);

        width: var(--container-size) !important;
        height: var(--container-size) !important;
        min-width: var(--container-size) !important;
        max-width: var(--container-size) !important;
        min-height: var(--container-size) !important;
        max-height: var(--container-size) !important;
        border-radius: var(--pg-border-radius-md);
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    /* Hide all Yivi UI elements except the QR code */
    .yivi-qr-container :global(.yivi-web-header),
    .yivi-qr-container :global(.yivi-web-button-link),
    .yivi-qr-container :global(.yivi-web-loading-animation),
    .yivi-qr-container :global(.yivi-web-logo),
    .yivi-qr-container :global(.yivi-web-button),
    .yivi-qr-container :global(.yivi-web-waiting-for-user),
    .yivi-qr-container :global(footer),
    .yivi-qr-container :global(header),
    .yivi-qr-container :global(p),
    .yivi-qr-container :global(h1),
    .yivi-qr-container :global(h2),
    .yivi-qr-container :global(h3) {
        display: none !important;
    }

    /* Constrain all direct children */
    .yivi-qr-container :global(> *) {
        max-width: var(--container-size) !important;
        max-height: var(--container-size) !important;
    }

    /* Force Yivi containers to fit our dimensions */
    .yivi-qr-container :global(.yivi-web-content) {
        width: var(--container-size) !important;
        height: var(--container-size) !important;
        min-width: var(--container-size) !important;
        max-width: var(--container-size) !important;
        min-height: var(--container-size) !important;
        max-height: var(--container-size) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
    }

    .yivi-qr-container :global(.yivi-web-form) {
        width: var(--container-size) !important;
        height: var(--container-size) !important;
        min-width: var(--container-size) !important;
        max-width: var(--container-size) !important;
        min-height: var(--container-size) !important;
        max-height: var(--container-size) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
    }

    /* QR code elements - let them render at native size, constrain with max */
    .yivi-qr-container :global(canvas),
    .yivi-qr-container :global(svg) {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        max-width: var(--qr-size) !important;
        max-height: var(--qr-size) !important;
        width: auto !important;
        height: auto !important;
        image-rendering: pixelated !important;
        image-rendering: crisp-edges !important;
    }

    /* Ensure any div containing QR is visible */
    .yivi-qr-container :global(div:has(> canvas)),
    .yivi-qr-container :global(div:has(> svg)) {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    .spinner {
        animation: spin 1s linear infinite;
        color: #9ca3af;
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
</style>
