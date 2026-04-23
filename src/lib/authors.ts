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
        image: 'https://media.licdn.com/dms/image/v2/D4E03AQGz3wVarBBXEQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1707298851498?e=2147483647&v=beta&t=gf-c66wBZk6aKnNfQ5ZS6fwRoKRKt1pASyADcK5VaCk',
        github: 'https://github.com/nickvdmeij',
        linkedin: 'https://linkedin.com/in/rubenhensen',
        url: 'https://postguard.eu/about',
    },
    'PostGuard Team': {
        name: 'PostGuard Team',
        image: 'https://postguard.eu/pg_logo.png',
        url: 'https://postguard.eu',
    },
}

/** Look up an author by name, falling back to a generic entry. */
export function getAuthor(name: string | undefined): Author {
    if (!name) return authors['PostGuard Team']
    return authors[name] ?? { name, url: 'https://postguard.eu/about' }
}
