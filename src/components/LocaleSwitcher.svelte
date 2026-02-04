<script lang="ts">
    import { locale } from 'svelte-i18n'
    import { browser } from '$app/environment'
    import { onMount } from 'svelte'

    let selectedLocale: string = 'en-US'

    onMount(() => {
        selectedLocale = $locale ?? 'en-US'
    })

    function handleChange() {
        locale.set(selectedLocale)
        if (browser) localStorage.setItem('preferredLanguage', selectedLocale)
    }
</script>

<div
    class="language"
    role="radiogroup"
    aria-labelledby="language-switcher"
>
    <p class="hidden" id="language-switcher">
        Choose a language for this website
    </p>
    <div class="language-container-left language-container-nl">
        <input
            bind:group={selectedLocale}
            on:change={handleChange}
            value="nl-NL"
            class="language-control"
            type="radio"
            id="language1-1"
            name="language-switch1"
        />
        <label class="language-label" for="language1-1">
            NL<span class="hidden"> Nederlands</span>
        </label>
    </div>
    <div class="language-container-right language-container-en">
        <input
            bind:group={selectedLocale}
            on:change={handleChange}
            value="en-US"
            class="language-control"
            type="radio"
            id="language1-2"
            name="language-switch1"
        />
        <label class="language-label" for="language1-2">
            EN<span class="hidden"> English</span>
        </label>
    </div>
</div>

<style lang="scss">
  $language-width: 50px;
  $language-height: 20px;
  $language-focus: #85bffd;
  $language-border: #ccc;
  $language-hover: #eee;
  $language-checked: #ddd;
  $white: #ffffff;

  .hidden {
    display: none;
  }

  .language {
    display: flex;
    width: $language-width * 2 + 20px;
    height: auto;
    font-size: 16px;
    line-height: 1;
    margin: 1em 0;
    align-content: center;
    align-items: center;
  }

  .language-container-left,
  .language-container-right {
    position: relative;
    float: left;
    width: $language-width;
    height: 30px;
    padding: 0;
  }

  .language-label {
    position: absolute;
    top: 0;
    left: 0;
    width: $language-width;
    height: $language-height;
    border: 1px solid $language-border;
    padding: 6px 0 2px 0;
    background-color: $white;
    text-align: center;
    text-transform: uppercase;
  }

  .language-container-left .language-label {
    border-radius: 4px 0 0 4px;
    border-right: 1px solid $language-border;
  }

  .language-container-right .language-label {
    border-left: 1px solid $language-border;
    border-radius: 0 4px 4px 0;
  }

  .language-control:hover + .language-label,
  .language-control:focus + .language-label {
    background-color: $language-hover;
  }

  .language-control:checked + .language-label {
    text-decoration: underline 2px;
    text-decoration-color: #1f2937;
  }

  .language-control:focus + .language-label,
  .language-control:checked:focus + .language-label {
    z-index: 2;
    outline: 2px solid $language-focus;
    box-shadow: 0 0 8px $language-focus;
  }
</style>
