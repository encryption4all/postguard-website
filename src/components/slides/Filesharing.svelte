<script lang="ts">
    import { _ } from 'svelte-i18n'
    import Sign from '$lib/components/filesharing/Sign.svelte'
    import {
        type AttType,
        EncryptionState,
        type EncryptState,
    } from '$lib/lib/types/filesharing/attributes'
    import { browser } from '$app/environment'
    import RecipientSelection from '$lib/components/filesharing/RecipientSelection.svelte'
    import { isMobile, GetBrowserInfo } from '$lib/lib/browser-detect'
    import MessageInput from '$lib/components/filesharing/MessageInput.svelte'
    import SenderInputs from '$lib/components/filesharing/SenderInputs.svelte'
    import SendButton from '$lib/components/filesharing/SendButton.svelte'
    import FileInput from '$lib/components/filesharing/inputs/FileInput.svelte'
    import EncryptionProgress from '$lib/components/filesharing/EncryptionProgress.svelte'
    import Error from '$lib/components/filesharing/Error.svelte'

    // janky way to conditionally import pg-wasm to avoid issues with SSR
    let modPromise: Promise<any>
    if (browser) {
        modPromise = import('@e4a/pg-wasm')
    } else {
        modPromise = Promise.resolve(null)
    }

    let isMobileDevice = isMobile()

    async function getParameters(): Promise<String> {
        let { name: browsername, version: browserversion } = GetBrowserInfo()

        let PKG_URL = import.meta.env.VITE_PKG_URL
        let APP_NAME = import.meta.env.VITE_APP_NAME
        let APP_VERSION = import.meta.env.VITE_APP_VERSION

        const METRICS_HEADER = {
            'X-PostGuard-Client-Version': `${browsername}${
                isMobileDevice ? '(mobile)' : ''
            },${browserversion},${APP_NAME},${
                APP_VERSION
            }`,
        }

        if (browser) {
            let resp = await fetch(`${PKG_URL}/v2/parameters`, {
                headers: METRICS_HEADER,
            })
            let params = await resp.json()
            return params.publicKey
        }
        return ''
    }

    const ATTRIBUTES: Array<AttType> = [
        'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
        'pbdf.gemeente.personalData.fullname',
        'pbdf.gemeente.personalData.dateofbirth',
    ]

    const defaultEncryptState: EncryptState = {
        recipients: [{ email: 'test@example.com', extra: [] }],
        sender: '',
        senderAttributes: [],
        message: '',
        files: [],
        percentages: [],
        done: [],
        encryptionState: EncryptionState.FileSelection,
        abort: new AbortController(),
        selfAborted: false,
        encryptStartTime: 0,
        modPromise: modPromise,
        pkPromise: getParameters(),
        senderConfirm: true,
        privSignKey: undefined,
        pubSignKey: undefined,
    }


    let EncryptState: EncryptState = $state(defaultEncryptState)
</script>

<div class="container">
    <FileInput bind:files={EncryptState.files} bind:percentages={EncryptState.percentages}
               bind:done={EncryptState.done} bind:stage={EncryptState.encryptionState} />
    <div class="crypt-progress-container" class:mobile-hide={EncryptState.files.length <= 0}>
        {#if EncryptState.encryptionState === EncryptionState.FileSelection}
            <RecipientSelection bind:recipients={EncryptState.recipients} attributes={ATTRIBUTES} />
            <MessageInput bind:message={EncryptState.message} />
            <SenderInputs bind:senderAttributes={EncryptState.senderAttributes}
                          bind:senderConfirm={EncryptState.senderConfirm}
                          attributes={ATTRIBUTES} />
            <SendButton bind:EncryptState={EncryptState}
            />
        {:else if EncryptState.encryptionState === EncryptionState.Sign}
            <Sign isMobile={isMobileDevice} />
        {:else if EncryptState.encryptionState === EncryptionState.Encrypting}
            <EncryptionProgress encryptStartTime={EncryptState.encryptionState}
                                files={EncryptState.files}
                                recipients={EncryptState.recipients}
                                percentages={EncryptState.percentages} />
        {:else if EncryptState.encryptionState === EncryptionState.Error}
            <Error bind:encryptionState={EncryptState.encryptionState} />
        {:else if EncryptState.encryptionState === EncryptionState.Done}

        {/if}
    </div>

</div>

<style lang="scss">
  @import "$lib/shared-styles.css";

  .container {
    display: grid;
    width: 100%;
    height: 100%;
    grid-auto-columns: 5fr 2fr;
    grid-auto-flow: column;
    gap: 2rem;
    overflow-y: auto;
  }

  .crypt-progress-container {
    display: flex;
    flex-direction: column;
    font-size: 1.15em;
    min-width: 0;
    gap: 1em;
    margin: 1em 1em 0 0;
  }

  .crypt-irma-qr {
    width: 100%;
  }

  @media only screen and (max-width: 600px) {
    .container {
      display: flex;
      flex-direction: column;
      margin-inline: 1em;
      gap: 1rem;
    }

    .crypt-progress-container {
        margin: 0;
    }
  }
</style>