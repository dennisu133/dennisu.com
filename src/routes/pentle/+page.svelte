<script lang="ts">
	import { CircleQuestionMark, Languages, MoveLeft, MoveRight } from "@lucide/svelte";
	import { resolve } from "$app/paths";
	import { onDestroy, onMount, tick } from "svelte";

	import IconButton from "$lib/components/IconButton.svelte";
	import FancyLink from "$lib/components/FancyLink.svelte";
	import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
	import GameBoard from "./GameBoard.svelte";
	import { Game } from "./game.svelte";
	import HelpDialog from "./HelpDialog.svelte";
	import { formatGuessFeedback, translate, type TranslationKey } from "./i18n";
	import { MAX_ATTEMPTS, type Language } from "./pentle";

	const game = new Game();
	const resultButtonClass =
		"accent-focus glass interactive-surface min-h-11 rounded-xs px-5 py-3 font-semibold text-(--pentle-text) hover:text-accent-hover";
	const gameLanguages = ["de", "en"] as const;

	let displayLanguage = $state<Language>("en");
	let languageReady = $state(false);
	let resultButton = $state<HTMLButtonElement>();
	let help = $state<HelpDialog>();
	let announcement = $state("");
	let announcementVersion = 0;

	async function announce(message: string) {
		const version = ++announcementVersion;
		announcement = "";
		// Keep the region mounted and separate identical messages by a DOM update.
		await tick();
		if (version === announcementVersion) announcement = message;
	}

	function announceRound() {
		void announce(text("attemptReady", { attempt: 1, max: MAX_ATTEMPTS }));
	}

	function startGame(language: Language) {
		game.start(language);
		announceRound();
	}

	function nextRound() {
		game.startNextRound();
		announceRound();
	}

	async function returnToSetup() {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		game.returnToSetup();
		void announce(text("chooseGameLanguage"));
		await tick();
		document.getElementById("pentle-start-de")?.focus();
	}

	function text(key: TranslationKey, params?: Record<string, string | number>): string {
		return translate(displayLanguage, key, params);
	}

	function toggleDisplayLanguage() {
		displayLanguage = displayLanguage === "de" ? "en" : "de";
		void announce("");
	}

	function submitAttempt(attempt: string): boolean {
		const accepted = game.submitAttempt(attempt);
		if (!accepted) {
			if (game.error) void announce(text(game.error));
			return false;
		}
		const feedback = formatGuessFeedback(
			displayLanguage,
			game.attempts.at(-1)!,
			game.feedbackGrid.at(-1)!,
			game.attempts.length
		);
		if (game.state === "running") {
			void announce(
				`${feedback} ${text("attemptReady", { attempt: game.attempts.length + 1, max: MAX_ATTEMPTS })}`
			);
		} else {
			const outcome =
				game.state === "won"
					? `${text("wonTitle")} ${text("roundScore", { score: game.roundScore })}.`
					: `${text("lostTitle")}. ${text("wordWas", { word: [...(game.revealedWord ?? "")].join(", ") })}`;
			void announceResult(
				`${feedback} ${outcome} ${text("finalScore", { score: game.totalScore })}. ${text("finalStreak", { streak: game.streak })}.`
			);
		}
		return true;
	}

	async function announceResult(message: string) {
		await tick();
		resultButton?.focus();
		void announce(message);
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
	<p id="pentle-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
		{announcement}
	</p>
	<header
		class="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 max-lg:items-start max-md:grid-cols-[1fr_auto]"
	>
		<FancyLink
			class={[
				"inline-flex items-center gap-1.5 justify-self-start py-1.5 text-muted-foreground no-underline hover:text-foreground max-md:row-start-2",
				game.state === "running" ? "max-md:pointer-coarse:row-start-1" : ""
			]}
			href={resolve("/")}
			aria-label={text("home").replaceAll("\u00a0", " ")}
		>
			<MoveLeft size={18} aria-hidden="true" />
			<span class="max-md:flex max-md:min-h-12 max-md:items-center">{text("home")}</span>
		</FancyLink>
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
				class="grid w-full max-w-2xl -translate-y-8 gap-6 md:grid-cols-[minmax(0,1fr)_auto] [@media(max-height:700px)]:translate-y-0"
				aria-label={text("chooseGameLanguage")}
			>
				<div class="glass grid content-center gap-3 rounded-xs p-4 text-center md:text-left">
					<p class="text-sm leading-relaxed text-muted-foreground">
						{text("introductionBeforeHelp")}<button
							type="button"
							class="glass interactive-surface inline-flex items-center justify-center rounded-xs p-1 align-middle text-muted-foreground hover:text-foreground"
							aria-label={text("helpButton")}
							onclick={() => help?.open()}
						>
							<CircleQuestionMark size={16} aria-hidden="true" />
						</button>{text("introductionAfterHelp")}
					</p>
					<p
						class="border-t border-border pt-3 text-xs leading-relaxed whitespace-pre-line text-muted-foreground"
					>
						{text("dictionaryDisclaimer")}
					</p>
				</div>
				<noscript class="glass rounded-xs p-4 text-sm text-foreground">
					{text("javascriptRequired")}
				</noscript>
				<div class="flex flex-wrap justify-center gap-3 noscript:hidden">
					{#each gameLanguages as language (language)}
						<button
							class="accent-focus glass interactive-surface flex min-h-48 w-36 flex-col justify-between rounded-xs px-5 py-4 text-left text-base font-semibold text-(--pentle-text) hover:text-accent-hover sm:w-40"
							type="button"
							id={`pentle-start-${language}`}
							onclick={() => startGame(language)}
						>
							<span class="font-display text-5xl text-muted-foreground" aria-hidden="true"
								>{language.toUpperCase()}</span
							>
							<span class="flex items-end justify-between gap-2">
								{text(language === "de" ? "playInGerman" : "playInEnglish")}
								<MoveRight class="shrink-0" size={16} aria-hidden="true" />
							</span>
						</button>
					{/each}
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
					onAnnounce={announce}
				/>
			{/key}

			{#if game.state === "won"}
				<section
					class="flex w-full max-w-sm flex-col items-center gap-4 text-center"
					aria-labelledby="pentle-result-title"
				>
					<h2 id="pentle-result-title" class="font-display text-3xl">{text("wonTitle")}</h2>
					<p class="font-mono text-lg font-bold text-accent">
						{text("roundScore", { score: game.roundScore })}
					</p>
					<button
						class={resultButtonClass}
						type="button"
						onclick={nextRound}
						aria-describedby="pentle-result-title"
						bind:this={resultButton}
					>
						{text("nextWord")}
					</button>
				</section>
			{:else if game.state === "lost"}
				<section
					class="flex w-full max-w-sm flex-col items-center gap-4 text-center"
					aria-labelledby="pentle-result-title"
				>
					<h2 id="pentle-result-title" class="font-display text-3xl">{text("lostTitle")}</h2>
					<p>
						{text("wordWas", {
							word: game.revealedWord?.toLocaleUpperCase(game.gameLanguage) ?? ""
						})}
					</p>
					<p>{text("finalScore", { score: game.totalScore })}</p>
					<p>{text("finalStreak", { streak: game.streak })}</p>
					<button
						class={resultButtonClass}
						type="button"
						onclick={returnToSetup}
						aria-describedby="pentle-result-title"
						bind:this={resultButton}
					>
						{text("newGame")}
					</button>
				</section>
			{/if}
		{/if}
	</main>

	<div class="flex gap-1.5 justify-self-end">
		<IconButton
			id="pentle-settings"
			class="gap-1 text-xs"
			label={text("displayLanguage")}
			onclick={toggleDisplayLanguage}
		>
			<Languages size={20} aria-hidden="true" />
			<span aria-hidden="true">{displayLanguage.toLocaleUpperCase()}</span>
		</IconButton>
		<ThemeToggle
			toggleLabel={text("themeToggle")}
			switchToDarkLabel={text("switchToDarkMode")}
			switchToLightLabel={text("switchToLightMode")}
		/>
		<HelpDialog bind:this={help} {displayLanguage} />
	</div>
</div>

<style>
	.pentle-page {
		--pentle-text: var(--color-foreground);
		--pentle-result-text: oklch(14.5% 0 0);
		--pentle-tile: light-dark(rgb(239 248 255 / 0.52), rgb(18 21 27 / 0.72));
		--pentle-empty-tile: light-dark(rgb(239 248 255 / 0.1), rgb(255 255 255 / 0.015));
		--pentle-border: light-dark(rgb(15 23 42 / 0.46), rgb(255 255 255 / 0.22));
		--pentle-empty-border: light-dark(rgb(15 23 42 / 0.52), rgb(255 255 255 / 0.26));
		--pentle-active: light-dark(oklch(48.8% 0.243 264.376), oklch(75.351% 0.139 232.661));
		--pentle-error: light-dark(oklch(39% 0.16 25), oklch(74% 0.18 25));
		--pentle-correct: oklch(72.3% 0.219 149.579);
		--pentle-correct-border: oklch(52.7% 0.154 150.069);
		--pentle-present: oklch(79.5% 0.184 86.047);
		--pentle-present-border: oklch(60% 0.14 75.834);
		--pentle-absent: oklch(63.7% 0.237 25.331);
		--pentle-absent-border: oklch(48% 0.2 27.325);
		--interaction-accent: var(--pentle-active);

		--pentle-dialog: light-dark(rgb(239 248 255 / 0.94), rgb(12 12 12 / 0.94));
	}

	:global(html[data-pentle-language="de"]) .pentle-page:not(.language-ready) {
		visibility: hidden;
	}

	/* Shared feedback overrides tile defaults and glass hover styles.
	 * Symbols stay in child elements so focus rings retain their pseudo-elements.
	 * Keep these unlayered: this <style> is inlined above the Tailwind link, so an
	 * @layer block here would register the layer first and demote it below components. */
	.pentle-page :global([data-feedback]) {
		position: relative;
		background-image: none;
		color: var(--pentle-result-text);
	}

	.pentle-page :global([data-feedback="correct"]) {
		border-color: var(--pentle-correct-border);
		background-color: var(--pentle-correct);
	}

	.pentle-page :global([data-feedback="present"]) {
		border-color: var(--pentle-present-border);
		background-color: var(--pentle-present);
	}

	.pentle-page :global([data-feedback="absent"]) {
		border-color: var(--pentle-absent-border);
		background-color: var(--pentle-absent);
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
		/* Keep preference overrides below utilities so game feedback and active borders win. */
		@layer components {
			.pentle-page :global(.glass) {
				background-color: var(--pentle-glass, Canvas);
				background-image: none;
				border-color: var(--pentle-border);
				box-shadow: none;
				backdrop-filter: none;
			}

			.pentle-page :global(.interactive-surface:hover) {
				background-color: var(--pentle-glass-hover, Canvas);
			}
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
