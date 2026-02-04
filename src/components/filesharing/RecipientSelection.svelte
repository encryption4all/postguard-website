<script lang="ts">
    import { _ } from 'svelte-i18n'
    import RecipientSelectionFields from '$lib/components/filesharing/RecipientSelectionFields.svelte'
    import addIcon from '$lib/assets/images/google-icons/add.svg'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/lib/types/filesharing/attributes'


    interface props {
        recipients: { email: string; extra: AttributeCon }[];
        attributes: AttType[];
        isConfirming?: boolean;
    }

    let { recipients = $bindable([]), attributes, isConfirming = false }: props = $props()

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

                <button
                    class:hidden={isConfirming}
                    onclick={addRecipient}>
                    <img
                        style="width: 24px; vertical-align: middle; margin-right: 0.2em;"
                        src={addIcon}
                        alt="add recipient"
                    />
                </button>
            </div>
            <p>
                {$_('filesharing.encryptPanel.RecipientsText')}
            </p>
        {/if}

        {#each recipients as _, index}
            <RecipientSelectionFields
                bind:recipient={recipients[index]}
                remove={() => removeRecipient(index)}
                addAttribute={(att: AttType) => addAttributeToRecipient(index, att)}
                {attributes}
                isConfirming={isConfirming}
            />
        {/each}
    </div>
</div>

<style lang="scss">
  p {
    font-size: 0.8em;
  }

  .recipient-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .remove-border {
    border: none;
  }
</style>