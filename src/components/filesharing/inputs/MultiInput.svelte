<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js/mobile'
    import '../shared-styles.css'

    import removeIcon from '$lib/assets/images/google-icons/remove.svg'

    interface props {
        translation_key: string;
        value?: string;
        deleteAction?: () => void;
        isConfirming?: boolean;
    }

    let { translation_key, value = $bindable(''), deleteAction, isConfirming = false }: props = $props()

    // So we have a unique id for the label-input pair so we can handle multiple inputs correctly in a list even with multiple recipients
    const randomId = Math.random().toString(36).substring(2, 15)
    let showingValue = $state('')
    let selectedCountryPrefix = $state('+31')

    const allowedCountries = ['at', 'be', 'bg', 'cy', 'dk', 'de', 'ee', 'fi', 'fr', 'gr', 'hu', 'ie',
        'is', 'it', 'hr', 'lv', 'lt', 'li', 'lu', 'mt', 'mc', 'nl', 'no', 'at',
        'pl', 'pt', 'ro', 'si', 'sk', 'es', 'cz', 'gb', 'se', 'ch']

    function getCountryPrefix(countryCode: string): string {
        const country = countryCode.toUpperCase() as CountryCode
        return '+' + getCountryCallingCode(country)
    }

    $effect(() => {
        if (translation_key === 'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber') {
            // so the prefix doesn't get added accidentally
            if (showingValue.startsWith(selectedCountryPrefix)) {
                showingValue.replace(selectedCountryPrefix, '')
            }

            value = selectedCountryPrefix + showingValue
        }
    })

</script>
<div>
    <label style="margin-top: 0;" for={randomId}>
        {$_(translation_key)}
    </label>
    <div class="optional-value" class:removed-del-border={isConfirming}>
        {#if translation_key === 'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber'}
            <select bind:value={selectedCountryPrefix} class="field-height phone-input"
                    class:is-confirming-bg={isConfirming} disabled={isConfirming}>
                {#each allowedCountries as country}
                    <option value={getCountryPrefix(country)}>
                        {country.toUpperCase()} {getCountryPrefix(country)}
                    </option>
                {/each}
            </select>
            <input
                id={randomId}
                class="removable-text-input field-height"
                class:is-confirming-bg={isConfirming}
                disabled={isConfirming}
                style="border-left: solid 0px black;"
                type="tel"
                bind:value={showingValue}
            />
        {:else if translation_key === 'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth'}
            <input
                id={randomId}
                class="removable-text-input field-height"
                class:is-confirming-bg={isConfirming}
                disabled={isConfirming}
                type="date"
                bind:value={value}
            />
        {:else}
            <input
                id={randomId}
                class="removable-text-input field-height"
                class:is-confirming-bg={isConfirming}
                disabled={isConfirming}
                type="text"
                bind:value={value}
            />
        {/if}
        {#if deleteAction}
            <button
                class:hidden={isConfirming}
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
</div>

<style>
    select {
        font-family: var(--pg-font-family);
    }

    label {
        font-family: var(--pg-font-family);
    }

    .field-height {
        height: 24px;
    }

    .phone-input {
        font-family: var(--pg-font-family);
        font-size: var(--pg-input-font-size);
        background-color: white;
        border: 1.5px solid var(--pg-border-color);
        border-right: none;
        border-radius: var(--pg-border-radius) 0 0 var(--pg-border-radius);
        padding: 8px 6px;
        height: 40px;
        transition: all 0.2s ease;
    }

    .phone-input:hover {
        border-color: var(--pg-border-color-hover);
    }

    .phone-input:focus {
        outline: none;
        border-color: var(--pg-accent-color);
        background-color: white;
    }

    .removable-text-input {
        font-family: var(--pg-font-family);
        font-size: var(--pg-input-font-size);
        background-color: white;
        border: 1.5px solid var(--pg-border-color);
        border-left: none;
        border-right: none;
        padding: 8px 10px;
        width: 100%;
        transition: all 0.2s ease;
        height: 40px;
    }

    .removable-text-input:hover {
        border-top-color: var(--pg-border-color-hover);
        border-bottom-color: var(--pg-border-color-hover);
    }

    .removable-text-input:focus {
        outline: none;
        border-color: var(--pg-accent-color);
        background-color: white;
    }

    .btn-delete {
        border: 1.5px solid var(--pg-border-color);
        border-left: none;
        border-radius: 0 var(--pg-border-radius) var(--pg-border-radius) 0;
        padding: 8px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background-color: white;
        height: 40px;
    }

    .btn-delete:hover {
        background-color: #fee2e2;
        border-color: #fca5a5;
    }

    .removed-del-border {
        border-right: 1.5px solid var(--pg-border-color);
        border-radius: 0 var(--pg-border-radius) var(--pg-border-radius) 0;
    }

    .optional-value {
        display: flex;
        align-items: stretch;
    }

    .optional-value:hover .phone-input,
    .optional-value:hover .removable-text-input,
    .optional-value:hover .btn-delete {
        border-color: var(--pg-border-color-hover);
    }

    .optional-value:focus-within .phone-input,
    .optional-value:focus-within .removable-text-input,
    .optional-value:focus-within .btn-delete {
        border-color: var(--pg-accent-color);
    }

    /* for the date input */
    input[type="date"] {
        font-family: var(--pg-font-family);
        position: relative;
        padding-left: 24px;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
        position: absolute;
        left: 4px;
        right: auto;
    }
</style>
