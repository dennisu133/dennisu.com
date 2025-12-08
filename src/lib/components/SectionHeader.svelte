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
	let { children, margin = "mb-[clamp(0.5rem,1dvh,1rem)]", id, class: className = "" } = $props();
</script>

<div
	class="flex items-center py-2 tracking-[0.2em] text-(--text-muted) uppercase {margin} {className}"
>
	<h2 {id}>
		{@render children?.()}
	</h2>
	<span class="ml-4 h-px grow bg-(--color-border)"></span>
</div>
