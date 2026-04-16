<script lang="ts">
    import Header from '$lib/components/Header.svelte'
    import { isLoading } from 'svelte-i18n'
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte'

    let { children } = $props()
    let contactEl = $state<HTMLAnchorElement>()

    onMount(() => {
        if (contactEl) {
            const addr = `${contactEl.dataset.name}@${contactEl.dataset.domain}`
            contactEl.href = `mailto:${addr}`
            contactEl.textContent = addr
        }
    })
</script>

{#if !$isLoading}
    <Header />
    <main>
        {@render children()}
    </main>
    <footer>
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>{$_('footer.productTitle')}</h4>
                    <ul>
                        <li><a href="/fileshare">{$_('footer.fs')}</a></li>
                        <li><a href="/decrypt">{$_('footer.inbox')}</a></li>
                        <li><a href="/addons">{$_('footer.addons')}</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>{$_('footer.resourcesTitle')}</h4>
                    <ul>
                        <li><a href="/about">{$_('footer.about')}</a></li>
                        <li><a href="/blog">{$_('footer.blog')}</a></li>
                        <li><a href="https://docs.postguard.eu">{$_('footer.docs')}</a></li>
                        <li><a href="/privacy">{$_('footer.pol')}</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>{$_('footer.connectTitle')}</h4>
                    <ul>
                        <li><a href="#contact" bind:this={contactEl} data-name="info" data-domain="postguard.eu">{$_('footer.contact')}</a></li>
                        <li><a href="https://github.com/encryption4all">GitHub</a></li>
                        <li><a href="https://business.postguard.eu">PostGuard for Business</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>{$_('footer.builtBy')} <a href="https://yivi.app">Yivi</a> @ <a href="https://caesar.nl">Caesar Groep</a></p>
            </div>
        </div>
    </footer>
{/if}

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    footer {
        margin-top: 4rem;
        padding: 0 1rem 1.5rem;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
    }

    .footer-content {
        max-width: 1100px;
        margin: 0 auto;
        border-top: 1px solid var(--pg-strong-background);
        padding-top: 3rem;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .footer-col {
        h4 {
            font-size: var(--pg-font-size-sm);
            font-weight: var(--pg-font-weight-semibold);
            color: var(--pg-text);
            margin: 0 0 0.75rem;
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        li {
            margin-bottom: 0.4rem;
        }

        a {
            color: var(--pg-text-secondary);
            text-decoration: none;

            &:hover {
                color: var(--pg-primary);
            }
        }
    }

    .footer-bottom {
        border-top: 1px solid var(--pg-strong-background);
        padding-top: 1.5rem;
        text-align: center;

        p {
            margin: 0;
        }

        a {
            color: var(--pg-text-secondary);
            text-decoration: none;
            font-weight: var(--pg-font-weight-semibold);

            &:hover {
                color: var(--pg-primary);
            }
        }
    }

    @media only screen and (max-width: 768px) {
        .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
    }
</style>
