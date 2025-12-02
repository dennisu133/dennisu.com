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
	let { name, description, url = "", repo, date, class: className = "" } = $props();

	const primaryLink = url || repo;
</script>

<!--  -->
{#snippet projectDate()}
	{#if date}
		<time datetime={date.toISOString()} class="text-xs opacity-60 text-(--text-muted)">
			{date.toLocaleDateString("en-US", { year: "numeric", month: "long" })}
		</time>
	{/if}
{/snippet}

<li class="relative card group {className} p-0! overflow-hidden">
	<!-- Mobile: touch-friendly with explicit links -->
	<div class="pointer-fine:hidden flex flex-col gap-2 card-padding h-full">
		<div class="flex items-start justify-between gap-2">
			<h3>{name}</h3>
			<div class="flex items-center gap-3">
				{#if url}
					<a class="link-action" href={url} target="_blank" rel="noreferrer">Visit</a>
					<span class="text-(--text-muted)">|</span>
				{/if}
				<a class="link-action" href={repo} target="_blank" rel="noreferrer">GitHub</a>
			</div>
		</div>
		<p>{description}</p>
		<div class="mt-auto pt-2 self-end">
			{@render projectDate()}
		</div>
	</div>

	<!-- Desktop: entire card clickable, GitHub link floats above -->
	<div
		class="hidden pointer-fine:flex flex-col gap-2 card-padding w-full h-full relative
           hover:bg-(--color-surface)/50 transition-colors"
	>
		<a
			href={primaryLink}
			target="_blank"
			rel="noreferrer"
			class="absolute inset-0 z-10"
			aria-label="Visit {name}"
		></a>

		<div class="flex items-start justify-between gap-2">
			<h3 class="group-hover:text-(--color-link-hover) transition-colors">
				{name}
			</h3>
			{#if repo}
				<a
					href={repo}
					target="_blank"
					rel="noreferrer"
					class="link-action relative z-20 pointer-events-auto hover:underline"
				>
					GitHub
				</a>
			{/if}
		</div>
		<div class="flex items-end justify-between gap-4">
			<p class="flex-1">{description}</p>
			{@render projectDate()}
		</div>
	</div>
</li>

<style lang="postcss">
	@import "./card.css";

	.card-padding {
		padding: clamp(0.75rem, 1.5dvh, 1rem);
	}

	h3 {
		font-size: var(--text-card-title);
		@apply font-medium;
	}
</style>
