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
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
	let { name, description, url: _url, repo, date, class: className = "" } = $props();
	const url = $derived(_url ?? repo);
</script>

<li class="card group relative flex {className}">
	<a href={url} class="absolute inset-0 z-10 hidden pointer-fine:block" aria-label="Open {name}"
	></a>

	<div class="flex flex-1 flex-col justify-between gap-2">
		<h3>{name}</h3>
		<p>{description}</p>
	</div>

	<div class="flex flex-col items-end justify-between">
		<div class="flex gap-2">
			<a href={url} target="_blank" rel="noreferrer" class="link-action pointer-fine:hidden">Open</a
			>
			<span class="mr-0.5 ml-0.5 h-6 w-px bg-(--color-border) pointer-fine:hidden"></span>
			<a href={repo} target="_blank" rel="noreferrer" class="link-action">GitHub</a>
		</div>

		<time datetime={date.toISOString()} class="text-xs text-(--text-muted) opacity-60"
			>{date.toLocaleDateString("en-US", { year: "numeric", month: "long" })}</time
		>
	</div>
</li>

<style lang="postcss">
	@import "./card.css";

	h3 {
		font-size: var(--text-h3);
		@apply font-medium transition-colors duration-150 ease-linear group-hover:text-(--color-link-hover);
	}

	p {
		@apply text-(--text-muted);
	}
</style>
