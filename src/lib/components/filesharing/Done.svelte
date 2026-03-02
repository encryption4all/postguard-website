<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { EncryptState } from '$lib/types/filesharing/attributes'
    import HelpToggle from '$lib/components/HelpToggle.svelte'
    import Chip from '$lib/components/Chip.svelte'
    import FileList from '$lib/components/filesharing/FileList.svelte'
    import airplane from '$lib/assets/images/airplane.svg'

    interface props {
        EncryptState: EncryptState;
        createDefaultEncryptState: () => EncryptState;
    }
    let { EncryptState=$bindable(), createDefaultEncryptState }: props = $props()
</script>

<div class="container">
    <h2>{$_('filesharing.encryptPanel.succes')}</h2>

    <!-- Files box -->
    <FileList files={EncryptState.files.map(f => f.name)} />

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
                            {#each recipient.extra.filter(a => a.v) as attr}
                                <Chip text={attr.v!} size="sm" variant="default" />
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
        onclick={() => EncryptState = createDefaultEncryptState()}
        size="lg"
        variant="dark"
    />

    <div class="spacer"></div>

    <!-- Airplane decoration -->
    <img src={airplane} alt="airplane" class="airplane-decoration" />
</div>

<style>

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 2rem 2rem 0 2rem;
        max-width: 600px;
        margin: 0 auto;
        flex: 1; /* fill the .done wrapper in +page.svelte */
    }

    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: --pg-text;
        margin: 0 0 1rem 0;
        text-align: center;
    }

    .info-box {
        width: 100%;
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
    }

    .info-box h3 {
        padding: 0.3rem 1rem;
    }

    .divider {
        width: 100%;
        height: 1px;
        background-color: var(--pg-strong-background);
        margin: 0rem 0rem;
    }

    .recipients-list {
        display: flex;
        flex-direction: column;
    }

    .recipient-item {
        padding: 0.3rem 0 0.4rem 1rem;
        margin: 0 0rem;
        font-family: var(--pg-font-family);
        font-size: 1rem;
        color: var(--pg-text);
        border-bottom: 1px solid var(--pg-strong-background);
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

    .spacer {
        flex: 1;
    }

    .airplane-decoration {
        width: 120%;
        max-width: 800px;
        height: auto;
        opacity: 0.6;
        pointer-events: none;
        margin: 0;
        padding: 0;

        @media only screen and (max-width: 768px) {
            width: 100%;
        }
    }

</style>
