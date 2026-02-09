<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { EncryptState } from '$lib/types/filesharing/attributes'
    import HelpToggle from '$lib/components/HelpToggle.svelte'
    import Chip from '$lib/components/Chip.svelte'
    import airplane from '$lib/assets/images/airplane.svg'

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
                                <Chip text={attr.v} size="sm" variant="default" />
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
    <Chip
        text={$_('filesharing.encryptPanel.another')}
        onclick={() => EncryptState = defaultEncryptState}
        size="lg"
        variant="dark"
    />

    <!-- Airplane decoration -->
    <img src={airplane} alt="airplane" class="airplane-decoration" />
</div>

<style>
    @import "shared-styles.css";

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        padding: 2rem 2rem 0 2rem;
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
        padding: 0.3rem 1.5rem;
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
        gap: 0.25rem;
    }

    .recipient-email {
        font-weight: 500;
    }

    .recipient-attributes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .airplane-decoration {
        width: 120%;
        max-width: 800px;
        height: auto;
        opacity: 0.6;
        pointer-events: none;
        margin: 2rem 0 0 0;
        padding: 0;
    }
</style>
