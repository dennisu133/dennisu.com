<!-- 
  @component
  Renders a single project as a boxed list item with responsive action links.
  Usage:
  <ProjectCard name="My App" description="..." url="https://..." repo="https://..." />
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
  let { name, description, url = "", repo, class: className = "" } = $props();
</script>

<li class="card group {className}">
  <div
    class="flex flex-row items-start justify-between gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <h2 class="text-card-title font-medium">
      {name}
    </h2>
    <div class="flex flex-row items-center gap-4">
      {#if url}
        <a class="link-action" href={url} target="_blank" rel="noreferrer"
          >Visit</a
        >
        <span class="text-[clamp(0.7rem,1.5vw,0.8rem)]">|</span>
      {/if}
      <a class="link-action" href={repo} target="_blank" rel="noreferrer"
        >GitHub</a
      >
    </div>
  </div>
  <p class="mt-2 text-muted">{description}</p>
</li>
