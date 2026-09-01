<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	import Background from "$lib/components/Background.svelte";
	import ProjectCard from "$lib/components/card/ProjectCard.svelte";
	import EmailContact from "$lib/components/EmailContact.svelte";
	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import FancyLink from "$lib/components/FancyLink.svelte";
	import ImagePreview from "$lib/components/ImagePreview.svelte";
	import NekoChase from "$lib/components/NekoChase.svelte";
	import { siteUrl } from "$lib/constants";
	import { generateFrames } from "$lib/generateFrames";
	import { allStackIconUrls, getStackIcons } from "$lib/stackIcons";
	import { onMount } from "svelte";

	import ImageDispenser from "$lib/components/ImageDispenser.svelte";

	import discordIcon from "$lib/assets/icons/social/discord.svg";
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import steamIcon from "$lib/assets/icons/social/steam.svg";
	import spotifyIcon from "$lib/assets/icons/social/spotify.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";

	const profile = {
		name: "Dennis Karnowitsch",
		subtitle: "Full-Stack Developer",
		proficiencies: "Experienced in Python, TypeScript and Java.",
		availability: "Currently looking for a full-time software role and open to freelance projects.",
		location: {
			label: "Cottbus, Germany",
			url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8"
		}
	};

	const projects = [
		{
			name: "Jikaze",
			description: "Android Riichi Mahjong score calculator for in-person play.",
			url: "https://jikaze.app/",
			repo: "https://github.com/dennisu133/Jikaze",
			date: new Date(2026, 2, 1, 12), // 2 = March, noon to avoid timezone shifts
			stack: getStackIcons("android", "jetpackcompose", "kotlin")
		},
		{
			name: "PrivateStream",
			description: "A private low-latency livestream viewer for friend groups.",
			url: "https://kino.dennisu.com/demo",
			repo: "https://github.com/dennisu133/PrivateStream",
			date: new Date(2025, 9, 1, 12), // Month is 0-indexed: 9 = October, noon to avoid timezone shifts
			stack: getStackIcons("typescript", "svelte", "tailwind")
		},
		{
			name: "LetterMaker",
			description: "Letter creator for the German postal system with stamp support.",
			url: "https://letter.dennisu.com",
			repo: "https://github.com/dennisu133/LetterMaker",
			date: new Date(2025, 7, 1, 12), // 7 = August, noon to avoid timezone shifts
			stack: getStackIcons("typescript", "go", "react", "tailwind")
		},
		{
			name: "CompetitiveWordle",
			description: "Wordle clone with a focus on competitive gameplay.",
			disclaimer: "abandoned university project",
			url: "https://wordle.dennisu.com",
			repo: "https://github.com/dennisu133/CompetitiveWordle",
			date: new Date(2025, 4, 1, 12), // 4 = May, noon to avoid timezone shifts
			stack: getStackIcons("typescript", "svelte")
		}
	];

	const socials = [
		{
			platform: "GitHub",
			url: "https://github.com/dennisu133",
			icon: githubIcon,
			iconDark: githubDarkIcon
		},
		{
			platform: "Discord",
			url: "https://discord.com/users/193137218964029440",
			icon: discordIcon
		},
		{
			platform: "Steam",
			url: "https://steamcommunity.com/id/dennisuchan/",
			icon: steamIcon
		},
		{
			platform: "Spotify",
			url: "https://open.spotify.com/user/dennisu-chan",
			icon: spotifyIcon
		}
	];

	const frames = generateFrames();
	const altTitle = "👀";
	let currentFrame = $state(0);
	let isVisible = $state(true);
	let showStatic = $state(true);

	// Deliberately omits the email address because it would expose it in plaintext.
	const profilePageSchema = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"@id": `${siteUrl}/`,
		url: `${siteUrl}/`,
		mainEntity: {
			"@type": "Person",
			"@id": `${siteUrl}/#person`,
			name: profile.name,
			url: `${siteUrl}/`,
			jobTitle: profile.subtitle,
			address: {
				"@type": "PostalAddress",
				addressLocality: "Cottbus",
				addressCountry: "DE"
			},
			sameAs: socials.map(({ url }) => url),
			knowsAbout: ["Python", "TypeScript", "Java", "Go", "C"]
		}
	}).replace(/</g, "\\u003c");

	const siteSource = "https://github.com/dennisu133/dennisu.com";

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
	<!-- Keep the favicon override mounted so browsers observe both state changes. -->
	<title>{isVisible ? (showStatic ? "Dennisu.com 🐱" : frames[currentFrame]) : altTitle}</title>
	<link
		rel="icon"
		type="image/svg+xml"
		href={isVisible ? "/favicon.svg?v=20260627" : "/alticon.svg?v=20260831"}
	/>
	<link
		rel="icon"
		type="image/png"
		href={isVisible ? "/favicon-96x96.png?v=20260627" : "/alticon-96x96.png?v=20260831"}
		sizes="96x96"
	/>
	<link rel="icon" href={isVisible ? "/favicon.ico?v=20260627" : "/alticon.ico?v=20260831"} />

	<meta
		name="description"
		content="Personal website of Dennis Karnowitsch, full-stack developer in Cottbus, Germany."
	/>

	<meta property="og:title" content="Dennisu.com 🐱" />
	<meta property="og:description" content="Please hire me." />
	<meta property="og:image" content="{siteUrl}/og-image.gif" />
	<meta property="og:image:alt" content="Dancing anime girl" />

	<!-- twitter title, description and site fall back to Open Graph -->
	<meta name="twitter:description" content="Check out my cat!" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{siteUrl}/twitter-card.jpg" />
	<meta
		name="twitter:image:alt"
		content="Black cat named Rust with reddish-brown undertones in her fur"
	/>

	{@html `<script type="application/ld+json">${profilePageSchema}</script>`}
</svelte:head>

<div class="isolate mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
	<Background />

	<header class="mt-6 flex min-h-40 flex-wrap gap-4 sm:min-h-36">
		<div class="transition-colors duration-150 ease-linear">
			<h1>
				{profile.name}
			</h1>
			<p class="text-subtitle leading-tight font-semibold text-muted-foreground">
				{profile.subtitle}
			</p>
		</div>

		<div class="ml-auto flex flex-col items-end self-end">
			<ThemeToggle />

			<div class="mt-1 text-right text-muted-foreground sm:mt-2">
				<span>Based in </span>
				<FancyLink
					href={profile.location.url}
					target="_blank"
					rel="noreferrer"
					class="text-accent hover:text-accent-hover focus-visible:text-accent-hover"
				>
					{profile.location.label}
				</FancyLink>
			</div>
		</div>
	</header>

	<main class="flex flex-1 flex-col">
		<section class="mb-6 lg:mb-2" aria-labelledby="about-heading">
			<h2
				id="about-heading"
				class="mb-[clamp(0.5rem,1dvh,1rem)] flex items-center gap-4 py-2 tracking-[0.2em] text-muted-foreground uppercase after:h-px after:grow after:bg-border"
			>
				About
			</h2>
			<div class="card grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-5">
				<div class="grid min-w-0 gap-2">
					<p>
						Bachelor in Computer Science. My interests are
						<ImageDispenser images={allStackIconUrls}>programming</ImageDispenser>,
						<ImagePreview src="/topsters.avif" alt="A grid of my favorite albums">
							music
						</ImagePreview> and
						<NekoChase>cats</NekoChase>.
					</p>

					<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] tracking-wide text-muted-foreground">
						{profile.proficiencies}
					</p>

					<div class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>
						<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] leading-relaxed text-muted-foreground">
							{profile.availability}
						</p>
						<ArrowRight
							aria-hidden="true"
							strokeWidth={1.5}
							class="h-4 w-4 shrink-0 rotate-90 text-accent md:ml-auto md:rotate-0"
						/>
					</div>
				</div>

				<div
					class="flex min-w-0 border-t border-border/50 pt-3 md:min-w-52 md:items-center md:border-t-0 md:border-l md:pt-0 md:pl-5"
				>
					<EmailContact />
				</div>
			</div>
		</section>

		<section class="mb-6 lg:mb-0" aria-labelledby="projects-heading">
			<h2
				id="projects-heading"
				class="mb-[clamp(0.5rem,1dvh,1rem)] flex items-center gap-4 py-2 tracking-[0.2em] text-muted-foreground uppercase after:h-px after:grow after:bg-border"
			>
				Projects
			</h2>
			<ul
				class="grid grid-cols-1 gap-2 lg:grid-cols-2 [@media(min-width:80rem)_and_(max-height:48rem)]:grid-cols-4"
			>
				{#each projects as project}
					<ProjectCard {...project} />
				{/each}
			</ul>
		</section>
	</main>

	<footer class="flex items-center justify-between border-t border-border py-3 text-xs">
		<FancyLink
			href={siteSource}
			target="_blank"
			rel="noreferrer"
			class="font-mono tracking-wide text-accent hover:text-accent-hover"
		>
			View Source
		</FancyLink>

		<nav aria-label="Social links">
			<ul class="flex items-center gap-3">
				{#each socials as social}
					<li>
						<a
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class="group/social relative block rounded-sm p-1 opacity-90 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
							aria-label="Open {social.platform}"
						>
							{#if social.iconDark}
								<img
									src={social.icon}
									alt=""
									class="show-on-dark social-icon-shadow size-4 transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
								<img
									src={social.iconDark}
									alt=""
									class="show-on-light social-icon-shadow size-4 transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
							{:else}
								<img
									src={social.icon}
									alt=""
									class="social-icon-shadow size-4 transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
							{/if}
							<span
								aria-hidden="true"
								class="tooltip right-0 bottom-full mb-1.5 group-hover/social:opacity-100 group-focus-visible/social:opacity-100"
							>
								{social.platform}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</footer>
</div>

<style>
	.social-icon-shadow {
		filter: drop-shadow(0 0 0.7px light-dark(rgb(15 23 42 / 0.75), transparent))
			drop-shadow(0 1px 0.5px light-dark(rgb(15 23 42 / 0.75), transparent));
	}
</style>
