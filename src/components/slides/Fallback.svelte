<script>
    import { onMount } from 'svelte'

    import decryptImg from '$lib/assets/images/decrypt.svg'
    import decryptImgLq from '$lib/assets/images/lqip/decrypt.svg'
    import Decrypt from '../fallback/Decrypt.svelte'
    import Settings from '../fallback/Settings.svelte'

    import Cog from 'svelte-material-icons/Cog.svelte'
    import UploadLock from 'svelte-material-icons/UploadLock.svelte'
    import Magnify from 'svelte-material-icons/Magnify.svelte'

    import { emails, currSelected } from './../fallback/stores.js'

    import { fly } from 'svelte/transition'
    import EmailView from '../fallback/EmailView.svelte'
    import ListView from '../fallback/ListView.svelte'

    // mode of the left window (List/Settings)
    const LEFTMODES = { ListView: 'List', Settings: 'Settings' }
    let currLeft = $emails.length > 0 ? LEFTMODES.ListView : LEFTMODES.Settings

    // mode of the right window (Nothing/MailView/Decrypting)
    const RIGHTMODES = {
        Nothing: 'Nothing',
        MailView: 'MailView',
        Decrypt: 'Decrypt',
    }

    $: currRight = $currSelected >= 0 ? RIGHTMODES.MailView : RIGHTMODES.Nothing

    let searchTerm
    let mod, readable

    const onFile = async (event) => {
        const [inFile] = event.srcElement.files
        readable = inFile.stream()
        currRight = RIGHTMODES.Decrypt
    }

    onMount(async () => {
        mod = await import('@e4a/irmaseal-wasm-bindings')
    })

    $: console.log(`current modes, left: ${currLeft}, right: ${currRight}`)
    $: console.log('mails changed: ', $emails)
    $: console.log('current selected mail: ', $currSelected)
</script>

<div class="grid-container">
    <div class="left">
        <div class="item upload">
            <label class="file-upload">
                <p>Click or drag a "postguard.encrypted" file here</p>
                <UploadLock class="test" size="30" />
                <input type="file" on:change={onFile} /></label
            >
        </div>
        <div class="item search">
            <label class="custom-field">
                <div
                    style="position:relative; float: right; right: 2em; top: 50%; transform: translateY(50%);; z-index:1;"
                >
                    <Magnify />
                </div>
                <input
                    type="search"
                    placeholder="Search..."
                    bind:value={searchTerm}
                />
            </label>
            <button
                on:click={() => (currLeft = LEFTMODES.Settings)}
                style="cursor:pointer;"
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
                in:fly={{ y: 1000, delay: 350, duration: 350 }}
                out:fly={{ y: 1000, duration: 350 }}
            >
                <EmailView />
            </div>
        {:else if currRight === RIGHTMODES.Nothing}
            <div
                id="image-container"
                in:fly={{ y: 1000, delay: 350, duration: 350 }}
                out:fly={{ y: 1000, duration: 350 }}
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
        {:else}
            <Decrypt {mod} {readable} bind:rightMode={currRight} />
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

                    .highlight {
                        border-color: purple;
                    }
                }
            }

            .search {
                display: flex;
                gap: 2em;
                grid-row: 4 / 6;

                input {
                    color: black;
                    border-radius: 1em;
                }

                button {
                    all: unset;
                    margin: auto 2em auto auto;
                }
            }

            .list {
                overflow-y: scroll;
                padding-left: 0;
                grid-row: 6 / 17;
            }
        }

        .right {
            grid-row: 1 / 10;
            grid-column: 2 / 2;
            background-color: white;
            height: 100%;

            #image-container {
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>
