<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import type { AttType } from '$lib/lib/types/filesharing/attributes'

    interface props {
        recipient: { email: string; extra: AttributeCon };
        remove: () => void;
        addAttribute: (att: AttType) => void;
        attributes: AttType[];
    }

    let { recipient = $bindable(), remove, addAttribute, attributes }: props = $props()


    let addableButtons: AttType[] = $state([])
    $effect(() => {
        addableButtons = attributes.filter((att) => !recipient.extra.some(({ t }) => t === att))

    })
</script>

<li class="crypt-recipient">
    <input
        placeholder={
                $_('filesharing.encryptPanel.emailRecipient')
            }
        type="email"
        required
        bind:value={recipient.email}
    />
    <button
        class="btn-delete"
        onclick={remove}
    >
        x
    </button>

    {#each recipient.extra as attribute, index}
        <div class="attribute-field">
            <input
                placeholder={`${recipient.email}${recipient.email !== "" ? "'s" : ""} ${$_('filesharing.attributes.' + attribute.t)}`}
                required
                value={attribute.v}
            />
            <button
                class="btn-delete"
                onclick={(e) => {
                    recipient.extra.splice(index, 1)
                }}
            >
                x
            </button>
        </div>
    {/each}

    {#each addableButtons as attribute}
        <button
            class="add-attribute-btn"
            onclick={() => addAttribute(attribute)}>
            + {$_('filesharing.attributes.' + attribute)}
        </button>
    {/each}
</li>

<style lang="scss">
  @use 'shared-styles';

  .crypt-recipient:not(:last-child) {
    margin-bottom: 1.5em;
  }

  .btn-delete {
    all: unset;
    cursor: pointer;
  }
</style>