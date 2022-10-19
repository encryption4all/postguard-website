<script>
    import { page } from '$app/stores'
    import { _ } from 'svelte-i18n'
    import basketImg from '$lib/assets/images/basket.svg'

    export let cryptifySrc = ''
    export let uuid
    let containerHeight
</script>

<div class="grid-container" bind:clientHeight={containerHeight}>
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <img
        class="grid-item"
        src={basketImg}
        alt="basket"
        width="509"
        height="278"
    />
    <div class="overlay" />
    <iframe
        title="filesharing"
        class="grid-item"
        src={`${cryptifySrc}${uuid ? `?download=${uuid}` : ''}`}
        type="text/html"
        style="max-height: {uuid ? 700 : 600}px; height: {containerHeight -
            20}px;"
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
