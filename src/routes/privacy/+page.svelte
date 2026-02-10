<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="privacy-container">
    <div class="privacy-content">
        <h2><span>{$_('privacypolicy.title')}</span></h2>
        <div class="privacy-text">
            <p>{@html $_('privacypolicy.full')}</p>
        </div>
    </div>
</div>

<style lang="scss">
    .privacy-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        height: calc(100vh - 52px - 0.5rem - 1rem);
        overflow-y: auto;
        padding: 2rem 1rem;
    }

    .privacy-content {
        max-width: 900px;
        width: 100%;
        text-align: center;
    }

    h2 {
        margin-bottom: 2rem;
        text-align: center;
    }

    .privacy-text {
        text-align: left;

        p {
            line-height: 1.6;
            font-size: 15px;
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
