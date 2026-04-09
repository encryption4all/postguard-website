import type { PostGuard as PostGuardType } from '@e4a/pg-js'

let instance: PostGuardType | null = null

export async function getPostGuard(): Promise<PostGuardType> {
    if (!instance) {
        const { PostGuard } = await import('@e4a/pg-js')
        const { PKG_URL, FILEHOST_URL } = await import('$lib/env')
        instance = new PostGuard({
            pkgUrl: PKG_URL,
            cryptifyUrl: FILEHOST_URL,
        })
    }
    return instance
}
