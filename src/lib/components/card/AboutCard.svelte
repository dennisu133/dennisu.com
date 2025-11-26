<!--  
  @component
  A simple boxed card for the "About" section content.
  Usage:
  ```html
  <AboutCard
    about="I'm a software engineer with a passion for building web applications."
    proficiencies="Proficient in Python, Typescript, Svelte and C"
  />
  ``` 
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    about,
    proficiencies,
    class: className = "",
  }: {
    about: string | Snippet;
    proficiencies: string | Snippet;
    class?: string;
  } = $props();
</script>

<!-- -->
<div class="card {className}">
  <div class="grid gap-2 lg:gap-3 text-body">
    <div>
      {#if typeof about === "string"}
        {about}
      {:else}
        {@render about()}
      {/if}
    </div>
    <div class="text-(--text-muted)">
      {#if typeof proficiencies === "string"}
        {proficiencies}
      {:else}
        {@render proficiencies()}
      {/if}
    </div>
  </div>
</div>
