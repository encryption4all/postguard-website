<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('about.title')}</span></h2>
        <h3>{$_('about.subtitle1')}</h3>
        <p>
            {$_('about.subpar1')}
        </p>
        <h3>{$_('about.subtitle1')}</h3>
        <p>
            {$_('about.subpar2')}
        </p>
    </div>
    <div class="grid-item">
        <img src="images/about.svg" alt="about" />
        <div id="team">
            <h3>{$_('about.about_team')}</h3>
            <p>
                {$_('lorum')}
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: auto 5% auto 5%;
        grid-gap: 10%;
    }

    .grid-item {
        max-width: 500px;
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    #team {
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        margin-top: 80px;
        padding: 40px;
    }
</style>
