<script lang="ts">
    import { _ } from 'svelte-i18n'
    import RecipientSelectionFields from '$lib/components/filesharing/RecipientSelectionFields.svelte'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/lib/types/filesharing/attributes'


    interface props {
        recipients: { email: string; extra: AttributeCon }[];
        attributes: AttType[];
    }

    let { recipients = $bindable([]), attributes }: props = $props()

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
    <div class="crypt-select-protection-input-box">
        <h3>
            {$_('filesharing.encryptPanel.RecipientsHeading')}
        </h3>{" "}
        <h4>
            {$_('filesharing.encryptPanel.RecipientsSubHeading')}
        </h4>
        <p>{$_('filesharing.encryptPanel.RecipientsText')}</p>

        <ul class="crypt-recipient-list">
            {#each recipients as recipient, index}
                <RecipientSelectionFields
                    bind:recipient = {recipients[index]}
                    remove={() => removeRecipient(index)}
                    addAttribute={(att: AttType) => addAttributeToRecipient(index, att)}
                    {attributes}
                />
            {/each}
        </ul>

        <button
            class="add-recipient-btn"
            onclick={addRecipient}>+ {$_('filesharing.encryptPanel.addRecipient')}
        </button>
    </div>
</div>

<style lang="scss">
  @use 'shared-styles';

    .add-recipient-btn {
        border: 1px solid black;
        border-radius: 15px;
        background-color: black;
        color: white;
        font-family: Overpass;
        cursor: pointer;
        margin-bottom: 1em;
        margin-top: 1em;
    }
</style>