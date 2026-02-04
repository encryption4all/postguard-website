<script lang="ts">
    import type { AttType } from '$lib/lib/types/filesharing/attributes'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import { _ } from 'svelte-i18n'
    import AttributeButton from '$lib/components/filesharing/inputs/AttributeButton.svelte'

    interface props {
        senderAttributes: AttributeCon;
        senderConfirm: boolean;
        attributes: AttType[];
    }

    let { senderAttributes = $bindable(), senderConfirm = $bindable(), attributes }: props = $props()

    let addableButtons: AttType[] = $derived(attributes.filter((att) => !senderAttributes.some(({ t }) => t === att)))

    function addAttribute(att: AttType) {
        senderAttributes.push({ t: att, v: '' })
    }

    function removeAttribute(index: number) {
        senderAttributes.splice(index, 1)
    }
</script>

<!-- <div class="crypt-select-protection-input-box">
    <div class="sender-heading">
        <h3>
            {$_('filesharing.encryptPanel.emailSenderHeading')}
        </h3>
        <details>
            <summary>
                {$_('filesharing.encryptPanel.emailSenderSubHeadingToggle')}
            </summary>
            <p>
                {$_('filesharing.encryptPanel.emailSenderSubHeading')}
            </p>
        </details>
    </div>

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
</div> -->

<style lang="scss">
  @import "shared-styles.css";
</style>
