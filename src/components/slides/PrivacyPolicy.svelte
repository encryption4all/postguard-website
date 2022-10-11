<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <p>{@html $_('privacypolicy')}</p>
</div>

<style>
    .grid-container {
        text-align: left;
        overflow-y: auto;
    }
</style>
