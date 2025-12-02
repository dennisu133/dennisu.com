<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Cloud, CloudOff } from "@lucide/svelte";
</script>

<input
	type="radio"
	id="bg-animated"
	name="background"
	value="animated"
	class="sr-only"
	bind:group={themeState.bg}
/>
<input
	type="radio"
	id="bg-static"
	name="background"
	value="static"
	class="sr-only"
	bind:group={themeState.bg}
/>

<label for="bg-animated" class={{ "toggle-option": true, group: true }}>
	<Cloud size={20} />
	<span class="sr-only">Animated Background</span>
	<span role="tooltip" class="toggle-tooltip">
		<span class="text-animated">Animated Background</span>
	</span>
</label>
<label for="bg-static" class={{ "toggle-option": true, group: true }}>
	<CloudOff size={20} />
	<span class="sr-only">Static Background</span>
	<span role="tooltip" class="toggle-tooltip">
		<span class="text-static">Static Background</span>
	</span>
</label>

<style lang="postcss">
	@import "./theme.css";

	/* CSS-only selected state based on :root bg attribute (prevents FOUC) */
	/* This applies immediately based on the blocking script in +layout.svelte */
	:global(:root[bg='animated']) label[for='bg-animated'],
	:global(:root[bg='static']) label[for='bg-static'],
	/* Fallback for when bg attribute isn't set yet (noscript support) */
	:global(:root:not([bg])) #bg-animated:checked ~ label[for='bg-animated'],
	:global(:root:not([bg])) #bg-static:checked ~ label[for='bg-static'] {
		@apply text-(--text);
		background-color: var(--bg-contrast);
	}
</style>
