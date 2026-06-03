import * as Sentry from '@sentry/browser'
import { APP_VERSION, GLITCHTIP_DSN } from '$lib/env'

let initialised = false

export function initErrorReporting(): void {
    if (initialised || !GLITCHTIP_DSN || typeof window === 'undefined') return
    Sentry.init({
        dsn: GLITCHTIP_DSN,
        release: APP_VERSION,
        // Manual capture only — no automatic global error / unhandledrejection
        // handlers, no breadcrumb tracing. User must press the report button.
        defaultIntegrations: false,
        sendClientReports: false,
    })
    initialised = true
}

export function isErrorReportingEnabled(): boolean {
    return !!GLITCHTIP_DSN
}

/** Captures the error with rich client context and waits for transport.
 *  Resolves to true if the report was delivered within the timeout. */
export async function reportError(
    error: unknown,
    extra: Record<string, unknown> = {}
): Promise<boolean> {
    if (!isErrorReportingEnabled()) return false
    initErrorReporting()

    const ctx: Record<string, unknown> = { ...extra }
    if (typeof window !== 'undefined') {
        ctx.url = window.location.href
        ctx.viewport = `${window.innerWidth}x${window.innerHeight}`
        ctx.devicePixelRatio = window.devicePixelRatio
    }
    if (typeof navigator !== 'undefined') {
        ctx.userAgent = navigator.userAgent
        ctx.language = navigator.language
    }

    Sentry.captureException(error, { extra: ctx })
    return Sentry.flush(3000)
}
