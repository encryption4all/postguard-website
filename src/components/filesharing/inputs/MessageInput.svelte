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
    <textarea
        required={false}
        placeholder={$_('filesharing.encryptPanel.messagePlaceholder')}
        bind:value={message}
    ></textarea>
</div>

<style>
    @import "../shared-styles.css";

    p {
        font-size: 0.85em;
        color: var(--pg-text-secondary);
        margin-bottom: 0.5em;
        font-family: var(--pg-font-family);
    }

    h3 {
        margin-bottom: 0.5em;
    }

    textarea {
        height: 5em;
        margin-top: 0.25em;
    }

    @media only screen and (min-height: 768px) {
        textarea {
            height: 6em;
        }
    }


    @media only screen and (min-height: 1024px) {
        textarea {
            height: 8em;
        }
    }
</style>