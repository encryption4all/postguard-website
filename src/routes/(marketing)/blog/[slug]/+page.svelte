<script lang="ts">
    import SEO from '$lib/components/SEO.svelte'
    import { page } from '$app/state'

    let { data } = $props()

    const siteUrl = 'https://postguard.eu'
    const articleJsonLd = $derived({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.metadata.title,
        description: data.metadata.description,
        datePublished: data.metadata.date,
        ...(data.metadata.image
            ? {
                  image: data.metadata.image.startsWith('http')
                      ? data.metadata.image
                      : `${siteUrl}${data.metadata.image}`,
              }
            : {}),
        author: {
            '@type': data.metadata.author === 'PostGuard Team' ? 'Organization' : 'Person',
            name: data.metadata.author || 'PostGuard Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'PostGuard',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/pg_logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}${page.url.pathname}`,
        },
    })
</script>

<SEO
    title={data.metadata.title}
    description={data.metadata.description}
    ogType="article"
    ogImage={data.metadata.image || ''}
    jsonLd={articleJsonLd}
/>

<article class="blog-post">
    <header>
        <time datetime={data.metadata.date}>
            {new Date(data.metadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}
        </time>
        {#if data.metadata.author}
            <span class="separator">&middot;</span>
            <span class="author">{data.metadata.author}</span>
        {/if}
    </header>
    <data.content />
</article>

<style lang="scss">
    .blog-post {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;

        header {
            margin-bottom: 0.5rem;
            color: var(--pg-text-secondary);
            font-size: var(--pg-font-size-sm);
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
    }

    .blog-post :global(h1) {
        font-size: var(--pg-font-size-2xl);
        margin-bottom: 1rem;
    }

    .blog-post :global(h2) {
        margin-top: 2rem;
        margin-bottom: 0.75rem;
    }

    .blog-post :global(p) {
        line-height: 1.7;
        margin-bottom: 1rem;
    }

    .blog-post :global(img) {
        max-width: 100%;
        height: auto;
        border-radius: var(--pg-border-radius-md);
        margin-bottom: 1rem;
    }

    .blog-post :global(a) {
        color: var(--pg-primary);
    }

    .blog-post :global(strong) {
        font-weight: var(--pg-font-weight-semibold);
    }

    .blog-post :global(ol),
    .blog-post :global(ul) {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }

    .blog-post :global(li) {
        line-height: 1.7;
        margin-bottom: 0.25rem;
    }

    .blog-post :global(code) {
        background: var(--pg-soft-background);
        padding: 0.15rem 0.4rem;
        border-radius: var(--pg-border-radius-sm);
        font-family: var(--pg-mono-font-family, monospace);
        font-size: 0.9em;
    }
</style>
