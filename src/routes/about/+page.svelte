<script>
    import { _ } from 'svelte-i18n'
    import aboutImg from '$lib/assets/images/about.svg'
</script>

<div class="page-wrapper">
    <div class="grid-container">
        <div class="grid-item header">
            <h2><span>{$_('about.title')}</span></h2>
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
        </div>
        <div class="grid-item content-box">
            <img
                src={aboutImg}
                alt="about"
                class="invert"
            />
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
    .page-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .grid-item {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 550px));
        height: auto;
        align-items: start;
        overflow-y: auto;
    }

    img {
        width: 90%;
        margin-bottom: 1rem;
    }

    .text-content {
        h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
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

    .content-box {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    #team {
        border: 1px dashed black;
        border-radius: 8px;
        padding: 20px;

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
        .grid-container {
            grid-template-columns: 1fr;
        }
    }
</style>
