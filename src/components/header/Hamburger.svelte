<script lang="ts">
    import menuIcon from '$lib/assets/images/google-icons/menu.svg'
    import closeIcon from '$lib/assets/images/google-icons/close.svg'
    import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte'
    import logo from '$lib/assets/images/logo.svg'
    import { _, locale } from 'svelte-i18n'
    import { page } from '$app/state'

    interface props {
        items: { name: string; route: string; }[];
    }

    let hamburgerOpen = $state(false)

    let { items }: props = $props()

    function isSelected(route: String) {
        return page.url.pathname === route;
    }
</script>

<button
    class="desktop-hide"
    onclick={() => {
        hamburgerOpen = !hamburgerOpen
    }}
>
    <span class="sr-only">Open menu</span>
    <img
        src={menuIcon}
        alt="open menu"
        width="32"
        height="32"
        class="hamburger-icon"
    />
</button>

<div class:open={hamburgerOpen} class="hamburger-menu">
    <div class="topbar">
        <img src={logo} alt="postguard logo" width="84" height="46" />
        <button onclick={() => {
        hamburgerOpen = !hamburgerOpen
    }}
        >
            <span class="sr-only">Close menu</span>
            <img
                src={closeIcon}
                alt="close menu"
                width="32"
                height="32"
                class="hamburger-icon"
            />
        </button>
    </div>
    <ul>
        {#each items as item, i}
            <li class:selected={isSelected(item.route)}>
                <a href={item.route}>
                    {$_(`header.${item.name}`)}</a>
            </li>
        {/each}
    </ul>
    <div class="align-lang">
        <LocaleSwitcher
            lang={$locale}
        />
    </div>
</div>

<style>
    @import "$lib/shared-styles.css";

    @media only screen and (min-width: 600px) {
        .hamburger-icon {
            display: none;
        }
    }

    .hamburger-icon {
        cursor: pointer;
    }

    .hamburger-menu {
        display: none;
        position: absolute;
        flex-direction: column;
        top: 0;
        right: 0;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }

    .hamburger-menu.open {
        display: flex;
    }

    .hamburger-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
        height: 100%;
    }

    .hamburger-menu li {
        border-bottom: 1px solid #eee;
    }

    .hamburger-menu li:last-child {
        border-bottom: none;
    }

    .hamburger-menu li a {
        display: block;
        padding: 10px 15px;
        color: #333;
        text-decoration: none;
    }

    .hamburger-menu li a:hover,
    .hamburger-menu li.selected a {
        background-color: #f0f0f0;
    }

    .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0.5rem 1rem 1rem 1rem;
    }

    .align-lang {
        display: flex;
        justify-content: flex-end;
        margin: 1rem;
    }
</style>