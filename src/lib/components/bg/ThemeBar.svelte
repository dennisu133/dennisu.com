<script lang="ts">
	import ThemeSelect from "./ThemeSelect.svelte";
	import BackgroundToggle from "./BackgroundToggle.svelte";
</script>

<div
	class="inline-flex items-center rounded-lg border border-border p-0.5"
	role="toolbar"
	aria-label="Display settings"
>
	<ThemeSelect />
	<div id="background-wrapper" class="contents">
		<span class="mr-0.5 ml-0.5 h-6 w-px bg-border"></span>
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
