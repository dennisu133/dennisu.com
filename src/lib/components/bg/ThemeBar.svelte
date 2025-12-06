<script lang="ts">
	import ThemeToggle from "./ThemeToggle.svelte";
	import BackgroundToggle from "./BackgroundToggle.svelte";
</script>

<div
	class="inline-flex items-center rounded-lg p-0.5 border border-(--color-border) transition-colors duration-150 ease-linear"
	role="toolbar"
	aria-label="Display settings"
>
	<ThemeToggle />
	<div id="background-wrapper" class="contents">
		<span class="h-6 w-px bg-(--color-border) ml-0.5 mr-0.5"></span>
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
