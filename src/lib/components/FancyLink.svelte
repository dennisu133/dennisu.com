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
	class="group/link pointer-events-auto relative z-20 inline-flex items-center text-[clamp(0.8rem,2.4vw,1rem)] leading-none tracking-[0.06em] text-link uppercase group-hover:text-link-hover hover:text-link-hover {className}"
>
	{text}
	<span
		class="absolute bottom-0 left-0 h-px w-0 bg-link-hover transition-[width] duration-300 ease-out group-hover/link:w-full"
	></span>
</a>
