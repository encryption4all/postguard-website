export const prerender = true

export function GET() {
    const staticPages = ['', '/about', '/privacy', '/blog']

    const postFiles = import.meta.glob('/src/content/blog/*.svx', { eager: true })
    const blogSlugs = Object.keys(postFiles).map(
        (path) => `/blog/${path.split('/').pop().replace('.svx', '')}`
    )

    const pages = [...staticPages, ...blogSlugs]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>https://postguard.eu${p}</loc></url>`).join('\n')}
</urlset>`

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' },
    })
}
