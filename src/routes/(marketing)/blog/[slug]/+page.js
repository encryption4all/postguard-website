const posts = import.meta.glob('/src/content/blog/*.svx', { eager: true })

export function load({ params }) {
    const path = `/src/content/blog/${params.slug}.svx`
    const post = posts[path]

    if (!post) {
        throw new Error(`Post not found: ${params.slug}`)
    }

    return {
        content: post.default,
        metadata: post.metadata,
    }
}

export function entries() {
    return Object.keys(posts).map((path) => ({
        slug: path.split('/').pop().replace('.svx', ''),
    }))
}
