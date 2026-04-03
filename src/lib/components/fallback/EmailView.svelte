<script>
    import { run } from 'svelte/legacy';

    import * as email from './email'
    import { emails, currSelected } from './../fallback/stores.js'
    import { _, locale } from 'svelte-i18n';

    import Icon from '@iconify/svelte'

    let parsed = $state()
    let date = $state()

    run(() => {
        if ($currSelected >= 0) {
            const mail = $emails.find((e) => e.id === $currSelected)
            if (mail) {
                date = new Date(mail.date)
                email.parseMail(mail.raw).then((x) => {
                    parsed = x
                })
            }
        }
    });
</script>

{#if parsed}
    <div class="email-view">
        <div class="email-header">
            <div class="header-row">
                <span class="header-label">{$_('fallback.email.from')}:</span>
                <span class="header-value">{parsed.from.name} &lt;{parsed.from.address}&gt;</span>
            </div>
            <div class="header-row">
                <span class="header-label">{$_('fallback.email.to')}:</span>
                <span class="header-value">
                    {#each parsed.to as { name, address }}
                        {name} &lt;{address}&gt;
                    {/each}
                </span>
            </div>
            <div class="header-row">
                <span class="header-label">{$_('fallback.email.subject')}:</span>
                <span class="header-value">{parsed.subject}</span>
            </div>
            <div class="header-row">
                <span class="header-label">{$_('fallback.email.date')}:</span>
                <span class="header-value">{date.toLocaleString($locale)}</span>
            </div>
        </div>

        <div class="email-body">
            <iframe
                srcdoc={`<style>body{margin:1rem}</style>${parsed.html ?? ''}`}
                title="Mail message"
                sandbox=""
            ></iframe>
        </div>

        {#if parsed.attachments.length > 0}
            <div class="email-attachments">
                {#each parsed.attachments as att}
                    <button
                        class="attachment-chip"
                        onclick={(e) => {
                            e.preventDefault()
                            email.downloadAttachment(
                                att.content,
                                att.mimeType,
                                att.filename
                            )
                        }}
                        type="button"
                    >
                        <Icon icon="mdi:attachment" width="16px" />
                        {att.filename}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
    .email-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .email-header {
        display: flex;
        flex-direction: column;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--pg-input-normal);
    }

    .header-row {
        display: flex;
        gap: 0.5rem;
        padding: 0.1rem 0;
        font-size: var(--pg-font-size-sm);
        line-height: 1.3;
    }

    .header-label {
        font-weight: var(--pg-font-weight-bold);
        white-space: nowrap;
        flex-shrink: 0;
    }

    .header-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .email-body {
        flex: 1;
        min-height: 0;

        iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
    }

    .email-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--pg-input-normal);
    }

    .attachment-chip {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.75rem;
        font-size: var(--pg-font-size-sm);
        background: var(--pg-general-background);
        border: 1px solid var(--pg-input-normal);
        border-radius: var(--pg-border-radius-md);
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--pg-primary);
            color: var(--pg-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--pg-primary);
            outline-offset: 2px;
        }
    }
</style>
