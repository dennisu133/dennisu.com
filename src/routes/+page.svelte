<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	import Background from "$lib/components/Background.svelte";
	import ProjectCard from "$lib/components/card/ProjectCard.svelte";
	import EmailContact from "$lib/components/EmailContact.svelte";
	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import FancyLink from "$lib/components/FancyLink.svelte";
	import ImagePreview from "$lib/components/ImagePreview.svelte";
	import NekoChase from "$lib/components/NekoChase.svelte";
	import { allStackIconUrls, getStackIcons } from "$lib/stackIcons";

	import ImageDispenser from "$lib/components/ImageDispenser.svelte";

	import discordIcon from "$lib/assets/icons/social/discord.svg";
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import steamIcon from "$lib/assets/icons/social/steam.svg";
	import spotifyIcon from "$lib/assets/icons/social/spotify.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";

	const profile = {
		name: "Dennis Karnowitsch",
		subtitle: "Full-Stack Developer",
		proficiencies: "Experienced in Python, TypeScript, Java, Go and C.",
		availability: "Currently looking for a full-time software role and open to freelance projects.",
		location: {
			label: "Cottbus, Germany",
			url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8"
		}
	};

	const projects = [
		{
			name: "RiichiCalc",
			description: "A Riichi Mahjong scoring companion for real-life play.",
			url: "https://riichi.dennisu.com/",
			repo: "https://github.com/dennisu133/RiichiCalc",
			date: new Date(2026, 2, 1, 12), // 2 = March, noon to avoid timezone shifts
			stack: getStackIcons("android", "kotlin")
		},
		{
			name: "PrivateStream",
			description: "A private low-latency livestream viewer for friend groups.",
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
			disclaimer: "Early university project",
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

	const siteSource = "https://github.com/dennisu133/dennisu.com";
</script>

<Background />

<div class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
	<header class="mt-6 flex min-h-40 flex-wrap gap-4 sm:min-h-36">
		<div class="transition-colors duration-150 ease-linear">
			<h1>
				{profile.name}
			</h1>
			<p class="text-subtitle! leading-tight font-semibold text-(--text-muted)">
				{profile.subtitle}
			</p>
		</div>

		<div class="ml-auto flex flex-col items-end self-end">
			<ThemeToggle />

			<div class="mt-1 text-right text-(--text-muted) sm:mt-2">
				<span>Based in </span>
				<FancyLink
					text={profile.location.label}
					url={profile.location.url}
					class="text-link hover:text-link-hover focus-visible:text-link-hover"
				/>
			</div>
		</div>
	</header>

	<main class="flex flex-1 flex-col">
		<section class="mb-6 lg:mb-2" aria-labelledby="about-heading">
			<h2 id="about-heading" class="section-heading">About</h2>
			<div
				class="card grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch md:gap-5"
			>
				<div class="grid min-w-0 gap-2">
					<p class="text-(--text)">
						Bachelor in Computer Science. My interests are
						<ImageDispenser images={allStackIconUrls}>programming</ImageDispenser>,
						<ImagePreview src="/topsters.webp" alt="A Topsters chart of Dennis's favorite albums">
							music
						</ImagePreview> and
						<NekoChase>cats</NekoChase>.
					</p>

					<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] tracking-wide text-(--text-muted)">
						{profile.proficiencies}
					</p>

					<div class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-link" aria-hidden="true"></span>
						<p class="text-[clamp(0.75rem,1.5vw,0.9rem)] leading-relaxed text-(--text-muted)">
							{profile.availability}
						</p>
						<ArrowRight
							aria-hidden="true"
							strokeWidth={1.5}
							class="h-4 w-4 shrink-0 rotate-90 text-link md:ml-auto md:rotate-0"
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
			<h2 id="projects-heading" class="section-heading">Projects</h2>
			<ul class="projects-grid grid grid-cols-1 gap-2 lg:grid-cols-2">
				{#each projects as project}
					<ProjectCard {...project} />
				{/each}
			</ul>
		</section>
	</main>

	<footer class="flex items-center justify-between border-t border-border py-3 text-xs">
		<FancyLink
			text="View Source"
			url={siteSource}
			class="font-display tracking-wide text-link hover:text-link-hover"
		/>

		<nav aria-label="Social links">
			<ul class="flex items-center gap-3">
				{#each socials as social}
					<li>
						<a
							href={social.url}
							target="_blank"
							rel="noreferrer"
							class="group/social block rounded-sm p-1 opacity-90 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
							aria-label="Open {social.platform}"
							title={social.platform}
						>
							{#if social.iconDark}
								<img
									src={social.icon}
									alt=""
									class="social-icon show-on-dark h-[1.1rem] w-[1.1rem] transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
								<img
									src={social.iconDark}
									alt=""
									class="social-icon show-on-light h-[1.1rem] w-[1.1rem] transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
							{:else}
								<img
									src={social.icon}
									alt=""
									class="social-icon h-[1.1rem] w-[1.1rem] transition-transform duration-150 group-hover/social:-translate-y-0.5"
								/>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</footer>
</div>

<style>
	.social-icon {
		filter: drop-shadow(0 0 0.7px var(--social-icon-shadow))
			drop-shadow(0 1px 0.5px var(--social-icon-shadow));
	}

	@media (min-width: 80rem) and (max-height: 48rem) {
		.projects-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
