<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Cloud, CloudOff } from "@lucide/svelte";

  import AboutCard from "$lib/components/card/AboutCard.svelte";
  import ProjectCard from "$lib/components/card/ProjectCard.svelte";
  import SocialCard from "$lib/components/card/SocialCard.svelte";
  import Background from "$lib/components/bg/Background.svelte";

  import emailIcon from "$lib/assets/email.svg";
  import githubIcon from "$lib/assets/github.svg";
  import discordIcon from "$lib/assets/discord.svg";
  import steamIcon from "$lib/assets/steam.svg";
  import spotifyIcon from "$lib/assets/spotify.svg";

  let animated = true;

  function toggleBackground() {
    animated = !animated;
    try {
      localStorage.setItem("bgAnimated", String(animated));
    } catch (e) {}
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem("bgAnimated");
      if (saved !== null) {
        animated = saved === "true";
      }
    } catch (e) {}
  });

  const profile = {
    name: "Dennis Karnowitsch",
    title: "Aspiring Full Stack Developer",
    about: "Bachelor in Computer Science. I love programming, music and cats.",
    proficiencies: "Proficient in Python, Typescript, Svelte and C",
    location: {
      text: "Based in",
      label: "Cottbus, Germany",
      url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8",
    },
  };

  const projects = [
    {
      name: "LetterMaker",
      description:
        "Create beautiful letters with folding guides ready for printout.",
      url: "https://letter.dennisu.com",
      repo: "https://github.com/dennisu133/LetterMaker",
    },
    {
      name: "CompetitiveWordle",
      description: "Wordle clone with a focus on competitive gameplay.",
      url: "https://wordle.dennisu.com",
      repo: "https://github.com/dennisu133/CompetitiveWordle",
    },
    {
      name: "PrivateStream",
      description: "A private low-latency livestream viewer for friend groups.",
      repo: "https://github.com/dennisu133/PrivateStream",
    },
  ];

  const socials = [
    {
      platform: "Email",
      handle: "d@dennisu.com",
      url: "mailto:d@dennisu.com",
      icon: emailIcon,
    },
    {
      platform: "GitHub",
      handle: "dennisu133",
      url: `https://github.com/dennisu133`,
      icon: githubIcon,
    },
    {
      platform: "Discord",
      handle: "dennisu",
      url: "https://discord.com/users/193137218964029440",
      icon: discordIcon,
    },
    {
      platform: "Steam",
      handle: "dennisuchan",
      url: "https://steamcommunity.com/id/dennisuchan/",
      icon: steamIcon,
    },
    {
      platform: "Spotify",
      handle: "dennisu-chan",
      url: "https://open.spotify.com/user/dennisu-chan",
      icon: spotifyIcon,
    },
  ];

  const siteSource = "https://github.com/dennisu133/dennisu.com";
</script>

<main class="page-shell">
  {#if animated}
    <div
      class="absolute inset-0 -z-10 pointer-events-none"
      in:fade={{ duration: 300 }}
      out:fade={{ duration: 300 }}
    >
      <Background />
    </div>
  {/if}

  <div class="page-container">
    <header class="flex flex-wrap items-end gap-6">
      <div class="max-w-xl">
        <h1 class="mt-3 text-title">
          {profile.name}
        </h1>
        <p class="mt-1 text-subtitle">
          {profile.title}
        </p>
      </div>

      <div class="flex flex-col items-end text-right text-small ml-auto">
        <div class="relative group">
          <button
            type="button"
            class="bg-toggle-button"
            onclick={toggleBackground}
            aria-label={animated
              ? "Disable animated background"
              : "Enable animated background"}
            aria-describedby="bg-toggle-tooltip"
          >
            {#if animated}
              <CloudOff size={30} />
            {:else}
              <Cloud size={30} />
            {/if}
          </button>
          <span id="bg-toggle-tooltip" role="tooltip" class="bg-toggle-tooltip">
            {animated
              ? "Disable animated background"
              : "Enable animated background"}
          </span>
        </div>

        <span class="text-subtle">
          {profile.location.text}
          <a
            href={profile.location.url}
            target="_blank"
            rel="noreferrer"
            class="link">{profile.location.label}</a
          >
        </span>
      </div>
    </header>

    <div class="mt-6 flex flex-1 flex-col gap-6">
      <section>
        <header class="section-header sm:mb-4">
          <span>About</span>
          <span class="rule"></span>
        </header>

        <AboutCard
          about={profile.about}
          proficiencies={profile.proficiencies}
          class="mt-4"
        />
      </section>

      <div class="flex flex-col gap-5 lg:flex-row lg:flex-1">
        <section class="flex w-full flex-col gap-4 lg:flex-1">
          <header class="section-header sm:mb-4">
            <span>Projects</span>
            <span class="rule"></span>
          </header>
          <ul class="flex flex-col gap-3 text-body">
            {#each projects as project}
              <ProjectCard
                name={project.name}
                description={project.description}
                url={project.url}
                repo={project.repo}
              />
            {/each}
          </ul>
        </section>

        <section class="flex w-full flex-col gap-4 lg:flex-1">
          <header class="section-header sm:mb-4">
            <span>Socials</span>
            <span class="rule"></span>
          </header>
          <ul class="grid gap-3 text-body">
            {#each socials as social}
              <SocialCard
                platform={social.platform}
                handle={social.handle}
                url={social.url}
                icon={social.icon}
              />
            {/each}
          </ul>
        </section>
      </div>
    </div>

    <footer class="mt-6 flex items-center text-small opacity-80">
      <a href={siteSource} target="_blank" rel="noreferrer" class="link"
        >View Source</a
      >
    </footer>
  </div>
</main>

<style lang="postcss">
  @reference "tailwindcss";

  .page-shell {
    @apply relative isolate flex min-h-dvh flex-col overflow-y-auto lg:h-dvh lg:overflow-hidden;
  }
  .page-container {
    @apply flex h-full w-full flex-col max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-8 lg:py-10;
  }
  .bg-toggle-button {
    @apply inline-flex items-center p-2 text-slate-400 hover:text-slate-300 transition-colors duration-150 focus:outline-none;
  }
  .bg-toggle-tooltip {
    @apply text-(--text) absolute right-0 top-full mt-2 border bg-black/90 px-2 py-1 text-left opacity-0 pointer-events-none transition-opacity duration-150 ease-linear group-hover:opacity-100;
    border-color: var(--color-border);
  }
  .section-header {
    @apply flex items-center justify-between mb-3 uppercase tracking-[0.35em] text-(--text-kicker);
  }
  .section-header .rule {
    @apply ml-4 h-px grow;
    background-color: var(--color-border);
  }
</style>
