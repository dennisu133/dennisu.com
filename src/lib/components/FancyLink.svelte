<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let { children, class: className, ...rest }: HTMLAnchorAttributes = $props();
</script>

<a {...rest} class={["accent-focus group/link relative inline-flex", className]}>
	{@render children?.()}
	<span
		aria-hidden="true"
		class="absolute bottom-0 left-0 h-px w-0 bg-accent-hover group-hover/link:w-full motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
	></span>
</a>
