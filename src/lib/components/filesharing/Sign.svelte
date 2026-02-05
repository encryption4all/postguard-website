<script lang="ts">
    import { EncryptionState, type EncryptState } from '$lib/types/filesharing/attributes'
    import { _ } from 'svelte-i18n'
    import '@privacybydesign/yivi-css'
    import './sign.css'

    interface props {
        isMobile: boolean;
        stage: EncryptionState;
    }

    let { isMobile, stage = $bindable() }:props = $props()
</script>

<div class="sign-container">
    <div id="crypt-irma-qr"></div>

    <button onclick={() => {stage = EncryptionState.FileSelection}}
            class="back-btn">
        {$_('filesharing.cancel')}
    </button>
</div>

<style>
    .sign-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-inline: 20px;
        /* max-width: 400px; */
        justify-self: center;
        height: 100%;
    }

    #crypt-irma-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
        width: 100%;
    }

    .back-btn {
        margin-top: 1em;
        padding: 0.5em 2em;
        background-color: #000000;
        color: #ffffff;
        border: none;
        border-radius: var(--pg-border-radius-sm);
        cursor: pointer;
        font-size: 1em;
        width: 100%;
        max-width: 256px;
        text-align: center;
    }

    @media only screen and (min-width: 768px) {
        .back-btn {
            margin-top: 1em;
            font-size: 1em;
        }
    }
</style>
