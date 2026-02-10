<script lang="ts">
    import {
        type AttType,
        EncryptionState,
        type EncryptState,
    } from '$lib/types/filesharing/attributes'
    import { browser } from '$app/environment'
    import RecipientSelection from '$lib/components/filesharing/RecipientSelection.svelte'
    import { isMobile, GetBrowserInfo } from '$lib/browser-detect'
    import MessageInput from '$lib/components/filesharing/inputs/MessageInput.svelte'
    import SenderInputs from '$lib/components/filesharing/SenderInputs.svelte'
    import SendButton from '$lib/components/filesharing/SendButton.svelte'
    import FileInput from '$lib/components/filesharing/inputs/FileInput.svelte'
    import Error from '$lib/components/filesharing/Error.svelte'
    import Done from '$lib/components/filesharing/Done.svelte'

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
        'pbdf.gemeente.personalData.dateofbirth',
    ]

    const defaultEncryptState: EncryptState = {
        recipients: [{ email: '', extra: [] }],
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

<div class:container={EncryptState.encryptionState === EncryptionState.FileSelection || EncryptState.encryptionState === EncryptionState.Sign || EncryptState.encryptionState === EncryptionState.Encrypting || EncryptState.encryptionState === EncryptionState.Error}>
    <FileInput bind:files={EncryptState.files} bind:percentages={EncryptState.percentages}
               bind:done={EncryptState.done} bind:stage={EncryptState.encryptionState} />
    {#if EncryptState.encryptionState === EncryptionState.FileSelection || EncryptState.encryptionState === EncryptionState.Sign || EncryptState.encryptionState === EncryptionState.Encrypting}
        <div class="inputs-container">
            <RecipientSelection bind:recipients={EncryptState.recipients} attributes={ATTRIBUTES} readonly={EncryptState.encryptionState === EncryptionState.Encrypting} />
            <MessageInput bind:message={EncryptState.message} readonly={EncryptState.encryptionState === EncryptionState.Encrypting} />
            <SenderInputs bind:senderAttributes={EncryptState.senderAttributes}
                          bind:senderConfirm={EncryptState.senderConfirm}
                          attributes={ATTRIBUTES}
                          readonly={EncryptState.encryptionState === EncryptionState.Encrypting} />
            <SendButton bind:EncryptState={EncryptState} />
        </div>
    {:else if EncryptState.encryptionState === EncryptionState.Error}
        <div class="inputs-container">
            <Error bind:encryptionState={EncryptState.encryptionState} />
        </div>
    {:else if EncryptState.encryptionState === EncryptionState.Done}
        <Done bind:EncryptState={EncryptState} defaultEncryptState={defaultEncryptState} />
    {/if}


</div>

<style lang="scss">
  @import "$lib/shared-styles.css";

  * {
    list-style-type: none;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-inline: 1rem;
    padding: 0.5rem 0;
  }

  .inputs-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    font-size: 1.15rem;
    min-width: 0;
    gap: 1.25rem;
    margin: 0;
  }

  @media only screen and (min-width: 768px) {
    .container {
      display: grid;
      grid-auto-columns: 4fr 3fr;
      grid-auto-flow: column;
      gap: 2rem;
      height: calc(100vh - 52px - 0.5rem - 1rem); /* navbar height + margin */
      overflow-y: hidden;
    }

    .inputs-container {
      max-height: 100%;
      margin: 1rem 0 0 0;
      padding-right: 1rem;
      overflow-y: auto;
      border-left: 2px solid var(--pg-strong-background);
      display: flex;
      justify-content: flex-start;
    }
  }
</style>
