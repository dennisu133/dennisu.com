<script lang="ts">
	import { themeState } from "./theme.svelte";
	import { Cloud, CloudOff } from "@lucide/svelte";
</script>

<div role="radiogroup" aria-label="Background Selection" class="grid grid-cols-2">
	<span class="group relative">
		<input
			aria-label="Animated Background"
			type="radio"
			id="bg-animated"
			name="background"
			value="animated"
			class="peer sr-only"
			bind:group={themeState.bg}
		/>
		<label aria-hidden="true" for="bg-animated" class="toggle-option">
			<Cloud size={20} />
		</label>
		<span aria-hidden="true" class="tooltip"> Animated Background </span>
	</span>

	<span class="group relative">
		<input
			aria-label="Static Background"
			type="radio"
			id="bg-static"
			name="background"
			value="static"
			class="peer sr-only"
			bind:group={themeState.bg}
		/>
		<label aria-hidden="true" for="bg-static" class="toggle-option">
			<CloudOff size={20} />
		</label>
		<span aria-hidden="true" class="tooltip"> Static Background </span>
	</span>
</div>
