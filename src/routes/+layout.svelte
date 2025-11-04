<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
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
</style>
