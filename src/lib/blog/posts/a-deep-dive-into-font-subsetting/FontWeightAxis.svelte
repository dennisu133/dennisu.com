<script lang="ts">
	const weights = [
		[100, "Thin"],
		[200, "ExtraLight"],
		[300, "Light"],
		[400, "Regular"],
		[500, "Medium"],
		[600, "SemiBold"],
		[700, "Bold"],
		[800, "ExtraBold"],
		[900, "Black"]
	] as const;
</script>

<figure
	class="@container my-6"
	aria-label="Geist weights from 100 to 900, with 400 and 700 highlighted as example weights"
>
	<!-- Nine specimens need enough article width for both glyphs and weight names. -->
	<div class="grid grid-cols-3 gap-1 @2xl:grid-cols-9">
		{#each weights as [weight, name] (weight)}
			{@const selected = weight === 400 || weight === 700}
			<div
				class={[
					"min-w-0 border px-1 py-4 text-center contrast-more:border-foreground",
					selected
						? "border-accent bg-accent/10 text-accent"
						: " border-border text-muted-foreground"
				]}
			>
				<span
					aria-hidden="true"
					class="block font-['Geist_Weight_Specimen'] text-4xl leading-none whitespace-nowrap @sm:text-5xl @2xl:text-4xl"
					style:font-weight={weight}>Aa</span
				>
				<div class="mt-3 text-xs">{name}</div>
				<div class="text-xs tabular-nums" class:font-semibold={selected}>{weight}</div>
			</div>
		{/each}
	</div>
</figure>

<style>
	/* The site's Geist only covers 400–700. This specimen keeps 100–900 for Aa.
	   Generated from Geist v1.7.2 with subset-font; license in OFL.txt. */
	@font-face {
		font-family: "Geist Weight Specimen";
		src: url("./geist-weight-specimen.woff2") format("woff2");
		font-weight: 100 900;
		font-display: swap;
		unicode-range: U+0041, U+0061;
	}
</style>
