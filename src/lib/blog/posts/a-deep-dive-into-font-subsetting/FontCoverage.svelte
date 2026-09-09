<script lang="ts">
	// Distinct Geist-covered characters in this post's rendered text, sample glyphs below
	// included. Recount from the built page if the article changes substantially.
	const used = 102;
	const total = 728;
	const usedSample = [..."eA2.,%"];
	const unusedSample = [..."çЖЯ½Ä€"];
</script>

<figure class="mb-8">
	<figcaption>
		This post uses {used} of Geist’s {total} characters.
	</figcaption>
	<div class="mt-4 mb-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm tabular-nums">
		<span class="font-semibold text-accent">{used} used · {((used / total) * 100).toFixed(1)}%</span
		>
		<span class="text-muted-foreground">{total - used} unused in this post</span>
	</div>
	<!-- The bar uses character counts, not byte sizes. -->
	<div
		aria-hidden="true"
		class="mb-5 grid h-5 border border-border contrast-more:border-foreground forced-colors:border-foreground"
		style:grid-template-columns={`${used}fr ${total - used}fr`}
	>
		<div class="border-r border-accent bg-accent forced-colors:bg-[Highlight]"></div>
		<div class="bg-foreground/10"></div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<div class="mb-2 text-xs font-semibold text-accent">Common characters</div>
			<div class="flex flex-wrap gap-1">
				{#each usedSample as character (character)}
					<span
						class="flex size-7 items-center justify-center border border-accent bg-accent/10 text-sm font-semibold text-accent"
						aria-label={character === " " ? "Space" : undefined}
						title={character === " " ? "Space" : undefined}
						>{character === " " ? "␣" : character}</span
					>
				{/each}
			</div>
		</div>
		<div>
			<div class="mb-2 text-xs font-semibold text-muted-foreground">Less common characters</div>
			<div class="flex flex-wrap gap-1">
				{#each unusedSample as character (character)}
					<span
						class="flex size-7 items-center justify-center border border-dashed border-muted-foreground text-sm text-muted-foreground"
						>{character}</span
					>
				{/each}
			</div>
		</div>
	</div>
</figure>
