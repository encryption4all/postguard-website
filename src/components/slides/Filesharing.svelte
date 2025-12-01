<script>
    import { run } from 'svelte/legacy';

    import { _ } from 'svelte-i18n'
    import basketImg from '$lib/assets/images/basket.svg'
    import basketImgLq from '$lib/assets/images/lqip/basket.svg'
    import { cryptifyIframe } from './../../stores.js'

    let el = $state()

    run(() => {
        el && cryptifyIframe.set(el)
    });
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <iframe
        bind:this={el}
        title="filesharing"
        class="grid-item"
        src=""
        type="text/html"
        scrolling="no"
></iframe>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-auto-columns: 1fr 1fr 1fr;
        grid-auto-flow: column;
        max-width: 1200px;
        max-height: 800px;
        grid-gap: 2rem;
    }

    img.grid-item {
        align-self: end;
        object-fit: contain;
    }

    iframe {
        grid-column: span 2;
        border: none;
        overflow: hidden;
        height: 100%;
        min-height: 333px;
        max-height: 1000px;
        width: 100%;
        min-width: 333px;
    }

    .grid-item {
        width: 100%;
        display: flex;
        justify-content: center;
        text-align: left;

        &.header {
            min-width: 225px;
            justify-content: start;
            padding-top: 5em;
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
