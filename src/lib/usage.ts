import { FILEHOST_URL, ROLLING_LIMIT } from '$lib/env'

/**
 * Response shape of `GET /usage?email=...` on the cryptify backend (see encryption4all/cryptify#100).
 * `limit_bytes` is authoritative — the frontend falls back to `ROLLING_LIMIT` when the call fails.
 */
export type UsageResponse = {
    email: string
    used_bytes: number
    limit_bytes: number
    window_days: number
    resets_at: string
}

export type UsageStatus = {
    usedBytes: number
    limitBytes: number
    remainingBytes: number
    resetsAt: Date | null
    /** Soft-warn threshold (2/3 of limit) passed. */
    warn: boolean
    /** Hard limit reached — new uploads will be rejected server-side. */
    blocked: boolean
}

const WARN_FRACTION = 2 / 3

export function classifyUsage(u: UsageResponse): UsageStatus {
    const remainingBytes = Math.max(0, u.limit_bytes - u.used_bytes)
    return {
        usedBytes: u.used_bytes,
        limitBytes: u.limit_bytes,
        remainingBytes,
        resetsAt: u.resets_at ? new Date(u.resets_at) : null,
        warn: u.used_bytes >= u.limit_bytes * WARN_FRACTION,
        blocked: u.used_bytes >= u.limit_bytes,
    }
}

/**
 * Fetch the current sender usage from cryptify. Returns null when the endpoint is
 * unreachable or unavailable (e.g. backend not yet deployed) so the UI degrades quietly.
 * `signal` lets callers cancel in-flight requests when the user keeps typing.
 */
export async function fetchUsage(
    email: string,
    signal?: AbortSignal
): Promise<UsageStatus | null> {
    try {
        const url = `${FILEHOST_URL}/usage?email=${encodeURIComponent(email)}`
        const res = await fetch(url, { signal, credentials: 'omit' })
        if (!res.ok) return null
        const body = (await res.json()) as UsageResponse
        if (
            typeof body.used_bytes !== 'number' ||
            typeof body.limit_bytes !== 'number'
        )
            return null
        return classifyUsage(body)
    } catch {
        return null
    }
}

/**
 * Parse a cryptify 413 "limit exceeded" response body into a UsageStatus when possible.
 * Falls back to a synthetic "blocked at `ROLLING_LIMIT`" status so the UI can still show
 * a clear message if the server doesn't return a structured body.
 */
export function parseLimitExceededBody(body: string): UsageStatus {
    try {
        const parsed = JSON.parse(body) as Partial<UsageResponse>
        if (
            typeof parsed.used_bytes === 'number' &&
            typeof parsed.limit_bytes === 'number'
        ) {
            return classifyUsage(parsed as UsageResponse)
        }
    } catch {
        // fall through
    }
    return {
        usedBytes: ROLLING_LIMIT,
        limitBytes: ROLLING_LIMIT,
        remainingBytes: 0,
        resetsAt: null,
        warn: true,
        blocked: true,
    }
}

export function bytesToGB(bytes: number): string {
    return (bytes / 1024 ** 3).toFixed(1)
}
