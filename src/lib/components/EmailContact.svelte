<script lang="ts">
	import { AtSign } from "@lucide/svelte";

	import FancyLink from "$lib/components/FancyLink.svelte";
	import {
		decodeEmail,
		EMAIL_CHARACTER_COUNT,
		EMAIL_DISPLAY_WIDTH_EM
	} from "$lib/emailObfuscation";

	let handle = $state<string | null>(null);
	const revealed = $derived(handle !== null);
	const computedHref = $derived(handle === null ? "#" : `mailto:${handle}`);
	const characterSlots = Array.from({ length: EMAIL_CHARACTER_COUNT }, (_, index) => index);
	const scrambleChars = "\u2588\u2593\u2592\u2591#$%&*@!?";

	function reveal() {
		if (handle === null) handle = decodeEmail();
		return handle;
	}

	function handleLinkClick(event: MouseEvent) {
		if (!revealed) {
			event.preventDefault();
			const email = reveal();
			setTimeout(() => (window.location.href = `mailto:${email}`), 150);
		}
	}
</script>

{#snippet emailAddress()}
	<span
		class="inline-flex max-w-full flex-wrap"
		style:width={`${EMAIL_DISPLAY_WIDTH_EM}em`}
		aria-hidden="true"
	>
		{#each characterSlots as i}
			{@const scramble = scrambleChars[(i * 7 + 3) % scrambleChars.length] ?? "\u2022"}
			{@const mod = i % 3}
			{@const offsetY = mod === 0 ? "-3px" : mod === 1 ? "4px" : "-2px"}
			{@const rotate = mod === 0 ? "-6deg" : mod === 1 ? "8deg" : "-4deg"}
			<span
				class={[
					"reveal-character relative inline-block",
					"transition-[translate,rotate,filter] duration-500 ease-out will-change-[translate,rotate,filter]",
					"after:absolute after:left-0 after:text-xs after:text-(--text-muted) after:transition-opacity after:duration-500 after:ease-out after:content-(--scramble)",
					revealed
						? "w-auto translate-y-0 rotate-0 text-current blur-none after:opacity-0"
						: "w-[0.5em] translate-y-(--offset-y) rotate-(--rotate) text-transparent blur-[1px] after:opacity-80"
				].join(" ")}
				style={`--i: ${i}; --offset-y: ${offsetY}; --rotate: ${rotate}; --scramble: '${scramble}'; transition-delay: calc(var(--i) * 25ms);`}
			>
				{handle?.[i] ?? "\u00a0"}
			</span>
		{/each}
	</span>
{/snippet}

<div class="group/email relative flex w-full min-w-0 items-center gap-3">
	<a
		href={computedHref}
		class="absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Send me an email"
		onmouseenter={reveal}
		onfocusin={reveal}
		onclick={handleLinkClick}
	></a>

	<AtSign aria-hidden="true" class="h-7 w-7 shrink-0 rounded-sm p-1" />

	<div class="min-w-0">
		<h3
			class="text-sm font-medium transition-colors duration-150 group-hover/email:text-link-hover"
		>
			Get in touch
		</h3>
		<div class="relative max-w-full text-sm text-(--text-muted)">
			{@render emailAddress()}
			<button
				type="button"
				class="absolute inset-0 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text) pointer-fine:hidden"
				aria-label={handle ?? "Email address hidden until interaction"}
				onclick={reveal}
			></button>
		</div>
		<noscript class="text-xs text-(--text-muted) opacity-80">
			<br /> Revealing email requires JavaScript.
		</noscript>
	</div>

	<FancyLink
		text="Email"
		url={computedHref}
		class="pointer-events-auto z-20 ml-auto items-center py-1 text-[clamp(0.75rem,4vw,1rem)] leading-none tracking-[0.06em] text-link uppercase group-hover:text-link-hover hover:text-link-hover pointer-fine:hidden"
		onclick={handleLinkClick}
	/>
</div>

<style>
	.reveal-character::after {
		transition-delay: calc(var(--i) * 25ms);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-character,
		.reveal-character::after {
			transition-delay: 0ms !important;
			transition-duration: 0ms !important;
		}
	}
</style>
