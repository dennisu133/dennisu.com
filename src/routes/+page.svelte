<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { asset } from "$app/paths";
  import { Cloud, CloudOff, Moon, Sun } from "@lucide/svelte";
  import { themeState, toggleTheme } from "$lib/theme.svelte";

  import AboutCard from "$lib/components/card/AboutCard.svelte";
  import ProjectCard from "$lib/components/card/ProjectCard.svelte";
  import SocialCard from "$lib/components/card/SocialCard.svelte";
  import Background from "$lib/components/bg/Background.svelte";
  import ImageDispenser from "$lib/components/ImageDispenser.svelte";

  let animated = $state(true);

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
    proficiencies: "Proficient in Python, Typescript, Svelte and C",
    location: {
      text: "Based in",
      label: "Cottbus, Germany",
      url: "https://maps.app.goo.gl/ebTN6YrvRcUfa5cX8",
    },
  };

  const projects = [
    {
      name: "PrivateStream",
      description: "A private low-latency livestream viewer for friend groups.",
      repo: "https://github.com/dennisu133/PrivateStream",
      date: "10/2025",
    },
    {
      name: "LetterMaker",
      description:
        "Create beautiful letters with folding guides ready for printout.",
      url: "https://letter.dennisu.com",
      repo: "https://github.com/dennisu133/LetterMaker",
      date: "08/2025",
    },
    {
      name: "CompetitiveWordle",
      description: "Wordle clone with a focus on competitive gameplay.",
      url: "https://wordle.dennisu.com",
      repo: "https://github.com/dennisu133/CompetitiveWordle",
      date: "05/2025",
    },
  ];

  const socials = [
    {
      platform: "Email",
      handle: "d@dennisu.com",
      url: "mailto:d@dennisu.com",
      icon: asset("/icons/email.svg"),
      iconDark: asset("/icons/email-dark.svg"),
    },
    {
      platform: "GitHub",
      handle: "dennisu133",
      url: `https://github.com/dennisu133`,
      icon: asset("/icons/github.svg"),
      iconDark: asset("/icons/github-dark.svg"),
    },
    {
      platform: "Discord",
      handle: "dennisu",
      url: "https://discord.com/users/193137218964029440",
      icon: asset("/icons/discord.svg"),
    },
    {
      platform: "Steam",
      handle: "dennisuchan",
      url: "https://steamcommunity.com/id/dennisuchan/",
      icon: asset("/icons/steam.svg"),
    },
    {
      platform: "Spotify",
      handle: "dennisu-chan",
      url: "https://open.spotify.com/user/dennisu-chan",
      icon: asset("/icons/spotify.svg"),
    },
  ];

  const siteSource = "https://github.com/dennisu133/dennisu.com";
  const programmingImages = import.meta.glob(
    "$lib/assets/images/programmingImages/*",
    {
      eager: true,
      query: "?url",
      import: "default",
    },
  );
  const musicImages = import.meta.glob("$lib/assets/images/musicImages/*", {
    eager: true,
    query: "?url",
    import: "default",
  });
  const catImages = import.meta.glob("$lib/assets/images/catImages/*", {
    eager: true,
    query: "?url",
    import: "default",
  });
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
        <h1>
          {profile.name}
        </h1>
        <p class="subtitle">
          {profile.title}
        </p>
      </div>

      <div class="flex flex-col items-end text-right ml-auto">
        <div class="flex items-center gap-2">
          <!-- Theme Toggle -->
          <div class="relative group">
            <button
              type="button"
              class="bg-toggle-button"
              onclick={toggleTheme}
              aria-label={themeState.mode === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"}
            >
              {#if themeState.mode === "dark"}
                <Moon size={30} />
              {:else}
                <Sun size={30} />
              {/if}
            </button>
            <span role="tooltip" class="bg-toggle-tooltip">
              {themeState.mode === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </div>

          <!-- Background Toggle -->
          <div class="relative group">
            <button
              type="button"
              class="bg-toggle-button"
              onclick={toggleBackground}
              aria-label={animated
                ? "Disable animated background"
                : "Enable animated background"}
            >
              {#if animated}
                <CloudOff size={30} />
              {:else}
                <Cloud size={30} />
              {/if}
            </button>
            <span role="tooltip" class="bg-toggle-tooltip">
              {animated ? "Static Background" : "Animated Background"}
            </span>
          </div>
        </div>

        <span class="location">
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
          <span class="separator"></span>
        </header>

        {#snippet aboutText()}
          Bachelor in Computer Science. I love
          <ImageDispenser paths={programmingImages}>programming</ImageDispenser
          >,
          <ImageDispenser paths={musicImages}>music</ImageDispenser> and
          <ImageDispenser paths={catImages}>cats</ImageDispenser>.
        {/snippet}

        <AboutCard
          about={aboutText}
          proficiencies={profile.proficiencies}
          class="mt-4"
        />
      </section>

      <div class="flex flex-col gap-5 lg:flex-row lg:flex-1">
        <section class="flex w-full flex-col gap-4 lg:flex-1">
          <header class="section-header sm:mb-4">
            <span>Projects</span>
            <span class="separator"></span>
          </header>
          <ul class="flex flex-col gap-3 text-body">
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

        <section class="flex w-full flex-col gap-4 lg:flex-1">
          <header class="section-header sm:mb-4">
            <span>Socials</span>
            <span class="separator"></span>
          </header>
          <ul class="grid gap-3 text-body">
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

    <footer class="mt-6 flex items-center text-small opacity-80">
      <a href={siteSource} target="_blank" rel="noreferrer" class="link"
        >View Source</a
      >
    </footer>
  </div>
</main>

<style lang="postcss">
  @reference "tailwindcss";

  h1 {
    font-size: var(--text-title);
    @apply mt-3 font-semibold leading-tight;
  }
  .subtitle {
    font-size: var(--text-subtitle);
    @apply mt-1 font-semibold leading-tight text-(--text-extra);
  }

  .location {
    @apply mt-2 text-(--text-extra);
  }

  .page-shell {
    @apply relative isolate flex min-h-dvh flex-col overflow-y-auto lg:h-dvh lg:overflow-hidden;
  }
  .page-container {
    @apply flex h-full w-full flex-col max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-8 lg:py-10;
  }
  .bg-toggle-button {
    @apply inline-flex items-center p-2 text-(--text-muted) hover:text-(--text) transition-colors duration-150 focus:outline-none cursor-pointer;
  }
  .bg-toggle-tooltip {
    @apply text-(--text) absolute right-0 top-full mt-2 border bg-(--color-surface) backdrop-blur-md shadow-sm px-2 py-1 text-left opacity-0 pointer-events-none transition-opacity duration-150 ease-linear group-hover:opacity-100 min-w-max z-10 rounded-sm text-xs;
    border-color: var(--color-border);
  }
  .section-header {
    @apply flex items-center justify-between mb-3 uppercase tracking-[0.35em] text-(--text-kicker);
  }
  .section-header .separator {
    @apply ml-4 h-px grow;
    background-color: var(--color-border);
  }
</style>
