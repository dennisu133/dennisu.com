<script lang="ts">
	import "./layout.css";
	import { page } from "$app/state";

	import fontGeist from "$lib/assets/fonts/GeistSans-Variable.woff2";
	import fontInstrument from "$lib/assets/fonts/InstrumentSans-Variable.woff2";
	import fontSpaceMono from "$lib/assets/fonts/SpaceMono-Regular.woff2";
	import { siteUrl } from "$lib/constants";

	let { children } = $props();

	const path = $derived(page.url.pathname);
</script>

<svelte:head>
	<!-- fonts -->
	<link rel="preload" href={fontGeist} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontInstrument} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontSpaceMono} as="font" type="font/woff2" crossorigin="anonymous" />

	<!-- default favicons -->
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260627" />
	<link rel="icon" type="image/png" href="/favicon-96x96.png?v=20260627" sizes="96x96" />
	<link rel="icon" href="/favicon.ico?v=20260627" />

	<!-- platform icons -->
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260831" />
	<link rel="manifest" href="/site.webmanifest?v=20260627" />
	<meta name="apple-mobile-web-app-title" content="dennisu.com" />

	<!-- global meta stuff -->
	<link rel="canonical" href={siteUrl + path} />
	<meta name="keywords" content="Dennis Karnowitsch, Dennisu, dennisu, dennisu133, dennisu.com" />
	<meta name="author" content="Dennis Karnowitsch" />
	<meta name="theme-color" content="#66b2ff" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl + path} />
</svelte:head>

{@render children?.()}
