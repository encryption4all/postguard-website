<script>
    import { _ } from 'svelte-i18n'
    import Tabs from '../../components/Tabs.svelte'
    import { fade } from 'svelte/transition'
    import { tweened } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'

    import tbLogo from '$lib/assets/images/tb_logo.svg'
    import olLogo from '$lib/assets/images/ol_logo.svg'
    import composeImg from '$lib/assets/images/compose.svg'
    import composeImgLq from '$lib/assets/images/lqip/compose.svg'

    let tabItems = [
        { item: 'Thunderbird', logo: tbLogo },
        { item: 'Outlook', logo: olLogo },
    ]

    let activeItem = $state('Thunderbird')
    let containerWidth = $state()

    const tween = tweened(0, { delay: 150, duration: 500, easing: cubicOut })

    let height = $derived((containerWidth > 800 ? 400 : 500) +
        $tween * (containerWidth > 800 ? 150 : 200))

    const triggerTabChange = (event) => {
        activeItem = event.detail
        tween.set(activeItem === 'Thunderbird' ? 0 : 1)
    }

    let sign = $derived(activeItem === 'Thunderbird' ? -1 : 1)
    
</script>

<div class="grid-container" bind:clientWidth={containerWidth}>
    <div class="grid-item header">
        <h2><span>{$_('addons.title')}</span></h2>
        <p>{$_('addons.par')}</p>
        <img
            class="lazyload"
            src={composeImgLq}
            data-src={composeImg}
            width={450}
            height={204}
            alt="compose"
        />
    </div>
    <div class="grid-item instruction" style="height: {height}px">
        <h2>{$_('addons.instruction.header')}</h2>
        <p>{$_('addons.instruction.download')}</p>
        <Tabs {tabItems} {activeItem} on:tabChange={triggerTabChange} />
        {#if activeItem}
            {#key activeItem}
                <div
                    id="client-instruction"
                    in:fade|global={{ delay: 250, duration: 250 }}
                    out:fade|global={{ duration: 250 }}
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
            max-width: 100%;
            height: 500px;
            align-self: center;

            h2 {
                inline-size: 300px;
                margin-bottom: 0;
            }

            img {
                position: absolute;
                bottom: 0;
                width: 100%;
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
            margin-top: 0;
            max-height: unset;
            grid-auto-flow: row;
            grid-template-columns: unset;
            justify-items: center;
        }
        .grid-item {
            object-fit: contain;
            height: 100%;
            &.header {
                height: 350px;
                align-self: center;
            }

            &.instruction {
                width: 90%;
                border: none;
            }
        }
    }
</style>
