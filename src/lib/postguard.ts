import { PostGuard, type RetryEvent } from '@e4a/pg-js'
import { writable } from 'svelte/store'
import { PKG_URL, FILEHOST_URL, CHUNK_SIZE } from '$lib/env'

/**
 * Latest cryptify retry event observed during an upload or download.
 * pg-js v1.4 retries chunk PUTs and downloads with exponential backoff on
 * transient failures (5xx, network errors, internal timeouts). Components
 * subscribe to this store to surface "retrying… (attempt N of M)" status
 * during the retry window. `null` whenever the SDK isn't actively retrying.
 *
 * Cleared by the consumer (e.g. SendButton) on successful completion or
 * terminal error so a stale event doesn't leak into the next operation.
 */
export const retryStatus = writable<RetryEvent | null>(null)

export const pg = new PostGuard({
    pkgUrl: PKG_URL,
    cryptifyUrl: FILEHOST_URL,
    ...(CHUNK_SIZE !== undefined && { uploadChunkSize: CHUNK_SIZE }),
    retry: {
        onRetry: (event) => retryStatus.set(event),
    },
})
