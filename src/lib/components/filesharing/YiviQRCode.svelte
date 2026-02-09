<script lang="ts">
    import '@privacybydesign/yivi-css'

    interface props {
        // This component just renders the QR code
        // Yivi initialization happens externally
    }

    let { }: props = $props()
</script>

<div id="crypt-irma-qr" class="yivi-qr-container"></div>

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
</style>
