<script lang="ts">
    import SEO from '$lib/components/SEO.svelte'

    let { data } = $props()

    const siteUrl = 'https://postguard.eu'
    const blogJsonLd = $derived({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        url: `${siteUrl}/blog`,
        name: 'PostGuard Blog',
        description:
            'News, updates, and insights about PostGuard — secure end-to-end encryption for email and files.',
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: data.posts.map((post, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${siteUrl}/blog/${post.slug}`,
            })),
        },
    })
</script>

<SEO
    title="Blog"
    description="News, updates, and insights about PostGuard — secure end-to-end encryption for email and files."
    jsonLd={blogJsonLd}
/>

<div class="blog-index">
    <h1>Blog</h1>
    <div class="posts">
        {#each data.posts as post}
            <a href="/blog/{post.slug}" class="post-card">
                {#if post.image}
                    <img src={post.image} alt={post.title} class="post-image" />
                {/if}
                <div class="post-content">
                    <time datetime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </time>
                    <h2>{post.title}</h2>
                    <p>{post.description}</p>
                </div>
            </a>
        {/each}
    </div>
</div>

<style lang="scss">
    .blog-index {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;

        h1 {
            margin-bottom: 2rem;
        }
    }

    .posts {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .post-card {
        display: block;
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-md);
        text-decoration: none;
        color: inherit;
        overflow: hidden;
        transition: box-shadow 0.2s ease;

        &:hover {
            box-shadow: 0 2px 12px rgba(48, 149, 222, 0.12);
        }
    }

    .post-image {
        width: 100%;
        height: auto;
        display: block;
        border-bottom: 1px solid var(--pg-strong-background);
    }

    .post-content {
        padding: 1.5rem;

        time {
            font-size: var(--pg-font-size-sm);
            color: var(--pg-text-secondary);
        }

        h2 {
            margin: 0.5rem 0;
            font-size: var(--pg-font-size-lg);
        }

        p {
            margin: 0;
            color: var(--pg-text-secondary);
            line-height: 1.5;
        }
    }
</style>
