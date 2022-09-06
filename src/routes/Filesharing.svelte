<script>
    import { page } from '$app/stores'
    import { _ } from 'svelte-i18n'

    export let cryptifySrc = ''
    const uuid = $page.url.searchParams.get('download')
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('filesharing.title')}</span></h2>
        <h3>{$_('filesharing.subtitle1')}</h3>
        <p>{$_('filesharing.subpar1')}</p>
        <h3>{$_('filesharing.subtitle2')}</h3>
        <p>{$_('filesharing.subpar2')}</p>
    </div>
    <img class="grid-item" src="images/basket.svg" alt="basket" />
    <div class="overlay" />
    <embed
        class="grid-item"
        src={`${cryptifySrc}${uuid ? `?download=${uuid}` : ''}`}
        type="text/html"
        width="400"
        height="700"
    />
</div>

<style lang="scss">
    .grid-container {
        grid-auto-flow: column;
        align-items: end;
        justify-content: center;

        @media only screen and (max-width: 600) {
            grid-template-columns: 1fr;
            grid-auto-flow: row;
        }
    }

    .grid-item {
        max-width: 400px;
        display: flex;
        justify-content: flex-end;
        text-align: left;
    }

    embed {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        overflow: hidden;
    }
</style>
