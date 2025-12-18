<script>
    import { preventDefault } from 'svelte/legacy'

    import { _, locale, init } from 'svelte-i18n'
    import logo from '$lib/assets/images/logo.svg'
    import LocaleSwitcher from './LocaleSwitcher.svelte'
    import Hamburger from '$lib/components/header/Hamburger.svelte'
    import { selected } from '$lib/stores'

    let items = $derived(['fs', 'addons', 'fallback', 'about', 'pol'].map((s) =>
        $_(`header.${s}`),
    ))
</script>

<div class="pg-topbar">
    <img src={logo} alt="postguard logo" width="84" height="46" />
    <div class="pg-desktop-menu">
        <ul>
            {#each items as item, i}
                <li class:selected={$selected === i}>
                    <a href="/" onclick={preventDefault(() => selected.set(i))}
                    >{item}</a
                    >
                </li>
            {/each}
        </ul>
        <LocaleSwitcher
            lang={$locale}
            on:locale-changed={(e) => locale.set(e.detail)}
        />
    </div>
    <Hamburger
        {items}
    />
</div>

<style lang="scss">
  .pg-topbar {
    width: auto;
    margin: 0.5rem 1rem auto 1rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .pg-desktop-menu {
    margin-left: auto;
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  @media only screen and (max-width: 600px) {
    .pg-desktop-menu {
      display: none;
    }
  }

  .pg-desktop-menu ul li {
    display: inline-block;
    position: relative;
    list-style-type: none;
    margin-left: 15px;
    padding-right: 15px;

    &:not(:last-child) {
      border-right: 1px solid black;
    }

    &.selected {
      text-decoration: 2px underline;
      text-underline-offset: 4px;
    }

    &:not(.selected) a {
      text-decoration: none;

      &:after {
        content: '';
        position: absolute;
        width: calc(100% - 15px);
        transform: scaleX(0);
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: var(--pg-accent-color);
        transform-origin: bottom right;
        transition: transform 0.25s ease-out;
      }

      &:hover:after {
        transform: scaleX(1);
        transform-origin: bottom left;
      }
    }
  }
</style>
