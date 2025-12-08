<!-- Very hacky way to make a purely CSS based theme toggle -->

<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Sun, Moon, SunMoon } from "@lucide/svelte";
</script>

<div role="radiogroup" aria-label="Theme Selection" class="contents">
	<input
		aria-label="System Preference"
		type="radio"
		id="theme-system"
		name="theme"
		value="system"
		class="sr-only"
		checked
		bind:group={themeState.mode}
	/>
	<label aria-hidden="true" for="theme-system" class="toggle-option group">
		<SunMoon size={20} />

		<span class="toggle-tooltip">
			<span class="text-system">System Preference</span>
		</span>
	</label>

	<input
		aria-label="Light Mode"
		type="radio"
		id="theme-light"
		name="theme"
		value="light"
		class="sr-only"
		bind:group={themeState.mode}
	/>
	<label aria-hidden="true" for="theme-light" class="toggle-option group">
		<Sun size={20} />

		<span class="toggle-tooltip">
			<span class="text-light">Light Mode</span>
		</span>
	</label>

	<input
		aria-label="Dark Mode"
		type="radio"
		id="theme-dark"
		name="theme"
		value="dark"
		class="sr-only"
		bind:group={themeState.mode}
	/>
	<label aria-hidden="true" for="theme-dark" class="toggle-option group">
		<Moon size={20} />

		<span class="toggle-tooltip">
			<span class="text-dark">Dark Mode</span>
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
		background-color: var(--bg-contrast);
	}
</style>
