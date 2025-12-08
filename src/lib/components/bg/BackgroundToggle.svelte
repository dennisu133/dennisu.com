<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Cloud, CloudOff } from "@lucide/svelte";
</script>

<div role="radiogroup" aria-label="Background Selection" class="contents">
	<input
		aria-label="Animated Background"
		type="radio"
		id="bg-animated"
		name="background"
		value="animated"
		class="sr-only"
		bind:group={themeState.bg}
	/>
	<label aria-hidden="true" for="bg-animated" class="toggle-option group">
		<Cloud size={20} />

		<span class="toggle-tooltip">
			<span class="text-animated">Animated Background</span>
		</span>
	</label>
	<input
		aria-label="Static Background"
		type="radio"
		id="bg-static"
		name="background"
		value="static"
		class="sr-only"
		bind:group={themeState.bg}
	/>

	<label aria-hidden="true" for="bg-static" class="toggle-option group">
		<CloudOff size={20} />
		<span class="toggle-tooltip">
			<span class="text-static">Static Background</span>
		</span>
	</label>
</div>

<style lang="postcss">
	@import "./theme.css";

	/* TODO: use tailwind peer */
	input:focus-visible + label {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

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
