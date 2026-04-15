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
    <footer>
        <div class="footer-content">
            <p>&copy; {new Date().getFullYear()} PostGuard. All rights reserved.</p>
        </div>
    </footer>
{/if}

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    footer {
        border-top: 1px solid var(--pg-strong-background);
        padding: 2rem 1rem;
        text-align: center;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
    }

    .footer-content {
        max-width: 1100px;
        margin: 0 auto;
    }
</style>
