<script lang="ts">
    import { _ } from 'svelte-i18n'

    interface props {
        senderConfirm: boolean;
        readonly?: boolean;
    }

    let { senderConfirm = $bindable(), readonly = false }: props = $props()
</script>

<div class="crypt-select-protection-input-box">
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

    <div class="crypt-sender-receipt">
        <input
            type="checkbox"
            id="receipt"
            bind:checked={senderConfirm}
            disabled={readonly}
        />
        <label for="receipt">
            {$_('filesharing.encryptPanel.emailSenderConfirm')}
        </label>
    </div>
</div>

<style lang="scss">
</style>
