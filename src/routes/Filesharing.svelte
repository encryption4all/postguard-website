<script>
	export let cryptifySrc = '';
</script>

<div>
	<img src="images/basket.svg" alt="basket" />
	<embed src={cryptifySrc} type="text/html" width="400" height="600" />
</div>

<style lang="scss">
	embed {
		border: 1px dashed #1e1e1e;
		border-radius: 16px;
	}
</style>
