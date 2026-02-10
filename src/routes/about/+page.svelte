<script>
    import { _ } from 'svelte-i18n'
    import aboutImg from '$lib/assets/images/about.svg'
</script>

<div class="about-container">
    <div class="about-content">
        <h2 class="page-title"><span>{$_('about.title')}</span></h2>

        <div class="content-grid">
            <div class="text-content">
                <h3>{$_('about.subtitle1')}</h3>
                <p>
                    {$_('about.subpar1')}
                </p>
                <h3>{$_('about.subtitle2')}</h3>
                <p>
                    {$_('about.subpar2')}
                </p>
                <h3>{$_('about.subtitle3')}</h3>
                <p>
                    {$_('about.subpar3')}
                </p>
            </div>

            <div class="image-content">
                <img
                    src={aboutImg}
                    alt="about"
                    class="invert"
                />
                
            </div>
            <div id="team">
                    <h3>{$_('about.team.header')}</h3>
                    <p>
                        {@html $_('about.team.par')}
                    </p>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .image-content{ 
        display: flex;
        justify-content: center
    }

    img {
        width: 100%;
    }
    .about-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        height: calc(100vh - 52px - 0.5rem - 1rem);
        overflow-y: auto;
        padding: 2rem 1rem;
    }

    .about-content {
        max-width: 1100px;
        width: 100%;
    }

    .page-title {
        text-align: center;
        margin-bottom: 2rem;
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: start;
    }

    .text-content {
        text-align: left;

        h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.1em;
            font-weight: 700;
            color: var(--pg-text);
        }

        h3:first-child {
            margin-top: 0;
        }

        p {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }
    }

    .image-content {
        text-align: left;

        img {
            max-width: 100%;
            height: auto;
        }
    }

    #team {
        border: 1px dashed var(--pg-text);
        border-radius: 16px; 
        padding: 1.5em 2em;

        h3 {
            margin-top: 0;
            margin-bottom: 0.75rem;
        }

        p {
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
        }
    }

    @media only screen and (max-width: 800px) {
        .about-container {
            padding: 1rem 0.5rem;
        }

        .about-content {
            width: 96%;
        }

        .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
    }
</style>
