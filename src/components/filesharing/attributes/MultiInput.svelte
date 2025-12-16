<script lang="ts">
    import { _ } from 'svelte-i18n'
    import removeIcon from '$lib/assets/images/google-icons/remove.svg'

    interface props {
        translation_key: string;
        value?: string;
        deleteAction?: () => void;
    }

    // So we have a unique id for the label-input pair so we can handle multiple inputs correctly in a list even with multiple recipients
    const randomId = Math.random().toString(36).substring(2, 15)

    let { translation_key, value = $bindable(''), deleteAction }: props = $props()

    let showingValue = $state('')
    showingValue = value

    let selectedCountryPrefix = $state('+31')

    function handleInput() {
        value = selectedCountryPrefix + showingValue
    }
</script>

<label style="margin-top: 0;" for={randomId}>
    {$_(translation_key)}
</label>
<div class="optional-value">
    {#if translation_key === 'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber'}
        <input
            id={randomId}
            class="removable-text-input field-height"
            type="tel"
            bind:value={showingValue}
            oninput={handleInput}
        />
        {:else if translation_key === 'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth'}
        <input
            id={randomId}
            class="removable-text-input field-height"
            type="date"
            bind:value={showingValue}
            oninput={handleInput}
        />
        {:else}
        <input
            id={randomId}
            class="removable-text-input field-height"
            type="text"
            bind:value={showingValue}
            oninput={handleInput}
        />
    {/if}
    {#if deleteAction}
        <button
            class="btn-delete field-height"
            onclick={deleteAction}
        >
            <img
                style="width: 16px"
                src={removeIcon}
                alt="remove optional attribute"
            />
        </button>
    {/if}
</div>

<style>
    .field-height {
        height: 24px;
    }

    .removable-text-input {
        background-color: #E9E9E9;
        border: none;
        border-block: solid 2px black;
        border-left: solid 2px black;
        padding: 4px 0 4px 4px;
    }

    .btn-delete {
        border-block: solid 2px black;
        border-right: solid 2px black;
        padding: 4px 4px 4px 0;
        display: flex;
        align-items: center;
    }

    .optional-value {
        display: flex;
        align-items: center;
    }


    /* for the date input */
    input[type="date"] {
        position: relative;
        padding-left: 24px;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        position: absolute;
        left: 4px;
        right: auto;
    }
</style>
