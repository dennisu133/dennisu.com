<script lang="ts">
	import githubIcon from "$lib/assets/icons/social/github.svg";
	import githubDarkIcon from "$lib/assets/icons/social/github-dark.svg";

	let {
		name,
		description,
		url: _url,
		repo,
		date,
		stack = []
	}: {
		name: string;
		description: string;
		url?: string;
		repo: string;
		date: Date;
		stack?: string[];
	} = $props();

	const url = $derived(_url ?? repo);
</script>

<li class="card group relative flex h-full flex-col gap-3">
	<!-- Desktop: entire card is clickable -->
	<a href={url} class="absolute inset-0 z-10 hidden pointer-fine:block" aria-label="Open {name}">
	</a>

	<!-- Header: Title + Date -->
	<div class="flex items-baseline justify-between gap-3">
		<h3 class="leading-none font-medium transition-colors duration-150 group-hover:text-link-hover">
			{name}
		</h3>
		<time
			datetime={date.toISOString()}
			class="shrink-0 font-display text-[0.6rem] leading-none tracking-wide text-(--text-muted) opacity-50"
		>
			{date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
		</time>
	</div>

	<!-- Description -->
	<p class="text-sm leading-relaxed text-(--text-muted)">{description}</p>

	<!-- Bottom bar: Stack icons left, actions right -->
	<div class="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
		<!-- Tech stack icons -->
		<div class="flex items-center gap-1.5">
			{#each stack as icon}
				<img
					src={icon}
					alt=""
					class="h-[1.1rem] w-[1.1rem] opacity-55 transition-opacity duration-150 group-hover:opacity-85"
				/>
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
				class="pointer-events-auto inline-flex opacity-50 transition-opacity duration-150 hover:opacity-100"
				aria-label="View {name} on GitHub"
			>
				<img src={githubIcon} alt="GitHub" class="show-on-dark h-[1.05rem] w-[1.05rem]" />
				<img src={githubDarkIcon} alt="GitHub" class="show-on-light h-[1.05rem] w-[1.05rem]" />
			</a>
		</div>
	</div>
</li>
