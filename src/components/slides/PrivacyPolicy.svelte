<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('privacypolicy.title')}</span></h2>
    </div>
    <div class="grid-item">
        <p>{@html $_('privacypolicy.full')}</p>
    </div>
</div>

<style lang="scss">
    div.grid-item {
        height: 100%;

        &:not(.header) {
            overflow-y: auto;
        }

        p {
            height: 100%;
            text-align: left;
        }
    }
</style>
