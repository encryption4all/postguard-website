<script>
    import { _ } from 'svelte-i18n'
    import SEO from '$lib/components/SEO.svelte'
</script>

<SEO
    title="Privacy Policy"
    description="PostGuard's privacy policy. Learn how we handle your data when you use our end-to-end encryption services for email and file sharing."
/>

<div class="privacy-container">
    <div class="privacy-content">
        <h2><span>{$_('privacypolicy.title')}</span></h2>
        <p class="last-updated">Last updated: April 21, 2026</p>
        <div class="privacy-text">
            {@html $_('privacypolicy.full')}
        </div>
    </div>
</div>

<style lang="scss">
    .privacy-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        padding: 2rem 1rem;
    }

    .privacy-content {
        max-width: 900px;
        width: 100%;
    }

    h2 {
        margin-bottom: 0.5rem;
    }

    .last-updated {
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        margin-bottom: 2rem;
    }

    .privacy-text {
        text-align: left;

        p {
            line-height: 1.6;
            font-size: var(--pg-font-size-base);
        }
    }

    @media only screen and (max-width: 800px) {
        .privacy-container {
            padding: 1rem 0.5rem;
        }

        .privacy-content {
            width: 96%;
        }
    }
</style>
