<!--  
  @component
  A simple boxed card for the "About" section content.
  Usage:
  <AboutCard about={profile.about} proficiencies={profile.proficiencies} class="mt-4" />
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

<div class="card {className}">
  <div class="grid gap-3 text-body">
    <div>
      {#if typeof about === "string"}
        {about}
      {:else}
        {@render about()}
      {/if}
    </div>
    <div>
      {#if typeof proficiencies === "string"}
        {proficiencies}
      {:else}
        {@render proficiencies()}
      {/if}
    </div>
  </div>
</div>
