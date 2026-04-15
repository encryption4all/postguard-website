<script lang="ts">
    let { children } = $props()
</script>

{@render children()}

<style>
    :global(html),
    :global(body),
    :global(#app) {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
