<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import favicon from "$lib/assets/favicon.svg";
	import alticon from "$lib/assets/alticon.svg";

	let { children } = $props();

	/**
	 * Generates an array of strings by replacing each character in the given name
	 * with the specified emoji, animating through each position, then reverses all but
	 * the first and last frames for a seamless loop.
	 *
	 * @param name The string to animate. Default: "Dennisu"
	 * @param emoji The emoji to insert in place of each char. Default: "🐈"
	 * @returns Array of animated strings with emoji inserted at each position.
	 */
	function generateFrames(name: string = "Dennisu", emoji: string = "🐈") {
		const frames: string[] = [];
		for (let i = 0; i < name.length; i++) {
			const frame = name.slice(0, i) + emoji + name.slice(i + 1);
			frames.push(frame);
		}
		return [...frames, ...frames.slice(1, -1).reverse()];
	}

	const frames = generateFrames();
	const altTitle = "Spicy Singles in Your Area 🌶️";
	const description = "Personal website of Dennis Karnowitsch. Please hire me.";
	let currentFrame = $state(0);
	let isVisible = $state(true);

	onMount(() => {
		isVisible = !document.hidden;

		const handleVisibilityChange = () => {
			isVisible = !document.hidden;
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Animate title when visible
		const interval = setInterval(() => {
			if (isVisible) {
				currentFrame = (currentFrame + 1) % frames.length;
			}
		}, 400);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href={isVisible ? favicon : alticon} />

	<!-- Metadata -->
	<title>{isVisible ? frames[currentFrame] : altTitle}</title>
	<noscript>
		<title>Dennisu.com 🐱</title>
	</noscript>
	<meta name="description" content={description} />
	<meta name="keywords" content="Dennis Karnowitsch, Dennisu, dennisu, dennisu133, dennisu.com" />
	<meta name="author" content="Dennis Karnowitsch" />
	<meta name="theme-color" content="#66b2ff" />

	<!-- Open Graph -->
	<meta property="og:title" content="🐱 Dennisu.com 🐱" />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://dennisu.com" />
	<meta property="og:image" content={"/dancing.gif"} />

	<!-- Blocking script to set initial theme attribute -->
	<script>
		const storedTheme = localStorage.getItem("theme");
		document.documentElement.setAttribute("theme", storedTheme || "system");
		const storedBg = localStorage.getItem("bg");
		document.documentElement.setAttribute("bg", storedBg || "animated");
	</script>
</svelte:head>

<div class="flex flex-col min-h-screen max-w-6xl px-6 mx-auto sm:px-10">
	{@render children?.()}
</div>
