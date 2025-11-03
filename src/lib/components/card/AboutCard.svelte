<!--  
  @component
  A simple boxed card for the "About" section content.
  Usage:
  <AboutCard about={profile.about} proficiencies={profile.proficiencies} class="mt-4" />
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
  let { about, proficiencies, class: className = "" } = $props();
</script>

<div class="card {className}">
  <div class="grid gap-3 text-default text-body">
    <p>{about}</p>
    <p class="text-muted">
      {proficiencies}
    </p>
  </div>
</div>
