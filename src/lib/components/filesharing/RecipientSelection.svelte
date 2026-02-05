<script lang="ts">
    import { _ } from 'svelte-i18n'
    import RecipientSelectionFields from '$lib/components/filesharing/RecipientSelectionFields.svelte'
    import addIcon from '$lib/assets/images/google-icons/add.svg'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/types/filesharing/attributes'


    interface props {
        recipients: { email: string; extra: AttributeCon }[];
        attributes: AttType[];
        isConfirming?: boolean;
    }

    let { recipients = $bindable([]), attributes, isConfirming = false }: props = $props()

    let helpTextExpanded = $state(false)

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
            <button class="help-text-toggle" type="button" onclick={() => helpTextExpanded = !helpTextExpanded}>
                <span class="arrow" class:expanded={helpTextExpanded}>▶</span>
                <span class="toggle-label">{$_('filesharing.encryptPanel.RecipientsHelpToggle')}</span>
            </button>
            {#if helpTextExpanded}
                <p class="help-text-content">
                    {$_('filesharing.encryptPanel.RecipientsText')}
                </p>
            {/if}
        {/if}

        {#each recipients as _, index}
            <RecipientSelectionFields
                bind:recipient={recipients[index]}
                remove={() => removeRecipient(index)}
                addAttribute={(att: AttType) => addAttributeToRecipient(index, att)}
                {attributes}
                isConfirming={isConfirming}
                isFirstRecipient={index === 0}
            />
        {/each}

        {#if !isConfirming}
            <button class="add-recipient-btn" onclick={addRecipient}>
                + {$_('filesharing.encryptPanel.addRecipientButton')}
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
  p {
    font-size: 0.85em;
    color: var(--pg-text-secondary);
    margin-bottom: 1em;
    font-family: var(--pg-font-family);
  }

  .help-text-toggle {
    all: unset;
    display: flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    margin-bottom: 0.75em;
    user-select: none;
    background: transparent;
  }

  .arrow {
    font-size: 0.7em;
    color: var(--pg-text-secondary);
    transition: transform 0.2s ease;
    display: inline-block;
  }

  .arrow.expanded {
    transform: rotate(90deg);
  }

  .toggle-label {
    font-size: 0.9em;
    color: var(--pg-text-secondary);
    font-weight: 600;
    font-family: var(--pg-font-family);
  }

  .help-text-content {
    font-size: 0.85em;
    color: var(--pg-text-secondary);
    margin-bottom: 1em;
    font-family: var(--pg-font-family);
    padding-left: 1.5em;
  }

  .recipient-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5em;
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
    font-weight: 600;
    color: var(--pg-text-primary);
    transition: all 0.2s ease;
    width: fit-content;
    box-sizing: border-box;
    // box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .add-recipient-btn:hover {
    background-color: #f9fafb;
    border-color: var(--pg-accent-color);
    color: var(--pg-accent-color);
    box-shadow: 0 2px 4px rgba(48, 149, 222, 0.15);
  }
</style>
