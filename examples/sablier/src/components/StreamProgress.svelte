
<script lang="ts">
	export let current = 25;
	export let total = 100;

	let percent: number;
	let dashOffset: number = 0;

	$: {
		const percentMult = current / total;
		percent = percentMult * 100;
		dashOffset = 566 - percentMult * 566;
	}
</script>

<style>
	.progress-wrapper {
		display: flex;
		flex-flow: column;
		align-items: center;
		gap: .5rem;
	}

	.progress-inner {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.progress-inner > svg {
		height: 200px;
		width: 200px;
		transform: rotate(-89deg);
	}
	#progress,
	#progress-border,
	#track,
	#border-track {
		fill: transparent;
	}
	#progress {
		stroke: #00B5FF;
		stroke-width: 14px;
		stroke-linecap: round;
		stroke-dasharray: 566;
	}
	#progress-border {
		stroke: #00B5FF;
		stroke-width: 12px;
		stroke-linecap: round;
		stroke-dasharray: 566;
	}
	#track {
		stroke: #363b54;
		stroke-width: 10px;
	}
	#border-track {
		stroke: #363b54;
		stroke-width: 12px;
	}

	.percent-display {
		position: absolute;
		height: 60px;
		width: 250px;
		top: calc(50% - 30px);
		border: 2px solid rgb(54, 59, 84);
		border-radius: 12px;
		background-color: rgba(54, 59, 84, 0.4);
		/*backdrop-filter: blur(5.5px);*/
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28px;
		font-weight: bold;
	}
</style>

<div class="progress-wrapper">
	<div class="progress-inner">
		<svg>
			<circle id="border-track" cx="100" cy="100" r="90"></circle>
			<circle id="track" cx="100" cy="100" r="90"></circle>
			<circle id="progress" cx="100" cy="100" r="90" style="stroke-dashoffset: {dashOffset};"></circle>
			<circle id="progress-border" cx="100" cy="100" r="90" style="stroke-dashoffset: {dashOffset};"></circle>
		</svg>
		<div class="percent-display">{percent.toFixed(2)}%</div>
	</div>
</div>
