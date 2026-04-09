import { PostGuard } from '@e4a/pg-js'
import { PKG_URL, FILEHOST_URL } from '$lib/env'

export const pg = new PostGuard({
    pkgUrl: PKG_URL,
    cryptifyUrl: FILEHOST_URL,
})
