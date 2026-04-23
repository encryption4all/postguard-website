<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import { ROLLING_LIMIT } from '$lib/env'
    import { bytesToGiB } from '$lib/usage'
    import {
        getLocalUsedBytes,
        getLocalRemainingBytes,
        getLocalResetsAt,
    } from '$lib/localUsage'

    interface props {
        /** Total size of files currently selected for upload. */
        pendingBytes: number
    }

    let { pendingBytes }: props = $props()

    let usedBytes = $derived(getLocalUsedBytes())
    let remainingBytes = $derived(getLocalRemainingBytes())
    let resetsAt = $derived(getLocalResetsAt())
    let wouldExceed = $derived(usedBytes + pendingBytes > ROLLING_LIMIT)
    let warn = $derived(usedBytes >= ROLLING_LIMIT * (2 / 3))

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

{#if wouldExceed || warn}
    <div
        class="usage-banner"
        class:blocked={wouldExceed}
        role={wouldExceed ? 'alert' : 'status'}
    >
        {#if wouldExceed}
            <p class="usage-title">
                {$_('filesharing.encryptPanel.usage.preCheckBlockedTitle')}
            </p>
            <p class="usage-body">
                {$_('filesharing.encryptPanel.usage.preCheckBlockedBody', {
                    values: {
                        used: bytesToGiB(usedBytes),
                        limit: bytesToGiB(ROLLING_LIMIT),
                        remaining: bytesToGiB(remainingBytes),
                        pending: bytesToGiB(pendingBytes),
                        resets: formatReset(resetsAt),
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
                        used: bytesToGiB(usedBytes),
                        limit: bytesToGiB(ROLLING_LIMIT),
                        remaining: bytesToGiB(remainingBytes),
                        resets: formatReset(resetsAt),
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
