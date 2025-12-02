<script lang="ts">
    import { _ } from 'svelte-i18n'

    interface props {
        message: string
    }

    let { message = $bindable() }: props = $props()
</script>

<div class="crypt-select-protection-input-box">
    <h3>{$_('filesharing.encryptPanel.messageHeading')}</h3>
    <p>{$_('filesharing.encryptPanel.messageText')}</p>
    {message}
    <textarea
        placeholder={
            $_('filesharing.encryptPanel.messagePlaceholder')
        }
        required={false}
        rows={4}
    >{message}</textarea>
</div>

<style lang="scss">
  @use 'shared-styles';
</style>