export interface Author {
    name: string
    role?: string
    image?: string
    github?: string
    linkedin?: string
    url?: string
}

/**
 * Central registry of blog post authors.
 *
 * The key must match the `author` field in blog post frontmatter exactly.
 * LinkedIn profile photos can be used as `image` — use the public profile
 * picture URL (right-click the photo on their LinkedIn profile page).
 */
export const authors: Record<string, Author> = {
    'Ruben Hensen': {
        name: 'Ruben Hensen',
        role: 'Open Source Developer at Yivi',
        image: 'https://github.com/rubenhensen.png',
        github: 'https://github.com/rubenhensen',
        linkedin: 'https://linkedin.com/in/rubenhensen',
        url: 'https://postguard.eu/about',
    },
}

/** Look up an author by name, falling back to a generic entry. */
export function getAuthor(name: string | undefined): Author {
    if (!name) return { name: 'PostGuard', url: 'https://postguard.eu' }
    return authors[name] ?? { name, url: 'https://postguard.eu/about' }
}
