<script lang="ts">
	import { Moon, Sun } from "@lucide/svelte";

	import IconButton, { iconButtonClass } from "../IconButton.svelte";

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
</script>

{#snippet toggleContents()}
	<span aria-hidden="true" class="theme-toggle-icon show-on-light">
		<Moon size={20} />
	</span>
	<span aria-hidden="true" class="theme-toggle-icon show-on-dark">
		<Sun size={20} />
	</span>
{/snippet}

{#snippet themeTooltip()}
	<span class="show-on-light">{switchToDarkLabel}</span>
	<span class="show-on-dark">{switchToLightLabel}</span>
{/snippet}

<IconButton
	class="script-theme-toggle noscript:hidden"
	label={toggleLabel}
	tooltip={themeTooltip}
	onclick={toggleTheme}
>
	{@render toggleContents()}
</IconButton>

<input
	id="no-script-theme-toggle"
	type="checkbox"
	class="peer sr-only hidden noscript:block"
	aria-label={toggleLabel}
/>
<label
	for="no-script-theme-toggle"
	class="hidden peer-focus-visible:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-accent-hover noscript:inline-flex peer-focus-visible:[&_.tooltip]:opacity-100 {iconButtonClass} relative"
>
	{@render toggleContents()}
	<span
		aria-hidden="true"
		class="tooltip right-0 bottom-full mb-1.5 group-hover/icon-button:opacity-100"
	>
		{@render themeTooltip()}
	</span>
</label>
