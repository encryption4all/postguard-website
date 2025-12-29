<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { browser } from '$app/environment'
    import iosBtnNl from '$lib/assets/images/non-free/appstores/nl/apple-appstore-nl.svg'
    import androidBtnNl from '$lib/assets/images/non-free/appstores/nl/google-playstore-nl.svg'
    import iosBtnEn from '$lib/assets/images/non-free/appstores/en/apple-appstore-en.svg'
    import androidBtnEn from '$lib/assets/images/non-free/appstores/en/google-playstore-en.svg'
    import { EncryptionState, type EncryptState } from '$lib/lib/types/filesharing/attributes'

    interface props {
        isMobile: boolean;
        stage: EncryptionState;
    }

    let { isMobile, stage = $bindable() }:props = $props()
</script>

<div class="inputs-container">
    <div id="crypt-irma-qr"></div>

    <button onclick={() => {stage = EncryptionState.FileSelection}}
            class="back-btn">
        Back
    </button>
</div>

<style>
    @import "shared-styles.css";

    .inputs-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    #crypt-irma-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
    }

    .back-btn {
        margin-top: 1em;
        padding: 0.5em 1em;
        background-color: #000000;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
        width: 100%;
        text-align: center;
    }
</style>