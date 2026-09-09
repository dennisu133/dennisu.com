<script lang="ts">
	const samples = [
		["Regular", "400", ""],
		["Bold", "700", ""],
		["Faux Bold", "700", "font-['Geist_Regular_Only',sans-serif]"]
	] as const;
</script>

<figure
	class="@container my-6"
	aria-label="The word Handgloves in Geist at weight 400, at a real weight 700, and as faux bold that the browser synthesizes from weight 400"
>
	<!-- Keep each full word intact, including when the sidebar narrows the article. -->
	<div class="grid gap-1 @2xl:grid-cols-3">
		{#each samples as [name, weight, family] (name)}
			{@const synthesized = name === "Faux Bold"}
			<div
				class="min-w-0 border border-border px-1 py-4 text-center contrast-more:border-foreground"
			>
				<span
					aria-hidden="true"
					class={[
						"block text-[clamp(1.875rem,6cqi,2.25rem)] leading-none whitespace-nowrap",
						family
					]}
					style:font-weight={weight}>Handgloves</span
				>
				<div
					class={[
						"mt-3 text-xs font-semibold",
						synthesized ? "text-muted-foreground " : "text-accent"
					]}
				>
					{name}
				</div>
				<div class="text-xs text-muted-foreground tabular-nums">{weight}</div>
			</div>
		{/each}
	</div>
</figure>

<style>
	/* The same file as the site font, so this costs no extra download. Declaring
	   only 400 clamps the weight axis there, so asking for 700 leaves the browser
	   no real bold to use and it smears the regular outlines instead. */
	@font-face {
		font-family: "Geist Regular Only";
		src: url("$lib/assets/fonts/geist-400-700.woff2") format("woff2");
		font-weight: 400;
		font-display: swap;
	}
</style>
