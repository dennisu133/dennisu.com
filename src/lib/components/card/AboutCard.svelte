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

	<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] tracking-wide text-(--text-muted)">
		{proficiencies}
	</p>
</div>
