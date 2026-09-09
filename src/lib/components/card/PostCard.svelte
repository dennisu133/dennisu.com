<script lang="ts">
	import { formatPostDate } from "$lib/blog/posts";

	let {
		slug,
		title,
		date,
		description,
		readingMinutes
	}: {
		slug: string;
		title: string;
		date: string;
		description: string;
		readingMinutes: number;
	} = $props();

	const href = $derived(`/blog/${slug}`);
</script>

<li class="glass interactive-surface group relative flex flex-col gap-2 p-4">
	<a
		{href}
		class="accent-focus absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Read {title}"
	>
	</a>

	<div class="flex items-start justify-between gap-3">
		<h3
			class="min-w-0 font-display text-xl leading-tight text-foreground/90 group-hover:text-accent-hover motion-safe:transition-colors motion-safe:duration-150"
		>
			{title}
		</h3>
		<div
			class="flex shrink-0 flex-col items-end gap-1.5 font-mono text-xs leading-none tracking-wide text-muted-foreground"
		>
			<time datetime={date}>{formatPostDate(date)}</time>
		</div>
	</div>

	<p class="text-sm leading-relaxed wrap-break-word text-muted-foreground">{description}</p>

	<a
		{href}
		class="hidden min-h-6 items-center gap-1 self-end text-sm leading-none tracking-wider text-accent uppercase pointer-coarse:inline-flex"
		aria-label="Read {title}"
	>
		Read
	</a>
</li>
