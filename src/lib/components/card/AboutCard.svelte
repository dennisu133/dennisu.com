<script lang="ts">
	import ImageDispenser from "$lib/components/ImageDispenser.svelte";

	export type AboutSegment = {
		text: string;
		images?: Record<string, unknown>;
	};

	let {
		about,
		proficiencies,
		class: className = ""
	}: {
		about: AboutSegment[];
		proficiencies: string;
		class?: string;
	} = $props();

	let srText = $derived(about.map((s) => s.text).join(""));
</script>

<div class="card {className}">
	<div class="grid gap-2 lg:gap-3">
		<div>
			<span class="sr-only">{srText}</span>

			<span aria-hidden="true">
				{#each about as segment}
					{#if segment.images}
						<ImageDispenser paths={segment.images}>
							{segment.text}
						</ImageDispenser>
					{:else}
						{segment.text}
					{/if}
				{/each}
			</span>
		</div>

		<div class="text-(--text-muted)">
			{proficiencies}
		</div>
	</div>
</div>

<style lang="postcss">
	@import "./card.css";
</style>
