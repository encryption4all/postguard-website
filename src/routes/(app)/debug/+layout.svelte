<script lang="ts">
    import { dev } from '$app/environment'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'

    let { children } = $props()

    if (!dev) {
        goto(resolve('/'))
    }
</script>

{#if dev}
    {@render children()}
{/if}
