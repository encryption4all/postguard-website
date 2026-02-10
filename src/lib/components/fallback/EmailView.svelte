<script>
    import { run, preventDefault, createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import * as email from './email'
    import { emails, currSelected } from './../fallback/stores.js'
    import { _, locale } from 'svelte-i18n';

    import Icon from '@iconify/svelte'

    let raw = $state(), parsed = $state()
    let date = $state(), formattedDate = $state()

    run(() => {
        if ($currSelected >= 0) {
            const mail = $emails.find((e) => e.id === $currSelected)
            if (mail) {
                date = new Date(mail.date)
                formattedDate = `${date.getFullYear()}${date.getMonth()}${date.getDay()}${date.getHours()}${date.getSeconds()}`
                email.parseMail(mail.raw).then((x) => {
                    parsed = x
                    raw = mail.raw
                })
            }
        }
    });
</script>

{#if parsed}
    <div id="mail">
        <div class="item from">
            <p>
                <b>{$_('fallback.email.from')}: </b>
                {parsed.from.name} &lt;{parsed.from.address}&gt;
            </p>
        </div>
        <div class="item to">
            <p>
                <b>{$_('fallback.email.to')}: </b>{#each parsed.to as { name, address }}
                    {name} &lt;{address}&gt;
                {/each}
            </p>
        </div>
        <div class="item subject">
            <p><b>{$_('fallback.email.subject')}: </b>{parsed.subject}</p>
        </div>
        <div class="item date">
            <p>
                <b>{$_('fallback.email.date')}: </b>{date.toLocaleString($locale)}
            </p>
        </div>
        <div class="item toolbar">
            <button
                onclick={() =>
                    email.downloadAttachment(
                        raw,
                        'text/plain',
                        `pg${formattedDate}.eml`
                    )}
            >
                <Icon icon="mdi:download" width="30px" /></button
            >
       </div>
        <div class="item body">
            <iframe
                id="myIframe"
                srcdoc={parsed.html}
                title="Mail message"
                sandbox
></iframe>
        </div>

        {#if parsed.attachments.length > 0}
            <div class="item attachments">
                <ol>
                    {#each parsed.attachments as att}
                        <li id="att">
                            <button
                                onclick={preventDefault(() =>
                                    email.downloadAttachment(
                                        att.content,
                                        att.mimeType,
                                        att.filename
                                    ))}
                                type="button"
                            >
                                {att.filename}
                            </button>
                        </li>
                    {/each}
                </ol>
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
    #myIframe {
        border: none;
        width: 100%;
        height: 100%;
    }

    #mail {
        height: 100%;
        display: grid;
        grid-template-rows: repeat(16, 1fr);

        .item {
            display: flex;
            align-items: center;
            text-align: left;
            padding-left: 1rem;

            &:not(:last-child, .toolbar) {
                border-bottom: 2px solid var(--pg-text);
            }
        }

        .from {
            grid-row: 1 / 1;
        }

        .to {
            grid-row: 2 / 2;
        }

        .subject {
            grid-row: 3 / 3;
        }

        .date {
            grid-row: 4 / 4;
        }

        .toolbar {
            grid-row: 5 / 5;
            display: flex;

            button {
                all: unset;
                cursor: pointer;
                margin-left: auto;
                margin-right: 0.5rem;
                margin-top: 0.5rem;
            }
        }

        .body {
            grid-row: 6 / 16;
        }

        .attachments {
            grid-row: 16 / 16;
            padding-left: 0;

            ol {
                height: 100%;
                list-style-type: none;
                display: flex;
                padding: 0;
                margin: 0;
                align-items: center;

                li {
                    padding: 0;
                    text-align: start;
                    border-right: 1px solid var(--pg-text);

                    button {
                        all: unset;
                        cursor: pointer;
                        font-size: 14px;
                        padding: 0.5rem;
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
    }
</style>
