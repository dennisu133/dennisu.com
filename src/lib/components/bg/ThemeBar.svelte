<script lang="ts">
	import ThemeSelect from "./ThemeSelect.svelte";
	import BackgroundToggle from "./BackgroundToggle.svelte";
</script>

<div
	class="border-border inline-flex items-center rounded-lg border p-0.5"
	role="toolbar"
	aria-label="Display settings"
>
	<ThemeSelect />
	<div id="background-wrapper" class="contents">
		<span class="bg-border mr-0.5 ml-0.5 h-6 w-px"></span>
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
