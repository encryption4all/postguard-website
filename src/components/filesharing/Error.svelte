<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { EncryptionState } from '$lib/lib/types/filesharing/attributes'

    interface props {
        encryptionState: EncryptionState;
    }

    let { encryptionState = $bindable() }: props = $props()
</script>

<h3 class="crypt-progress-error">{"Error occured"}</h3>
<p>{$_('filesharing.error')}</p>
<button
    class="crypt-btn-main crypt-btn"
    onclick={() =>
                encryptionState = EncryptionState.FileSelection
          }
    type="button"
>
    {$_('filesharing.tryAgain')}
</button>

<style lang="scss">
  @use "shared-styles";

  .crypt-progress-error {
    color: #ff0033;
  }
</style>