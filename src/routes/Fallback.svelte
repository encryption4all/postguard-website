<script>
    export let fallbackSrc = ''
</script>

<div class="grid-container">
    <embed class="grid-item" src={fallbackSrc} width="400" height="600" />
    <img class="grid-item" src="images/decrypt.svg" alt="decrypt" />
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: auto 5% auto 5%;
        grid-gap: 10%;
    }
</style>
