<script lang="ts">
    import Header from '$lib/components/Header.svelte'
    import '$lib/i18n'
    import { isLoading } from 'svelte-i18n'

    let { children } = $props()
</script>

<svelte:head>
    <title>PostGuard</title>
    <meta
        name="description"
        content="PostGuard is an easy-to-use encryption protocol for email and files."
    />
    <meta
        name="keywords"
        content="Encryption, Usability, Privacy, Security, Identity-Based Encryption"
    />
</svelte:head>

{#if !$isLoading}
    <Header />
    {@render children()}
{/if}
