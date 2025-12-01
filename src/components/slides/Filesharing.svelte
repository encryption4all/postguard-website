<script lang="ts">
    import { _ } from 'svelte-i18n'
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import iosBtnEn from '$lib/assets/images/non-free/appstores/en/apple-appstore-en.svg'
    import iosBtnNl from '$lib/assets/images/non-free/appstores/nl/apple-appstore-nl.svg'
    import androidBtnEn from '$lib/assets/images/non-free/appstores/en/google-playstore-en.svg'
    import androidBtnNl from '$lib/assets/images/non-free/appstores/nl/google-playstore-nl.svg'
    import { browser } from '$app/environment'

    function isMobile(): boolean {
        if (browser || typeof window === "undefined") {
            return false
        }
        // IE11 doesn't have window.navigator, test differently
        // https://stackoverflow.com/questions/21825157/internet-explorer-11-detection
        // @ts-ignore
        if (!!window.MSInputMethodContext && !!document.documentMode) {
            return false
        }

        if (/Android/i.test(window.navigator.userAgent)) {
            return true
        }

        // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
        // @ts-ignore so MSStream is not flagged as error
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            return true
        }

        // https://stackoverflow.com/questions/57776001/how-to-detect-ipad-pro-as-ipad-using-javascript
        if (
            /Macintosh/.test(navigator.userAgent) &&
            navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2
        ) {
            return true
        }

        // Neither Android nor iOS, assuming desktop
        return false
    }

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

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <div class="crypt-progress-container">
        <h3>
            {isMobile() ? $_('filesharing.encryptPanel.irmaInstructionHeaderMobile') : $_('filesharing.encryptPanel.irmaInstructionHeaderQr')}
        </h3>
        <p>{isMobile() ? $_('filesharing.encryptPanel.irmaInstructionMobile') : $_('filesharing.encryptPanel.irmaInstructionQr')}</p>
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
    </div>
</div>

<style lang="scss">
  .grid-container {
    display: grid;
    grid-auto-columns: 1fr 1fr 1fr;
    grid-auto-flow: column;
    max-width: 1200px;
    max-height: 800px;
    grid-gap: 2rem;
  }

  img.grid-item {
    align-self: end;
    object-fit: contain;
  }

  .grid-item {
    width: 100%;
    display: flex;
    justify-content: center;
    text-align: left;

    &.header {
      min-width: 225px;
      justify-content: start;
      padding-top: 5em;
    }
  }

  @media only screen and (max-width: 800px) {
    .grid-container {
      display: grid;
      grid-auto-flow: unset;
      max-height: unset;
      margin: 0 5%;
    }

    .grid-item {
      width: 90%;

      &.header {
        justify-content: start;
        padding-bottom: 0;
      }
    }
  }

  .crypt-progress-container {
    font-size: 1.15em;
  }

  @media only screen and (max-width: 500px) {
    .crypt-progress-container:not(:first-child) {
      margin-top: 8em;
    }
  }

  .crypt-irma-qr {
    width: 100%;
  }
</style>