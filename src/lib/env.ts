function requireEnv(name: string): string {
    const value = import.meta.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const FILEHOST_URL = requireEnv('VITE_FILEHOST_URL')
export const PKG_URL = '/pkg'
export const MAX_UPLOAD_SIZE = Number(requireEnv('VITE_MAX_UPLOAD_SIZE'))
export const UPLOAD_CHUNK_SIZE = Number(requireEnv('VITE_UPLOAD_CHUNK_SIZE'))
export const FILEREAD_CHUNK_SIZE = Number(
    requireEnv('VITE_FILEREAD_CHUNK_SIZE')
)
export const APP_NAME = requireEnv('VITE_APP_NAME')
export const APP_VERSION = requireEnv('VITE_APP_VERSION')

// 15 GB per-email rolling limit over a 14-day window, enforced by cryptify.
// Falls back to 15 GB when VITE_ROLLING_LIMIT is unset (see cryptify#100 / postguard-website#85).
const rollingLimitRaw = import.meta.env.VITE_ROLLING_LIMIT as string | undefined
export const ROLLING_LIMIT = rollingLimitRaw
    ? Number(rollingLimitRaw)
    : 15 * 1024 * 1024 * 1024

/** Runtime config injected by config.js (Terraform ConfigMap in deployed environments). */
function runtimeConfig(): Record<string, unknown> {
    return (globalThis as any).APP_CONFIG ?? {}
}

export const FF_BUSINESS = runtimeConfig().FF_BUSINESS === true
export const BUSINESS_URL =
    (runtimeConfig().BUSINESS_URL as string) ?? 'https://business.postguard.eu'
