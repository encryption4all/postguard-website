<script lang="ts">
    import type { AttType } from '$lib/lib/types/filesharing/attributes'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import { _ } from 'svelte-i18n'
    import closebutton from '$lib/assets/images/google-icons/close.svg'

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
    <!--browser native more info dropdown, no JS needed-->
    <details>
        <summary>
            {$_('filesharing.encryptPanel.emailSenderSubHeadingToggle')}
        </summary>
        <p>
            {$_('filesharing.encryptPanel.emailSenderSubHeading')}
        </p>
    </details>

    <div class="attributes-list">
        <p class="added-attribute">
            {$_('filesharing.encryptPanel.emailSender')}
        </p>
        {#each senderAttributes as attribute, index}
            <button class="added-attribute" onclick={() =>removeAttribute(index)}>
                {$_('filesharing.attributes.' + attribute.t)}
                <img style="width: 20px" src={closebutton} alt="close button" /></button>
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
    margin: 0.5em 0 0 0;
    width: unset;
  }

  .added-attribute {
    display: flex;
    align-items: center;
    color: black;
    background-color: #d9d9d9;
    font-family: Overpass;
    text-align: start;
    width: fit-content;
    padding: 4px 6px;
    border-radius: 5px;
    font-size: 16px;
    height: min-content;
    margin: 0;
  }

  /* if the added attributed contains an image remove 2px padding to account for the extra space created by the svg */
    .added-attribute img {
        margin-right: -4px;
        padding: 0;
    }

  .attributes-list {
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 100%;
    text-wrap: nowrap;
    overflow-x: auto;
  }

  summary {
    font-size: 0.8em;
  }
</style>