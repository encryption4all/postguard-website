<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/types/filesharing/attributes'
    import closebutton from '$lib/assets/images/google-icons/close.svg'
    import AttributeButton from '$lib/components/filesharing/inputs/AttributeButton.svelte'
    import MultiInput from '$lib/components/filesharing/inputs/MultiInput.svelte'
    interface props {
        recipient: { email: string; extra: AttributeCon };
        remove: () => void;
        addAttribute: (att: AttType) => void;
        attributes: AttType[];
        isConfirming?: boolean;
        isFirstRecipient?: boolean;
    }

    let { recipient = $bindable(), remove, addAttribute, attributes, isConfirming = false, isFirstRecipient = false }: props = $props()


    let addableButtons: AttType[] = $derived(attributes.filter((att) => !recipient.extra.some(({ t }) => t === att)))
</script>

<li class="crypt-recipient" class:is-confirming-bg={isConfirming}>
    <div class="recipient-container">
        {#if !isFirstRecipient}
            <button
                class="btn-delete"
                class:hidden={isConfirming}
                onclick={remove}
            >
                <img class="invert" style="width: 14px; height: 14px;" src={closebutton} alt="close button" />
            </button>
        {/if}

        <div class="recipient-content">
            <div class="recipient-heading">
                <label class="field-label" for="recipient-email-{recipient.email}">
                    {$_('filesharing.encryptPanel.emailRecipient')}
                </label>
            </div>
            <input
                id="recipient-email-{recipient.email}"
                placeholder={$_('filesharing.encryptPanel.emailRecipientPlaceholder')}
                type="email"
                required
                class="pg-input"
                class:is-confirming-bg={isConfirming}
                bind:value={recipient.email}
                disabled={isConfirming}
            />

            <div class="optionals-container">
                {#if isConfirming}
                    {#if recipient.extra.length > 0}
                        <div class="attributes-list">
                            {#each recipient.extra as attribute}
                                <AttributeButton
                                    type="added"
                                    translation_key={'filesharing.attributes.' + attribute.t}
                                />
                            {/each}
                        </div>
                    {/if}
                {:else}
                    {#each recipient.extra as attribute, index}
                        <MultiInput
                            translation_key={'filesharing.attributes.' + attribute.t}
                            bind:value={attribute.v}
                            deleteAction={() => {
                                recipient.extra.splice(index, 1)
                            }}
                        />
                    {/each}
                    <div class="attributes-list">
                        {#each addableButtons as attribute}
                            <AttributeButton
                                type="add"
                                translation_key={'filesharing.attributes.' + attribute}
                                clickAction={() => addAttribute(attribute)}
                            />
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</li>

<style>
    .crypt-recipient {
        background-color: var(--pg-soft-background);
        padding: 1rem;
        border-radius: var(--pg-border-radius-lg);
        border: 1px solid var(--pg-strong-background);
    }

    .crypt-recipient:not(:last-child) {
        margin-bottom: 0.5rem;
    }

    .recipient-container {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .btn-delete {
        all: unset;
        cursor: pointer;
        padding: 4px;
        border-radius: var(--pg-border-radius-md);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .btn-delete:hover {
        background-color: var(--pg-soft-background);
    }

    .btn-delete:focus-visible {
        outline: 2px solid var(--pg-primary);
        outline-offset: 2px;
    }

    .recipient-content {
        flex: 1;
        min-width: 0;
    }

    .recipient-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .field-label {
        font-size: var(--pg-font-size-sm);
        font-weight: var(--pg-font-weight-extrabold);
        color: var(--pg-text);
        font-family: var(--pg-font-family);
    }


    .optionals-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
</style>
