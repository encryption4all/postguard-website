<script>
    import { _ } from 'svelte-i18n'
    import basketImg from '$lib/assets/images/basket.svg'
    import basketImgLq from '$lib/assets/images/lqip/basket.svg'
    import { cryptifyIframe } from './../../stores.js'

    let el

    $: el && cryptifyIframe.set(el)
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <img
        src={basketImgLq}
        data-src={basketImg}
        class="grid-item lazyload"
        alt="basket"
        width="509"
        height="278"
    />
    <div class="overlay" />
    <iframe
        bind:this={el}
        title="filesharing"
        class="grid-item"
        src=""
        type="text/html"
        style="height: 100%; max-height: 750px;"
    />
</div>

<style lang="scss">
    .grid-container {
        grid-auto-flow: column;
        max-width: 1000px;
        max-height: 650px;
        grid-gap: 2rem;
    }

    img.grid-item {
        align-self: end;
        object-fit: contain;
        max-width: 350px;
    }

    iframe {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        overflow: scroll;
        width: 375px;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .grid-item {
        display: flex;
        justify-content: center;
        text-align: left;

        &.header {
            justify-content: end;
            padding-bottom: 5rem;
        }
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            display: grid;
            grid-auto-flow: unset;
            max-height: unset;
        }

        .grid-item {
            &.header {
                justify-content: start;
                padding-bottom: 0;
            }
        }
    }
</style>
