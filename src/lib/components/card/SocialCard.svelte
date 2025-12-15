<!-- 
  @component
  Renders a social entry as a boxed list item with an action link.
  Usage:
  ```html
  <SocialCard
    platform="GitHub"
    handle="@user"
    url="https://..."
    icon="/github.svg"
    iconDark="/github-dark.svg"
  />
  ```
-->

<script lang="ts">
	import FancyLink from "$lib/components/FancyLink.svelte";

	let {
		platform,
		handle,
		url,
		icon,
		iconDark = null
	}: {
		platform: string;
		handle: string;
		url: string;
		icon: string;
		iconDark?: string | null;
	} = $props();

	// Preserve initial width to prevent shrinking on reveal
	const lockWidth = (node: HTMLElement) => {
		node.style.minWidth = `${node.getBoundingClientRect().width}px`;
	};

	// Email obfuscation
	const isEmail = $derived(platform === "Email");
	let revealed = $state(false);
	let computedHref = $derived(!isEmail || revealed ? url : "#");

	// Use a wide placeholder glyph so the locked initial width
	// won't expand when the real email (variable glyph widths) reveals.
	const displayHandle = $derived(isEmail && !revealed ? "█".repeat(handle.length) : handle);
	const scrambleChars = "█▓▒░#$%&*@!?";

	function reveal() {
		if (isEmail && !revealed) revealed = true;
	}

	function handleLinkClick(e: MouseEvent) {
		if (isEmail && !revealed) {
			e.preventDefault();
			reveal();
			setTimeout(() => (window.location.href = url), 150);
		}
	}
</script>

{#snippet cardIcon()}
	<!-- icon = light-colored (for dark bg), iconDark = dark-colored (for light bg) -->
	<img
		src={icon}
		alt={platform}
		class="h-8 w-8 rounded-md p-1.5 {iconDark ? 'show-on-dark' : ''}"
	/>
	{#if iconDark}
		<img src={iconDark} alt={platform} class="show-on-light h-8 w-8 rounded-md p-1.5" />
	{/if}
{/snippet}

{#snippet cardHandle()}
	<div>
		<h3 class="group-hover:text-link-hover text-base font-medium">
			{platform}
		</h3>
		{#if isEmail}
			<p
				use:lockWidth
				class="inline-flex text-(--text-muted) {!revealed && 'gap-px'}"
				aria-label={revealed ? handle : "Email address"}
			>
				{#each displayHandle.split("") as char, i}
					{@const scramble = scrambleChars[(i * 7 + 3) % scrambleChars.length] ?? "•"}
					{@const mod = i % 3}
					{@const offsetY = mod === 0 ? "-3px" : mod === 1 ? "4px" : "-2px"}
					{@const rotate = mod === 0 ? "-6deg" : mod === 1 ? "8deg" : "-4deg"}
					<span
						class={[
							"relative inline-block",
							"transition-all duration-500 ease-out will-change-transform",
							"after:absolute after:left-0 after:transition-opacity after:duration-500 after:ease-out",
							revealed
								? "translate-y-0 rotate-0 text-current blur-none after:opacity-0"
								: "translate-y-(--offset-y) rotate-(--rotate) text-transparent blur-[1px] after:text-(--text-muted) after:opacity-70 after:content-(--scramble)"
						].join(" ")}
						style={`--i: ${i}; --offset-y: ${offsetY}; --rotate: ${rotate}; --scramble: '${scramble}'; transition-delay: calc(var(--i) * 25ms);`}
					>
						{char}
					</span>
				{/each}
			</p>
			<noscript class="text-xs text-(--text-muted) opacity-60">
				<br /> Revealing email requires JavaScript.
			</noscript>
		{:else}
			<p class="text-(--text-muted)">{handle}</p>
		{/if}
	</div>
{/snippet}

<li class="card group relative flex justify-between gap-2" onmouseenter={reveal}>
	<a
		href={computedHref}
		target="_blank"
		rel="noreferrer"
		class="absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Open {platform}"
		onclick={handleLinkClick}
	></a>
	<div class="flex items-center gap-4">
		{@render cardIcon()}
		{@render cardHandle()}
	</div>

	<FancyLink text="Open" url={computedHref} class="pointer-fine:hidden" />
</li>
