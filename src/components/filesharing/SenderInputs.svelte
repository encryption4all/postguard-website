<script lang="ts">
    import type { AttType } from '$lib/lib/types/filesharing/attributes'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import { _ } from 'svelte-i18n'
    import AttributeButton from '$lib/components/filesharing/attributes/AttributeButton.svelte'

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
        <AttributeButton type="added"
                         translation_key={'filesharing.encryptPanel.emailSender'}
        />
        {#each senderAttributes as attribute, index}
            <AttributeButton type="added"
                 translation_key={'filesharing.attributes.' + attribute.t}
                 clickAction={() => removeAttribute(index)}
            />
        {/each}
    </div>

    <div class="attributes-list add-list">
        {#each addableButtons as attribute}
            <AttributeButton type="add"
                 translation_key={'filesharing.attributes.' + attribute}
                 clickAction={() => addAttribute(attribute)}
            />
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

  .add-list {
    margin-top: 0.3em;
  }

  summary {
    font-size: 0.8em;
  }

  details {
    margin-bottom: 0.3em;
  }

  details p {
    border-left: 2px solid black;
    padding-left: 4px;
  }
</style>