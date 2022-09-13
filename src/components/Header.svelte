<script>
    import { _ } from 'svelte-i18n'
    export let selected = 1
    const items = ['fs', 'home', 'addons', 'fallback', 'about', 'pol'].map(
        (s) => $_(`header.${s}`)
    )
</script>

<div class="pg-topbar">
    <img src="logo.svg" alt="postguard logo" />
    <ul class="pg-menu">
        {#each items as item, i}
            <li class:selected={selected === i}>
                <a href="/" on:click|preventDefault={() => (selected = i)}
                    >{item}</a
                >
            </li>
        {/each}
    </ul>
</div>

<style lang="scss">
    .pg-topbar {
        width: auto;
        height: 96px;
        margin: 25px 25px auto 25px;

        display: flex;
        flex-direction: row;
        align-items: center;

        img {
            width: 96px;
            height: 96px;
        }
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
