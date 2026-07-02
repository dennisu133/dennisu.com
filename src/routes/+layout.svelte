<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";

	import fontGeist from "$lib/assets/fonts/GeistSans-Variable.woff2";
	import fontInstrument from "$lib/assets/fonts/InstrumentSans-Variable.woff2";
	import fontSpaceMono from "$lib/assets/fonts/SpaceMono-Regular.woff2";

	let { children } = $props();

	/**
	 * Generates an array of strings by replacing each character in the given name
	 * with the specified emoji, animating through each position, then reverses all but
	 * the first and last frames for a seamless loop.
	 *
	 * @param name The string to animate. Default: "Welcome!"
	 * @param emoji The emoji to insert in place of each char. Default: "🐈"
	 * @returns Array of animated strings with emoji inserted at each position.
	 */
	function generateFrames(name: string = "Welcome!", emoji: string = "🐈") {
		const frames: string[] = [];
		for (let i = 0; i < name.length; i++) {
			const frame = name.slice(0, i) + emoji + name.slice(i + 1);
			frames.push(frame);
		}
		return [...frames, ...frames.slice(1, -1).reverse()];
	}

	const frames = generateFrames();
	const staticTitle = "Dennisu.com 🐱";
	const altTitle = "👀";
	const description = "Personal website of Dennis Karnowitsch. Please hire me.";
	const siteUrl = "https://dennisu.com";
	let currentFrame = $state(0);
	let isVisible = $state(true);
	let showStatic = $state(true);

	onMount(() => {
		isVisible = !document.hidden;

		let timeout: ReturnType<typeof setTimeout>;
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		const startAnimation = () => {
			showStatic = true;
			clearTimeout(timeout);
			if (motionQuery.matches) return;
			timeout = setTimeout(() => {
				if (!document.hidden) {
					showStatic = false;
				}
			}, 1000);
		};

		startAnimation();
		motionQuery.addEventListener("change", startAnimation);

		const handleVisibilityChange = () => {
			isVisible = !document.hidden;
			if (isVisible) {
				startAnimation();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Animate title when visible
		const interval = setInterval(() => {
			if (isVisible && !showStatic) {
				currentFrame = (currentFrame + 1) % frames.length;
			}
		}, 400);

		return () => {
			motionQuery.removeEventListener("change", startAnimation);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			clearInterval(interval);
			clearTimeout(timeout);
		};
	});
</script>

<svelte:head>
	<!-- Preload fonts to avoid FOUC on first load -->
	<link rel="preload" href={fontGeist} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontInstrument} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={fontSpaceMono} as="font" type="font/woff2" crossorigin="anonymous" />

	<!-- Switch favicon when the page gains or loses focus -->
	<link
		rel="icon"
		type="image/svg+xml"
		href={isVisible ? "/favicon.svg?v=20260627" : "/alticon.svg?v=20260627"}
	/>
	<link
		rel="icon"
		type="image/png"
		href={isVisible ? "/favicon-96x96.png?v=20260627" : "/alticon-96x96.png?v=20260627"}
		sizes="96x96"
	/>
	<link rel="icon" href={isVisible ? "/favicon.ico?v=20260627" : "/alticon.ico?v=20260627"} />

	<!-- Platform icons -->
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260627" />
	<meta name="apple-mobile-web-app-title" content="dennisu.com" />
	<link rel="manifest" href="/site.webmanifest?v=20260627" />

	<!-- Metadata -->
	<title>{isVisible ? (showStatic ? staticTitle : frames[currentFrame]) : altTitle}</title>

	<meta name="description" content={description} />
	<meta name="keywords" content="Dennis Karnowitsch, Dennisu, dennisu, dennisu133, dennisu.com" />
	<meta name="author" content="Dennis Karnowitsch" />
	<meta name="theme-color" content="#66b2ff" />

	<!-- Open Graph -->
	<meta property="og:title" content={staticTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:image" content="{siteUrl}/dancing.gif" />
	<meta property="og:image:alt" content="Dancing anime girl" />

	<!-- X / Twitter card (title, description and site fall back to Open Graph) -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{siteUrl}/Twitter.webp" />
	<meta name="twitter:image:alt" content="Rust, a black cat with green eyes, lying on the floor" />
</svelte:head>

{@render children?.()}
