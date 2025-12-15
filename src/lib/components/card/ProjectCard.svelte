<!-- 
  @component
  Renders a single project as a boxed list item with responsive action links.
  Usage:
  ```html
  <ProjectCard
    name="My App"
    description="..."
    url="https://..."
    repo="https://..."
    date="2025-01-01"
  />
  ```
-->

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

<li class="card group relative flex flex-col gap-2">
	<a href={url} class="absolute inset-0 z-10 hidden pointer-fine:block" aria-label="Open {name}"
	></a>

	<div class="flex flex-1 items-start justify-between gap-2">
		<h3 class="group-hover:text-link-hover font-medium transition-colors duration-150 ease-linear">
			{name}
		</h3>
		<div class="flex gap-2">
			<FancyLink text="Open" {url} class="pointer-fine:hidden" />
			<span class="bg-border mr-0.5 ml-0.5 h-6 w-px pointer-fine:hidden"></span>
			<FancyLink text="GitHub" url={repo} />
		</div>
	</div>

	<div class="flex items-end justify-between gap-2">
		<p class="text-(--text-muted)">{description}</p>
		<time datetime={date.toISOString()} class="text-xs text-(--text-muted) opacity-60"
			>{date.toLocaleDateString("en-US", { year: "numeric", month: "long" })}</time
		>
	</div>
</li>
