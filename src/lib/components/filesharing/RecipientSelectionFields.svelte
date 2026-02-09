<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/types/filesharing/attributes'
    import closebutton from '$lib/assets/images/google-icons/close.svg'
    import AttributeButton from '$lib/components/filesharing/inputs/AttributeButton.svelte'
    import MultiInput from '$lib/components/filesharing/inputs/MultiInput.svelte'
    import './shared-styles.css'

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
                <img style="width: 14px; height: 14px;" src={closebutton} alt="close button" />
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
                {#each recipient.extra as attribute, index}
                    <MultiInput
                        translation_key={'filesharing.attributes.' + attribute.t}
                        bind:value={attribute.v}
                        deleteAction={() => {
                            recipient.extra.splice(index, 1)
                        }}
                        isConfirming={isConfirming}
                    />
                {/each}
                {#if !isConfirming}
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
        background-color: var(--pg-strong-background);
        padding: 1em;
        border-radius: var(--pg-border-radius-lg);
        border: 1px solid var(--pg-border-color-light);
        /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); */
        transition: all 0.2s ease;
    }

    .crypt-recipient:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-color: var(--pg-border-color);
    }

    .crypt-recipient:not(:last-child) {
        margin-bottom: 0.5em;
    }

    .recipient-container {
        display: flex;
        gap: 0.75em;
        align-items: flex-start;
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
        background-color: #fee2e2;
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
        font-size: 0.8em;
        font-weight: 800;
        color: var(--pg-text-primary);
        font-family: var(--pg-font-family);
    }


    .optionals-container {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        margin-top: 0.5em;
    }
</style>
