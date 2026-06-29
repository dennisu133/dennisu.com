<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";
	import type { Snippet } from "svelte";

	let {
		about,
		proficiencies,
		availability,
		contact
	}: {
		about: Snippet;
		proficiencies: string;
		availability: string;
		contact: Snippet;
	} = $props();
</script>

<div
	class="card grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch md:gap-5"
>
	<div class="grid min-w-0 gap-2">
		<div class="text-(--text)">
			{@render about?.()}
		</div>

		<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] tracking-wide text-(--text-muted)">
			{proficiencies}
		</p>

		<div class="flex items-center gap-2">
			<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-link" aria-hidden="true"></span>
			<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] leading-relaxed text-(--text-muted)">
				{availability}
			</p>
			<ArrowRight
				aria-hidden="true"
				strokeWidth={1.5}
				class="h-4 w-4 shrink-0 rotate-90 text-link md:ml-auto md:rotate-0"
			/>
		</div>
	</div>

	<div
		class="flex min-w-0 border-t border-border/50 pt-3 md:min-w-52 md:items-center md:border-t-0 md:border-l md:pt-0 md:pl-5"
	>
		{@render contact?.()}
	</div>
</div>
