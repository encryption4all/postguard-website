<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('home.title')}</span></h2>
        <p>{$_('home.par')}</p>
    </div>
    <div class="grid-item">
        <img src="images/signpost.svg" alt="signpost" usemap="#signpost" />
        <map name="signpost">
            <area
                shape="rect"
                coords="259, 237, 67, 116"
                alt="filesharing"
                href="#filesharing"
            />
            <area
                shape="rect"
                coords="287, 139, 505, 4"
                alt="emailing"
                href="#addons"
            />
        </map>
    </div>
    <div class="grid-item" />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-auto-flow: column;
        height: auto;
        justify-content: center;
        align-content: center;
        margin: auto 25px auto 25px;

        .grid-item.header {
            display: flex;
            flex-direction: column;
            position: relative;
            height: 100%;
            width: 400px;
            text-align: left;
        }
    }
    .grid-container > * {
        overflow: hidden;
    }

    h2 {
        position: relative;
        inline-size: 260px;
        overflow-wrap: break-word;
        margin-bottom: 0;
    }

    p {
        margin-top: 0;
    }

    h2 span {
        background-color: white;
        padding-right: 5px;
    }

    h2:after {
        content: '';
        position: absolute;
        bottom: 12px;
        left: 0;
        right: 0;
        height: 4px;
        background-color: #5fd9ad;
        border-radius: 3.5px;
        z-index: -1;
    }
</style>
