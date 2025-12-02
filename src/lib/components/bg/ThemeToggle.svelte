<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Sun, Moon, SunMoon } from "@lucide/svelte";
</script>

<input
	type="radio"
	id="theme-system"
	name="theme"
	value="system"
	class="sr-only"
	checked
	bind:group={themeState.mode}
/>
<input
	type="radio"
	id="theme-light"
	name="theme"
	value="light"
	class="sr-only"
	bind:group={themeState.mode}
/>
<input
	type="radio"
	id="theme-dark"
	name="theme"
	value="dark"
	class="sr-only"
	bind:group={themeState.mode}
/>

<label for="theme-system" class={{ "toggle-option": true, group: true }}>
	<SunMoon size={20} />
	<span class="sr-only">System Preference</span>
	<span role="tooltip" class="toggle-tooltip">
		<span class="text-system">System Preference</span>
	</span>
</label>
<label for="theme-light" class={{ "toggle-option": true, group: true }}>
	<Sun size={20} />
	<span class="sr-only">Light Mode</span>
	<span role="tooltip" class="toggle-tooltip">
		<span class="text-light">Light Mode</span>
	</span>
</label>
<label for="theme-dark" class={{ "toggle-option": true, group: true }}>
	<Moon size={20} />
	<span class="sr-only">Dark Mode</span>
	<span role="tooltip" class="toggle-tooltip">
		<span class="text-dark">Dark Mode</span>
	</span>
</label>

<style lang="postcss">
	@import "./theme-button.css";
	@reference "tailwindcss";

	/* CSS-only selected state based on :root theme attribute (prevents FOUC) */
	/* This applies immediately based on the blocking script in +layout.svelte */
	:global(:root[theme='system']) label[for='theme-system'],
	:global(:root[theme='light']) label[for='theme-light'],
	:global(:root[theme='dark']) label[for='theme-dark'],
	/* Fallback for when theme attribute isn't set yet (noscript support) */
	:global(:root:not([theme])) #theme-system:checked ~ label[for='theme-system'],
	:global(:root:not([theme])) #theme-light:checked ~ label[for='theme-light'],
	:global(:root:not([theme])) #theme-dark:checked ~ label[for='theme-dark'] {
		@apply text-(--text);
	}
</style>
