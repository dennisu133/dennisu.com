<script lang="ts">
	import AboutCard from "$lib/components/card/AboutCard.svelte";
	import ProjectCard from "$lib/components/card/ProjectCard.svelte";
	import SocialCard from "$lib/components/card/SocialCard.svelte";
	import Background from "$lib/components/bg/Background.svelte";
	import ThemeBar from "$lib/components/bg/ThemeBar.svelte";
	import SectionHeader from "$lib/components/SectionHeader.svelte";

	import discordIcon from "$lib/assets/icons/discord.svg";
	import githubIcon from "$lib/assets/icons/github.svg";
	import steamIcon from "$lib/assets/icons/steam.svg";
	import spotifyIcon from "$lib/assets/icons/spotify.svg";
	import emailIcon from "$lib/assets/icons/email.svg";
	import emailDarkIcon from "$lib/assets/icons/email-dark.svg";
	import githubDarkIcon from "$lib/assets/icons/github-dark.svg";

	const profile = {
		name: "Dennis Karnowitsch",
		title: "Aspiring Full Stack Developer",
		proficiencies: "Proficient in Python, Typescript, Svelte and C.",
		location: {
			text: "Based in",
			label: "Cottbus, Germany",
			url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8"
		}
	};

	const projects = [
		{
			name: "PrivateStream",
			description: "A private low-latency livestream viewer for friend groups.",
			repo: "https://github.com/dennisu133/PrivateStream",
			date: new Date(2025, 9, 1, 12) // Month is 0-indexed: 9 = October, noon to avoid timezone shifts
		},
		{
			name: "LetterMaker",
			description: "Letter creator for the German postal system with stamp support.",
			url: "https://letter.dennisu.com",
			repo: "https://github.com/dennisu133/LetterMaker",
			date: new Date(2025, 7, 1, 12) // 7 = August, noon to avoid timezone shifts
		},
		{
			name: "CompetitiveWordle",
			description: "Wordle clone with a focus on competitive gameplay.",
			url: "https://wordle.dennisu.com",
			repo: "https://github.com/dennisu133/CompetitiveWordle",
			date: new Date(2025, 4, 1, 12) // 4 = May, noon to avoid timezone shifts
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

	const aboutSegments = [
		{ text: "Bachelor in Computer Science. My interests are " },
		{ text: "programming", images: programmingImages },
		{ text: ", " },
		{ text: "music", images: musicImages },
		{ text: " and " },
		{ text: "cats", images: catImages },
		{ text: "." }
	];
</script>

<Background />

<header class="mt-6 flex min-h-40 flex-wrap sm:min-h-36">
	<hgroup class="transition-colors duration-150 ease-linear">
		<h1>
			{profile.name}
		</h1>
		<p class="text-subtitle! leading-tight font-semibold text-(--text-muted)">
			{profile.title}
		</p>
	</hgroup>

	<div class="ml-auto flex flex-col items-end self-end">
		<ThemeBar />
		<!-- TODO: there has to be a better way to do a11y -->
		<span class="mt-1 text-(--text-muted) sm:mt-2">
			<span aria-hidden="true">{profile.location.text}</span>
			<address
				class="inline-block text-nowrap"
				aria-label={`${profile.location.text} ${profile.location.label}`}
			>
				<a
					class="text-(--color-link) hover:text-(--color-link-hover) focus-visible:text-(--color-link-hover)"
					href={profile.location.url}
					target="_blank"
					rel="noreferrer"
				>
					{profile.location.label}
				</a>
			</address>
		</span>
	</div>
</header>

<main class="flex flex-1 flex-col">
	<section class="mb-6 lg:mb-2">
		<SectionHeader>About</SectionHeader>
		<AboutCard about={aboutSegments} proficiencies={profile.proficiencies} />
	</section>

	<div class="flex flex-col gap-4 lg:flex-row">
		<section class="lg:basis-2/3">
			<SectionHeader>Projects</SectionHeader>
			<ul class="flex flex-col gap-2">
				{#each projects as project}
					<ProjectCard
						name={project.name}
						description={project.description}
						url={project.url}
						repo={project.repo}
						date={project.date}
					/>
				{/each}
			</ul>
		</section>

		<section class="lg:basis-1/3">
			<SectionHeader>Socials</SectionHeader>
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

<footer class="py-4 text-xs opacity-80">
	<a
		href={siteSource}
		target="_blank"
		rel="noreferrer"
		class="text-(--color-link) hover:text-(--color-link-hover) focus-visible:text-(--color-link-hover)"
		>View Source</a
	>
</footer>
