<script lang="ts">
	import type { StackIcon } from "$lib/stackIcons";

	let {
		name,
		description,
		url,
		repo,
		date,
		stack
	}: {
		name: string;
		description: string;
		url?: string;
		repo: string;
		date: Date;
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

<li class="card interactive-surface group flex flex-col gap-3">
	<a
		href={projectUrl}
		class="accent-focus absolute inset-0 z-10 hidden pointer-fine:block"
		aria-label="Open {name}"
	>
	</a>

	<div class="flex items-baseline justify-between gap-3">
		<div class="relative w-fit min-w-0">
			<h3
				class="leading-none font-medium group-hover:text-accent-hover motion-safe:transition-colors motion-safe:duration-150"
			>
				{name}
			</h3>
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
						class="icon-shadow size-5 opacity-90 group-hover/stack-icon:opacity-100 motion-safe:transition-opacity motion-safe:duration-150"
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
				class="hidden min-h-6 items-center text-xs leading-none tracking-wider text-accent uppercase hover:text-accent-hover motion-safe:transition-colors motion-safe:duration-150 pointer-coarse:inline-flex"
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
				class="group/source relative -m-1 inline-flex rounded-sm p-1 opacity-50 hover:opacity-100 focus-visible:opacity-100 motion-safe:transition-opacity motion-safe:duration-150"
				aria-label="View source code for {name}"
			>
				<span aria-hidden="true" class="github-icon size-4"></span>
				<span
					aria-hidden="true"
					class="tooltip right-0 bottom-full mb-1.5 group-hover/source:opacity-100 group-focus-visible/source:opacity-100"
				>
					Source Code
				</span>
			</a>
		</div>
	</div>
</li>
