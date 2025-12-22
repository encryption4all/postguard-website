<script>
    import { run } from 'svelte/legacy';

    import { onMount } from 'svelte'

    import decryptImg from '$lib/assets/images/decrypt.svg'
    import decryptImgLq from '$lib/assets/images/lqip/decrypt.svg'
    import Decrypt from '../../components/fallback/Decrypt.svelte'
    import Settings from '../../components/fallback/Settings.svelte'

    import Cog from 'svelte-material-icons/Cog.svelte'
    import UploadLock from 'svelte-material-icons/UploadLock.svelte'
    import Magnify from 'svelte-material-icons/Magnify.svelte'

    import { emails, krCache, currSelected, nextId } from '../../components/fallback/stores.js'

    import { _ } from 'svelte-i18n'

    import { fly } from 'svelte/transition'
    import EmailView from '../../components/fallback/EmailView.svelte'
    import ListView from '../../components/fallback/ListView.svelte'

    // mode of the left window (List/Settings)
    const LEFTMODES = { ListView: 'List', Settings: 'Settings' }
    let currLeft = $state(LEFTMODES.ListView)

    // mode of the right window (Nothing/MailView/Decrypting)
    const RIGHTMODES = {
        Nothing: 'Nothing',
        MailView: 'MailView',
        Decrypt: 'Decrypt',
    }

    let currRight;
    run(() => {
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

    run(() => {
        console.log(`left: ${currLeft}, right: ${currRight}`)
    });
</script>

<div class="grid-container">
    <div class="left">
        <div class="item upload">
            <label class="file-upload">
                <p>{$_('fallback.drop')}</p>
                <UploadLock size="30px" />
                <input type="file" onchange={onFile} /></label
            >
        </div>
        <div class="item search">
            <label class="custom-field">
                <div class="magnify">
                    <Magnify />
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
                <Cog class="button-image" size="30px" />
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
            <div
                id="mail-container"
                in:fly|global={{ y: 1000, delay: 250, duration: 250 }}
                out:fly|global={{ y: 1000, duration: 250 }}
            >
                <EmailView />
            </div>
        {:else if currRight === RIGHTMODES.Nothing}
            <div
                id="image-container"
                in:fly|global={{ y: 1000, delay: 250, duration: 250 }}
                out:fly|global={{ y: 1000, duration: 250 }}
            >
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
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(9, 1fr);
        border-radius: 3em;
        gap: 2px;
        background-color: black;
        border: 2px solid black;
        min-width: 800px;
        width: 100%;
        margin-left: 10%;
        margin-right: 10%;
        overflow: hidden;
        max-width: 1200px;

        .item {
            display: flex;
            align-items: center;
            text-align: left;
            padding-left: 1em;

            &:not(:last-child) {
                border-bottom: 2px solid black;
            }
        }

        .left {
            height: 100%;
            grid-row: 1 / 10;
            grid-column: 1 / 1;
            background-color: white;

            display: grid;
            grid-template-rows: repeat(16, 1fr);

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
                    border: 1px dashed black;
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
                        color: black;
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
            background-color: white;
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
