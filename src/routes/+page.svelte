<script lang="ts">
	import AboutCard from "$lib/components/card/AboutCard.svelte";
	import ProjectCard from "$lib/components/card/ProjectCard.svelte";
	import SocialCard from "$lib/components/card/SocialCard.svelte";
	import Background from "$lib/components/bg/Background.svelte";
	import ThemeBar from "$lib/components/bg/ThemeBar.svelte";
	import SectionHeader from "$lib/components/SectionHeader.svelte";

	import ImageDispenser from "$lib/components/ImageDispenser.svelte";

	import typescriptIcon from "$lib/assets/icons/stack/typescript.svg";
	import svelteIcon from "$lib/assets/icons/stack/svelte.svg";
	import tailwindIcon from "$lib/assets/icons/stack/tailwind.svg";
	import goIcon from "$lib/assets/icons/stack/go.svg";
	import reactIcon from "$lib/assets/icons/stack/react.svg";

	import discordIcon from "$lib/assets/icons/social/discord.svg";
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import steamIcon from "$lib/assets/icons/social/steam.svg";
	import spotifyIcon from "$lib/assets/icons/social/spotify.svg";
	import emailIcon from "$lib/assets/icons/social/email.svg";
	import emailDarkIcon from "$lib/assets/icons/social/email-dark.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";

	const profile = {
		name: "Dennis Karnowitsch",
		subtitle: "Aspiring Full Stack Developer",
		proficiencies: "Experienced in Python, Typescript, Java, Go and C.",
		location: {
			pretext: "Based in ",
			label: "Cottbus, Germany",
			url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8"
		}
	};

	const projects = [
		{
			name: "PrivateStream",
			description: "A private low-latency livestream viewer for friend groups.",
			repo: "https://github.com/dennisu133/PrivateStream",
			date: new Date(2025, 9, 1, 12), // Month is 0-indexed: 9 = October, noon to avoid timezone shifts
			stack: [typescriptIcon, svelteIcon, tailwindIcon]
		},
		{
			name: "LetterMaker",
			description: "Letter creator for the German postal system with stamp support.",
			url: "https://letter.dennisu.com",
			repo: "https://github.com/dennisu133/LetterMaker",
			date: new Date(2025, 7, 1, 12), // 7 = August, noon to avoid timezone shifts
			stack: [typescriptIcon, goIcon, reactIcon, tailwindIcon]
		},
		{
			name: "CompetitiveWordle",
			description: "Wordle clone with a focus on competitive gameplay.",
			url: "https://wordle.dennisu.com",
			repo: "https://github.com/dennisu133/CompetitiveWordle",
			date: new Date(2025, 4, 1, 12), // 4 = May, noon to avoid timezone shifts
			stack: [typescriptIcon, svelteIcon]
		}
	];

	const socials = [
		{
			platform: "Email",
			handle: "d@dennisu.com",
			url: "mailto:d@dennisu.com",
			icon: emailIcon,
			iconDark: emailDarkIcon
		},
		{
			platform: "GitHub",
			handle: "dennisu133",
			url: `https://github.com/dennisu133`,
			icon: githubIcon,
			iconDark: githubDarkIcon
		},
		{
			platform: "Discord",
			handle: "dennisu",
			url: "https://discord.com/users/193137218964029440",
			icon: discordIcon
		},
		{
			platform: "Steam",
			handle: "dennisuchan",
			url: "https://steamcommunity.com/id/dennisuchan/",
			icon: steamIcon
		},
		{
			platform: "Spotify",
			handle: "dennisu-chan",
			url: "https://open.spotify.com/user/dennisu-chan",
			icon: spotifyIcon
		}
	];

	const siteSource = "https://github.com/dennisu133/dennisu.com";

	const programmingImages = import.meta.glob("$lib/assets/images/programmingImages/*", {
		eager: true,
		query: "?url",
		import: "default"
	});
	const musicImages = import.meta.glob("$lib/assets/images/musicImages/*", {
		eager: true,
		query: "?url",
		import: "default"
	});
	const catImages = import.meta.glob("$lib/assets/images/catImages/*", {
		eager: true,
		query: "?url",
		import: "default"
	});
</script>

<Background />

{#snippet about()}
	<p aria-hidden="true">
		Bachelor in Computer Science. My interests are
		<ImageDispenser paths={programmingImages}>programming</ImageDispenser>,
		<ImageDispenser paths={musicImages}>music</ImageDispenser> and
		<ImageDispenser paths={catImages}>cats</ImageDispenser>.
	</p>

	<p class="sr-only">Bachelor in Computer Science. My interests are programming, music and cats.</p>
{/snippet}

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
		<ThemeBar />

		<div class="mt-1 text-right text-(--text-muted) sm:mt-2">
			<span>{profile.location.pretext}</span>
			<a
				class="text-link hover:text-link-hover focus-visible:text-link-hover"
				href={profile.location.url}
				target="_blank"
				rel="noreferrer"
			>
				{profile.location.label}
			</a>
		</div>
	</div>
</header>

<main class="flex flex-1 flex-col">
	<section class="mb-6 lg:mb-2" aria-labelledby="about-heading">
		<SectionHeader id="about-heading">About</SectionHeader>
		<AboutCard {about} proficiencies={profile.proficiencies} />
	</section>

	<div class="flex flex-col gap-4 lg:flex-row">
		<section class="flex-1" aria-labelledby="projects-heading">
			<SectionHeader id="projects-heading">Projects</SectionHeader>
			<ul class="flex flex-col gap-2">
				{#each projects as project}
					<ProjectCard
						name={project.name}
						description={project.description}
						url={project.url}
						repo={project.repo}
						date={project.date}
						stack={project.stack}
					/>
				{/each}
			</ul>
		</section>

		<section aria-labelledby="socials-heading">
			<SectionHeader id="socials-heading">Socials</SectionHeader>
			<ul class="flex flex-col gap-2">
				{#each socials as social}
					<SocialCard
						platform={social.platform}
						handle={social.handle}
						url={social.url}
						icon={social.icon}
						iconDark={social.iconDark}
					/>
				{/each}
			</ul>
		</section>
	</div>
</main>

<footer class="flex items-center justify-between border-t border-border py-3 text-xs">
	<a
		href={siteSource}
		target="_blank"
		rel="noreferrer"
		class="font-display tracking-wide text-link hover:text-link-hover"
	>
		View Source
	</a>
</footer>
