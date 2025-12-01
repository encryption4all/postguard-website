<script>
    import { preventDefault } from 'svelte/legacy';

    import { _, locale, init } from 'svelte-i18n'
    import logo from '$lib/assets/images/logo.svg'
    import LocaleSwitcher from './LocaleSwitcher.svelte'
    import { selected } from '$lib/stores'

    let items = $derived(['fs', 'home', 'addons', 'fallback', 'about', 'pol'].map((s) =>
        $_(`header.${s}`)
    ))
</script>

<div class="pg-topbar">
    <img src={logo} alt="postguard logo" width="84" height="46" />
    <ul class="pg-menu">
        {#each items as item, i}
            <li class:selected={$selected === i}>
                <a href="/" onclick={preventDefault(() => selected.set(i))}
                    >{item}</a
                >
            </li>
        {/each}
    </ul>
    <LocaleSwitcher
        style="margin-left: 1rem"
        lang={$locale}
        on:locale-changed={(e) => locale.set(e.detail)}
    />
</div>

<style lang="scss">
    .pg-topbar {
        width: auto;
        margin: 1rem 1rem auto 1rem;

        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .pg-menu {
        margin-left: auto;
    }

    ul.pg-menu li {
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
