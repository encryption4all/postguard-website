<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('addons.title')}</span></h2>
        <h3>{$_('addons.subtitle')}</h3>
        <p>{$_('addons.par')}</p>
    </div>
    <img class="grid-item" src="images/compose.svg" alt="compose" />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: auto 5% auto 5%;
        grid-gap: 20%;
    }
</style>
