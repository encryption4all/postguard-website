<script lang="ts">
    import { browser } from '$app/environment'
    import sun from '$lib/assets/images/google-icons/sun.svg'
    import moon from '$lib/assets/images/google-icons/moon.svg'

    let theme: 'light' | 'dark' = 'light'

    if (browser) {
        const stored = localStorage.getItem('preferredtheme')
        if (stored === 'dark') {
            theme = 'dark'
            document.documentElement.classList.add('dark')
        }
    }

    function setTheme(newTheme: 'light' | 'dark') {
        theme = newTheme

        if (!browser) return

        document.documentElement.classList.toggle('dark', newTheme === 'dark')
        localStorage.setItem('preferredtheme', newTheme)
    }

    $: isLight = theme === 'light'
    $: isDark = theme === 'dark'
</script>

<div
    class="theme"
    role="radiogroup"
    aria-labelledby="theme-switcher"
>
    <p class="hidden" id="theme-switcher">
        Choose a theme for this website
    </p>

    <div class="theme-container-left" class:selected={isLight}>
        <input
            type="radio"
            class="theme-control"
            id="theme-light"
            name="theme"
            checked={isLight}
            onchange={() => setTheme('light')}
        />
        <label class="theme-label" for="theme-light">
            <img src={sun} width="16" height="16" alt="" class="invert" />
            <span class="hidden">Light mode</span>
        </label>
    </div>

    <div class="theme-container-right" class:selected={isDark}>
        <input
            type="radio"
            class="theme-control"
            id="theme-dark"
            name="theme"
            checked={isDark}
            onchange={() => setTheme('dark')}
        />
        <label class="theme-label" for="theme-dark">
            <img src={moon} width="16" height="16" alt="" class="invert" />
            <span class="hidden">Dark mode</span>
        </label>
    </div>
</div>


<style lang="scss">
  $theme-width: 100%;
  $theme-height: 100%;
  $theme-focus: var(--pg-primary);
  $theme-border: var(--pg-input-normal);
  $theme-hover: var(--pg-soft-background);
  $theme-checked: var(--pg-strong-background);
  $white: var(--pg-general-background);

 // hide radio buttons language and theme switcher
  input.theme-control { 
      /*
      Source - https://stackoverflow.com/a/22462740
      Posted by Joe H, modified by community. See post 'Timeline' for change history
      Retrieved 2026-02-10, License - CC BY-SA 4.0
      */

      position: fixed;
      opacity: 0;
      pointer-events: none;
  }

  .hidden {
    display: none;
  }

  .theme {
    display: flex;
    width: 6rem;
    height: auto;
    font-size: 16px;
    line-height: 1;
    margin: 1em 0;
    align-content: center;
    align-items: center;
  }

  .theme-container-left,
  .theme-container-right {
    position: relative;
    float: left;
    width: $theme-width;
    height: 30px;
    padding: 0;
  }

  .theme-label {
    position: absolute;
    top: 0;
    left: 0;
    width: $theme-width;
    height: $theme-height;
    border: 1px solid $theme-border;
    padding: 6px 0 2px 0;
    background-color: transparant;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;
  }

  .theme-container-left .theme-label {
    border-radius: 4px 0 0 4px;
    border-right: 1px solid $theme-border;
  }

  .theme-container-right .theme-label {
    border-left: 1px solid $theme-border;
    border-radius: 0 4px 4px 0;
  }

  .theme-label:hover {
    background-color: $theme-hover;
  }

  .selected .theme-label {
    text-decoration: 2px underline;
    text-decoration-color: --pg-text;
    text-underline-offset: 4px;
  }

  .theme-control:focus-visible + .theme-label {
    outline: 2px solid $theme-focus;
    outline-offset: 2px;
  }
</style>
