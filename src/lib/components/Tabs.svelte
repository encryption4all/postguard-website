<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    /** @type {{tabItems: any, activeItem: any}} */
    let { tabItems, activeItem } = $props();
</script>

<div class="tabs">
    <ul>
        {#each tabItems as { item, logo }}
            <li class:active={item === activeItem}>
                <button
                    onclick={() => dispatch('tabChange', item)}
                    type="button"
                >
                    <img src={logo} alt="" width={16} height={16} />
                    <b>{item}</b>
                </button>
            </li>
        {/each}
    </ul>
</div>

<style lang="scss">
    ul {
        display: flex;
        justify-content: start;
        padding-left: 0;
        margin: 5px auto 5px auto;
    }

    li {
        white-space: nowrap;
        font-size: 14px;
        position: relative;
        display: inline-block;
        z-index: 0;
        display: flex;
        gap: 5px;

        button {
            all: unset;
            cursor: pointer;
            display: flex;
            gap: 5px;
            align-items: center;
        }

        &.active {
            &:before {
                content: '';
                position: absolute;
                z-index: -1;
                bottom: -3px;
                height: 0;
                border: 2px solid rgba(var(--pg-primary-rgb), 50%);
                border-radius: 10px;
            }
        }

        &:not(:first-child) {
            padding-left: 20px;
            &.active {
                &:before {
                    left: 21px;
                    right: 0;
                }
            }
        }

        &:not(:last-child) {
            border-right: 2px solid var(--pg-text);
            padding-right: 20px;
            &.active {
                &:before {
                    right: 19px;
                    left: 0;
                }
            }
        }
    }
</style>
