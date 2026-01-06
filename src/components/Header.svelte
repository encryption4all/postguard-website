<script lang="ts">
    import { _, locale, init } from 'svelte-i18n'
    import logo from '$lib/assets/images/logo.svg'
    import LocaleSwitcher from './LocaleSwitcher.svelte'
    import '$lib/global.scss'
    import Hamburger from '$lib/components/header/Hamburger.svelte'
    import { page } from '$app/state';

    let items = [
        { name: 'fs', route: '/' },
        { name: 'addons', route: '/addons' },
        { name: 'fallback', route: '/fallback' },
        { name: 'about', route: '/about' },
        { name: 'pol', route: '/privacy' },
    ]

    function isSelected(route: String) {
        return page.url.pathname === route;
    }
</script>

<div class="pg-topbar">
    <a href="/"><img src={logo} alt="postguard logo" width="84" height="46" /></a>
    <div class="pg-desktop-menu">
        <ul>
            {#each items as item, i}
                <li class:selected={isSelected(item.route)}>
                    <a href={item.route}>
                        {$_(`header.${item.name}`)}
                    </a>
                </li>
            {/each}
        </ul>
        <LocaleSwitcher
            lang={$locale}
        />
    </div>
    <Hamburger
        {items}
    />
</div>

<style lang="scss">
  .pg-topbar {
    width: auto;
    margin: 0.5rem 1rem 1rem 1rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .pg-desktop-menu {
    display: none;
    margin-left: auto;
    flex-direction: row;
    gap: 1rem;
  }

  @media only screen and (min-width: 768px) {
    .pg-desktop-menu {
      display: flex;
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
