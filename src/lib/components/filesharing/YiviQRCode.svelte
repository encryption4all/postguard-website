<script lang="ts">
    import '@privacybydesign/yivi-css'
    import { onMount } from 'svelte'
    import { _ } from 'svelte-i18n'

    interface props {
        mode?: 'qr' | 'deeplink'
        id?: string
        responsive?: boolean
        // Render short, numbered "how to scan" steps directly beneath the QR.
        // Off by default so existing layouts that already carry their own
        // instruction copy are unaffected; the decrypt/scan flows opt in.
        showInstructions?: boolean
    }

    let {
        mode = 'qr',
        id = 'crypt-irma-qr',
        responsive = false,
        showInstructions = false,
    }: props = $props()

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

<div class="yivi-qr" class:responsive>
    <div {id} class="yivi-qr-container" bind:this={containerEl}>
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

    {#if showInstructions}
        <div class="scan-instructions">
            <p class="scan-heading">
                {$_('yivi.scan.heading', { default: 'How to scan' })}
            </p>
            <ol class="scan-steps">
                <li>
                    {$_('yivi.scan.step1', {
                        default: 'Open the free Yivi app on your phone.',
                    })}
                </li>
                <li>
                    {$_('yivi.scan.step2', {
                        default: 'Tap the QR-scan button in the app.',
                    })}
                </li>
                <li>
                    {$_('yivi.scan.step3', {
                        default: "Point your phone's camera at the code above.",
                    })}
                </li>
            </ol>
        </div>
    {/if}
</div>

<style>
    .yivi-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .yivi-qr.responsive {
        width: 100%;
    }

    .yivi-qr-container {
        /* Larger than before (was 330px) so the code is easier to frame and
           scan, especially for low-vision users (#297). */
        width: 360px;
        height: 360px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        /* Pure white surface + a generous white inner margin give the QR the
           high-contrast quiet-zone that scanners need to lock on. */
        background: #ffffff;
        /* Neutral, clearly-visible frame (the pale-blue border read as almost
           no frame). Delineates the white QR box on both light and dark pages. */
        border: 1px solid var(--pg-text-secondary);
        border-radius: var(--pg-border-radius-sm);
        padding: 16px;
    }

    .yivi-qr.responsive .yivi-qr-container {
        width: 100%;
        max-width: 360px;
        aspect-ratio: 1 / 1;
        height: auto;
        min-height: 220px;
    }

    .yivi-qr.responsive .yivi-qr-container :global(canvas),
    .yivi-qr.responsive .yivi-qr-container :global(svg) {
        width: 100% !important;
        height: auto !important;
    }

    /* Keep the enlarged QR modules crisp (no blurry interpolation) so the
       black/white edges stay sharp for the scanner. */
    .yivi-qr-container :global(canvas) {
        image-rendering: pixelated;
    }

    .scan-instructions {
        width: 100%;
        max-width: 360px;
        color: var(--pg-text);
    }

    .scan-heading {
        margin: 0 0 0.4rem;
        font-size: var(--pg-font-size-md);
        font-weight: var(--pg-font-weight-bold);
    }

    .scan-steps {
        margin: 0;
        padding-left: 1.3rem;
        font-size: var(--pg-font-size-md);
        color: var(--pg-text-secondary);
    }

    .scan-steps li {
        margin-bottom: 0.25rem;
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
