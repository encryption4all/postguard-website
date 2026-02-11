<script>
    import { _ } from 'svelte-i18n'
    import Tabs from '$lib/components/Tabs.svelte'
    // import { fade } from 'svelte/transition'
    import { Tween } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'

    import tbLogo from '$lib/assets/images/tb_logo.svg'
    import olLogo from '$lib/assets/images/ol_logo.svg'
    import composeImg from '$lib/assets/images/compose.svg'

    let tabItems = [
        { item: 'Thunderbird', logo: tbLogo },
        { item: 'Outlook', logo: olLogo },
    ]

    let activeItem = $state('Thunderbird')
    let containerWidth = $state()

    const tween = new Tween(0, { delay: 150, duration: 500, easing: cubicOut })

    let height = $derived((containerWidth > 800 ? 400 : 500) +
        tween.current * (containerWidth > 800 ? 150 : 200))

    const triggerTabChange = (event) => {
        activeItem = event.detail
        tween.set(activeItem === 'Thunderbird' ? 0 : 1)
    }

    let sign = $derived(activeItem === 'Thunderbird' ? -1 : 1)
    
</script>

<div class="page-wrapper">
    <div class="grid-container" bind:clientWidth={containerWidth}>
        <div class="grid-item header">
            <h2><span>{$_('addons.title')}</span></h2>
            <p>{$_('addons.par')}</p>
            <img
                src={composeImg}
                class="image invert"
                alt="compose"
            />
        </div>
        <div class="grid-item instruction" style="min-height: {height}px">
            <h2>{$_('addons.instruction.header')}</h2>
            <p>{$_('addons.instruction.download')}</p>
            <Tabs {tabItems} {activeItem} on:tabChange={triggerTabChange} />
            {#if activeItem}
                {#key activeItem}
                    <div
                        id="client-instruction"
                    >
                        {@html $_(`addons.${activeItem}`)}
                    </div>
                {/key}
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .page-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    img {
        width: 90%;
        margin-top: auto;
    }

    .grid-item {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 550px));
        height: auto;
        align-items: start;
        overflow-y: auto;
        // margin-right: 0;
        // padding-right: 5%;
        // padding-bottom: 2rem;
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            grid-template-columns: 1fr;
        }
    }
    
    .instruction {
        height: 100%;
        border: 1px dashed black;
        border-radius: 8px;
        padding: 20px;

        h2 {
            margin-top: 0;
        }
    }
</style>
