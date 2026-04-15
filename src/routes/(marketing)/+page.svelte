<script lang="ts">
    import { browser } from '$app/environment'
    import { onMount } from 'svelte'
    import { _ } from 'svelte-i18n'
    import SEO from '$lib/components/SEO.svelte'

    onMount(() => {
        localStorage.setItem('pg_visited', 'true')
    })
</script>

<SEO
    title="Secure File Sharing & Email Encryption"
    description="PostGuard offers free, easy-to-use end-to-end encryption for emails and files. Your data never leaves your browser unencrypted."
/>

<div class="landing">
    <section class="hero">
        <h1>{$_('home.title')}</h1>
        <p class="hero-text">{$_('home.par')}</p>
        <div class="cta-buttons">
            <a href="/fileshare" class="cta-primary">{$_('landing.cta')}</a>
            <a href="/about" class="cta-secondary">{$_('landing.learnMore')}</a>
        </div>
    </section>

    <section class="features">
        <h2>{$_('home.subtitle1')}</h2>
        <p>{$_('home.subpar1')}</p>

        <div class="feature-grid">
            <div class="feature-card">
                <h3>{$_('landing.feature1Title')}</h3>
                <p>{$_('landing.feature1Desc')}</p>
            </div>
            <div class="feature-card">
                <h3>{$_('landing.feature2Title')}</h3>
                <p>{$_('landing.feature2Desc')}</p>
            </div>
            <div class="feature-card">
                <h3>{$_('landing.feature3Title')}</h3>
                <p>{$_('landing.feature3Desc')}</p>
            </div>
        </div>
    </section>
</div>

<style lang="scss">
    .landing {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .hero {
        text-align: center;
        padding: 4rem 0 3rem;

        h1 {
            font-size: var(--pg-font-size-2xl);
            font-weight: var(--pg-font-weight-extrabold);
            margin-bottom: 1.5rem;
        }
    }

    .hero-text {
        font-size: var(--pg-font-size-lg);
        line-height: 1.6;
        max-width: 700px;
        margin: 0 auto 2rem;
        color: var(--pg-text-secondary);
    }

    .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .cta-primary {
        display: inline-block;
        padding: 0.875rem 2rem;
        background: var(--pg-primary);
        color: white;
        border: 2px solid var(--pg-primary);
        border-radius: var(--pg-border-radius-sm);
        text-decoration: none;
        font-weight: var(--pg-font-weight-semibold);
        font-size: var(--pg-font-size-base);
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.9;
        }
    }

    .cta-secondary {
        display: inline-block;
        padding: 0.875rem 2rem;
        border: 2px solid var(--pg-primary);
        color: var(--pg-primary);
        border-radius: var(--pg-border-radius-sm);
        text-decoration: none;
        font-weight: var(--pg-font-weight-semibold);
        font-size: var(--pg-font-size-base);
        transition: background 0.2s ease;

        &:hover {
            background: var(--pg-soft-background);
        }
    }

    .features {
        padding: 3rem 0;

        h2 {
            text-align: center;
            margin-bottom: 1rem;
        }

        > p {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 2.5rem;
            line-height: 1.6;
            color: var(--pg-text-secondary);
        }
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }

    .feature-card {
        padding: 1.5rem;
        background: var(--pg-soft-background);
        border-radius: var(--pg-border-radius-md);
        border: 1px solid var(--pg-strong-background);

        h3 {
            margin: 0 0 0.75rem;
            font-size: var(--pg-font-size-base);
            font-weight: var(--pg-font-weight-semibold);
        }

        p {
            margin: 0;
            font-size: var(--pg-font-size-sm);
            line-height: 1.5;
            color: var(--pg-text-secondary);
        }
    }

    @media only screen and (max-width: 768px) {
        .hero {
            padding: 2rem 0;
        }

        .feature-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
