<script lang="ts">
	let {
		text,
		url,
		class: className = ""
	}: {
		text: string;
		url: string;
		class?: string;
	} = $props();
</script>

<a
	href={url}
	target="_blank"
	rel="noreferrer"
	class="group/link text-link group-hover:text-link-hover hover:text-link-hover pointer-events-auto relative z-20 tracking-[0.06em] {className}"
>
	{text}
	<span
		class="bg-link-hover absolute bottom-0 left-0 h-px w-0 transition-[width] duration-300 ease-out group-hover/link:w-full"
	></span>
</a>
