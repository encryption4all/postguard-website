<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import { fetchUsage, bytesToGB, type UsageStatus } from '$lib/usage'

    interface props {
        email: string
    }

    let { email }: props = $props()

    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    let status: UsageStatus | null = $state(null)

    // Debounce lookups: re-query at most once the email has been idle for 500 ms.
    $effect(() => {
        status = null
        const trimmed = email.trim().toLowerCase()
        if (!emailRegex.test(trimmed)) return

        const controller = new AbortController()
        const timer = window.setTimeout(async () => {
            const result = await fetchUsage(trimmed, controller.signal)
            if (!controller.signal.aborted) status = result
        }, 500)

        return () => {
            window.clearTimeout(timer)
            controller.abort()
        }
    })

    function formatReset(d: Date | null): string {
        if (!d) return ''
        const loc = $locale === 'nl-NL' ? 'nl-NL' : 'en-US'
        return d.toLocaleDateString(loc, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }
</script>

{#if status && (status.warn || status.blocked)}
    <div
        class="usage-banner"
        class:blocked={status.blocked}
        role={status.blocked ? 'alert' : 'status'}
    >
        {#if status.blocked}
            <p class="usage-title">
                {$_('filesharing.encryptPanel.usage.blockedTitle')}
            </p>
            <p class="usage-body">
                {$_('filesharing.encryptPanel.usage.blockedBody', {
                    values: {
                        limit: bytesToGB(status.limitBytes),
                        resets: formatReset(status.resetsAt),
                    },
                })}
            </p>
        {:else}
            <p class="usage-title">
                {$_('filesharing.encryptPanel.usage.warningTitle')}
            </p>
            <p class="usage-body">
                {$_('filesharing.encryptPanel.usage.warningBody', {
                    values: {
                        used: bytesToGB(status.usedBytes),
                        limit: bytesToGB(status.limitBytes),
                        remaining: bytesToGB(status.remainingBytes),
                        resets: formatReset(status.resetsAt),
                    },
                })}
            </p>
        {/if}
    </div>
{/if}

<style>
    .usage-banner {
        border-radius: var(--pg-border-radius-md);
        padding: 0.75rem 1rem;
        margin: 0.5rem 0;
        background: var(--pg-soft-background);
        border-left: 4px solid var(--pg-primary);
        font-family: var(--pg-font-family);
    }

    .usage-banner.blocked {
        border-left-color: var(--pg-input-error);
        background: color-mix(
            in srgb,
            var(--pg-input-error) 8%,
            var(--pg-general-background)
        );
    }

    .usage-title {
        margin: 0 0 0.25rem 0;
        font-weight: var(--pg-font-weight-bold);
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text);
    }

    .usage-banner.blocked .usage-title {
        color: var(--pg-input-error);
    }

    .usage-body {
        margin: 0;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        line-height: 1.4;
    }
</style>
