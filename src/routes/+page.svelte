<script lang="ts">
	import { asset } from "$app/paths";

	import AboutCard from "$lib/components/card/AboutCard.svelte";
	import ProjectCard from "$lib/components/card/ProjectCard.svelte";
	import SocialCard from "$lib/components/card/SocialCard.svelte";
	import Background from "$lib/components/bg/Background.svelte";
	import ImageDispenser from "$lib/components/ImageDispenser.svelte";
	import ThemeBar from "$lib/components/bg/ThemeBar.svelte";

	const profile = {
		name: "Dennis Karnowitsch",
		title: "Aspiring Full Stack Developer",
		proficiencies: "Proficient in Python, Typescript, Svelte and C",
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
			date: new Date(2025, 9, 1) // Month is 0-indexed: 9 = October
		},
		{
			name: "LetterMaker",
			description: "Create beautiful letters with folding guides ready for printout.",
			url: "https://letter.dennisu.com",
			repo: "https://github.com/dennisu133/LetterMaker",
			date: new Date(2025, 7, 1) // 7 = August
		},
		{
			name: "CompetitiveWordle",
			description: "Wordle clone with a focus on competitive gameplay.",
			url: "https://wordle.dennisu.com",
			repo: "https://github.com/dennisu133/CompetitiveWordle",
			date: new Date(2025, 4, 1) // 4 = May
		}
	];

	const socials = [
		{
			platform: "Email",
			handle: "d@dennisu.com",
			url: "mailto:d@dennisu.com",
			icon: asset("/icons/email.svg"),
			iconDark: asset("/icons/email-dark.svg")
		},
		{
			platform: "GitHub",
			handle: "dennisu133",
			url: `https://github.com/dennisu133`,
			icon: asset("/icons/github.svg"),
			iconDark: asset("/icons/github-dark.svg")
		},
		{
			platform: "Discord",
			handle: "dennisu",
			url: "https://discord.com/users/193137218964029440",
			icon: asset("/icons/discord.svg")
		},
		{
			platform: "Steam",
			handle: "dennisuchan",
			url: "https://steamcommunity.com/id/dennisuchan/",
			icon: asset("/icons/steam.svg")
		},
		{
			platform: "Spotify",
			handle: "dennisu-chan",
			url: "https://open.spotify.com/user/dennisu-chan",
			icon: asset("/icons/spotify.svg")
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

<main class="page-shell">
	<div class="page-container">
		<header class="flex flex-wrap items-end gap-6">
			<div class="max-w-xl">
				<h1>
					{profile.name}
				</h1>
				<p class="subtitle">
					{profile.title}
				</p>
			</div>

			<div class="flex flex-col items-end text-right ml-auto">
				<ThemeBar />

				<span class="location">
					{profile.location.text}
					<address class="inline-block text-nowrap">
						<a href={profile.location.url} target="_blank" rel="noreferrer">
							{profile.location.label}
						</a>
					</address>
				</span>
			</div>
		</header>

		<div class="content-area">
			<section>
				<header class="section-header">
					<h2>About</h2>
					<span class="separator"></span>
				</header>

				{#snippet aboutText()}
					Bachelor in Computer Science. I love
					<ImageDispenser paths={programmingImages}>programming</ImageDispenser>,
					<ImageDispenser paths={musicImages}>music</ImageDispenser> and
					<ImageDispenser paths={catImages}>cats</ImageDispenser>.
				{/snippet}

				<AboutCard about={aboutText} proficiencies={profile.proficiencies} />
			</section>

			<div class="projects-socials-row">
				<section class="section-col lg:basis-2/3">
					<header class="section-header">
						<h2>Projects</h2>
						<span class="separator"></span>
					</header>
					<ul class="item-list">
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

				<section class="section-col lg:basis-1/3">
					<header class="section-header">
						<h2>Socials</h2>
						<span class="separator"></span>
					</header>
					<ul class="item-list">
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
		</div>

		<footer class="page-footer">
			<a href={siteSource} target="_blank" rel="noreferrer" class="link">View Source</a>
		</footer>
	</div>
</main>

<style lang="postcss">
	@reference "tailwindcss";
	a {
		@apply text-(--color-link)
    hover:text-(--color-link-hover) 
    focus-visible:text-(--color-link-hover)
    transition-colors duration-150 ease-linear;
	}

	h1 {
		font-size: var(--text-title);
		@apply mt-3 font-semibold leading-tight;
	}
	.subtitle {
		font-size: var(--text-subtitle);
		@apply mt-1 font-semibold leading-tight text-(--text-extra);
	}

	.location {
		@apply mt-1 text-sm text-(--text-extra) sm:mt-2 sm:text-base;
	}

	.page-shell {
		@apply relative isolate flex min-h-dvh flex-col overflow-y-auto 
    lg:h-dvh lg:overflow-hidden;
	}
	.page-container {
		--page-gap: clamp(0.75rem, 1.5dvh, 1.5rem);
		@apply flex h-full w-full flex-col max-w-6xl mx-auto px-6 sm:px-10;
		padding-block: clamp(1rem, 2dvh, 2.5rem);
	}
	.section-header {
		@apply flex items-center justify-between uppercase 
    tracking-[0.2em] text-(--text-muted);
		margin-bottom: clamp(0.5rem, 1dvh, 1rem);
	}
	.section-header .separator {
		@apply ml-4 h-px grow;
		background-color: var(--color-border);
	}

	.content-area {
		@apply flex flex-1 flex-col;
		margin-top: var(--page-gap);
		gap: var(--page-gap);
	}

	.projects-socials-row {
		@apply flex flex-col lg:flex-row lg:flex-1;
		gap: var(--page-gap);
	}

	.section-col {
		@apply flex w-full flex-col;
		gap: var(--page-gap);
	}

	.item-list {
		@apply flex flex-col;
		gap: clamp(0.5rem, 1dvh, 0.75rem);
	}

	.page-footer {
		@apply flex items-center text-xs opacity-80;
		margin-top: var(--page-gap);
	}
</style>
