<script lang="ts">
	import "./layout.css";
	import { page } from "$app/state";

	import fontDMSerifDisplay from "$lib/assets/fonts/dm-serif-display-400.woff2";
	import fontGeist from "$lib/assets/fonts/geist-400-700.woff2";
	import fontCommitMono from "$lib/assets/fonts/commit-mono-400.woff2";
	import { PUBLIC_SITE_ORIGIN } from "$env/static/public";

	let { children } = $props();

	const path = $derived(page.url.pathname);
</script>

<svelte:head>
	<!-- fonts -->
	<!-- prettier-ignore -->
	<link rel="preload" href={fontDMSerifDisplay} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontGeist} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontCommitMono} as="font" type="font/woff2" crossorigin="anonymous" />

	<!-- default favicons -->
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260627" />
	<link rel="icon" type="image/png" href="/favicon-96x96.png?v=20260627" sizes="96x96" />
	<link rel="icon" href="/favicon.ico?v=20260627" />

	<!-- platform icons -->
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260831" />
	<link rel="manifest" href="/site.webmanifest?v=20260627" />
	<meta name="apple-mobile-web-app-title" content="Dennis K" />

	<!-- global meta stuff -->
	<link rel="canonical" href={PUBLIC_SITE_ORIGIN + path} />
	<meta name="author" content="Dennis Karnowitsch" />
	<meta name="theme-color" content="#66b2ff" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={PUBLIC_SITE_ORIGIN + path} />
</svelte:head>

{@render children?.()}
