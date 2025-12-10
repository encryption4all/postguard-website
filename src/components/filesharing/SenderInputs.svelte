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

    <div class="attributes-list">
        <p class="added-attribute">
            {$_('filesharing.encryptPanel.emailSender')}
        </p>
        {#each senderAttributes as attribute, index}
            <p class="added-attribute">{$_('filesharing.attributes.' + attribute.t)}</p>
            <button
                class="remove-button"
                onclick={() =>removeAttribute(index)}
            > x
            </button>
        {/each}
    </div>

    <div class="attributes-list">
        {#each addableButtons as attribute, index}
            <div class="attribute-field">
                <button
                    class="add-attribute-btn"
                    onclick={() => addAttribute(attribute)}>
                    {$_('filesharing.attributes.' + attribute)} +
                </button>
            </div>
        {/each}
    </div>
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
  @import "shared-styles.css";

  .crypt-sender-receipt > input {
    margin: 0.75em 0.5em 0 0;
    width: unset;
  }

  .added-attribute {
    color: black;
    background-color: #d9d9d9;
    font-family: Overpass;
    text-align: start;
    width: fit-content;
    padding: 2px 4px;
    border-radius: 5px;
    font-size: 16px;
    height: min-content;
    margin: 0;
  }

  .attributes-list {
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 100%;
    text-wrap: nowrap;
    overflow-x: auto;
  }

  .remove-button {
    all: unset;
    cursor: pointer;
    font-family: Overpass;
    display: inline;
  }

</style>