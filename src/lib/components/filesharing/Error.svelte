<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { EncryptionState } from '$lib/types/filesharing/attributes'

    interface props {
        encryptionState: EncryptionState;
    }

    let { encryptionState = $bindable() }: props = $props()
</script>

<div class="error-container">
    <div class="error-content">
        <h3 class="error-title">{$_('filesharing.errorTitle')}</h3>
        <p class="error-message">{$_('filesharing.error')}</p>
        <button
            class="error-btn"
            onclick={() => encryptionState = EncryptionState.FileSelection}
            type="button"
        >
            {$_('filesharing.tryAgain')}
        </button>
    </div>
</div>

<style>
    .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 400px;
        padding: 1.5rem;
    }

    .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 400px;
        gap: 1rem;
    }

    .error-title {
        color: #dc2626;
        font-family: var(--pg-font-family);
        font-size: 1.5em;
        font-weight: 700;
        margin: 0;
    }

    .error-message {
        color: var(--pg-text-primary);
        font-family: var(--pg-font-family);
        font-size: 1em;
        line-height: 1.5;
        margin: 0;
    }

    .error-btn {
        margin-top: 1em;
        padding: 0.75em 2em;
        background-color: #000000;
        color: #ffffff;
        border: none;
        border-radius: var(--pg-border-radius-sm);
        cursor: pointer;
        font-size: 1em;
        font-family: var(--pg-font-family);
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .error-btn:hover {
        background-color: #1a1a1a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .error-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
</style>
