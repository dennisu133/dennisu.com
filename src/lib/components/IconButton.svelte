<script module lang="ts">
	export const iconButtonClass =
		"glass interactive-surface group/icon-button items-center justify-center rounded-xs p-2 text-muted-foreground hover:text-foreground focus-visible:text-foreground";
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		label,
		tooltip = label,
		children,
		class: className,
		type = "button",
		...rest
	}: Omit<HTMLButtonAttributes, "aria-label"> & {
		label: string;
		tooltip?: string | Snippet | false;
	} = $props();
</script>

<button
	{...rest}
	{type}
	aria-label={label}
	class={[iconButtonClass, "relative inline-flex", className]}
>
	{@render children?.()}
	{#if tooltip}
		<span
			aria-hidden="true"
			class="tooltip right-0 bottom-full mb-1.5 group-hover/icon-button:opacity-100 group-focus-visible/icon-button:opacity-100"
		>
			{#if typeof tooltip === "string"}{tooltip}{:else}{@render tooltip()}{/if}
		</span>
	{/if}
</button>
