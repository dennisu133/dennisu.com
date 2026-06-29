<script lang="ts">
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";
	import type { StackIcon } from "$lib/stackIcons";

	let {
		name,
		description,
		url: _url,
		repo,
		date,
		disclaimer,
		stack = []
	}: {
		name: string;
		description: string;
		url?: string;
		repo: string;
		date: Date;
		disclaimer?: string;
		stack?: StackIcon[];
	} = $props();

	const url = $derived(_url ?? repo);
	let cardElement: HTMLLIElement;
	let activeStackIcon = $state<string | null>(null);

	function getStackTooltipId(iconName: string) {
		return `stack-tooltip-${name}-${iconName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	}

	function toggleStackTooltip(iconName: string) {
		activeStackIcon = activeStackIcon === iconName ? null : iconName;
	}

	function closeStackTooltip() {
		activeStackIcon = null;
	}

	function handleWindowClick(event: MouseEvent) {
		if (!activeStackIcon) return;

		const target = event.target;
		const trigger = target instanceof Element && target.closest("[data-stack-tooltip-trigger]");

		if (!trigger || !cardElement.contains(trigger)) {
			closeStackTooltip();
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			closeStackTooltip();
		}
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={handleWindowKeydown}
	onscroll={closeStackTooltip}
/>

<li bind:this={cardElement} class="card group relative flex h-full flex-col gap-3">
	<!-- Desktop: entire card is clickable -->
	<a
		href={url}
		class="card-primary-link absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Open {name}"
	>
	</a>

	<!-- Header: Title + Date -->
	<div class="flex items-baseline justify-between gap-3">
		<div class="relative w-fit min-w-0">
			<h3
				class="leading-none font-medium transition-colors duration-150 group-hover:text-link-hover"
			>
				{name}
			</h3>
			{#if disclaimer}
				<p
					class="project-disclaimer pointer-events-none absolute top-[75%] left-[72%] z-20 w-max -rotate-3 font-display text-[0.65rem] leading-none font-bold text-project-disclaimer"
				>
					{disclaimer}
				</p>
			{/if}
		</div>
		<time
			datetime={date.toISOString()}
			class="shrink-0 self-start font-display text-[0.6rem] leading-none tracking-wide text-(--text-muted) opacity-50"
		>
			{date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
		</time>
	</div>

	<!-- Description -->
	<p class="text-sm leading-relaxed text-(--text-muted)">{description}</p>

	<!-- Bottom bar: Stack icons left, actions right -->
	<div class="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
		<!-- Tech stack icons -->
		<div class="flex items-center gap-2">
			{#each stack as icon}
				<span class="stack-icon-trigger group/stack relative z-20 block">
					<img
						src={icon.src}
						alt=""
						class="stack-icon h-[1.1rem] w-[1.1rem] transition-[filter,opacity] duration-150"
					/>
					<span
						id={getStackTooltipId(icon.name)}
						role="tooltip"
						style:opacity={activeStackIcon === icon.name ? 1 : null}
						class="pointer-events-none absolute bottom-full left-0 mb-1.5 min-w-max rounded-sm border border-border bg-(--bg-tooltip) px-2 py-1 text-left text-xs text-(--text) opacity-0 shadow-sm transition-opacity duration-150 select-none group-hover/stack:opacity-100"
					>
						{icon.name}
					</span>
					<a
						href={url}
						aria-hidden="true"
						tabindex="-1"
						class="absolute inset-0 hidden pointer-fine:block"
					></a>
					<button
						type="button"
						class="absolute inset-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text) pointer-fine:hidden"
						aria-label={icon.name}
						aria-controls={getStackTooltipId(icon.name)}
						aria-expanded={activeStackIcon === icon.name}
						data-stack-tooltip-trigger
						onclick={() => toggleStackTooltip(icon.name)}
					></button>
				</span>
			{/each}
		</div>

		<!-- Actions -->
		<div class="relative z-20 flex items-center gap-2">
			<!-- Mobile: Open button -->
			<a
				href={url}
				class="pointer-events-auto hidden items-center text-[clamp(0.75rem,2.4vw,0.85rem)] leading-none tracking-[0.06em] text-link uppercase transition-colors duration-150 hover:text-link-hover pointer-coarse:inline-flex"
				target="_blank"
				rel="noreferrer"
			>
				Open
			</a>

			<span class="mx-0.5 hidden h-[0.85em] w-px self-center bg-border/70 pointer-coarse:block"
			></span>

			<!-- GitHub icon link -->
			<a
				href={repo}
				target="_blank"
				rel="noreferrer"
				class="pointer-events-auto -m-1 inline-flex rounded-sm p-1 opacity-50 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)"
				aria-label="View {name} on GitHub"
			>
				<img src={githubIcon} alt="GitHub" class="show-on-dark h-[1.05rem] w-[1.05rem]" />
				<img src={githubDarkIcon} alt="GitHub" class="show-on-light h-[1.05rem] w-[1.05rem]" />
			</a>
		</div>
	</div>
</li>

<style>
	.card-primary-link:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: -3px;
	}

	.stack-icon {
		opacity: var(--stack-icon-opacity);
		filter: drop-shadow(0 0 0.7px var(--stack-icon-shadow))
			drop-shadow(0 1px 0.5px var(--stack-icon-shadow));
	}

	.stack-icon-trigger:hover .stack-icon {
		opacity: var(--stack-icon-hover-opacity);
	}

	@media (min-width: 80rem) and (max-height: 48rem) {
		.project-disclaimer {
			left: 42%;
		}
	}
</style>
