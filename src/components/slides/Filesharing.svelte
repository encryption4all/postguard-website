<script lang="ts">
    import { _ } from 'svelte-i18n'
    import Sign from '$lib/components/filesharing/Sign.svelte'
    import type { AttributeCon, ISigningKey } from '@e4a/pg-wasm'
    import { browser } from '$app/environment'
    import FileSelection from '$lib/components/filesharing/FileSelection.svelte'
    import { isMobile, GetBrowserInfo } from '$lib/lib/browser-detect';

    // janky way to conditionally import pg-wasm to avoid issues with SSR
    let modPromise: Promise<any>;
    if (browser) {
        modPromise = import("@e4a/pg-wasm");
    } else {
        modPromise = Promise.resolve(null);
    }

    let PKG_URL = import.meta.env.VITE_PKG_URL
    let APP_NAME = import.meta.env.VITE_APP_NAME
    let APP_VERSION = import.meta.env.VITE_APP_VERSION

    let { name: browsername, version: browserversion } = GetBrowserInfo();
    let isMobileDevice = isMobile();

    export const METRICS_HEADER = {
        "X-PostGuard-Client-Version": `${browsername}${
            isMobileDevice ? "(mobile)" : ""
        },${browserversion},${APP_NAME},${
            APP_VERSION
        }`,
    };
    async function getParameters(): Promise<String> {
        if (browser) {
            let resp = await fetch(`${PKG_URL}/v2/parameters`, {
                headers: METRICS_HEADER,
            });
            let params = await resp.json();
            return params.publicKey;
        }
        return "";
    }

    enum EncryptionState {
        FileSelection = 1,
        Encrypting,
        Done,
        Error,
        Sign,
    }

    type EncryptState = {
        recipients: { email: string; extra: AttributeCon }[];
        sender: string;
        message: string;
        files: File[];
        percentages: number[];
        done: boolean[];
        encryptionState: EncryptionState;
        abort: AbortController;
        selfAborted: boolean;
        encryptStartTime: number;
        modPromise: Promise<any>;
        pkPromise: Promise<any>;
        pubSignKey?: ISigningKey;
        privSignKey?: ISigningKey;
        senderAttributes: AttributeCon;
        senderConfirm: boolean;
    };

    const defaultEncryptState: EncryptState = {
        recipients: [{ email: "", extra: [] }],
        sender: "",
        senderAttributes: [],
        message: "",
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
    };


    let EncryptState: EncryptState = defaultEncryptState;
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <div class="crypt-progress-container">
    {#if EncryptState.encryptionState === EncryptionState.FileSelection}
        <FileSelection />
    {:else if EncryptState.encryptionState === EncryptionState.Sign}
        <Sign isMobile={isMobileDevice} />
    {/if}
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