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
    <iframe
        bind:this={el}
        title="filesharing"
        class="grid-item"
        src=""
        type="text/html"
    />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-auto-columns: 1fr;
        grid-auto-flow: column;
        max-width: 1200px;
        max-height: 650px;
        grid-gap: 2rem;
    }

    img.grid-item {
        align-self: end;
        object-fit: contain;
    }

    iframe {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        overflow: scroll;
        overflow-y: scroll;
        overflow-x: hidden;
        height: 100%;
        min-height: 333px;
        max-height: 1000px;
        width: 100%;
        min-width: 333px;
        max-width: 600px;
    }

    .grid-item {
        width: 100%;
        display: flex;
        justify-content: center;
        text-align: left;

        &.header {
            min-width: 225px;
            justify-content: end;
            padding-bottom: 5rem;
        }
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            display: grid;
            grid-auto-flow: unset;
            max-height: unset;
            margin: 0 5%;
        }

        .grid-item {
            width: 90%;
            &.header {
                justify-content: start;
                padding-bottom: 0;
            }
        }
    }
</style>
