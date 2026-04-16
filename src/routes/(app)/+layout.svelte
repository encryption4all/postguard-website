<script lang="ts">
    import Header from '$lib/components/Header.svelte'
    import { isLoading } from 'svelte-i18n'

    let { children } = $props()
</script>

{#if !$isLoading}
    <Header />
    <main>
        {@render children()}
    </main>
{/if}

<style>
    main {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }
</style>
