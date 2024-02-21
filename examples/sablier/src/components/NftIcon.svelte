
<script lang="ts">
	export let imageUrl;
</script>

<style>
	.cat-image-container {
		width: 100%;
		max-width: 400px;
		position: relative;
		margin: 0 auto;
		height: fit-content;
		display: flex;
	}
	.cat-image-container img {
		width: 100%;
		border-radius: 12px;
	}
</style>

<div class="cat-image-container">
	<img alt="your cat" style="width: 100%; position: relative;" src="{imageUrl}"/>
	<slot/>
</div>
