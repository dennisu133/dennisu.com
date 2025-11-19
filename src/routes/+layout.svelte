<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { initTheme } from "$lib/theme.svelte";
  import favicon from "$lib/assets/favicon.svg";
  import alticon from "$lib/assets/alticon.svg";

  let { children } = $props();

  function generateFrames(name = "Dennisu", emoji = "🐈") {
    const frames = [];
    for (let i = 0; i < name.length; i++) {
      const frame = name.slice(0, i) + emoji + name.slice(i + 1);
      frames.push(frame);
    }
    return [...frames, ...frames.slice(1, -1).reverse()];
  }

  const frames = generateFrames();
  const altTitle = "Spicy Singles in Your Area";
  let currentFrame = $state(0);
  let isVisible = $state(true);

  onMount(() => {
    initTheme();

    // Check initial visibility state
    isVisible = !document.hidden;

    // Handle visibility change
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
  <link rel="icon" href={isVisible ? favicon : alticon} />
  <title>{isVisible ? frames[currentFrame] : altTitle}</title>
  <meta name="theme-color" content="#66b2ff" />
  <meta property="og:title" content="Dennisu.com 🐱" />
  <meta
    property="og:description"
    content={"Personal website of Dennis Karnowitsch. Please hire me."}
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://dennisu.com" />
  <meta property="og:image" content={"/dancing.gif"} />
  <script>
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      if (saved === "dark" || (!saved && prefersDark)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  </script>
</svelte:head>

{@render children?.()}

<style lang="postcss">
  @reference "tailwindcss";

  :global(.card) {
    @apply border p-4 transition-colors duration-150 ease-linear;
    background-color: var(--color-surface);
    border-color: var(--color-border);
  }
  :global(.card:hover) {
    border-color: var(--color-border-hover);
  }

  :global(.text-body) {
    @apply leading-relaxed;
    font-size: var(--text-body);
  }

  :global(.link) {
    @apply text-(--color-link) transition-colors duration-150 ease-linear 
    hover:text-(--color-link-hover) focus-visible:text-(--color-link-hover);
  }

  :global(.link-action) {
    @apply uppercase tracking-[0.06em] text-(--text-action) 
    hover:text-(--color-link-hover) group-hover:text-(--color-link-hover);
    color: var(--color-link);
  }
</style>
