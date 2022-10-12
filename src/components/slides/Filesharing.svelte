<script>
    import { page } from '$app/stores'
    import { _ } from 'svelte-i18n'

    export let cryptifySrc = ''
    export let uuid
    let containerHeight
</script>

<div class="grid-container" bind:clientHeight={containerHeight}>
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <p>{@html $_('filesharing.subpar1')}</p>
    </div>
    <img class="grid-item" src="/images/basket.svg" alt="basket" />
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
        max-width: 930px;
        max-height: 650px;
        grid-gap: 3%;
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
        width: 400px;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .grid-item {
        max-width: 333px;
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
