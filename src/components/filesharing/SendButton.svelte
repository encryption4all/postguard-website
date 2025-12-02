<script lang="ts">
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'

    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE

    interface props {
        files: File[];
        recipients: { email: string; extra: AttributeCon }[];
    }

    let { files, recipients }: props = $props()

    let canEncrypt:boolean = $state(false)
    $effect(() => {
        if (files.length === 0 || recipients.length === 0) {
            return;
        }

        const totalSize = files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0);

        const regex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        const addressesValid =
            recipients.every(({ email }) => regex.test(email));

        canEncrypt = totalSize < MAX_UPLOAD_SIZE &&
            recipients.length > 0 &&
            addressesValid;
    })

    function onSign(): void {
        // Placeholder function for signing/encrypting action
        // Replace with actual implementation as needed
        console.log('Encrypt and send action triggered')
    }
</script>

<button
    class="crypt-btn-main crypt-btn yivi-btn-logo {canEncrypt ? '' : ' crypt-btn-disabled'}"
    onclick={(e) => {
          if (canEncrypt) {
            onSign();
          }
        }}
>
    <img src={yiviLogo} alt="yivi-logo" width={36} height={20} />
    {$_('filesharing.encryptPanel.encryptSend')}
</button>

<style lang="scss">
  .crypt-btn-main {
    width: 14em;
  }

  @media only screen and (max-width: 400px) {
    .crypt-btn-main {
      width: 13em;
    }

    .crypt-btn-cancel {
      width: 13em !important;
    }
  }

  .crypt-btn {
    border: none;
    border-radius: 2.6em;
    background: #000000;
    cursor: pointer;
    color: white;
    font-weight: bold;
    font-size: 1.15em;
    line-height: 1.6em;
    padding: 0.25em 0;
    text-align: center;
  }

  .crypt-btn:disabled,
  .crypt-btn[disabled],
  .crypt-btn-disabled {
    background: #e8e8e8;
    color: #424242;
    cursor: not-allowed;
  }

  .yivi-btn-logo {
    display: flex;
    padding-right: 1em;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
  }

  .crypt-btn-main {
    display: block;
    padding-left: 0.25em;
    width: 15em;
    margin: 1em auto;
  }
</style>