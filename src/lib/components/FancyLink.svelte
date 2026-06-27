<script lang="ts">
	let {
		text,
		url,
		class: className = "",
		onclick
	}: {
		text: string;
		url: string;
		class?: string;
		onclick?: (event: MouseEvent) => void;
	} = $props();
</script>

<a
	href={url}
	target="_blank"
	rel="noreferrer"
	class="group/link relative inline-flex {className}"
	{onclick}
>
	{text}
	<span
		class="absolute bottom-0 left-0 h-px w-0 bg-link-hover transition-[width] duration-300 ease-out group-hover/link:w-full"
	></span>
</a>
