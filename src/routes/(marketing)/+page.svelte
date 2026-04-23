<script lang="ts">
    import { onMount } from 'svelte'
    import { _ } from 'svelte-i18n'
    import SEO from '$lib/components/SEO.svelte'
    import { FF_BUSINESS } from '$lib/env'

    let contactEl: HTMLAnchorElement

    onMount(() => {
        localStorage.setItem('pg_visited', 'true')
        if (contactEl) {
            const addr = `${contactEl.dataset.name}@${contactEl.dataset.domain}`
            contactEl.href = `mailto:${addr}`
        }
    })

    const homepageJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                name: 'PostGuard',
                description:
                    'Free, open-source identity-based encryption for emails and files using Yivi identity attributes.',
                applicationCategory: 'SecurityApplication',
                operatingSystem: 'Web Browser',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'EUR',
                },
                url: 'https://postguard.eu',
                license: 'https://opensource.org/licenses/MIT',
                softwareRequirements: 'Yivi (IRMA) app',
                sameAs: ['https://github.com/encryption4all'],
                author: {
                    '@type': 'Organization',
                    name: 'Yivi',
                    url: 'https://yivi.app',
                },
            },
            {
                '@type': 'Organization',
                name: 'PostGuard',
                url: 'https://postguard.eu',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://postguard.eu/pg_logo.png',
                },
                sameAs: ['https://github.com/encryption4all'],
                parentOrganization: {
                    '@type': 'Organization',
                    name: 'Yivi',
                    url: 'https://yivi.app',
                },
            },
        ],
    }
</script>

<SEO
    title="Secure File Sharing & Email Encryption"
    description="PostGuard offers free, easy-to-use end-to-end encryption for emails and files. Your data never leaves your browser unencrypted."
    jsonLd={homepageJsonLd}
/>

<section class="hero">
    <div class="hero-content">
        <h1>{$_('home.title')}</h1>
        <p class="hero-text">{$_('home.par')}</p>
        <div class="cta-buttons">
            <a href="/fileshare" class="cta-primary">{$_('landing.cta')}</a>
            <a href="/about" class="cta-secondary">{$_('landing.learnMore')}</a>
        </div>
    </div>
    <div class="scroll-indicator">
        <span class="scroll-arrow"></span>
    </div>
</section>

<div class="landing">
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

    {#if FF_BUSINESS}
    <section class="business">
        <div class="business-content">
            <h2>{$_('landing.businessTitle')}</h2>
            <p>{$_('landing.businessDesc')}</p>
            <div class="business-features">
                <div class="business-feature">
                    <h3>{$_('landing.business1Title')}</h3>
                    <p>{$_('landing.business1Desc')}</p>
                </div>
                <div class="business-feature">
                    <h3>{$_('landing.business2Title')}</h3>
                    <p>{$_('landing.business2Desc')}</p>
                </div>
                <div class="business-feature">
                    <h3>{$_('landing.business3Title')}</h3>
                    <p>{$_('landing.business3Desc')}</p>
                </div>
            </div>
            <h3 class="coming-soon-heading">{$_('landing.comingSoonTitle')}</h3>
            <div class="business-features">
                <div class="business-feature">
                    <h3>{$_('landing.business4Title')}</h3>
                    <p>{$_('landing.business4Desc')}</p>
                </div>
                <div class="business-feature">
                    <h3>{$_('landing.business5Title')}</h3>
                    <p>{$_('landing.business5Desc')}</p>
                </div>
                <div class="business-feature">
                    <h3>{$_('landing.business6Title')}</h3>
                    <p>{$_('landing.business6Desc')}</p>
                </div>
            </div>
            <a href="mailto:" bind:this={contactEl} data-name="info" data-domain="postguard.eu" class="business-cta">{$_('landing.businessCta')}</a>
        </div>
    </section>
    {/if}
</div>

<style lang="scss">
    .hero {
        height: calc(100vh - 86px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 0 1rem;
    }

    .hero-content {
        max-width: 700px;
        margin: auto 0;

        h1 {
            font-size: var(--pg-font-size-2xl);
            font-weight: var(--pg-font-weight-extrabold);
            margin-bottom: 1.5rem;
        }
    }

    .hero-text {
        font-size: var(--pg-font-size-lg);
        line-height: 1.6;
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

    .scroll-indicator {
        margin-top: auto;
        padding-bottom: 2rem;
    }

    .scroll-arrow {
        display: block;
        width: 24px;
        height: 24px;
        border-right: 2px solid var(--pg-text-secondary);
        border-bottom: 2px solid var(--pg-text-secondary);
        transform: rotate(45deg);
        animation: bounce 2s ease infinite;
        will-change: translate;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            translate: 0 0;
        }
        40% {
            translate: 0 8px;
        }
        60% {
            translate: 0 4px;
        }
    }

    .landing {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .features {
        padding: 1.5rem 0 3rem;

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

    .business {
        padding: 3rem 0;
        margin-top: 1rem;
        border-top: 1px solid var(--pg-strong-background);
    }

    .business-content {
        text-align: center;

        h2 {
            margin-bottom: 1rem;
        }

        > p {
            max-width: 700px;
            margin: 0 auto 2.5rem;
            line-height: 1.6;
            color: var(--pg-text-secondary);
        }
    }

    .business-features {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
    }

    .business-feature {
        padding: 1.5rem;
        background: var(--pg-soft-background);
        border-radius: var(--pg-border-radius-md);
        border: 1px solid var(--pg-strong-background);
        text-align: left;

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

    .coming-soon-heading {
        font-size: var(--pg-font-size-base);
        font-weight: var(--pg-font-weight-semibold);
        color: var(--pg-primary);
        margin-bottom: 1.5rem;
    }

    .business-cta {
        display: inline-block;
        padding: 0.875rem 2rem;
        background: var(--pg-text);
        color: var(--pg-general-background);
        border-radius: var(--pg-border-radius-sm);
        text-decoration: none;
        font-weight: var(--pg-font-weight-semibold);
        font-size: var(--pg-font-size-base);
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.85;
        }
    }

    @media only screen and (max-width: 768px) {
        .feature-grid,
        .business-features {
            grid-template-columns: 1fr;
        }
    }
</style>
