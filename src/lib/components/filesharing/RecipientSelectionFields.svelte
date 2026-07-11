<script lang="ts">
    import { _ } from 'svelte-i18n'
    import type { AttributeCon } from '$lib/types/filesharing/attributes'
    import type { AttType } from '$lib/types/filesharing/attributes'
    import closebutton from '$lib/assets/images/google-icons/close.svg'
    import AttributeButton from '$lib/components/filesharing/inputs/AttributeButton.svelte'
    import MultiInput from '$lib/components/filesharing/inputs/MultiInput.svelte'
    interface props {
        recipient: { email: string; extra: AttributeCon }
        remove: () => void
        addAttribute: (att: AttType) => void
        attributes: AttType[]
        isConfirming?: boolean
        isFirstRecipient?: boolean
    }

    let {
        recipient = $bindable(),
        remove,
        addAttribute,
        attributes,
        isConfirming = false,
        isFirstRecipient = false,
    }: props = $props()

    let addableButtons: AttType[] = $derived(
        attributes.filter((att) => !recipient.extra.some(({ t }) => t === att))
    )
</script>

<li class="crypt-recipient" class:is-confirming-bg={isConfirming}>
    <div class="recipient-container">
        {#if !isFirstRecipient}
            <button
                class="btn-delete"
                class:hidden={isConfirming}
                onclick={remove}
            >
                <img
                    class="invert"
                    style="width: 14px; height: 14px;"
                    src={closebutton}
                    alt="close button"
                />
            </button>
        {/if}

        <div class="recipient-content">
            <div class="recipient-heading">
                <label
                    class="field-label"
                    for="recipient-email-{recipient.email}"
                >
                    {$_('filesharing.encryptPanel.emailRecipient')}
                    <span class="required-asterisk" aria-hidden="true">*</span>
                </label>
            </div>
            <div class="address-input">
                <svg
                    class="address-input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                    id="recipient-email-{recipient.email}"
                    placeholder={$_(
                        'filesharing.encryptPanel.emailRecipientPlaceholder'
                    )}
                    type="email"
                    required
                    aria-required="true"
                    aria-describedby="required-fields-legend"
                    autocomplete="email"
                    inputmode="email"
                    autocapitalize="none"
                    spellcheck="false"
                    class="pg-input"
                    class:is-confirming-bg={isConfirming}
                    bind:value={recipient.email}
                    disabled={isConfirming}
                />
            </div>

            <div class="optionals-container">
                {#if isConfirming}
                    {#if recipient.extra.length > 0}
                        <div class="attributes-list">
                            {#each recipient.extra as attribute (attribute.t)}
                                <AttributeButton
                                    type="added"
                                    translation_key={'filesharing.attributes.' +
                                        attribute.t}
                                />
                            {/each}
                        </div>
                    {/if}
                {:else}
                    {#each recipient.extra as attribute, index (attribute.t)}
                        <MultiInput
                            translation_key={'filesharing.attributes.' +
                                attribute.t}
                            bind:value={attribute.v}
                            deleteAction={() => {
                                recipient.extra.splice(index, 1)
                            }}
                        />
                    {/each}
                    <div class="attributes-list">
                        {#each addableButtons as attribute (attribute)}
                            <AttributeButton
                                type="add"
                                translation_key={'filesharing.attributes.' +
                                    attribute}
                                clickAction={() => addAttribute(attribute)}
                            />
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</li>

<style>
    .crypt-recipient {
        background-color: var(--pg-soft-background);
        padding: 1rem;
        border-radius: var(--pg-border-radius-lg);
        border: 1px solid var(--pg-strong-background);
    }

    .crypt-recipient:not(:last-child) {
        margin-bottom: 0.5rem;
    }

    .recipient-container {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .btn-delete {
        all: unset;
        cursor: pointer;
        padding: 4px;
        border-radius: var(--pg-border-radius-md);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .btn-delete:hover {
        background-color: var(--pg-soft-background);
    }

    .btn-delete:focus-visible {
        outline: 2px solid var(--pg-primary);
        outline-offset: 2px;
    }

    .recipient-content {
        flex: 1;
        min-width: 0;
    }

    .recipient-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .field-label {
        font-size: var(--pg-font-size-sm);
        font-weight: var(--pg-font-weight-extrabold);
        color: var(--pg-text);
        font-family: var(--pg-font-family);
    }

    .required-asterisk {
        color: var(--pg-error, #e53e3e);
        margin-left: 0.125rem;
    }

    .optionals-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    /* Distinct "address field" affordance: a leading envelope icon so the
       recipient input reads as "who you're sending to" and is visually set
       apart from the optional free-text message box (#289). */
    .address-input {
        position: relative;
        display: flex;
        align-items: center;
    }

    .address-input-icon {
        position: absolute;
        left: 0.85rem;
        width: 18px;
        height: 18px;
        color: var(--pg-text-secondary);
        pointer-events: none;
    }

    .address-input > :global(input.pg-input) {
        padding-left: 2.6rem;
    }
</style>
