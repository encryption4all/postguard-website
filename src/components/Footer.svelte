<script>
	export let selected;

	const items = [
		'Send & Encrypt',
		'Back to home',
		'Download add-on',
		'Decrypt emails',
		'About',
		'Privacy Policy'
	];

	const next2imgs = ['images/forward_icon.svg', 'images/rightarrow.svg'];
	const prev2imgs = ['images/leftarrow.svg', 'images/back_icon.svg'];

	let next2, prev2;
	$: prev2 = items.slice(Math.max(selected - 2, 0), selected);
	$: next2 = items.slice(selected + 1, selected + 3);
</script>

<div class="pg-footer">
	<div class={'swiper-button-prev'}>
		{#each prev2 as label, i}
			<a href={'#'}>
				<div on:click={() => (selected -= prev2.length - i)}>
					<img src={prev2imgs[i]} alt={`Go back back by ${i + 1}`} />
					<p>{prev2[i]}</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="swiper-pagination" />

	<div class={'swiper-button-next'}>
		{#each next2 as label, i}
			<a href={'#'}>
				<div on:click={() => (selected += i + 1)}>
					<p>{next2[i]}</p>
					<img
						src={next2imgs[i]}
						class:arrow={next2imgs[i].includes('arrow')}
						alt={`Go forward by ${i + 1}`}
					/>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="scss">
	.pg-footer {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-column-gap: 5px;
		justify-items: center;
		margin: auto 25px 25px 25px;

		a {
			text-decoration: none;
			p {
				position: relative;
				display: inline-block;
				z-index: 0;

				&:before {
					content: '';
					position: absolute;
					z-index: -1;
					left: 0;
					right: 0;
					bottom: 3px;
					height: 0;
					border: 2px solid rgba(84, 214, 167, 0.5);
					border-radius: 10px;
				}
			}
		}
	}
	.swiper-pagination {
		position: relative;
		bottom: 0;
		margin: auto;
		grid-column-start: 2;
	}
	.swiper-button-prev {
		width: 100%;
		display: flex;
		grid-column-start: 1;

		div {
			display: flex;
			margin-right: 15px;
			align-items: center;

			img.arrow {
				display: block;
				width: 65px;
				height: 10px;
			}
		}
	}
	.swiper-button-next {
		width: 100%;
		grid-column-start: 3;
		display: flex;
		justify-content: right;

		div {
			display: flex;
			margin-left: 15px;
			align-items: center;

			img.arrow {
				display: block;
				width: 65px;
				height: 10px;
			}
		}
	}
</style>
