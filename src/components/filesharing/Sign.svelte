<script lang="ts">
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
    @import "@privacybydesign/yivi-css";
    @import "sign.css";

    .inputs-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        margin-inline: 20px;
        max-width: 400px;
        justify-self: center;
    }

    #crypt-irma-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
    }

    .back-btn {
        margin-top: 1em;
        padding: 0.5em 0em;
        background-color: #000000;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
        width: 100%;
        text-align: center;
    }

    @media only screen and (min-width: 768px) {
        .back-btn {
            margin-top: 1em;
            font-size: 1em;
        }
    }
</style>