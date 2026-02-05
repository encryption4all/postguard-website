<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js/mobile'
    import '../shared-styles.css'

    import closeIcon from '$lib/assets/images/google-icons/close.svg'

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
<div class="input-wrapper">
    <label for={randomId}>
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
                type="tel"
                placeholder={$_(translation_key + '.placeholder')}
                bind:value={showingValue}
            />
        {:else if translation_key === 'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth'}
            <input
                id={randomId}
                class="removable-text-input field-height"
                class:is-confirming-bg={isConfirming}
                disabled={isConfirming}
                type="text"
                pattern="\d{2}-\d{2}-\d{4}"
                placeholder={$_(translation_key + '.placeholder')}
                bind:value={value}
            />
        {:else}
            <input
                id={randomId}
                class="removable-text-input field-height"
                class:is-confirming-bg={isConfirming}
                disabled={isConfirming}
                type="text"
                placeholder={$_(translation_key + '.placeholder')}
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
                    style="width: 18px; height: 18px;"
                    src={closeIcon}
                    alt="remove optional attribute"
                />
            </button>
        {/if}
    </div>
</div>

<style>
    .input-wrapper {
        margin-bottom: 0.5em;
    }

    .input-wrapper:last-child {
        margin-bottom: 0;
    }

    select {
        font-family: var(--pg-font-family);
    }

    label {
        font-family: var(--pg-font-family);
        font-size: 0.9em;
        color: var(--pg-text-secondary);
        margin-bottom: 0.35em;
        margin-top: 0;
        display: block;
    }

    .field-height {
        height: 40px;
    }

    .phone-input {
        font-family: var(--pg-font-family);
        font-size: var(--pg-input-font-size);
        background-color: white;
        border: 1.5px solid var(--pg-border-color);
        border-radius: var(--pg-border-radius-md);
        padding: 0 10px;
        height: 40px;
        transition: all 0.2s ease;
        min-width: 100px;
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
        border-radius: var(--pg-border-radius-md);
        padding: 0 10px;
        width: 100%;
        transition: all 0.2s ease;
        height: 40px;
        flex: 1;
    }

    .removable-text-input:hover {
        border-color: var(--pg-border-color-hover);
    }

    .removable-text-input:focus {
        outline: none;
        border-color: var(--pg-accent-color);
        background-color: white;
    }

    .btn-delete {
        all: unset;
        border-radius: var(--pg-border-radius-md);
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background-color: transparent;
        height: 40px;
        min-width: 40px;
        cursor: pointer;
    }

    .btn-delete:hover {
        background-color: #fee2e2;
    }

    .removed-del-border {
        border-radius: var(--pg-border-radius-md);
    }

    .optional-value {
        display: flex;
        align-items: center;
        gap: 0.5em;
        height: 40px;
    }

</style>
