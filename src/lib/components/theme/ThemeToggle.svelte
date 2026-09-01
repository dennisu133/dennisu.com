<script lang="ts">
	import { Moon, Sun } from "@lucide/svelte";

	import { toggleTheme } from "./theme";

	const toggleClass =
		"group/theme-toggle relative items-center justify-center rounded-lg border border-border bg-[light-dark(rgb(15_23_42/0.12),transparent)] p-2 text-muted-foreground transition-colors hover:text-foreground";

	function handleToggle(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const { left, top, width, height } = button.getBoundingClientRect();

		toggleTheme({
			x: left + width / 2,
			y: top + height / 2
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
	<span
		aria-hidden="true"
		class="tooltip show-on-light right-0 bottom-full mb-1.5 group-hover/theme-toggle:opacity-100"
	>
		Switch to dark mode
	</span>
	<span
		aria-hidden="true"
		class="tooltip show-on-dark right-0 bottom-full mb-1.5 group-hover/theme-toggle:opacity-100"
	>
		Switch to light mode
	</span>
{/snippet}

<button
	type="button"
	class="script-theme-toggle inline-flex focus-visible:text-foreground noscript:hidden {toggleClass}"
	aria-label="Toggle color theme"
	onclick={handleToggle}
>
	{@render toggleContents()}
</button>

<input
	id="no-script-theme-toggle"
	type="checkbox"
	class="peer sr-only hidden noscript:block"
	aria-label="Toggle color theme"
/>
<label
	for="no-script-theme-toggle"
	class="hidden peer-focus-visible:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-accent-hover noscript:inline-flex {toggleClass}"
>
	{@render toggleContents()}
</label>
