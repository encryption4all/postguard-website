<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { EncryptState } from '$lib/types/filesharing/attributes'
    import HelpToggle from '$lib/components/HelpToggle.svelte'

    interface props {
        EncryptState: EncryptState;
        defaultEncryptState: EncryptState;
    }
    let { EncryptState=$bindable(), defaultEncryptState }: props = $props()
</script>

<div class="container">
    <h2>{$_('filesharing.encryptPanel.succes')}</h2>

    <!-- Files box -->
    <div class="info-box">
        <h3>{$_('filesharing.encryptPanel.filesHeader')}</h3>
        <div class="divider"></div>
        <div class="files-list">
            {#each EncryptState.files as file}
                <div class="file-item">{file.name}</div>
            {/each}
        </div>
    </div>

    <!-- Recipients box -->
    <div class="info-box">
        <h3>{$_('filesharing.encryptPanel.recipientsHeader')}</h3>
        <div class="divider"></div>
        <div class="recipients-list">
            {#each EncryptState.recipients as recipient}
                <div class="recipient-item">
                    <div class="recipient-email">{recipient.email}</div>
                    {#if recipient.extra.length > 0}
                        <div class="recipient-attributes">
                            {#each recipient.extra as attr}
                                <span class="attribute-badge">
                                    {attr.v}
                                </span>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- Help section -->
    <HelpToggle
        title={$_('filesharing.encryptPanel.whatRecipientGets')}
        content={$_('filesharing.encryptPanel.whatRecipientGetsText')}
        bordered={true}
    />

    <!-- Send another button -->
    <button
        class="send-another-btn"
        onclick={() => EncryptState = defaultEncryptState}
        type="button"
    >
        {$_('filesharing.encryptPanel.another')}
    </button>
</div>

<style>
    @import "shared-styles.css";

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        padding: 2rem;
        max-width: 600px;
        margin: 0 auto;
    }

    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 1rem 0;
        text-align: center;
    }

    .info-box {
        width: 100%;
        background: var(--pg-strong-background);
        border: 2px solid var(--pg-border-color-light);
        border-radius: var(--pg-border-radius-lg);
        /* padding: 1.5rem; */
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
    }

    .info-box h3 {
        padding: 0.5rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #1f2937;
    }

    .divider {
        width: 100%;
        height: 2px;
        background-color: var(--pg-border-color-light);
        margin: 0rem 0rem;
    }

    .files-list,
    .recipients-list {
        display: flex;
        flex-direction: column;
        /* gap: 0.5rem; */
    }

    .file-item,
    .recipient-item {
        padding: 0.5rem 1.5rem;
        margin: 0 0rem;
        font-family: var(--pg-font-family);
        font-size: 1rem;
        color: var(--pg-text-primary);
        border-bottom: 2px solid var(--pg-border-color-light);
    }

    .file-item:last-child,
    .recipient-item:last-child {
        border-bottom: none;
    }

    .recipient-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .recipient-email {
        font-weight: 500;
    }

    .recipient-attributes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .attribute-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        background-color: white;
        border: 1.5px solid #1f2937;
        border-radius: var(--pg-border-radius-md);
        font-family: var(--pg-font-family);
        font-size: 0.85rem;
        color: var(--pg-text-primary);
        white-space: nowrap;
    }

    .send-another-btn {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.6rem 1.5rem;
        background-color: white;
        border: 2px solid #1f2937;
        border-radius: var(--pg-border-radius-md);
        cursor: pointer;
        font-family: var(--pg-font-family);
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .send-another-btn:hover {
        background-color: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
</style>
