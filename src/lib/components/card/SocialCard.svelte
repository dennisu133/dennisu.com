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
  Optional: pass `class` to extend/override wrapper spacing.
-->

<script lang="ts">
	import { browser } from "$app/environment";

	let { platform, handle, url, icon, iconDark = null, class: className = "" } = $props();

	// Email obfuscation
	const isEmail = platform === "Email";
	let revealed = $state(!isEmail);
	let computedHref = $derived(revealed || !isEmail ? url : "#");

	// Base64 encode/decode for DOM obfuscation
	function b64Encode(str: string) {
		if (!browser) {
			// Match client-side base64 length (unpadded) to prevent hydration mismatch
			const len = Math.ceil((str.length * 4) / 3);
			return "x".repeat(len);
		}
		return btoa(str).replace(/[+/=]/g, (m) => ({ "+": "-", "/": "_", "=": "" })[m]!);
	}

	function b64Decode(encoded: string) {
		if (!browser) return encoded;
		const padded = encoded.replace(/[-_]/g, (m) => (m === "-" ? "+" : "/"));
		return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
	}

	const encodedHandle = isEmail ? b64Encode(handle) : handle;
	const displayHandle = $derived(revealed && isEmail ? b64Decode(encodedHandle) : encodedHandle);

	// Scramble for visual obfuscation
	const scrambleChars = "█▓▒░#$%&*@!?";
	const scrambledChars = encodedHandle
		.split("")
		.map((c: string, i: number) =>
			c === "@" || c === "." ? c : scrambleChars[(i * 7 + 3) % scrambleChars.length]
		);

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

<!-- Shared card content -->
{#snippet cardIcon()}
	<!-- icon = light-colored (for dark bg), iconDark = dark-colored (for light bg) -->
	<img
		src={icon}
		alt={platform}
		class="h-8 w-8 p-1.5 rounded-md {iconDark ? 'show-on-dark' : ''}"
		style="background-color: var(--bg-icon)"
	/>
	{#if iconDark}
		<img
			src={iconDark}
			alt={platform}
			class="show-on-light h-8 w-8 p-1.5 rounded-md"
			style="background-color: var(--bg-icon)"
		/>
	{/if}
{/snippet}

{#snippet cardHandle(desktopHover: boolean)}
	<div>
		<h3 class={desktopHover ? "group-hover:text-(--color-link-hover) transition-colors" : ""}>
			{platform}
		</h3>
		{#if isEmail}
			<p class="inline-flex font-mono" aria-label={revealed ? handle : "Email address"}>
				{#each displayHandle.split("") as char, i}
					<span
						class="shatter-char relative inline-block"
						class:revealed
						style="--i: {i}; --scramble: '{scrambledChars[i] ?? '•'}'">{char}</span
					>
				{/each}
			</p>
			<noscript class="text-xs opacity-60 text-(--text-muted)">
				<br /> Revealing email requires JavaScript.
			</noscript>
		{:else}
			<p>{handle}</p>
		{/if}
	</div>
{/snippet}

<li class="flex relative items-center justify-between group card {className}" onmouseenter={reveal}>
	<a
		href={computedHref}
		target="_blank"
		rel="noreferrer"
		class="hidden pointer-fine:block absolute inset-0 z-10"
		aria-label="Open {platform}"
		onclick={handleLinkClick}
	></a>

	<div class="flex flex-1 items-center gap-4">
		{@render cardIcon()}
		{@render cardHandle(true)}
	</div>

	<a
		class="pointer-fine:hidden link-action"
		href={computedHref}
		target="_blank"
		rel="noreferrer"
		onclick={handleLinkClick}
	>
		Open
	</a>
</li>

<style lang="postcss">
	@import "./card.css";

	/* EMAIL OBFUSCATION */
	.shatter-char:not(.revealed) {
		@apply text-transparent;
		transform: translateY(var(--offset-y, 2px)) rotate(var(--rotate, 5deg));
		filter: blur(1px);
	}

	.shatter-char:not(.revealed)::after {
		content: var(--scramble);
		@apply absolute left-0 opacity-60;
		color: var(--text-muted);
	}

	/* Revealed: one-shot animation */
	.shatter-char.revealed {
		animation: shatter-reveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		animation-delay: calc(var(--i) * 25ms);
	}

	@keyframes shatter-reveal {
		from {
			transform: translateY(var(--offset-y, 2px)) rotate(var(--rotate, 5deg));
			filter: blur(1px);
			color: transparent;
		}
		to {
			transform: none;
			filter: blur(0);
			color: inherit;
		}
	}

	/* Alternating offsets */
	.shatter-char:nth-child(3n) {
		--offset-y: -3px;
		--rotate: -6deg;
	}
	.shatter-char:nth-child(3n + 1) {
		--offset-y: 4px;
		--rotate: 8deg;
	}
	.shatter-char:nth-child(3n + 2) {
		--offset-y: -2px;
		--rotate: -4deg;
	}

	p {
		@apply text-(--text-muted);
	}
</style>
