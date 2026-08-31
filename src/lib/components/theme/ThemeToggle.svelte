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
	class="script-theme-toggle relative inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
	class="no-script-theme-toggle relative items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
>
	{@render toggleContents()}
</label>

<style>
	.no-script-theme-input,
	.no-script-theme-toggle {
		display: none;
	}

	.script-theme-toggle,
	.no-script-theme-toggle {
		background-color: light-dark(rgb(15 23 42 / 0.12), transparent);
	}

	.tooltip {
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
	}

	.script-theme-toggle:hover .tooltip,
	.no-script-theme-toggle:hover .tooltip {
		opacity: 1;
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
			color: var(--color-foreground);
			outline: 2px solid var(--color-foreground);
			outline-offset: 2px;
		}
	}
</style>
