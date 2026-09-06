<script lang="ts">
	import { Languages, MoveLeft } from "@lucide/svelte";
	import { resolve } from "$app/paths";
	import { onDestroy, onMount, tick } from "svelte";

	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import GameBoard from "./GameBoard.svelte";
	import { Game } from "./game.svelte";
	import HelpDialog from "./HelpDialog.svelte";
	import { translate, type TranslationKey } from "./i18n";
	import type { Language } from "./pentle";

	const game = new Game();

	let displayLanguage = $state<Language>("en");
	let languageReady = $state(false);
	let resultButton = $state<HTMLButtonElement>();

	function returnToSetup() {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		game.returnToSetup();
	}

	function text(key: TranslationKey, params?: Record<string, string | number>): string {
		return translate(displayLanguage, key, params);
	}

	function toggleDisplayLanguage() {
		displayLanguage = displayLanguage === "de" ? "en" : "de";
	}

	function submitAttempt(attempt: string): boolean {
		const accepted = game.submitAttempt(attempt);
		if (accepted && game.state !== "running") void focusResultButton();
		return accepted;
	}

	async function focusResultButton() {
		await tick();
		if (window.matchMedia("(pointer: coarse)").matches) return;
		resultButton?.focus();
	}

	onMount(() => {
		displayLanguage = document.documentElement.dataset.pentleLanguage === "de" ? "de" : "en";
		languageReady = true;

		const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
		if (!viewport) return;

		const originalContent = viewport.content;
		viewport.content = `${originalContent}, interactive-widget=resizes-content`;

		return () => (viewport.content = originalContent);
	});

	$effect(() => {
		const previousLanguage = document.documentElement.lang;
		document.documentElement.lang = displayLanguage;
		return () => (document.documentElement.lang = previousLanguage);
	});

	onDestroy(() => game.destroy());
</script>

<svelte:head>
	<script>
		document.documentElement.dataset.pentleLanguage = navigator.language
			.toLowerCase()
			.startsWith("de")
			? "de"
			: "en";
	</script>
	<title>Pentle | Dennis Karnowitsch</title>
	<meta name="description" content={text("description")} />
</svelte:head>

<!-- Short viewports need less vertical padding; width breakpoints cannot detect this. -->
<div
	class={[
		"pentle-page grid min-h-dvh grid-rows-[auto_1fr_auto] px-4 pt-5 pb-4 text-(--pentle-text) sm:px-6 lg:px-10 [@media(max-height:700px)]:pt-3",
		languageReady && "language-ready"
	]}
>
	<header
		class="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 max-lg:items-start max-md:grid-cols-[1fr_auto]"
	>
		<a
			class={[
				"inline-flex items-center gap-1.5 justify-self-start py-1.5 text-muted-foreground no-underline hover:text-foreground max-md:row-start-2",
				game.state === "running" ? "max-md:pointer-coarse:row-start-1" : ""
			]}
			href={resolve("/")}
			aria-label={text("home").replaceAll("\u00a0", " ")}
		>
			<MoveLeft size={18} aria-hidden="true" />
			<span class="max-md:flex max-md:min-h-12 max-md:items-center">{text("home")}</span>
		</a>
		<h1
			class={[
				"text-center text-3xl max-md:col-span-full max-md:row-start-1 max-md:text-left sm:text-4xl lg:text-5xl",
				game.state === "running" && "max-md:pointer-coarse:sr-only"
			]}
		>
			Pentle
		</h1>

		{#if game.state !== "setup"}
			<dl
				class={[
					"flex gap-3 justify-self-end text-right font-mono tabular-nums max-md:row-start-2 max-md:text-sm sm:gap-6",
					game.state === "running" ? "max-md:pointer-coarse:row-start-1" : ""
				]}
			>
				<div class="grid gap-0.5">
					<dt class="font-sans text-xs tracking-wider text-muted-foreground uppercase">
						{text("score")}
					</dt>
					<dd class="font-bold">{game.totalScore}</dd>
				</div>
				<div class="grid gap-0.5">
					<dt class="font-sans text-xs tracking-wider text-muted-foreground uppercase">
						{text("streak")}
					</dt>
					<dd class="font-bold">{game.streak}</dd>
				</div>
				<div class="grid gap-0.5">
					<dt class="font-sans text-xs tracking-wider text-muted-foreground uppercase">
						{text("time")}
					</dt>
					<dd class="font-bold">{text("seconds", { count: game.elapsedSeconds })}</dd>
				</div>
			</dl>
		{/if}
	</header>

	<main
		class={[
			"flex flex-col items-center justify-center py-8",
			game.state !== "setup" &&
				"[@media(max-height:700px)]:justify-start [@media(max-height:700px)]:pt-4",
			game.state === "running" && "max-md:pointer-coarse:justify-start max-md:pointer-coarse:py-4"
		]}
	>
		{#if game.state === "setup"}
			<section
				class="flex w-full max-w-md -translate-y-8 flex-col items-center gap-4 text-center [@media(max-height:700px)]:translate-y-0"
				aria-label={text("chooseGameLanguage")}
			>
				<p
					class="card w-full rounded-xs text-sm leading-relaxed whitespace-pre-line text-muted-foreground"
				>
					{text("dictionaryDisclaimer")}
				</p>
				<div class="flex flex-wrap justify-center gap-3">
					<button
						class="accent-focus min-h-48 w-36 cursor-pointer rounded-xs border border-(--pentle-border) bg-(--pentle-glass) bg-(image:--pentle-control-gradient) px-5 py-3 text-base font-semibold text-(--pentle-text) shadow-(--pentle-control-shadow) backdrop-blur-md hover:border-(--pentle-active) hover:bg-(--pentle-glass-hover) hover:text-accent-hover motion-safe:transition-[color,background-color,border-color,translate] motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:-translate-y-px sm:w-40"
						type="button"
						onclick={() => game.start("de")}
					>
						{text("playInGerman")}
					</button>
					<button
						class="accent-focus min-h-48 w-36 cursor-pointer rounded-xs border border-(--pentle-border) bg-(--pentle-glass) bg-(image:--pentle-control-gradient) px-5 py-3 text-base font-semibold text-(--pentle-text) shadow-(--pentle-control-shadow) backdrop-blur-md hover:border-(--pentle-active) hover:bg-(--pentle-glass-hover) hover:text-accent-hover motion-safe:transition-[color,background-color,border-color,translate] motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:-translate-y-px sm:w-40"
						type="button"
						onclick={() => game.start("en")}
					>
						{text("playInEnglish")}
					</button>
				</div>
			</section>
		{:else if game.gameLanguage}
			{#key game.roundId}
				<GameBoard
					attempts={game.attempts}
					feedback={game.feedbackGrid}
					gameLanguage={game.gameLanguage}
					{displayLanguage}
					playing={game.state === "running"}
					error={game.error}
					onSubmit={submitAttempt}
				/>
			{/key}

			{#if game.state === "won"}
				<section
					class="flex w-full max-w-sm flex-col items-center gap-4 text-center"
					aria-live="polite"
				>
					<h2 class="font-display text-3xl">{text("wonTitle")}</h2>
					<p class="font-mono text-lg font-bold text-accent">
						{text("roundScore", { score: game.roundScore })}
					</p>
					<button
						class="accent-focus min-h-11 cursor-pointer rounded-xs border border-(--pentle-border) bg-(--pentle-glass) bg-(image:--pentle-control-gradient) px-5 py-3 font-semibold text-(--pentle-text) shadow-(--pentle-control-shadow) backdrop-blur-md hover:border-(--pentle-active) hover:bg-(--pentle-glass-hover) hover:text-accent-hover motion-safe:transition-[color,background-color,border-color,translate] motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:-translate-y-px"
						type="button"
						onclick={() => game.startNextRound()}
						bind:this={resultButton}
					>
						{text("nextWord")}
					</button>
				</section>
			{:else if game.state === "lost"}
				<section
					class="flex w-full max-w-sm flex-col items-center gap-4 text-center"
					aria-live="polite"
				>
					<h2 class="font-display text-3xl">{text("lostTitle")}</h2>
					<p>
						{text("wordWas", {
							word: game.revealedWord?.toLocaleUpperCase(game.gameLanguage) ?? ""
						})}
					</p>
					<p>{text("finalScore", { score: game.totalScore })}</p>
					<p>{text("finalStreak", { streak: game.streak })}</p>
					<button
						class="accent-focus min-h-11 cursor-pointer rounded-xs border border-(--pentle-border) bg-(--pentle-glass) bg-(image:--pentle-control-gradient) px-5 py-3 font-semibold text-(--pentle-text) shadow-(--pentle-control-shadow) backdrop-blur-md hover:border-(--pentle-active) hover:bg-(--pentle-glass-hover) hover:text-accent-hover motion-safe:transition-[color,background-color,border-color,translate] motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:-translate-y-px"
						type="button"
						onclick={returnToSetup}
						bind:this={resultButton}
					>
						{text("newGame")}
					</button>
				</section>
			{/if}
		{/if}
	</main>

	<div class="flex gap-1.5 justify-self-end">
		<button
			id="pentle-settings"
			type="button"
			class="group/language relative inline-flex cursor-pointer items-center justify-center gap-1 rounded-xs border border-(--pentle-border) bg-(--pentle-glass) bg-(image:--pentle-control-gradient) p-2 text-xs text-muted-foreground shadow-(--pentle-control-shadow) backdrop-blur-md hover:border-(--pentle-active) hover:bg-(--pentle-glass-hover) hover:text-foreground"
			aria-label={text("displayLanguage")}
			onclick={toggleDisplayLanguage}
		>
			<Languages size={20} aria-hidden="true" />
			<span aria-hidden="true">{displayLanguage.toLocaleUpperCase()}</span>
			<span class="tooltip right-0 bottom-full mb-1.5 group-hover/language:opacity-100">
				{text("displayLanguage")}
			</span>
		</button>
		<ThemeToggle
			toggleLabel={text("themeToggle")}
			switchToDarkLabel={text("switchToDarkMode")}
			switchToLightLabel={text("switchToLightMode")}
		/>
		<HelpDialog {displayLanguage} />
	</div>
</div>

<style>
	.pentle-page {
		--pentle-text: var(--color-foreground);
		--pentle-result-text: oklch(14.5% 0 0);
		--pentle-glass: light-dark(rgb(239 248 255 / 0.38), rgb(12 12 12 / 0.62));
		--pentle-glass-hover: light-dark(rgb(239 248 255 / 0.58), rgb(255 255 255 / 0.08));
		--pentle-glass-highlight: light-dark(rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.08));
		--pentle-tile: light-dark(rgb(239 248 255 / 0.52), rgb(18 21 27 / 0.72));
		--pentle-empty-tile: light-dark(rgb(239 248 255 / 0.1), rgb(255 255 255 / 0.015));
		--pentle-border: light-dark(rgb(15 23 42 / 0.46), rgb(255 255 255 / 0.22));
		--pentle-empty-border: light-dark(rgb(15 23 42 / 0.52), rgb(255 255 255 / 0.26));
		--pentle-active: light-dark(oklch(48.8% 0.243 264.376), oklch(75.351% 0.139 232.661));
		--pentle-error: light-dark(oklch(39% 0.16 25), oklch(74% 0.18 25));
		--pentle-shadow: var(--shadow-lg);
		--pentle-correct: oklch(72.3% 0.219 149.579);
		--pentle-correct-border: oklch(52.7% 0.154 150.069);
		--pentle-present: oklch(79.5% 0.184 86.047);
		--pentle-present-border: oklch(60% 0.14 75.834);
		--pentle-absent: oklch(63.7% 0.237 25.331);
		--pentle-absent-border: oklch(48% 0.2 27.325);
		--interaction-accent: var(--pentle-active);

		--pentle-dialog: light-dark(rgb(239 248 255 / 0.94), rgb(12 12 12 / 0.94));
		--pentle-control-gradient: linear-gradient(
			135deg,
			var(--pentle-glass-highlight),
			transparent 60%
		);
		--pentle-tile-gradient: linear-gradient(135deg, var(--pentle-glass-highlight), transparent 58%);
		/* A one-pixel highlight defines the shared glass edge. */
		--pentle-inset-shadow: inset 0 1px 0 var(--pentle-glass-highlight);
		--pentle-control-shadow: var(--pentle-inset-shadow), var(--pentle-shadow);
		--pentle-tile-shadow: var(--pentle-inset-shadow), var(--shadow-md);
	}

	:global(html[data-pentle-language="de"]) .pentle-page:not(.language-ready) {
		visibility: hidden;
	}

	.pentle-page :global([data-feedback]) {
		position: relative;
	}

	.pentle-page :global([data-feedback]::after) {
		position: absolute;
		right: 0.125rem;
		bottom: 0.125rem;
		font: 700 var(--text-xs)/1 var(--font-sans);
		pointer-events: none;
	}

	.pentle-page :global([data-feedback="correct"]::after) {
		content: "✓" / "";
	}

	.pentle-page :global([data-feedback="present"]::after) {
		content: "↔" / "";
	}

	.pentle-page :global([data-feedback="absent"]::after) {
		content: "×" / "";
	}

	/* Palette changes are shared by tiles, controls, and the help dialog. */
	@media (prefers-contrast: more) {
		.pentle-page {
			--color-muted-foreground: var(--color-foreground);
			--pentle-glass: light-dark(#fff, #000);
			--pentle-glass-hover: light-dark(#e2e8f0, #1e293b);
			--pentle-tile: var(--pentle-glass);
			--pentle-empty-tile: var(--pentle-glass);
			--pentle-dialog: var(--pentle-glass);
			--pentle-border: var(--color-foreground);
			--pentle-empty-border: var(--color-foreground);
			--pentle-result-text: #000;
			--pentle-correct: #86efac;
			--pentle-present: #fde047;
			--pentle-absent: #fca5a5;
			--pentle-correct-border: var(--color-foreground);
			--pentle-present-border: var(--color-foreground);
			--pentle-absent-border: var(--color-foreground);
		}
	}

	@media (prefers-contrast: less) {
		.pentle-page {
			--pentle-glass: light-dark(#c4daed, #20252d);
			--pentle-glass-hover: light-dark(#d0e1ef, #2b323c);
			--pentle-tile: var(--pentle-glass);
			--pentle-empty-tile: var(--pentle-glass);
			--pentle-dialog: var(--pentle-glass);
			--pentle-correct: #96c5a3;
			--pentle-present: #d0bd80;
			--pentle-absent: #cf9f9b;
		}
	}

	@media (prefers-contrast: more), (prefers-contrast: less), (forced-colors: active) {
		.pentle-page {
			--pentle-glass-highlight: transparent;
			--pentle-control-gradient: none;
			--pentle-tile-gradient: none;
			--pentle-inset-shadow: 0 0 #0000;
			--pentle-shadow: 0 0 #0000;
			--pentle-tile-shadow: 0 0 #0000;
		}

		/* The shared theme toggle owns its CSS; adapt it only within this route. */
		.pentle-page :global(.theme-toggle) {
			background-color: var(--pentle-glass);
			background-image: none;
			border-color: var(--pentle-border);
			box-shadow: none;
		}

		.pentle-page :global(.theme-toggle:hover) {
			background-color: var(--pentle-glass-hover);
			border-color: var(--pentle-active);
		}
	}

	@media (forced-colors: active) {
		.pentle-page {
			--pentle-text: CanvasText;
			--pentle-result-text: CanvasText;
			--pentle-border: CanvasText;
			--pentle-empty-border: CanvasText;
			--pentle-active: Highlight;
			--pentle-error: CanvasText;
		}

		.pentle-page :global(:where(a, button):focus-visible) {
			outline: 2px solid Highlight;
			outline-offset: 3px;
		}
	}
</style>
