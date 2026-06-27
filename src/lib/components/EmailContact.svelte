<script lang="ts">
	import FancyLink from "$lib/components/FancyLink.svelte";

	let {
		handle,
		url,
		icon,
		iconDark
	}: {
		handle: string;
		url: string;
		icon: string;
		iconDark: string;
	} = $props();

	let revealed = $state(false);
	const computedHref = $derived(revealed ? url : "#");
	const scrambleChars = "\u2588\u2593\u2592\u2591#$%&*@!?";

	function reveal() {
		if (!revealed) revealed = true;
	}

	function handleLinkClick(event: MouseEvent) {
		if (!revealed) {
			event.preventDefault();
			reveal();
			setTimeout(() => (window.location.href = url), 150);
		}
	}
</script>

<div class="group/email relative flex w-full items-center gap-3">
	<a
		href={computedHref}
		class="absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Send me an email"
		onmouseenter={reveal}
		onclick={handleLinkClick}
	></a>

	<div class="relative h-7 w-7 shrink-0">
		<img src={icon} alt="" class="show-on-dark absolute inset-0 h-7 w-7 rounded-sm p-1" />
		<img src={iconDark} alt="" class="show-on-light absolute inset-0 h-7 w-7 rounded-sm p-1" />
	</div>

	<div class="min-w-0">
		<h3
			class="text-sm font-medium transition-colors duration-150 group-hover/email:text-link-hover"
		>
			Get in touch
		</h3>
		<p
			class="inline-flex text-sm text-(--text-muted)"
			aria-label={revealed ? handle : "Email address hidden until interaction"}
		>
			{#each handle.split("") as char, i}
				{@const scramble = scrambleChars[(i * 7 + 3) % scrambleChars.length] ?? "\u2022"}
				{@const mod = i % 3}
				{@const offsetY = mod === 0 ? "-3px" : mod === 1 ? "4px" : "-2px"}
				{@const rotate = mod === 0 ? "-6deg" : mod === 1 ? "8deg" : "-4deg"}
				<span
					class={[
						"reveal-character relative inline-block",
						"transition-all duration-500 ease-out will-change-transform",
						"after:absolute after:left-0 after:text-xs after:text-(--text-muted) after:transition-opacity after:duration-500 after:ease-out after:content-(--scramble)",
						revealed
							? "translate-y-0 rotate-0 text-current blur-none after:opacity-0"
							: "translate-y-(--offset-y) rotate-(--rotate) text-transparent blur-[1px] after:opacity-70"
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
	</div>

	<FancyLink
		text="Open"
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
