<script lang="ts">
	import "$lib/blog/code.css";
	import { PUBLIC_SITE_ORIGIN } from "$env/static/public";
	import { copyCode } from "$lib/blog/copy-code";
	import { resolve } from "$app/paths";
	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import { formatPostDate } from "$lib/blog/posts";
	import type { PageData } from "./$types";
	import { iconButtonClass } from "$lib/components/IconButton.svelte";
	import FancyLink from "$lib/components/FancyLink.svelte";
	import { House } from "@lucide/svelte";
	import TableOfContents from "./TableOfContents.svelte";

	let { data }: { data: PageData } = $props();
	let article = $state<HTMLElement>();
	const socialImage = $derived(`${PUBLIC_SITE_ORIGIN}/blog/${data.post.slug}/og.png`);
	const postSource = $derived(
		`https://github.com/dennisu133/dennisu.com/tree/main/src/lib/blog/posts/${data.post.slug}`
	);
</script>

<svelte:head>
	<title>{data.post.title} | Dennis Karnowitsch</title>
	<meta name="description" content={data.post.description} />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.description} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content={data.post.title} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.description} />
	<meta name="twitter:image" content={socialImage} />
	<meta name="twitter:image:alt" content={data.post.title} />
</svelte:head>

<div class="isolate mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
	<header class="mt-6 flex min-h-40 flex-wrap gap-4 sm:min-h-36">
		<div class="max-w-4xl min-w-0">
			<h1 class="wrap-break-word">{data.post.title}</h1>
			<p
				class="flex flex-wrap gap-x-2 gap-y-1 text-h3 leading-tight font-semibold text-muted-foreground"
			>
				<time datetime={data.post.date}>{formatPostDate(data.post.date)}</time>
				<span class="w-px bg-border/80" aria-hidden="true"></span>
				<span class="text-muted-foreground/80">{data.post.readingMinutes} min read</span>
			</p>
		</div>

		<!-- mb matches the "Based in" line under the home page toggle so both toggles line up. -->
		<div class="mb-7 ml-auto flex items-center gap-2 self-end sm:mb-8">
			<a href={resolve("/")} aria-label="Home" class={[iconButtonClass, "relative inline-flex"]}>
				<House size={20} aria-hidden="true" />
				<span
					aria-hidden="true"
					class="tooltip right-0 bottom-full mb-1.5 group-hover/icon-button:opacity-100 group-focus-visible/icon-button:opacity-100"
				>
					Home
				</span>
			</a>
			<ThemeToggle />
		</div>
	</header>
	<main class="mb-6 grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
		<article bind:this={article} class="glass max-w-4xl min-w-0 p-6 sm:p-10">
			<p class="mb-8 border-b border-border pb-6 text-muted-foreground">{data.post.description}</p>
			<div
				{@attach copyCode}
				class="min-w-0 leading-relaxed wrap-break-word [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-accent-hover [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:font-mono [&_code]:text-[clamp(0.75rem,1.5vw,0.875rem)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mt-6 [&_h4]:font-semibold [&_hr]:my-8 [&_hr]:border-border [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_pre]:my-6 [&_pre]:thin-scrollbar [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:p-4 [&_table]:my-6 [&_table]:block [&_table]:thin-scrollbar [&_table]:overflow-x-auto [&_td]:border [&_td]:border-border [&_td]:p-3 [&_th]:border [&_th]:border-border [&_th]:p-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
			>
				<data.Content />
			</div>
		</article>
		{#if article}
			<aside
				class="sticky top-6 hidden max-h-[calc(100dvh-3rem)] thin-scrollbar overflow-y-auto lg:block"
			>
				<TableOfContents {article} />
			</aside>
		{/if}
	</main>

	<footer class="border-t border-border py-3 text-xs">
		<nav class="flex items-center gap-3">
			<FancyLink
				href={resolve("/")}
				class="font-mono tracking-wide text-accent hover:text-accent-hover"
			>
				Home
			</FancyLink>

			<span class="h-3 w-px bg-border/80" aria-hidden="true"></span>

			<FancyLink
				href={postSource}
				target="_blank"
				rel="noreferrer"
				class="font-mono tracking-wide text-accent hover:text-accent-hover"
			>
				Source Code
			</FancyLink>
		</nav>
	</footer>
</div>
