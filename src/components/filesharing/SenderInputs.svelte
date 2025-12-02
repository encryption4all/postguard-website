<script lang="ts">
    import type { AttType } from '$lib/lib/types/filesharing/attributes'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import { _ } from 'svelte-i18n'

    interface props {
        senderAttributes: AttributeCon;
        senderConfirm: boolean;
        attributes: AttType[];
    }

    let { senderAttributes = $bindable(), senderConfirm = $bindable(), attributes }: props = $props()

    let addableButtons: AttType[] = $state([])
    $effect(() => {
        addableButtons = attributes.filter((att) => !senderAttributes.some(({ t }) => t === att))

    })

    function addAttribute(att: AttType) {
        senderAttributes.push({ t: att, v: '' })
    }

    function removeAttribute(index: number) {
        senderAttributes.splice(index, 1)
    }
</script>

<div class="crypt-select-protection-input-box">
    <h3>
        {$_('filesharing.encryptPanel.emailSenderHeading')}
    </h3>
    <h4>
        {$_('filesharing.encryptPanel.emailSenderSubHeading')}
    </h4>
    <p>{$_('filesharing.encryptPanel.emailSenderText')}</p>
    {#each addableButtons as attribute, index}
        <div class="attribute-field">
            <button
                class="add-attribute-btn"
                onclick={() => addAttribute(attribute)}>
                + { $_('filesharing.encryptPanel.emailSenderAttributePrefix') + " " + $_('filesharing.attributes.' + attribute)}
            </button>
        </div>
    {/each}

    {#each senderAttributes as attribute, index}
        <p style="display:inline; margin-left: 2em;">
            { $_('filesharing.encryptPanel.emailSenderAttributePrefix') + " " + $_('filesharing.attributes.' + attribute.t)}
        </p>
        <button
            class="btn-delete"
            onclick={() =>removeAttribute(index)}
        >
            x
        </button>
    {/each}
    <div class="crypt-sender-receipt">
        <input
            type="checkbox"
            id="receipt"
            checked={senderConfirm}
        />
        <label for="receipt">
            {$_('filesharing.encryptPanel.emailSenderConfirm')}
        </label>
    </div>
</div>

<style lang="scss">
  @use 'shared-styles';

  .crypt-sender-receipt > input {
    margin: 0.75em 0.5em 0 0;
    width: unset;
  }

  .btn-delete {
    all: unset;
    cursor: pointer;
  }
</style>