function requireEnv(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const FILEHOST_URL = requireEnv('VITE_FILEHOST_URL');
export const PKG_URL = '/pkg';
export const MAX_UPLOAD_SIZE = Number(requireEnv('VITE_MAX_UPLOAD_SIZE'));
export const UPLOAD_CHUNK_SIZE = Number(requireEnv('VITE_UPLOAD_CHUNK_SIZE'));
export const FILEREAD_CHUNK_SIZE = Number(requireEnv('VITE_FILEREAD_CHUNK_SIZE'));
export const APP_NAME = requireEnv('VITE_APP_NAME');
export const APP_VERSION = requireEnv('VITE_APP_VERSION');
