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
		"glass theme-toggle group/theme-toggle relative cursor-pointer items-center justify-center rounded-xs p-2 text-muted-foreground hover:border-accent hover:text-foreground motion-safe:transition-colors";
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
