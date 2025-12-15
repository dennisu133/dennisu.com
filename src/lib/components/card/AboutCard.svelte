<!-- 
  @component
  Renders an about card with a list of about segments and a list of proficiencies.
  Usage:
  ```html
  <AboutCard about={aboutSnippet} proficiencies={profile.proficiencies} />
  ```
-->

<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		about,
		proficiencies
	}: {
		about: Snippet;
		proficiencies: string;
	} = $props();
</script>

<div class="card grid gap-2 lg:gap-3">
	{@render about?.()}

	<p class="text-(--text-muted)">
		{proficiencies}
	</p>
</div>
