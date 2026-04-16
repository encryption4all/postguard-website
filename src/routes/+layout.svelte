<script lang="ts">
    import { onMount } from 'svelte'

    let { children } = $props()

    // Mark that the app has hydrated so subsequent navigations
    // to / don't trigger the returning visitor redirect.
    onMount(() => {
        window.__pg_client_nav = true
    })
</script>

{@render children()}

<style>
    :global(html),
    :global(body),
    :global(#app) {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
