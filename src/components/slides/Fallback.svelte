<script>
    import decryptImg from '$lib/assets/images/decrypt.svg'
    import decryptImgLq from '$lib/assets/images/lqip/decrypt.svg'
    import Decrypt from '../fallback/Decrypt.svelte'
    import Settings from '../fallback/Settings.svelte'

    import Cog from 'svelte-material-icons/Cog.svelte'
    import UploadLock from 'svelte-material-icons/UploadLock.svelte'

    import { emails } from './../fallback/stores.js'

    import { fade, fly } from 'svelte/transition'

    const MODES = { MailView: 0, Settings: 1 }

    let currMode = $emails.length > 0 ? MODES.MailView : MODES.Settings

    $: console.log('current mode: ', currMode)
</script>

<div class="grid-container">
    <div class="left">
        <div class="item upload">
            <p>TODO instruction</p>
            <UploadLock size="30" />
            <input type="file" />
        </div>
        <div class="item search">
            <button on:click={() => (currMode = 1 - currMode)}>
                <Cog size="30" />
            </button>
            <input type="text" placeholder="Search..." />
        </div>
        <div class="item list">list</div>
    </div>
    <div class="right">
        {#if currMode === MODES.MailView}
            <div
                id="mail-container"
                in:fly={{ y: 1000, delay: 500, duration: 500 }}
                out:fly={{ y: 1000, duration: 500 }}
            >
                <div class="item to"><p><b>To: </b></p></div>
                <div class="item from"><p><b>From: </b></p></div>
                <div class="item subject"><p><b>Subject: </b></p></div>
                <div class="item date"><p><b>Date: </b></p></div>
                <div class="item body">body</div>
            </div>
        {:else}
            <div
                id="image-container"
                in:fly={{ y: 1000, delay: 500, duration: 500 }}
                out:fly={{ y: 1000, duration: 500 }}
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
            }

            .search {
                grid-row: 4 / 6;

                input {
                    color: black;
                    border-radius: 1em;
                    background-color: grey;
                }
            }

            .list {
                grid-row: 7 / 17;
            }
        }

        .right {
            grid-row: 1 / 10;
            grid-column: 2 / 2;
            background-color: white;
            height: 100%;

            div#mail-container {
                height: 100%;
                display: grid;
                grid-template-rows: repeat(16, 1fr);

                .to {
                    grid-row: 1 / 1;
                }

                .from {
                    grid-row: 2 / 2;
                }

                .subject {
                    grid-row: 3 / 3;
                }

                .date {
                    grid-row: 4 / 4;
                }

                .body {
                    grid-row: 5 / 17;
                }
            }
        }
    }
</style>
