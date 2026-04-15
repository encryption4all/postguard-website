export async function load() {
    const postFiles = import.meta.glob('/src/content/blog/*.svx', { eager: true })

    const posts = Object.entries(postFiles)
        .map(([path, module]) => ({
            slug: path.split('/').pop().replace('.svx', ''),
            ...module.metadata,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))

    return { posts }
}
