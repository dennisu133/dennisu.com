<!--
  @component
  Renders a section header with a title and a border.
  Usage:
  ```html
  <SectionHeader id="projects-heading">Projects</SectionHeader>
  ```
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
	import type { Snippet } from "svelte";
	let {
		id,
		class: className = "",
		children
	}: {
		id: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div
	class="mb-[clamp(0.5rem,1dvh,1rem)] flex items-center py-2 tracking-[0.2em] text-(--text-muted) uppercase {className}"
>
	<h2 {id}>
		{@render children?.()}
	</h2>
	<span class="bg-border ml-4 h-px grow"></span>
</div>
