<script lang="ts">
	import ThemeToggle from "./ThemeToggle.svelte";
	import BackgroundToggle from "./BackgroundToggle.svelte";
</script>

<div class="controls-container" role="toolbar" aria-label="Display settings">
	<div class="controls-section">
		<ThemeToggle />
	</div>
	<div class="controls-separator bg-toggle-section"></div>
	<div class="controls-section bg-toggle-section">
		<BackgroundToggle />
	</div>
</div>

<noscript>
	<style>
		.bg-toggle-section {
			display: none !important;
		}
	</style>
</noscript>

<style lang="postcss">
	@reference "tailwindcss";

	.controls-container {
		@apply inline-flex items-center gap-0.5 p-0.5 
    border rounded-lg
		transition-colors duration-150 ease-linear;
		border-color: var(--color-border);
	}

	.controls-section {
		@apply inline-flex items-center gap-0.5;
	}

	.controls-separator {
		@apply h-6 w-px;
		background-color: var(--color-border);
		margin: 0 0.125rem;
	}
</style>
