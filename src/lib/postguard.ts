import { PostGuard } from '@e4a/pg-js'
import { PKG_URL, FILEHOST_URL, CHUNK_SIZE } from '$lib/env'

export const pg = new PostGuard({
    pkgUrl: PKG_URL,
    cryptifyUrl: FILEHOST_URL,
    ...(CHUNK_SIZE !== undefined && { uploadChunkSize: CHUNK_SIZE }),
})
