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
	const displayHandle = $derived(isEmail && !revealed ? "\u2588".repeat(handle.length) : handle);
	const scrambleChars = "\u2588\u2593\u2592\u2591#$%&*@!?";

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
		class="h-7 w-7 rounded-sm p-1 {iconDark ? 'show-on-dark' : ''}"
	/>
	{#if iconDark}
		<img src={iconDark} alt={platform} class="show-on-light h-7 w-7 rounded-sm p-1" />
	{/if}
{/snippet}

{#snippet cardHandle()}
	<div class="min-w-0">
		<h3 class="group-hover:text-link-hover text-sm font-medium transition-colors duration-150">
			{platform}
		</h3>
		{#if isEmail}
			<p
				use:lockWidth
				class="inline-flex text-xs text-(--text-muted) {!revealed && 'gap-px'}"
				aria-label={revealed ? handle : "Email address"}
			>
				{#each displayHandle.split("") as char, i}
					{@const scramble = scrambleChars[(i * 7 + 3) % scrambleChars.length] ?? "\u2022"}
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
			<p class="text-xs text-(--text-muted)">{handle}</p>
		{/if}
	</div>
{/snippet}

<li class="card group relative flex items-center justify-between gap-2" onmouseenter={reveal}>
	<a
		href={computedHref}
		target="_blank"
		rel="noreferrer"
		class="absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Open {platform}"
		onclick={handleLinkClick}
	></a>
	<div class="flex items-center gap-3">
		{@render cardIcon()}
		{@render cardHandle()}
	</div>

	<FancyLink
		text="Open"
		url={computedHref}
		class="pointer-fine:hidden pointer-coarse:py-1 pointer-coarse:text-[clamp(0.75rem,4vw,1rem)]"
	/>
</li>
