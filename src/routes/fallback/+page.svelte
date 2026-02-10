<script>
    import { onMount } from 'svelte'

    import decryptImg from '$lib/assets/images/decrypt.svg'
    import decryptImgLq from '$lib/assets/images/lqip/decrypt.svg'
    import Decrypt from '$lib/components/fallback/Decrypt.svelte'
    import Settings from '$lib/components/fallback/Settings.svelte'

    import Icon from '@iconify/svelte'

    import { emails, krCache, currSelected, nextId } from '$lib/components/fallback/stores.js'

    import { _ } from 'svelte-i18n'

    import EmailView from '$lib/components/fallback/EmailView.svelte'
    import ListView from '$lib/components/fallback/ListView.svelte'

    // mode of the left window (List/Settings)
    const LEFTMODES = { ListView: 'List', Settings: 'Settings' }
    let currLeft = $state(LEFTMODES.ListView)

    // mode of the right window (Nothing/MailView/Decrypting)
    const RIGHTMODES = {
        Nothing: 'Nothing',
        MailView: 'MailView',
        Decrypt: 'Decrypt',
    }

    let currRight = $state();
    $effect(() => {
        currRight = $currSelected >= 0 ? RIGHTMODES.MailView : RIGHTMODES.Nothing
    });

    let searchTerm = $state()
    let mod = $state(), readable = $state()

    let unique = $state({})
    const onFile = async (event) => {
        const [inFile] = event.srcElement.files
        readable = inFile.stream()
        unique = {}
        currRight = RIGHTMODES.Decrypt
    }

    onMount(async () => {
        mod = await import('@e4a/pg-wasm')
    })
</script>

<div class="grid-container">
    <div class="left">
        <div class="item upload">
            <label class="file-upload">
                <p>{$_('fallback.drop')}</p>
                <Icon icon="mdi:upload-lock" width="30px" />
                <input type="file" onchange={onFile} /></label
            >
        </div>
        <div class="item search">
            <label class="custom-field">
                <div class="magnify">
                    <Icon icon="mdi:magnify" />
                </div>
                <input
                    type="search"
                    placeholder={$_('fallback.search')}
                    bind:value={searchTerm}
                />
            </label>
            <button
                onclick={() =>
                    (currLeft =
                        currLeft === LEFTMODES.Settings
                            ? LEFTMODES.ListView
                            : LEFTMODES.Settings)}
            >
                <Icon icon="mdi:cog" class="button-image invert" width="30px" />
            </button>
        </div>
        <div class="item list">
            {#if currLeft === LEFTMODES.ListView}
                <ListView bind:rightMode={currRight} bind:searchTerm />
            {:else}
                <Settings bind:currMode={currLeft} />
            {/if}
        </div>
    </div>
    <div class="right">
        {#if currRight === RIGHTMODES.MailView}
            <div id="mail-container">
                <EmailView />
            </div>
        {:else if currRight === RIGHTMODES.Nothing}
            <div id="image-container">
                <img
                    src={decryptImgLq}
                    data-src={decryptImg}
                    class="grid-item lazyload"
                    alt="decrypt"
                    width="400"
                    height="450"
                />
            </div>
        {:else}{#key unique}
                <Decrypt {mod} {readable} bind:rightMode={currRight} />
            {/key}
        {/if}
    </div>
</div>

<style lang="scss">
    input {
        background-color: transparent;
    }
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(9, 1fr);
        border-radius: 3em;
        gap: 2px;
        background-color: var(--pg-general-background);
        border: 2px solid var(--pg-input-normal);
        overflow: hidden;
        height: calc(100% - 2em);
        margin: 1em;
        max-width: 1200px;
        align-self: center;
        justify-self: center;

        // not implemented yet https://www.w3.org/TR/css-gaps-1/
        // row-rule: 6px solid red;
        // column-rule: 6px solid blue;

        .item {
            display: flex;
            align-items: center;
            text-align: left;
            padding-left: 1em;

            &:not(:last-child) {
                border-bottom: 2px solid var(--pg-input-normal);
            }
        }

        .left {
            height: 100%;
            grid-row: 1 / 10;
            grid-column: 1 / 1;
            background-color: transparant;

            display: grid;
            grid-template-rows: repeat(16, 1fr);
            border-right: 2px solid var(--pg-input-normal);

            .upload {
                grid-row: 1 / 4;
                display: flex;
                padding: 0.5em;

                .file-upload {
                    input[type='file'] {
                        display: none;
                    }

                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border: 1px dashed var(--pg-input-normal);
                    border-radius: 40px 10px 10px 10px;
                }
            }

            .search {
                display: flex;
                gap: 2em;
                grid-row: 4 / 6;
                width: 100%;

                label {
                    width: 100%;

                    .magnify {
                        position: relative;
                        float: right;
                        right: 30%;
                        transform: translateY(50%);
                        z-index: 1;
                    }

                    input {
                        width: 75%;
                        color: var(--pg-input-normal);
                        border-radius: 1em;
                    }
                }

                button {
                    all: unset;
                    margin: auto 2em auto auto;
                    cursor: pointer;
                    display: flex;
                }
            }

            .list {
                overflow-y: scroll;
                align-items: start;
                padding-left: 0;
                grid-row: 6 / 17;
            }
        }

        .right {
            grid-row: 1 / 10;
            grid-column: 2 / 2;
            background-color: transparant;
            height: 100%;

            #mail-container {
                height: 100%;
            }

            #image-container {
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>
