<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		about,
		proficiencies
	}: {
		about: Snippet;
		proficiencies: string;
	} = $props();
</script>

<div class="card grid gap-2">
	<div class="text-(--text)">
		{@render about?.()}
	</div>

	<p class="font-display text-sm tracking-wide text-(--text-muted)">
		{proficiencies}
	</p>
</div>
