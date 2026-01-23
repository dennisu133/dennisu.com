<script lang="ts">
	import FancyLink from "$lib/components/FancyLink.svelte";
	let {
		name,
		description,
		url: _url,
		repo,
		date
	}: {
		name: string;
		description: string;
		url?: string;
		repo: string;
		date: Date;
	} = $props();
	const url = $derived(_url ?? repo);
</script>

<li class="card group relative flex items-center gap-4">
	<a href={url} class="absolute inset-0 z-10 hidden pointer-fine:block" aria-label="Open {name}"
	></a>

	<div class="flex flex-1 items-center justify-between gap-3">
		<div class="flex-1">
			<div class="mb-3 flex items-center gap-3">
				<h3
					class="leading-none font-medium transition-colors duration-150 group-hover:text-link-hover"
				>
					{name}
				</h3>
				<time
					datetime={date.toISOString()}
					class="shrink-0 font-display text-[0.65rem] leading-none tracking-wide text-(--text-muted) opacity-50"
				>
					{date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
				</time>
			</div>
			<p class="mt-1 text-sm text-(--text-muted)">{description}</p>
		</div>

		<div class="flex shrink-0 gap-2">
			<FancyLink text="Open" {url} class="pointer-fine:hidden" />
			<span class="mx-0.5 h-[0.9em] w-px self-center bg-border/70 pointer-fine:hidden"></span>
			<FancyLink text="GitHub" url={repo} />
		</div>
	</div>
</li>
