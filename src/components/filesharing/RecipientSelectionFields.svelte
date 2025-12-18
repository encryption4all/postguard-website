<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/lib/types/filesharing/attributes'
    import closebutton from '$lib/assets/images/google-icons/close.svg'
    import AttributeButton from '$lib/components/filesharing/inputs/AttributeButton.svelte'
    import MultiInput from '$lib/components/filesharing/inputs/MultiInput.svelte'

    interface props {
        recipient: { email: string; extra: AttributeCon };
        remove: () => void;
        addAttribute: (att: AttType) => void;
        attributes: AttType[];
    }

    let { recipient = $bindable(), remove, addAttribute, attributes }: props = $props()


    let addableButtons: AttType[] = $state([])
    $effect(() => {
        addableButtons = attributes.filter((att) => !recipient.extra.some(({ t }) => t === att))

    })
</script>

<li class="crypt-recipient">
    <div class="recipient-heading">
        <h3>
            {$_('filesharing.encryptPanel.emailRecipient')}
        </h3>
        <button
            class="btn-delete"
            onclick={remove}
        >
            <img style="width: 24px" src={closebutton} alt="close button" />
        </button>
    </div>
    <input
        placeholder={
                $_('filesharing.encryptPanel.emailRecipient')
            }
        type="email"
        required
        class="email-input"
        bind:value={recipient.email}
    />


    <h3 class="optionals-header">
        {$_('filesharing.encryptPanel.RecipientsOptionalHeading')}
    </h3>
    <div class="optionals-container">
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
    </div>
</li>

<style lang="scss">
  @use 'shared-styles';

  .optionals-header {
    margin-top: 0.5em;
  }

  .crypt-recipient {
    background-color: #E9E9E9;
    padding: 0.4em;
    border-radius: 5px;
  }

  .crypt-recipient:not(:last-child) {
    margin-bottom: 1.5em;
  }

  .btn-delete {
    all: unset;
    cursor: pointer;
  }

  .recipient-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .email-input {
    background-color: #E9E9E9;
    border: none;
    border-bottom: solid 2px black;
  }

  .optionals-container {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border-left: 2px solid black;
    padding-left: 4px;
  }
</style>