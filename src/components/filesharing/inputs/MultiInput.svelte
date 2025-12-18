<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js/mobile'
    import * as flags from 'country-flag-icons/string/3x2'

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
    <div class="optional-value">
        {#if translation_key === 'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber'}
            <select bind:value={selectedCountryPrefix} class="field-height phone-input">
                {#each allowedCountries as country}
                    <option value={getCountryPrefix(country)}>
                        {country.toUpperCase()} {getCountryPrefix(country)}
                    </option>
                {/each}
            </select>
            <input
                id={randomId}
                class="removable-text-input field-height"
                style="border-left: solid 0px black;"
                type="tel"
                bind:value={showingValue}
            />
        {:else if translation_key === 'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth'}
            <input
                id={randomId}
                class="removable-text-input field-height"
                type="date"
                bind:value={value}
            />
        {:else}
            <input
                id={randomId}
                class="removable-text-input field-height"
                type="text"
                bind:value={value}
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
</div>

<style>
    select {
        font-family: "Overpass";
    }
    .field-height {
        height: 24px;
    }

    .phone-input {
        background-color: #E9E9E9;
        border: 0;
        border-block: solid 2px black;
        border-left: solid 2px black;
        padding: 4px 0 4px 4px;
        height: 35.2px;
    }

    .removable-text-input {
        background-color: #E9E9E9;
        border: none;
        border-block: solid 2px black;
        border-left: solid 2px black;
        padding: 4px 0 4px 4px;
        width: 100%;
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
        font-family: "Overpass";
        position: relative;
        padding-left: 24px;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
        position: absolute;
        left: 4px;
        right: auto;
    }
</style>
