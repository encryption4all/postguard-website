<script>
    import { _ } from 'svelte-i18n'
</script>

<div class="grid-container">
    <div class="grid-item header">
        <h2><span>{$_('about.title')}</span></h2>
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
    <div class="grid-item">
        <img src="/images/about.svg" alt="about" />
        <div id="team">
            <h3>{$_('about.team.header')}</h3>
            <p>
                {@html $_('about.team.par')}
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .grid-container {
        grid-template-columns: 1fr 1fr;
        width: 100%;
        align-items: center;
        justify-content: center;
        align-content: center;
        grid-gap: 4rem;
        max-width: 1000px;
    }

    .grid-item {
        text-align: left;

        &.header {
            min-width: 500px;
            overflow-y: auto;

            h2 {
                margin-bottom: 1rem;
            }

            h3,
            p {
                padding-left: 1.5rem;
            }
        }

        img {
            max-width: 450px;
        }
    }

    #team {
        max-width: 500px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        margin-top: 80px;
        padding: 1em 2em;
    }

    p {
        font-size: 15px;
    }

    p,
    h2,
    h3 {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            grid-auto-flow: row;
            grid-template-columns: unset;
            overflow-y: scroll;
            justify-items: center;
            align-items: center;
            align-content: unset;
        }

        .grid-item {
            width: 96%;
            &.header {
                min-width: unset;
                overflow-y: unset;
                h3,
                p {
                    padding-left: 0;
                }
            }

            #team {
                margin-top: 4rem;
            }

            img {
                object-fit: contain;
                position: relative;
                width: 100%;
            }
        }
    }
</style>
