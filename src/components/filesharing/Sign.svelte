<script lang="ts">
    import { _ } from 'svelte-i18n'
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { browser } from '$app/environment'
    import iosBtnNl from '$lib/assets/images/non-free/appstores/nl/apple-appstore-nl.svg'
    import androidBtnNl from '$lib/assets/images/non-free/appstores/nl/google-playstore-nl.svg'
    import iosBtnEn from '$lib/assets/images/non-free/appstores/en/apple-appstore-en.svg'
    import androidBtnEn from '$lib/assets/images/non-free/appstores/en/google-playstore-en.svg'


    let { isMobile } = $props()

    function getAppButton(store: string) {
        if (browser) {
            let selectedLang: String | null = localStorage.getItem('preferredLanguage')
            if (selectedLang === 'nl-NL') {
                return store === 'ios' ? iosBtnNl : androidBtnNl
            } else {
                return store === 'ios' ? iosBtnEn : androidBtnEn
            }
        }
    }
</script>

<h3>
    {isMobile ? $_('filesharing.encryptPanel.irmaInstructionHeaderMobile') : $_('filesharing.encryptPanel.irmaInstructionHeaderQr')}
</h3>
<p>{isMobile ? $_('filesharing.encryptPanel.irmaInstructionMobile') : $_('filesharing.encryptPanel.irmaInstructionQr')}</p>

<div class="crypt-irma-qr"></div>

<div class="get-irma-here-anchor">
    <img class="irma-logo" src={yiviLogo} alt="yivi-logo" />
    <span
        class="get-irma-text"
        style="
              display: inline-block;
              verticalAlign: middle;
              height: 45pt;
              marginLeft: 5pt;
              marginBottom: 0.5em;
            "
    >
                {$_('filesharing.decryptpanel.noIrma')}
            </span>
    <div class="get-irma-buttons">
        <a
            href={$_('yivi.iosHref')}
            style="
                display: inline-block;
                height: 38pt;
                marginRight: 15pt;
              "
        >
            <img
                style="height: 100%"
                class="irma-appstore-button"
                src={getAppButton('ios')}
                alt="apple-appstore"
            />
        </a>
        <a
            href={$_('yivi.androidHref')}
            style="display: inline-block; height: 38pt"
        >
            <img
                style="height: 100%"
                class="irma-appstore-button"
                src={getAppButton('android')}
                alt="google-playstore"
            />
        </a>
    </div>
</div>