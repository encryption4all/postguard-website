<svelte:options runes />

<script lang="ts">
    import { _, locale } from 'svelte-i18n'

    function changeLanguage(lang: string) {
        locale.set(lang)
        localStorage.setItem('preferredLanguage', lang)
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
            bind:group={$locale}
            onclick={()=>changeLanguage('nl-NL')}
            value={'nl-NL'}
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
            bind:group={$locale}
            onclick={()=>changeLanguage('en-US')}
            value={'en-US'}
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
    height: $language-height;
    font-size: 14px;
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
    height: $language-height;
    padding: 5px;
  }

  .language-label {
    position: absolute;
    top: 0;
    left: 0;
    width: $language-width;
    height: $language-height;
    border: 1px solid $language-border;
    padding: 9px 8px 2px 0;
    background-color: $white;
    background-repeat: no-repeat;
    background-position: 7px 7px;
    background-size: 14px;
    text-align: right;
    text-transform: uppercase;
  }

  .language-container-left .language-label {
    border-radius: 4px 0 0 4px;
  }

  .language-container-right .language-label {
    border-left: 0;
    border-radius: 0 4px 4px 0;
  }

  .language-control:hover + .language-label,
  .language-control:focus + .language-label {
    background-color: $language-hover;
  }

  .language-control:checked + .language-label .selected {
    text-decoration: underline 2px;
    text-decoration-color: var(--pg-accent-color);
  }

  .language-control:focus + .language-label,
  .language-control:checked:focus + .language-label {
    z-index: 2;
    outline: 2px solid $language-focus;
    box-shadow: 0 0 8px $language-focus;
  }

  .language-container-nl .language-label {
    background-image: url('../assets/images/nl.svg');
  }

  .language-container-en .language-label {
    background-image: url('../assets/images/gb.svg');
  }
</style>
