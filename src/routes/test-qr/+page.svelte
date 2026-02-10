<script lang="ts">
    import { onMount } from 'svelte'
    import { dev } from '$app/environment'
    import { goto } from '$app/navigation'
    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import { RetrieveSignKeys } from '$lib/yivi-tools'

    // Redirect to home if not in development mode
    if (!dev) {
        goto('/')
    }

    onMount(async () => {
        // Initialize Yivi session for testing
        try {
            const pubSignId = [
                { t: 'pbdf.sidn-pbdf.email.email' },
            ]

            await RetrieveSignKeys(pubSignId)
        } catch (error) {
            console.error('Failed to load QR code:', error)
        }
    })
</script>

<div class="test-container">
    <h1>Yivi QR Code Test Page</h1>


            <YiviQRCode />
    <br/>
    <div class="debug-info">
        <h2>Debug Info:</h2>
        <ul>
            <li>QR Wrapper: 240px × 240px with rounded corners</li>
            <li>QR Inner: 230px × 230px</li>
            <li>QR Code: max 220px × 220px</li>
        </ul>
    </div>
</div>

<style>
    .test-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
        color: var(--pg-text);
        margin-bottom: 2rem;
    }

    .debug-info {
        background: var(--pg-strong-background);
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid var(--pg-primary);
    }

    .debug-info h2 {
        margin-top: 0;
        color: var(--pg-primary-contrast);
    }

    .debug-info ul {
        margin: 0;
        padding-left: 1.5rem;
    }

    .debug-info li {
        margin-bottom: 0.5rem;
        color: var(--pg-text-secondary);
    }
</style>
