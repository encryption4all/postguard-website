<script lang="ts">
    import { dev } from '$app/environment'
    import { goto } from '$app/navigation'

    let { children } = $props()

    if (!dev) {
        goto('/')
    }
</script>

{#if dev}
    {@render children()}
{/if}
