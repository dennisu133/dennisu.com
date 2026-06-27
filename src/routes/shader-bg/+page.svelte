<script lang="ts">
	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import ShaderBackground from "./ShaderBackground.svelte";
</script>

<svelte:head>
	<title>Shader Background | Dennisu.com</title>
	<meta
		name="description"
		content="An archived interactive demo of the animated shader background from dennisu.com."
	/>
</svelte:head>

<ShaderBackground />

<main class="relative z-10 min-h-svh">
	<h1 class="sr-only">Shader background demo</h1>
	<div class="fixed top-4 right-4">
		<ThemeToggle />
	</div>
</main>
