<script lang="ts">
	import { Moon, Sun } from "@lucide/svelte";

	import { toggleTheme } from "./theme";

	let {
		toggleLabel = "Toggle color theme",
		switchToDarkLabel = "Switch to dark mode",
		switchToLightLabel = "Switch to light mode"
	}: {
		toggleLabel?: string;
		switchToDarkLabel?: string;
		switchToLightLabel?: string;
	} = $props();

	const toggleClass =
		"theme-toggle group/theme-toggle relative cursor-pointer items-center justify-center p-2 transition-colors";
</script>

{#snippet toggleContents()}
	<span aria-hidden="true" class="theme-toggle-icon show-on-light">
		<Moon size={20} />
	</span>
	<span aria-hidden="true" class="theme-toggle-icon show-on-dark">
		<Sun size={20} />
	</span>
	<span
		aria-hidden="true"
		class="tooltip show-on-light right-0 bottom-full mb-1.5 group-hover/theme-toggle:opacity-100"
	>
		{switchToDarkLabel}
	</span>
	<span
		aria-hidden="true"
		class="tooltip show-on-dark right-0 bottom-full mb-1.5 group-hover/theme-toggle:opacity-100"
	>
		{switchToLightLabel}
	</span>
{/snippet}

<button
	type="button"
	class="script-theme-toggle inline-flex focus-visible:text-foreground noscript:hidden {toggleClass}"
	aria-label={toggleLabel}
	onclick={toggleTheme}
>
	{@render toggleContents()}
</button>

<input
	id="no-script-theme-toggle"
	type="checkbox"
	class="peer sr-only hidden noscript:block"
	aria-label={toggleLabel}
/>
<label
	for="no-script-theme-toggle"
	class="hidden peer-focus-visible:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-accent-hover noscript:inline-flex {toggleClass}"
>
	{@render toggleContents()}
</label>

<style>
	.theme-toggle {
		color: var(--color-muted-foreground);
		background-color: light-dark(rgb(239 248 255 / 0.38), rgb(12 12 12 / 0.62));
		background-image: linear-gradient(
			135deg,
			light-dark(rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.08)),
			transparent 60%
		);
		border: 1px solid light-dark(rgb(15 23 42 / 0.46), rgb(255 255 255 / 0.22));
		border-radius: 0.125rem;
		box-shadow:
			inset 0 1px 0 light-dark(rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.08)),
			0 8px 24px light-dark(rgb(30 64 175 / 0.1), rgb(0 0 0 / 0.32));
		backdrop-filter: blur(12px);
	}

	.theme-toggle:hover {
		color: var(--color-foreground);
		background-color: light-dark(rgb(239 248 255 / 0.58), rgb(255 255 255 / 0.08));
		border-color: light-dark(oklch(48.8% 0.243 264.376), oklch(75.351% 0.139 232.661));
	}
</style>
