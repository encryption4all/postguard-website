<script>
    export let fallbackSrc = ''
    let windowWidth

    $: console.log(windowWidth)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="grid-container">
    <iframe
        title="fallback"
        class="grid-item"
        src={fallbackSrc}
        width={windowWidth > 1000 ? 500 : 350}
        height="600"
    />
    <img
        class="grid-item"
        src="/images/decrypt.svg"
        alt="decrypt"
        width="400"
        height="500"
    />
</div>

<style lang="scss">
    .grid-container {
        grid-template-columns: 1fr 1fr;
        justify-items: center;
        justify-content: center;
        align-items: center;
    }

    img {
        max-width: 400px;
        object-fit: contain;
    }

    iframe {
        overflow-y: auto;
        border: 1px dashed black;
        border-radius: 15px;
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            display: grid;
            grid-template-columns: unset;
            max-height: unset;
            overflow-y: scroll;

            .grid-item {
                width: 96%;
            }
        }

        img.grid-item {
            object-fit: contain;
            width: 80%;
        }
    }
</style>
