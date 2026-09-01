<script lang="ts">
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";
	import type { StackIcon } from "$lib/stackIcons";

	let {
		name,
		description,
		url,
		repo,
		date,
		disclaimer,
		stack
	}: {
		name: string;
		description: string;
		url?: string;
		repo: string;
		date: Date;
		disclaimer?: string;
		stack: StackIcon[];
	} = $props();

	const projectUrl = $derived(url ?? repo);
	let activeStackIcon = $state<string | null>(null);

	function getStackTooltipId(iconName: string) {
		return `stack-tooltip-${name}-${iconName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	}

	function toggleStackTooltip(iconName: string) {
		activeStackIcon = activeStackIcon === iconName ? null : iconName;
	}

	function handleWindowClick(event: MouseEvent) {
		const trigger = event.target instanceof Element && event.target.closest("[data-stack-project]");
		if (trigger && trigger.getAttribute("data-stack-project") === name) return;
		activeStackIcon = null;
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={(event) => event.key === "Escape" && (activeStackIcon = null)}
	onscroll={() => (activeStackIcon = null)}
/>

<li class="card group flex flex-col gap-3">
	<a
		href={projectUrl}
		class="absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Open {name}"
	>
	</a>

	<div class="flex items-baseline justify-between gap-3">
		<div class="relative w-fit min-w-0">
			<h3
				class="leading-none font-medium transition-colors duration-150 group-hover:text-accent-hover"
			>
				{name}
			</h3>
			<!-- TODO: remove me and competitiveworlde -->
			{#if disclaimer}
				<p
					class="pointer-events-none absolute top-3/4 left-[70%] z-20 w-max -rotate-3 font-mono text-xs leading-none font-bold text-[light-dark(oklch(41.033%_0.1502_10.272),oklch(71.919%_0.169_13.428))] [@media(min-width:80rem)_and_(max-height:48rem)]:left-[42%]"
				>
					{disclaimer}
				</p>
			{/if}
		</div>
		<time
			datetime={date.toISOString()}
			class="shrink-0 self-start font-mono text-xs leading-none tracking-wide text-muted-foreground opacity-80"
		>
			{date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
		</time>
	</div>

	<p class="text-sm leading-relaxed text-muted-foreground">{description}</p>

	<div class="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
		<div class="flex items-center gap-2">
			{#each stack as icon (icon.name)}
				{@const tooltipId = getStackTooltipId(icon.name)}
				<span class="group/stack-icon relative z-20">
					<img
						src={icon.src}
						alt=""
						class="stack-icon size-5 opacity-90 transition-opacity duration-150 group-hover/stack-icon:opacity-100"
					/>
					<span
						id={tooltipId}
						role="tooltip"
						style:opacity={activeStackIcon === icon.name ? 1 : null}
						class="tooltip bottom-full left-0 mb-1.5 group-hover/stack-icon:opacity-100"
					>
						{icon.name}
					</span>
					<a
						href={projectUrl}
						aria-hidden="true"
						tabindex="-1"
						class="absolute inset-0 hidden pointer-fine:block"
					></a>
					<button
						type="button"
						class="absolute inset-0 rounded-sm pointer-fine:hidden"
						aria-label={icon.name}
						aria-controls={tooltipId}
						aria-expanded={activeStackIcon === icon.name}
						data-stack-project={name}
						onclick={() => toggleStackTooltip(icon.name)}
					></button>
				</span>
			{/each}
		</div>

		<div class="relative z-20 flex items-center gap-2">
			<a
				href={projectUrl}
				class="hidden min-h-6 items-center text-xs leading-none tracking-wider text-accent uppercase transition-colors duration-150 hover:text-accent-hover pointer-coarse:inline-flex"
				target="_blank"
				rel="noreferrer"
			>
				Open
			</a>

			<span class="mx-0.5 hidden h-3.5 w-px bg-border/70 pointer-coarse:block"></span>

			<a
				href={repo}
				target="_blank"
				rel="noreferrer"
				class="-m-1 inline-flex rounded-sm p-1 opacity-50 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
				aria-label="View {name} on GitHub"
			>
				<img src={githubIcon} alt="" class="show-on-dark size-4" />
				<img src={githubDarkIcon} alt="" class="show-on-light size-4" />
			</a>
		</div>
	</div>
</li>

<style>
	/* This becomes unreadable in Tailwind */
	.stack-icon {
		filter: drop-shadow(0 0 0.7px light-dark(rgb(15 23 42 / 0.65), transparent))
			drop-shadow(0 1px 0.5px light-dark(rgb(15 23 42 / 0.65), transparent));
	}
</style>
