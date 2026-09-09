<script lang="ts">
	// Split so the two characters that change can be underlined in both samples.
	const parts = [
		["A new comment from Jos", false],
		["é", true],
		[" M", false],
		["ü", true],
		["ller", false]
	] as const;

	const panels = [
		{
			label: "Complete font",
			detail: "Every character is drawn by Geist.",
			correct: true,
			family: ""
		},
		{
			label: "Subset without é and ü",
			detail: "Those two fall back to the system sans-serif.",
			correct: false,
			family: "font-['Geist_Basic_Latin_Only',ui-sans-serif,system-ui,sans-serif]"
		}
	] as const;
</script>

<figure
	class="my-6"
	aria-label="The same sentence rendered twice. With the complete font every character is drawn by Geist. With a subset that never received é or ü, those two characters are drawn in the system sans-serif instead, while the rest of the sentence stays in Geist."
>
	<div class="grid gap-1 sm:grid-cols-2">
		{#each panels as panel (panel.label)}
			<div class="min-w-0 border border-border px-3 py-4 contrast-more:border-foreground">
				<!-- prettier-ignore -->
				<span aria-hidden="true" class={["block text-2xl leading-tight", panel.family]}>{#each parts as [text, marked], index (index)}{#if marked}<span class={["border-b-2 pb-1", panel.correct ? "border-accent" : "border-muted-foreground"]}>{text}</span>{:else}{text}{/if}{/each}</span>
				<div
					class={[
						"mt-4 text-xs font-semibold",
						panel.correct ? "text-accent" : "text-muted-foreground"
					]}
				>
					{panel.label}
				</div>
				<div class="text-xs text-muted-foreground">{panel.detail}</div>
			</div>
		{/each}
	</div>
</figure>

<style>
	/* The same file as the site font, so this costs no extra download. Limiting the
	   range to Basic Latin makes the browser skip this face for é and ü and reach for
	   the next family in the stack, which is what a subset that never saw those
	   characters looks like on the page. */
	@font-face {
		font-family: "Geist Basic Latin Only";
		src: url("$lib/assets/fonts/geist-400-700.woff2") format("woff2");
		font-weight: 400 700;
		font-display: swap;
		unicode-range: U+0020-007E, U+00A0;
	}
</style>
