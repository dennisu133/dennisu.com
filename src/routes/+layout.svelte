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
	const altTitle = "Spicy Singles in Your Area 🌶️";
	const description = "Personal website of Dennis Karnowitsch. Please hire me.";
	let currentFrame = $state(0);
	let isVisible = $state(true);
	let showStatic = $state(true);

	onMount(() => {
		isVisible = !document.hidden;

		let timeout: ReturnType<typeof setTimeout>;

		const startAnimation = () => {
			showStatic = true;
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				if (!document.hidden) {
					showStatic = false;
				}
			}, 1000);
		};

		startAnimation();

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
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			clearInterval(interval);
			clearTimeout(timeout);
		};
	});
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" type="image/svg+xml" href={isVisible ? favicon : alticon} />

	<!-- Metadata -->
	<title>{isVisible ? (showStatic ? staticTitle : frames[currentFrame]) : altTitle}</title>
	<noscript>
		<title>{staticTitle}</title>
	</noscript>
	<meta name="description" content={description} />
	<meta name="keywords" content="Dennis Karnowitsch, Dennisu, dennisu, dennisu133, dennisu.com" />
	<meta name="author" content="Dennis Karnowitsch" />
	<meta name="theme-color" content="#66b2ff" />

	<!-- Open Graph -->
	<meta property="og:title" content={staticTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://dennisu.com" />
	<meta property="og:image" content={"/dancing.gif"} />

	<!-- Blocking script to set initial theme attribute -->
	<script>
		document.documentElement.setAttribute("theme", localStorage.getItem("theme") || "system");
		document.documentElement.setAttribute("bg", localStorage.getItem("bg") || "animated");
	</script>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
	{@render children?.()}
</div>
