<script>
    export let fallbackSrc = ''
    let clientHeight
</script>

<div class="grid-container" bind:clientHeight>
    <iframe
        title="fallback"
        class="grid-item"
        src={fallbackSrc}
        width="600"
        height={clientHeight > 800 ? 800 : 400}
    />
    <img class="grid-item" src="/images/decrypt.svg" alt="decrypt" />
</div>

<style lang="scss">
    .grid-container {
        grid-template-columns: 1fr 1fr;
        justify-items: center;
        justify-content: center;
        align-items: center;
    }

    .grid-item {
        max-width: 100%;
    }

    iframe {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        overflow-y: auto;
    }

    @media only screen and (max-width: 800px) {
        .grid-container {
            display: grid;
            grid-template-columns: unset;
            max-height: unset;
            overflow: hidden;
            border-bottom: unset;
        }

        img.grid-item {
            object-fit: contain;
            width: 80%;
        }
    }
</style>
