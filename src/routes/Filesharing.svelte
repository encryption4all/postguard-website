<script>
    import { _ } from 'svelte-i18n'
    export let cryptifySrc = ''
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
    <embed
        class="grid-item"
        src={cryptifySrc}
        type="text/html"
        width="400"
        height="600"
    />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 10%;
        margin: auto 5% auto 5%;
        align-items: end;
        justify-content: center;

        @media only screen and (max-width: 600) {
            grid-template-columns: 1fr;
            grid-auto-flow: row;
        }
    }

    .grid-item {
        max-width: 333px;
        display: flex;
        justify-content: flex-end;
        text-align: left;
    }

    embed {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
    }
</style>
