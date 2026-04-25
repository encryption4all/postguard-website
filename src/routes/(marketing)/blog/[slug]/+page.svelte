<script lang="ts">
    import SEO from '$lib/components/SEO.svelte'
    import { page } from '$app/state'
    import { getAuthor } from '$lib/authors'

    let { data } = $props()

    const siteUrl = 'https://postguard.eu'
    const author = $derived(getAuthor(data.metadata.author))

    const authorJsonLd = $derived(() => {
        const isOrg = !author.github && !author.linkedin
        const base: Record<string, unknown> = {
            '@type': isOrg ? 'Organization' : 'Person',
            name: author.name,
        }
        if (author.url) base.url = author.url
        if (author.image) base.image = author.image
        if (!isOrg && (author.github || author.linkedin)) {
            base.sameAs = [author.github, author.linkedin].filter(Boolean)
        }
        return base
    })

    const articleJsonLd = $derived({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.metadata.title,
        description: data.metadata.description,
        datePublished: data.metadata.date,
        dateModified: data.metadata.modified || data.metadata.date,
        image: data.metadata.image
            ? (data.metadata.image.startsWith('http')
                ? data.metadata.image
                : `${siteUrl}${data.metadata.image}`)
            : `${siteUrl}/pg_logo.png`,
        author: authorJsonLd(),
        publisher: {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: 'PostGuard',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/pg_logo.png`,
                width: 512,
                height: 512,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}${page.url.pathname}`,
        },
        isPartOf: {
            '@id': `${siteUrl}/#website`,
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
        <div class="meta">
            <time datetime={data.metadata.date}>
                {new Date(data.metadata.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </time>
        </div>
        {#if author}
            <div class="author-info">
                {#if author.image}
                    <img
                        src={author.image}
                        alt={author.name}
                        class="author-avatar"
                        width="36"
                        height="36"
                    />
                {/if}
                <div class="author-details">
                    <span class="author-name">
                        {#if author.linkedin}
                            <a href={author.linkedin} target="_blank" rel="noopener">{author.name}</a>
                        {:else}
                            {author.name}
                        {/if}
                    </span>
                    {#if author.role}
                        <span class="author-role">{author.role}</span>
                    {/if}
                </div>
            </div>
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
            margin-bottom: 1.5rem;
        }
    }

    .meta {
        color: var(--pg-text-secondary);
        font-size: var(--pg-font-size-sm);
        margin-bottom: 0.75rem;
    }

    .author-info {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .author-avatar {
        border-radius: 50%;
        object-fit: cover;
    }

    .author-details {
        display: flex;
        flex-direction: column;
    }

    .author-name {
        font-weight: var(--pg-font-weight-semibold);
        font-size: var(--pg-font-size-sm);

        a {
            color: inherit;
            text-decoration: none;

            &:hover {
                color: var(--pg-primary);
            }
        }
    }

    .author-role {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-text-secondary);
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
