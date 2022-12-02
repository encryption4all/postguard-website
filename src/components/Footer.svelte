<script>
    import { _ } from 'svelte-i18n'
    import { fly } from 'svelte/transition'

    import leftArrow from '$lib/assets/images/leftarrow.svg'
    import rightArrow from '$lib/assets/images/rightarrow.svg'
    import backIcon from '$lib/assets/images/back_icon.svg'
    import nextIcon from '$lib/assets/images/forward_icon.svg'

    export let selected

    $: items = ['fs', 'home', 'addons', 'fallback', 'about', 'pol'].map((s) =>
        $_(`footer.${s}`)
    )
</script>

<div class="pg-footer">
    <div class={'swiper-button-prev'}>
        {#if items[selected - 1]}
            <a in:fly={{ x: -300 }} out:fly={{ x: -300 }} href={'#'}>
                <div on:click={() => selected--}>
                    <img
                        class="arrow"
                        src={leftArrow}
                        alt={`Go back back by 1`}
                    />
                    <p>{items[selected - 1]}</p>
                    <img
                        src={backIcon}
                        alt="go back icon"
                        width="29"
                        height="29"
                    />
                </div>
            </a>
        {/if}
    </div>

    <div class="swiper-pagination" />

    <div class={'swiper-button-next'}>
        {#if items[selected + 1]}
            <a in:fly={{ x: 300 }} out:fly={{ x: 300 }} href={'#'}>
                <div on:click={() => selected++}>
                    <img
                        src={nextIcon}
                        alt="go forward icon"
                        width="29"
                        height="29"
                    />
                    <p>{items[selected + 1]}</p>
                    <img
                        class="arrow"
                        src={rightArrow}
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
        width: 100%;
        grid-column-start: 2;
        align-self: center;
    }

    .swiper-button-prev,
    .swiper-button-next {
        display: flex;
        min-width: 100px;
        min-height: 50px;
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

            p {
                white-space: nowrap;
            }

            @media only screen and (max-width: 800px) {
                img:not(.arrow),
                p {
                    display: none;
                }

                img.arrow {
                    margin-top: 1.5rem;
                }
            }
        }
    }

    .swiper-button-next {
        grid-column-start: 3;
        justify-content: right;

        div {
            margin-right: unset;
            margin-left: 15px;
            align-items: center;
        }
    }
</style>
