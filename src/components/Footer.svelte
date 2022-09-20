<script>
    import { _ } from 'svelte-i18n'

    import { fly } from 'svelte/transition'

    export let selected

    const items = ['fs', 'home', 'addons', 'fallback', 'about', 'pol'].map(
        (s) => $_(`footer.${s}`)
    )
</script>

<div class="pg-footer">
    <div class={'swiper-button-prev'}>
        {#if items[selected - 1]}
            <a in:fly={{ x: -300 }} out:fly={{ x: -300 }} href={'#'}>
                <div on:click={() => selected--}>
                    <img
                        class="arrow"
                        src="images/leftarrow.svg"
                        alt={`Go back back by 1`}
                    />
                    <p>{items[selected - 1]}</p>
                    <img src="images/back_icon.svg" />
                </div>
            </a>
        {/if}
    </div>

    <div class="swiper-pagination" />

    <div class={'swiper-button-next'}>
        {#if items[selected + 1]}
            <a in:fly={{ x: 300 }} out:fly={{ x: 300 }} href={'#'}>
                <div on:click={() => selected++}>
                    <img src="images/forward_icon.svg" />
                    <p>{items[selected + 1]}</p>
                    <img
                        class="arrow"
                        src="images/rightarrow.svg"
                        alt={`Go forward by 1`}
                    />
                </div>
            </a>
        {/if}
    </div>
</div>

<style lang="scss">
    .pg-footer {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-column-gap: 5px;
        justify-items: center;
        margin: auto 1rem 1rem 1rem;

        a {
            text-decoration: none;
            p {
                position: relative;
                display: inline-block;
                z-index: 0;

                &:before {
                    content: '';
                    position: absolute;
                    z-index: -1;
                    left: 0;
                    right: 0;
                    bottom: 3px;
                    height: 0;
                    border: 2px solid rgba(var(--pg-accent-color-rgb), 50%);
                    border-radius: 10px;
                }
            }
        }
    }

    .swiper-pagination {
        position: relative;
        bottom: 0;
        margin: auto;
        grid-column-start: 2;
    }

    .swiper-button-prev {
        width: 100%;
        display: flex;
        grid-column-start: 1;

        div {
            display: flex;
            margin-right: 15px;
            align-items: center;

            img.arrow {
                display: block;
                width: 65px;
                height: 10px;
            }
        }
    }

    .swiper-button-next {
        width: 100%;
        grid-column-start: 3;
        display: flex;
        justify-content: right;

        div {
            display: flex;
            margin-left: 15px;
            align-items: center;

            img.arrow {
                display: block;
                width: 65px;
                height: 10px;
            }
        }
    }
</style>
