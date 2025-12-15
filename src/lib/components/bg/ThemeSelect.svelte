<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Sun, Moon, SunMoon } from "@lucide/svelte";
</script>

<div role="radiogroup" aria-label="Theme Selection" class="grid grid-cols-3">
	<span class="group relative">
		<input
			aria-label="System Preference"
			type="radio"
			id="theme-system"
			name="theme"
			value="system"
			class="peer sr-only"
			bind:group={themeState.mode}
		/>
		<label aria-hidden="true" for="theme-system" class="toggle-option">
			<SunMoon size={20} />
		</label>
		<span aria-hidden="true" class="tooltip"> System Preference </span>
	</span>

	<span class="group relative">
		<input
			aria-label="Light Mode"
			type="radio"
			id="theme-light"
			name="theme"
			value="light"
			class="peer sr-only"
			bind:group={themeState.mode}
		/>
		<label aria-hidden="true" for="theme-light" class="toggle-option">
			<Sun size={20} />
		</label>
		<span aria-hidden="true" class="tooltip"> Light Mode </span>
	</span>

	<span class="group relative">
		<input
			aria-label="Dark Mode"
			type="radio"
			id="theme-dark"
			name="theme"
			value="dark"
			class="peer sr-only"
			bind:group={themeState.mode}
		/>
		<label aria-hidden="true" for="theme-dark" class="toggle-option">
			<Moon size={20} />
		</label>
		<span aria-hidden="true" class="tooltip"> Dark Mode </span>
	</span>
</div>
