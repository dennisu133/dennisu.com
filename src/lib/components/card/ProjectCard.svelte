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

<li class="card {className}">
  <div
    class="flex flex-row items-start justify-between gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <h2 class="text-card-title">
      {name}
    </h2>
    <div class="flex flex-row items-center gap-4">
      {#if url}
        <a class="link-action" href={url} target="_blank" rel="noreferrer"
          >Visit</a
        >
        <span class="text-muted">|</span>
      {/if}
      <a class="link-action" href={repo} target="_blank" rel="noreferrer"
        >GitHub</a
      >
    </div>
  </div>
  <p class="mt-2 text-muted">{description}</p>
</li>
