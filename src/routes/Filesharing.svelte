<script>
    export let cryptifySrc = ''
</script>

<div class="grid-container">
    <div class="grid-item left-grid">
        <h2>Encrypt & Send files</h2>
        <h3>How does file encryption work?</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <h3>How does file encryption work?</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </div>
    <img class="grid-item middle-grid" src="images/basket.svg" alt="basket" />
    <embed
        class="grid-item right-grid"
        src={cryptifySrc}
        type="text/html"
        width="400"
        height="600"
    />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 5%;
        margin: auto 5% auto 5%;
        align-items: end;
        justify-content: center;

        @media only screen and (max-width: 600) {
            grid-template-columns: 1fr;
            grid-auto-flow: row;
        }
    }

    .grid-item {
        text-align: left;
        min-width: 300px;
        max-width: 600px;
    }

    embed {
        padding: 10px;
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
    }
</style>
