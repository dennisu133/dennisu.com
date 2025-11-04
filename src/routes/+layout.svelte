<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style lang="postcss">
  @reference "tailwindcss";

  :global(.card) {
    @apply border bg-surface p-4 transition-colors duration-150 ease-linear;
    border-color: var(--color-border);
  }
  :global(.card:hover) {
    border-color: var(--color-border-hover);
  }
</style>
