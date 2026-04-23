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
    <footer class="app-footer">
        <a href="/about">About</a>
        <span class="sep">&middot;</span>
        <a href="/privacy">Privacy Policy</a>
        <span class="sep">&middot;</span>
        <span>Built by <a href="https://yivi.app">Yivi</a></span>
    </footer>
{/if}

<style>
    main {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    .app-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.75rem 1rem;
        font-size: var(--pg-font-size-xs);
        color: var(--pg-text-secondary);

        a {
            color: var(--pg-text-secondary);
            text-decoration: none;
        }

        a:hover {
            color: var(--pg-primary);
        }

        .sep {
            opacity: 0.5;
        }
    }
</style>
