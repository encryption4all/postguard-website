<script>
    import { _ } from 'svelte-i18n'
    import Tabs from './../Tabs.svelte'
    import { fade } from 'svelte/transition'
    import { tweened } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'

    let tabItems = [
        { item: 'Thunderbird', logo: '/images/tb_logo.svg' },
        { item: 'Outlook', logo: '/images/ol_logo.svg' },
    ]

    let activeItem = 'Thunderbird'
    $: sign = activeItem === 'Thunderbird' ? -1 : 1

    const tween = tweened(0, { duration: 500, easing: cubicOut })

    let height
    $: height =
        (containerWidth > 800 ? 400 : 500) +
        $tween * (containerWidth > 800 ? 125 : 175)

    const triggerTabChange = (event) => {
        activeItem = event.detail
        tween.set(activeItem === 'Thunderbird' ? 0 : 1)
    }

    let containerWidth
</script>

<div class="grid-container" bind:clientWidth={containerWidth}>
    <div class="grid-item header">
        <h2><span>{$_('addons.title')}</span></h2>
        <p>{$_('addons.par')}</p>
    </div>
    <div class="grid-item instruction" style="height: {height}px">
        <h2>{$_('addons.instruction.header')}</h2>
        <p>{$_('addons.instruction.download')}</p>
        <Tabs {tabItems} {activeItem} on:tabChange={triggerTabChange} />
        {#if activeItem}
            {#key activeItem}
                <div
                    class="swiper-no-swiping"
                    id="client-instruction"
                    in:fade={{ delay: 250, duration: 250 }}
                    out:fade={{ duration: 250 }}
                >
                    {@html $_(`addons.${activeItem}`)}
                </div>
            {/key}
        {/if}
    </div>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10%;
        max-width: 1000px;
        max-height: 600px;
    }

    .grid-item {
        &.header {
            background: url('/images/compose.svg') no-repeat left 0 bottom 0 /
                contain;
            max-width: 100%;
            height: 500px;
            align-self: center;

            h2 {
                inline-size: 300px;
                margin-bottom: 0;
            }
        }

        &.instruction {
            text-align: left;
            border: 1px dashed black;
            border-radius: 15px;
            padding: 25px;
            width: 450px;

            h2 {
                margin-bottom: 5px;
                margin-top: 5px;
            }

            :global(p),
            :global(li) {
                font-size: 14px;
            }

            :global(ol) {
                list-style-position: outside;
                padding-left: 10px;
            }

            :global(p) {
                margin-top: 0;
                margin-bottom: 0;
            }
        }
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            grid-auto-flow: row;
            grid-template-columns: unset;
            justify-items: center;
        }
        .grid-item {
            object-fit: contain;
            width: 85%;
            height: 100%;
            &.header {
                background: url('/images/compose.svg') no-repeat left 0 bottom 0 /
                    contain;
                height: 350px;
                align-self: center;
            }

            &.instruction {
                width: 85%;
            }
        }
    }
</style>
