<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Moon, Sun } from "@lucide/svelte";

	const nextTheme = $derived(themeState.mode === "light" ? "dark" : "light");
</script>

<button
	type="button"
	class="group relative inline-flex items-center justify-center rounded-lg border border-border bg-(--bg-contrast) p-2 text-(--text-muted) transition-colors hover:text-(--text) focus-visible:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
	aria-label="Switch to {nextTheme} mode"
	onclick={() => themeState.toggle()}
>
	{#if themeState.mode === "dark"}
		<span aria-hidden="true">
			<Sun size={20} />
		</span>
	{:else}
		<span aria-hidden="true">
			<Moon size={20} />
		</span>
	{/if}
	<span aria-hidden="true" class="tooltip">Switch to {nextTheme} mode</span>
</button>
