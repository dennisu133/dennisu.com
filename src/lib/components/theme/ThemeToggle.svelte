<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Moon, Sun } from "@lucide/svelte";

	const nextTheme = $derived(themeState.mode === "light" ? "dark" : "light");

	function toggleTheme(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const bounds = button.getBoundingClientRect();
		const wasTriggeredByKeyboard = event.detail === 0;

		themeState.toggle({
			x: wasTriggeredByKeyboard ? bounds.left + bounds.width / 2 : event.clientX,
			y: wasTriggeredByKeyboard ? bounds.top + bounds.height / 2 : event.clientY
		});
	}
</script>

{#snippet toggleContents()}
	<span aria-hidden="true" class="theme-toggle-icon show-on-light">
		<Moon size={20} />
	</span>
	<span aria-hidden="true" class="theme-toggle-icon show-on-dark">
		<Sun size={20} />
	</span>
	<span aria-hidden="true" class="tooltip show-on-light">Switch to dark mode</span>
	<span aria-hidden="true" class="tooltip show-on-dark">Switch to light mode</span>
{/snippet}

<button
	type="button"
	class="script-theme-toggle group relative inline-flex items-center justify-center rounded-lg border border-border bg-(--bg-contrast) p-2 text-(--text-muted) transition-colors hover:text-(--text) focus-visible:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
	aria-label="Switch to {nextTheme} mode"
	onclick={toggleTheme}
>
	{@render toggleContents()}
</button>

<input
	id="no-script-theme-toggle"
	type="checkbox"
	class="no-script-theme-input sr-only"
	aria-label="Toggle color theme"
/>
<label
	for="no-script-theme-toggle"
	class="no-script-theme-toggle group relative items-center justify-center rounded-lg border border-border bg-(--bg-contrast) p-2 text-(--text-muted) transition-colors hover:text-(--text)"
>
	{@render toggleContents()}
</label>

<style>
	.no-script-theme-input,
	.no-script-theme-toggle {
		display: none;
	}

	@media (scripting: none) {
		.script-theme-toggle {
			display: none;
		}

		.no-script-theme-input {
			display: block;
		}

		.no-script-theme-toggle {
			display: inline-flex;
		}

		.no-script-theme-input:focus-visible + .no-script-theme-toggle {
			color: var(--text);
			outline: 2px solid var(--text);
			outline-offset: 2px;
		}
	}
</style>
