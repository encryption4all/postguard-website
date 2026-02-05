<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { EncryptState } from '$lib/types/filesharing/attributes'

    interface props {
        EncryptState: EncryptState;
        defaultEncryptState: EncryptState;
    }
    let { EncryptState=$bindable(), defaultEncryptState }: props = $props()
    const to = EncryptState.recipients.map(({ email }) => email).join(', ')
</script>

<div class="container">
    <h2>{$_('filesharing.encryptPanel.succes')}</h2>
    <h4>{$_('filesharing.encryptPanel.succesInfo')} <a href={`mailto:${to}`}>{to}</a></h4>
    <button
        class="crypt-btn-main crypt-btn"
        onclick={() =>
            EncryptState = defaultEncryptState
        }
        type="button"
    >
        {$_('filesharing.encryptPanel.another')}
    </button>
</div>

<style>
    @import "shared-styles.css";

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1em;
        text-align: center;
        padding: 2em;
    }

    button {
        padding: 0.5em 1em;
    }

    h2, h4 {
        margin: 0;
    }
</style>