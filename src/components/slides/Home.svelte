<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('home.title')}</span></h2>
        <p>{$_('home.par')}</p>
    </div>
    <div class="grid-item">
        <img src="/images/signpost.svg" alt="signpost" usemap="#signpost" />
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
        grid-template-columns: 1fr auto 1fr;
        grid-auto-flow: column;
        max-height: 500px;
    }

    img {
        object-fit: contain;
        max-width: 550px;
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            grid-auto-flow: row;
            grid-template-columns: unset;
            border-bottom: unset;
            max-height: unset;
        }
        img {
            max-width: 100%;
        }
    }
</style>
