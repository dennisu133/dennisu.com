<script lang="ts">
	import ThemeToggle from "./ThemeToggle.svelte";
	import BackgroundToggle from "./BackgroundToggle.svelte";
</script>

<div
	class="inline-flex items-center rounded-lg border border-(--color-border) p-0.5 transition-colors duration-150 ease-linear"
	role="toolbar"
	aria-label="Display settings"
>
	<ThemeToggle />
	<div id="background-wrapper" class="contents">
		<span class="mr-0.5 ml-0.5 h-6 w-px bg-(--color-border)"></span>
		<BackgroundToggle />
	</div>
</div>

<noscript>
	<style>
		#background-wrapper {
			display: none !important;
		}
	</style>
</noscript>
