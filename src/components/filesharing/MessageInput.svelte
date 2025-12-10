<script lang="ts">
    import { _ } from 'svelte-i18n'

    interface props {
        message: string
    }

    let { message = $bindable() }: props = $props()
</script>

<div class="crypt-select-protection-input-box">
    <h3>{$_('filesharing.encryptPanel.messageHeading')}</h3>
    {message}
    <textarea
        placeholder={
            $_('filesharing.encryptPanel.messagePlaceholder')
        }
        required={false}
        rows={8}
    >{message}</textarea>
</div>

<style>
    @import "shared-styles.css";

</style>