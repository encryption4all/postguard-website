<script lang="ts">
    import '@privacybydesign/yivi-css'
    import { onMount } from 'svelte'

    interface props {
        mode?: 'qr' | 'deeplink'
        id?: string
        responsive?: boolean
    }

    let { mode = 'qr', id = 'crypt-irma-qr', responsive = false }: props = $props()

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

<div {id} class="yivi-qr-container" class:responsive bind:this={containerEl}>
    {#if !qrLoaded}
        <svg class="spinner" viewBox="0 0 24 24" width="32" height="32">
            <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
        </svg>
    {/if}
</div>

<style>
    /*
     * Reset all Yivi plugin CSS, but preserve the styles of Yivi's animation elements.
     * Animation elements (phone, checkmark, etc.) rely on their Yivi CSS rules for
     * colour, size, and keyframe animations — stripping them would break the visuals.
     */
    .yivi-qr-container :global(*:not(
        .yivi-web-waiting-for-user-animation,
        .yivi-web-checkmark-animation,
        .yivi-web-forbidden-animation,
        .yivi-web-clock-animation
    )) {
        all: revert !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
    }

    .yivi-web-content {
        min-width: 0px !important;
    }

    .yivi-qr-container {
        width: 250px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        background: var(--pg-general-background);
        border: 1.5px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        padding: 10px;
    }

    .yivi-qr-container.responsive {
        /* width: 100%; */
        height: auto;
        min-height: 200px;
    }

    .yivi-qr-container.responsive :global(canvas),
    .yivi-qr-container.responsive :global(svg) {
        width: 100% !important;
        height: auto !important;
    }

    /*
     * Hide everything except the QR canvas/svg and Yivi's post-scan animation states
     * (waiting-for-user, success, cancelled, timeout/error).
     * The :has() selectors ensure ancestor divs of visible content are also shown.
     */
    .yivi-qr-container :global(:not(
        canvas, svg,
        div:has(canvas), div:has(svg),
        .yivi-web-waiting-for-user-animation,
        .yivi-web-checkmark-animation,
        .yivi-web-forbidden-animation,
        .yivi-web-clock-animation,
        div:has(.yivi-web-waiting-for-user-animation),
        div:has(.yivi-web-checkmark-animation),
        div:has(.yivi-web-forbidden-animation),
        div:has(.yivi-web-clock-animation)
    )) {
        display: none !important;
    }

    .yivi-qr-container :global(div:has(> canvas)),
    .yivi-qr-container :global(div:has(> svg)) {
        display: flex !important;
        justify-content: center;
        align-items: center;
    }

    .yivi-qr-container :global(canvas),
    .yivi-qr-container :global(svg) {
        display: block !important;
        image-rendering: pixelated !important;
        image-rendering: crisp-edges !important;
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
</style>
