<script>
    import Header from '$lib/components/Header.svelte'
    import Footer from '$lib/components/Footer.svelte'
    import '$lib/i18n'
    import { isLoading } from 'svelte-i18n'
</script>

<svelte:head>
    <title>PostGuard</title>
    <html lang="en" />
</svelte:head>

{#if !$isLoading}
    <Header />
    <slot />
    <Footer />
{/if}
