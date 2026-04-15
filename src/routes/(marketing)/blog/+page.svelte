<script lang="ts">
    import SEO from '$lib/components/SEO.svelte'

    let { data } = $props()
</script>

<SEO
    title="Blog"
    description="News, updates, and insights about PostGuard — secure end-to-end encryption for email and files."
/>

<div class="blog-index">
    <h1>Blog</h1>
    <div class="posts">
        {#each data.posts as post}
            <a href="/blog/{post.slug}" class="post-card">
                <time datetime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </time>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
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
        padding: 1.5rem;
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-md);
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.2s ease;

        &:hover {
            box-shadow: 0 2px 12px rgba(48, 149, 222, 0.12);
        }

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
