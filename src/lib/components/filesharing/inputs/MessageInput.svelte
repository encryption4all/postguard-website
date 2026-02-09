<script lang="ts">
    import { _ } from 'svelte-i18n'

    interface props {
        message: string
        readonly?: boolean
    }

    let { message = $bindable(), readonly = false }: props = $props()
</script>

<div class="crypt-select-protection-input-box">
    <h3>{@html $_('filesharing.encryptPanel.messageHeading').replace(/\s*\([^)]*\)/, (match) => ` <span class="optional-text">${match.trim()}</span>`)}</h3>
    <p>{$_('filesharing.encryptPanel.messageText')}</p>
    <textarea
        class="pg-input"
        required={false}
        placeholder={$_('filesharing.encryptPanel.messagePlaceholder')}
        bind:value={message}
        disabled={readonly}
    ></textarea>
</div>

<style>
    @import "../shared-styles.css";

    p {
        font-size: 0.85em;
        color: var(--pg-text-secondary);
        margin: 0 0 0.5em;
        font-family: var(--pg-font-family);
    }

    :global(.optional-text) {
        font-weight: 400;
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
