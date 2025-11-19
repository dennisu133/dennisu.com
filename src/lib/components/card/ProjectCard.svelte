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

<!-- Snippet for the inner content to avoid duplication -->
{#snippet cardContent(isDesktop: boolean)}
  <div class="content {isDesktop ? 'w-full' : 'mb-2'}">
    <h3 class="{isDesktop ? 'group-hover:text-(--color-link-hover) transition-colors' : ''}">{name}</h3>
    
    <!-- Actions/Links -->
    <div class="{isDesktop ? '' : 'flex flex-row items-center gap-4'}">
      {#if !isDesktop}
        <!-- Mobile Actions -->
        {#if url}
          <a class="link-action" href={url} target="_blank" rel="noreferrer">Visit</a>
          <span class="rule">|</span>
        {/if}
        <a class="link-action" href={repo} target="_blank" rel="noreferrer">GitHub</a>
      {:else if repo}
        <!-- Desktop Actions (GitHub only, url is stretched link) -->
        <!-- GitHub link must be z-20 to be clickable over the stretched link -->
        <!-- Use object to avoid nested <a> warning/issue, keep strict separation -->
        <object class="relative z-20" aria-label="GitHub Repository">
          <a 
            href={repo} 
            target="_blank" 
            rel="noreferrer" 
            class="link-action hover:underline pointer-events-auto" 
            onclick={(e) => e.stopPropagation()}
          >
            GitHub
          </a>
        </object>
      {/if}
    </div>
  </div>
  <p class={isDesktop ? "mt-2" : ""}>{description}</p>
{/snippet}

<li class="relative card group {className} p-0! sm:p-0! overflow-hidden">
  <!-- Mobile Layout (Default: Touch-friendly) -->
  <!-- Visible by default, hidden ONLY on fine-pointer devices (Mouse) -->
  <div class="pointer-fine:hidden p-4 h-full flex flex-col">
    {@render cardContent(false)}
  </div>

  <!-- Desktop Layout (Clickable Card) -->
  <!-- Hidden by default, visible ONLY on fine-pointer devices (Mouse) -->
  <div class="hidden pointer-fine:flex flex-col p-4 w-full h-full relative hover:bg-(--color-surface)/50 transition-colors">
    <!-- Main Stretched Link -->
    <a 
      href={url || repo} 
      target="_blank" 
      rel="noreferrer" 
      class="absolute inset-0 z-10"
      aria-label={`Visit ${name}`}
    ></a>

    {@render cardContent(true)}
  </div>
</li>

<style lang="postcss">
  @reference "tailwindcss";

  h3 {
    font-size: var(--text-card-title);
    @apply font-medium;
  }

  .content {
    @apply flex flex-row items-start justify-between gap-2 sm:flex-row sm:items-center sm:justify-between;
  }

  .rule {
    @apply text-(--text-muted);
  }
</style>
