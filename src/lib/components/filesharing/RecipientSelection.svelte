<script lang="ts">
    import { _ } from 'svelte-i18n'
    import RecipientSelectionFields from '$lib/components/filesharing/RecipientSelectionFields.svelte'
    import HelpToggle from '$lib/components/HelpToggle.svelte'
    import addIcon from '$lib/assets/images/google-icons/add.svg'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/types/filesharing/attributes'


    interface props {
        recipients: { email: string; extra: AttributeCon }[];
        attributes: AttType[];
        isConfirming?: boolean;
        readonly?: boolean;
    }

    let { recipients = $bindable([]), attributes, isConfirming = false, readonly = false }: props = $props()

    function removeRecipient(index: number) {
        recipients.splice(index, 1)
    }

    function addRecipient() {
        recipients.push({ email: '', extra: [] })
    }

    function addAttributeToRecipient(index: number, att: AttType) {
        recipients[index].extra.push({ t: att, v: '' })
    }
</script>
<div>
    <div class="crypt-select-protection-input-box" class:remove-border={isConfirming}>
        {#if !isConfirming}
            <div class="recipient-heading">
                <h3>
                    {$_('filesharing.encryptPanel.RecipientsHeading')}
                </h3>
            </div>
            <HelpToggle
                title={$_('filesharing.encryptPanel.RecipientsHelpToggle')}
                content={$_('filesharing.encryptPanel.RecipientsText')}
            />
        {/if}

        {#each recipients as _, index}
            <RecipientSelectionFields
                bind:recipient={recipients[index]}
                remove={() => removeRecipient(index)}
                addAttribute={(att: AttType) => addAttributeToRecipient(index, att)}
                {attributes}
                isConfirming={isConfirming || readonly}
                isFirstRecipient={index === 0}
            />
        {/each}

        {#if !isConfirming && !readonly}
            <button class="add-recipient-btn" onclick={addRecipient}>
                + {$_('filesharing.encryptPanel.addRecipientButton')}
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
  .recipient-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .remove-border {
    border: none;
  }

  .add-recipient-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.2em 1em;
    background-color: transparent;
    border: 1.5px solid var(--pg-border-color);
    border-radius: var(--pg-border-radius-lg);
    cursor: pointer;
    font-family: var(--pg-font-family);
    font-size: 0.95em;
    font-weight: 400;
    color: var(--pg-text-primary);
    transition: all 0.2s ease;
    width: fit-content;
    box-sizing: border-box;
  }

  .add-recipient-btn:hover {
    background-color: #f9fafb;
    border-color: var(--pg-accent-color);
    color: var(--pg-accent-color);
    box-shadow: 0 2px 4px rgba(48, 149, 222, 0.15);
  }
</style>
