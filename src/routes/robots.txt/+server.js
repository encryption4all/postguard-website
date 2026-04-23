export const prerender = true

export function GET() {
    const body = `User-agent: *
Allow: /
Disallow: /fileshare
Disallow: /decrypt
Disallow: /download
Disallow: /debug

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://postguard.eu/sitemap.xml
`

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain' },
    })
}
