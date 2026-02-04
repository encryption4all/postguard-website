<script lang="ts">
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
    import Sign from '$lib/components/filesharing/Sign.svelte'
    import EncryptionProgress from '$lib/components/filesharing/EncryptionProgress.svelte'
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
        'pbdf.gemeente.personalData.fullname',
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
        <Sign isMobile={isMobileDevice} bind:stage={EncryptState.encryptionState} />
        <div class="recipients-sign-container">
            <RecipientSelection bind:recipients={EncryptState.recipients} attributes={ATTRIBUTES} isConfirming={true} />
        </div>
    {:else if EncryptState.encryptionState === EncryptionState.Encrypting}
        <EncryptionProgress encryptStartTime={EncryptState.encryptionState}
                            files={EncryptState.files}
                            recipients={EncryptState.recipients}
                            bind:percentages={EncryptState.percentages}
                            bind:done={EncryptState.done}
                            bind:stage={EncryptState.encryptionState}
                            bind:selfAborted={EncryptState.selfAborted}
                            abort={EncryptState.abort}
        />
    {:else if EncryptState.encryptionState === EncryptionState.Error}
        <Error bind:encryptionState={EncryptState.encryptionState} />
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
    gap: 1rem;
    margin-inline: 1em;
    overflow-y: auto;
    height: calc(100vh - 52px - 0.5rem - 1rem); /* navbar height + margin */
  }

  .sign-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .inputs-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    font-size: 1.15em;
    min-width: 0;
    gap: 1em;
    margin: 0;
    border-left: 1px solid var(--Postguard-Strong-Background, #C6E2F6)
  }

  .shrinking-spacer {
    flex-shrink: 0;
  }

  .inputs-container:last-child {
    margin-top: auto;
  }

  .recipients-sign-container {
    display: none;
  }

  @media only screen and (min-width: 768px) {
    .sign-container {
      margin-right: 20px;
      justify-content: space-between;
    }

    .container {
      display: grid;
      grid-auto-columns: 5fr 2fr;
      grid-auto-flow: column;
      gap: 2rem;
      overflow-y: hidden;
    }

    .inputs-container {
      margin: 1em 1em 0 0;
      overflow-y: auto;
    }
  }

  @media only screen and (min-width: 1280px) {
    .recipients-sign-container {
      display: block;
    }
  }
</style>