<script lang="ts">
	let { children, margin = "mb-[clamp(0.5rem,1dvh,1rem)]" } = $props();
</script>

<header class="flex items-center py-2 uppercase tracking-[0.2em] text-(--text-muted) {margin}">
	<h2>
		{@render children?.()}
	</h2>
	<span class="ml-4 h-px grow bg-(--color-border)"></span>
</header>
