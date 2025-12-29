<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { browser } from '$app/environment'
    import iosBtnNl from '$lib/assets/images/non-free/appstores/nl/apple-appstore-nl.svg'
    import androidBtnNl from '$lib/assets/images/non-free/appstores/nl/google-playstore-nl.svg'
    import iosBtnEn from '$lib/assets/images/non-free/appstores/en/apple-appstore-en.svg'
    import androidBtnEn from '$lib/assets/images/non-free/appstores/en/google-playstore-en.svg'


    let { isMobile } = $props()

    function getAppButton(store: string) {
        if (browser) {
            let selectedLang = $locale
            if (selectedLang === 'nl-NL') {
                return store === 'ios' ? iosBtnNl : androidBtnNl
            } else {
                return store === 'ios' ? iosBtnEn : androidBtnEn
            }
        }
    }
</script>

<div class="inputs-container">
    <div id="crypt-irma-qr"></div>
</div>

<style>
    @import "shared-styles.css";

    #crypt-irma-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
    }

    #crypt-irma-qr .yivi-web-header {
        display: none;
    }
</style>