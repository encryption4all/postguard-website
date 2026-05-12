const COOKIE_NAME = 'pg_visited'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function registrableDomain(hostname: string): string | null {
    if (!hostname || hostname === 'localhost') return null
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null
    const parts = hostname.split('.')
    if (parts.length < 2) return null
    return parts.slice(-2).join('.')
}

export function hasVisited(): boolean {
    if (typeof document === 'undefined') return false
    return document.cookie
        .split(';')
        .some((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
}

export function markVisited(): void {
    if (typeof document === 'undefined') return
    const domain = registrableDomain(window.location.hostname)
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    const domainAttr = domain ? `; Domain=.${domain}` : ''
    document.cookie = `${COOKIE_NAME}=1; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax${domainAttr}${secure}`
}
