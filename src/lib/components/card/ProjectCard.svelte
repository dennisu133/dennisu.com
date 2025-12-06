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
	let { name, description, url, repo, date, class: className = "" } = $props();
	url ??= repo; // if url is null, set it to repo
</script>

<li class="flex card relative group {className}">
	<a href={url} class="hidden pointer-fine:block absolute inset-0 z-10" aria-label="Open {name}"
	></a>

	<div class="flex flex-col flex-1 justify-between gap-2">
		<h3>{name}</h3>
		<p>{description}</p>
	</div>

	<div class="flex flex-col justify-between items-end">
		<div class="flex gap-2">
			<a href={url} target="_blank" rel="noreferrer" class="link-action pointer-fine:hidden">Open</a
			>
			<span class="h-6 w-px bg-(--color-border) ml-0.5 mr-0.5 pointer-fine:hidden"></span>
			<a href={repo} target="_blank" rel="noreferrer" class="link-action">GitHub</a>
		</div>

		<time datetime={date.toISOString()} class="text-xs opacity-60 text-(--text-muted)"
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
