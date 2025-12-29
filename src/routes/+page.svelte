<script lang="ts">
    import Sign from '$lib/components/filesharing/Sign.svelte'
    import {
        type AttType,
        EncryptionState,
        type EncryptState,
    } from '$lib/lib/types/filesharing/attributes'
    import { browser } from '$app/environment'
    import RecipientSelection from '$lib/components/filesharing/RecipientSelection.svelte'
    import { isMobile, GetBrowserInfo } from '$lib/lib/browser-detect'
    import MessageInput from '$lib/components/filesharing/inputs/MessageInput.svelte'
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

<div class:container={EncryptState.encryptionState === EncryptionState.FileSelection}
     class:sign-container={EncryptState.encryptionState === EncryptionState.Sign}>
    <FileInput bind:files={EncryptState.files} bind:percentages={EncryptState.percentages}
               bind:done={EncryptState.done} bind:stage={EncryptState.encryptionState} />
    {#if EncryptState.encryptionState === EncryptionState.FileSelection}
        <div class="inputs-container" class:mobile-hide={EncryptState.files.length <= 0}>
            <RecipientSelection bind:recipients={EncryptState.recipients} attributes={ATTRIBUTES} />
            <MessageInput bind:message={EncryptState.message} />
            <SenderInputs bind:senderAttributes={EncryptState.senderAttributes}
                          bind:senderConfirm={EncryptState.senderConfirm}
                          attributes={ATTRIBUTES} />
            <div class="shrinking-spacer"></div>
            <SendButton bind:EncryptState={EncryptState} />
        </div>
    {:else if EncryptState.encryptionState === EncryptionState.Sign}
        <div>
            <Sign isMobile={isMobileDevice} />
            <button onclick={() => {EncryptState.encryptionState = EncryptionState.FileSelection}}
                    class="back-btn">
                Back
            </button>
        </div>
        <RecipientSelection bind:recipients={EncryptState.recipients} attributes={ATTRIBUTES} isConfirming={true} />
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

<style lang="scss">
  @import "$lib/shared-styles.css";

  * {
    list-style-type: none;
  }

  .container {
    display: grid;
    grid-auto-columns: 5fr 2fr;
    grid-auto-flow: column;
    gap: 2rem;
    overflow-y: hidden;
    height: calc(100vh - 52px - 0.5rem - 1rem); /* navbar height + margin */
  }

  .sign-container {
    display: grid;
    grid-auto-columns: 2fr 3fr 2fr;
    grid-auto-flow: column;
  }

  .inputs-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    font-size: 1.15em;
    min-width: 0;
    gap: 1em;
    margin: 1em 1em 0 0;
    overflow-y: auto;
  }

  .shrinking-spacer {
    flex-shrink: 0;
  }

  .inputs-container:last-child {
    margin-top: auto;
  }

  .crypt-irma-qr {
    width: 100%;
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

  @media only screen and (max-width: 768px) {
    .container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-inline: 1em;
    }

    .inputs-container {
      margin: 0;
    }
  }
</style>