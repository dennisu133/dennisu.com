<!-- 
  @component
  Renders a social entry as a boxed list item with an action link.
  Usage:
  <SocialCard platform="GitHub" handle="@user" url="https://..." icon="/github.svg" />
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
  import { themeState } from "$lib/theme.svelte";

  let {
    platform,
    handle,
    url,
    icon,
    iconDark = null,
    class: className = "",
  } = $props();

  let currentIcon = $derived(
    themeState.mode === "light" && iconDark ? iconDark : icon,
  );
</script>

<!-- Snippet for the inner content to avoid duplication -->
{#snippet cardContent(isDesktop: boolean)}
  <div
    class="flex items-center {isDesktop
      ? 'gap-4 pointer-events-none'
      : 'gap-4'}"
  >
    <img
      src={currentIcon}
      alt={platform}
      class="h-8 w-8 p-1.5 rounded-md"
      style="background-color: var(--bg-icon)"
    />
    <div>
      <h2
        class={isDesktop
          ? "group-hover:text-(--color-link-hover) transition-colors"
          : ""}
      >
        {platform}
      </h2>
      <p>{handle}</p>
    </div>
  </div>

  {#if !isDesktop}
    <a class="link-action" href={url} target="_blank" rel="noreferrer">
      Open
    </a>
  {/if}
{/snippet}

<li class="relative card group {className} p-0! overflow-hidden">
  <!-- Mobile: Standard layout with button -->
  <!-- Visible by default, hidden ONLY on fine-pointer devices (Mouse) -->
  <div class="pointer-fine:hidden flex items-center justify-between p-4">
    {@render cardContent(false)}
  </div>

  <!-- Desktop: Entire card is clickable via Stretched Link -->
  <!-- Hidden by default, visible ONLY on fine-pointer devices (Mouse) -->
  <div
    class="hidden pointer-fine:flex items-center justify-between p-4 w-full h-full relative hover:bg-(--color-surface)/50 transition-colors"
  >
    <!-- Main Stretched Link -->
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      class="absolute inset-0 z-10"
      aria-label={`Open ${platform}`}
    ></a>

    {@render cardContent(true)}
  </div>
</li>
