function requireEnv(name: string): string {
    const value = import.meta.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const FILEHOST_URL = requireEnv('VITE_FILEHOST_URL');
export const PKG_URL = '/pkg';
export const MAX_UPLOAD_SIZE = Number(requireEnv('VITE_MAX_UPLOAD_SIZE'));
export const ROLLING_LIMIT = Number(requireEnv('VITE_ROLLING_LIMIT'));
export const APP_NAME = requireEnv('VITE_APP_NAME');
export const APP_VERSION = requireEnv('VITE_APP_VERSION');

const chunkSizeRaw = import.meta.env.VITE_CHUNK_SIZE as string | undefined;
export const CHUNK_SIZE: number | undefined = chunkSizeRaw ? Number(chunkSizeRaw) : undefined;

/** Runtime config injected by config.js (Terraform ConfigMap in deployed environments). */
function runtimeConfig(): Record<string, unknown> {
    return (globalThis as any).APP_CONFIG ?? {}
}

export const FF_BUSINESS = runtimeConfig().FF_BUSINESS === true
export const BUSINESS_URL =
    (runtimeConfig().BUSINESS_URL as string) ?? 'https://business.postguard.eu'
