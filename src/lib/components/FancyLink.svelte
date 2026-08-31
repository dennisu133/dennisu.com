<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let { children, class: className, ...rest }: HTMLAnchorAttributes = $props();
</script>

<a {...rest} class={["group/link relative inline-flex", className]}>
	{@render children?.()}
	<span
		aria-hidden="true"
		class="absolute bottom-0 left-0 h-px w-0 bg-accent-hover transition-[width] duration-300 ease-out group-hover/link:w-full"
	></span>
</a>
