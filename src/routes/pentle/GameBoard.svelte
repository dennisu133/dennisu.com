<script lang="ts">
	import { tick } from "svelte";

	import type { GameError } from "./game.svelte";
	import { ordinal, translate } from "./i18n";
	import Keyboard from "./Keyboard.svelte";
	import { MAX_ATTEMPTS, WORD_LENGTH, type FeedbackStatus, type Language } from "./pentle";

	let {
		attempts,
		feedback,
		gameLanguage,
		displayLanguage,
		playing,
		error,
		onSubmit
	}: {
		attempts: readonly string[];
		feedback: readonly (readonly FeedbackStatus[])[];
		gameLanguage: Language;
		displayLanguage: Language;
		playing: boolean;
		error: GameError | null;
		onSubmit: (attempt: string) => boolean;
	} = $props();

	const rowNumbers = Array.from({ length: MAX_ATTEMPTS }, (_, index) => index);
	const visibleRows = $derived(playing ? rowNumbers : rowNumbers.slice(0, attempts.length));

	let values = $state<string[]>(Array(WORD_LENGTH).fill(""));
	let activeIndex = $state(0);
	let hiddenInput: HTMLInputElement | null = null;
	let announcedGuess = $state<string | null>(null);
	let announcedError = $state<GameError | null>(null);
	let rejectionId = $state(0);

	const placeholder = " ";
	const guess = $derived(values.join(""));
	const feedbackAnnouncement = $derived.by(() => {
		const attempt = attempts.at(-1);
		const attemptFeedback = feedback.at(-1);
		if (!attempt || !attemptFeedback) return "";

		return translate(displayLanguage, "guessResult", {
			guess: attempt.toLocaleUpperCase(gameLanguage),
			feedback: attemptFeedback.map((status) => translate(displayLanguage, status)).join(", ")
		});
	});

	function isValidCharacter(character: string): boolean {
		return (gameLanguage === "de" ? /^[a-zA-ZäöüÄÖÜß]$/ : /^[a-zA-Z]$/).test(character);
	}

	function displayCharacter(character: string): string {
		return character === "ß" ? character : character.toLocaleUpperCase(gameLanguage);
	}

	function squareLabel(index: number, value: string, status?: FeedbackStatus): string {
		let label = `${ordinal(displayLanguage, index)} ${translate(displayLanguage, "letter")}, ${value || translate(displayLanguage, "empty")}`;
		if (status) label += `, ${translate(displayLanguage, status)}`;
		return label;
	}

	function moveCursor(index: number) {
		activeIndex = index;
		hiddenInput?.focus();
	}

	function announceGuess() {
		announcedGuess = guess;
	}

	function insertCharacter(character: string, focusInput = true) {
		if (!isValidCharacter(character)) return;
		values[activeIndex] = displayCharacter(character);
		if (activeIndex < WORD_LENGTH - 1) activeIndex += 1;
		if (focusInput) hiddenInput?.focus();
		announceGuess();
	}

	function deleteCharacter(focusInput = true) {
		if (values[activeIndex]) {
			values[activeIndex] = "";
		} else if (activeIndex > 0) {
			activeIndex -= 1;
			values[activeIndex] = "";
		}
		if (focusInput) hiddenInput?.focus();
		announceGuess();
	}

	async function submit() {
		if (onSubmit(guess)) {
			values = Array(WORD_LENGTH).fill("");
			activeIndex = 0;
			announcedGuess = null;
			announcedError = null;
			return;
		}

		rejectionId += 1;
		announcedError = null;
		await tick();
		announcedError = error;
	}

	function handleVirtualKey(key: string) {
		if (key === "Enter") {
			void submit();
			return;
		}
		if (key === "Backspace") {
			deleteCharacter(false);
		} else {
			insertCharacter(key, false);
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (
			!playing ||
			event.defaultPrevented ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			document.querySelector("dialog[open]")
		)
			return;

		if (
			event.target instanceof Element &&
			(event.key === "Enter" || event.key === " ") &&
			event.target.closest("button, a")
		)
			return;

		const inputHasFocus = document.activeElement === hiddenInput;
		if (inputHasFocus && (event.key.length === 1 || event.key === "Backspace")) return;

		switch (event.key) {
			case "Backspace":
				event.preventDefault();
				deleteCharacter();
				break;
			case "ArrowLeft":
				event.preventDefault();
				if (activeIndex > 0) moveCursor(activeIndex - 1);
				break;
			case "ArrowRight":
				event.preventDefault();
				if (activeIndex < WORD_LENGTH - 1) moveCursor(activeIndex + 1);
				break;
			case "Enter":
				event.preventDefault();
				void submit();
				break;
			case "Tab":
				break;
			default:
				if (event.key.length === 1) {
					event.preventDefault();
					insertCharacter(event.key);
				}
		}
	}

	function handleInput(event: Event) {
		const inputEvent = event as InputEvent;
		const input = event.currentTarget as HTMLInputElement;
		if (inputEvent.inputType.startsWith("delete") || input.value === "") {
			deleteCharacter(false);
			input.value = placeholder;
			return;
		}

		const inserted = inputEvent.data;
		if (inserted) {
			const characters =
				inputEvent.inputType === "insertCompositionText" ? inserted.slice(-1) : inserted;
			for (const character of characters) insertCharacter(character, false);
		}
		input.value = placeholder;
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		let index = activeIndex;
		for (const character of event.clipboardData?.getData("text") ?? "") {
			if (index === WORD_LENGTH) break;
			if (isValidCharacter(character)) values[index++] = displayCharacter(character);
		}
		const nextEmpty = values.findIndex((value) => !value);
		activeIndex = nextEmpty === -1 ? WORD_LENGTH - 1 : nextEmpty;
		announceGuess();
	}

	function focusInput(index: number) {
		activeIndex = index;
		hiddenInput?.focus();
	}

	function captureInput(input: HTMLInputElement) {
		hiddenInput = input;
		input.value = placeholder;
		input.focus();
		return () => (hiddenInput = null);
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class={playing ? "mb-1.5" : "mb-4"}>
	{#each visibleRows as rowIndex (rowIndex)}
		{@const attempt = attempts[rowIndex]}
		{#if attempt}
			<div
				class="relative mb-2 flex items-center justify-center gap-2 sm:mb-2.5 sm:gap-2.5"
				role="group"
				aria-label={`${translate(displayLanguage, "row")} ${rowIndex + 1}`}
			>
				{#each [...attempt] as character, index (index)}
					<div
						class="glass flex size-12 items-center justify-center rounded-xs border-2 border-(--pentle-border) bg-(--pentle-tile) p-0 font-mono text-2xl font-bold text-(--pentle-text) select-none data-feedback:bg-none data-feedback:text-(--pentle-result-text) data-[feedback=absent]:border-(--pentle-absent-border) data-[feedback=absent]:bg-(--pentle-absent) data-[feedback=correct]:border-(--pentle-correct-border) data-[feedback=correct]:bg-(--pentle-correct) data-[feedback=present]:border-(--pentle-present-border) data-[feedback=present]:bg-(--pentle-present) sm:size-14 sm:text-3xl"
						data-feedback={feedback[rowIndex]?.[index]}
						role="img"
						aria-label={squareLabel(
							index,
							displayCharacter(character),
							feedback[rowIndex]?.[index]
						)}
					>
						{displayCharacter(character)}
					</div>
				{/each}
			</div>
		{:else if playing && rowIndex === attempts.length}
			{#key rejectionId}
				<div
					class="relative mb-2 flex items-center justify-center gap-2 sm:mb-2.5 sm:gap-2.5"
					role="group"
					aria-label={`${translate(displayLanguage, "row")} ${rowIndex + 1}`}
				>
					<span class="sr-only" aria-live="polite" aria-atomic="true">
						{announcedGuess === null
							? ""
							: translate(displayLanguage, "currentGuess", {
									guess: announcedGuess || translate(displayLanguage, "empty")
								})}
					</span>
					<input
						type="text"
						class="pointer-events-none absolute size-px opacity-0"
						inputmode="text"
						enterkeyhint="done"
						tabindex="-1"
						aria-label={translate(displayLanguage, "characterLabel")}
						autocomplete="off"
						autocorrect="off"
						autocapitalize="characters"
						spellcheck="false"
						{@attach captureInput}
						onfocus={(event) => ((event.currentTarget as HTMLInputElement).value = placeholder)}
						oninput={handleInput}
						onpaste={handlePaste}
					/>
					{#each values as value, index (index)}
						<button
							type="button"
							class={[
								"accent-focus glass flex size-12 cursor-pointer items-center justify-center rounded-xs border-2 bg-(--pentle-tile) p-0 font-mono text-2xl font-bold text-(--pentle-text) select-none not-forced-colors:focus-visible:border-(--pentle-border) sm:size-14 sm:text-3xl",
								index === activeIndex
									? "border-(--pentle-active) forced-colors:outline-2 forced-colors:-outline-offset-4 forced-colors:outline-[Highlight]"
									: "border-(--pentle-border)",
								error &&
									"motion-safe:animate-[pentle-shake_500ms_ease-in-out] motion-reduce:border-(--pentle-error) forced-colors:border-dashed"
							]}
							onclick={() => focusInput(index)}
							onfocus={() => (activeIndex = index)}
							aria-label={squareLabel(index, value)}
						>
							{value}
						</button>
					{/each}

					<button
						type="button"
						class={[
							"glass absolute left-full ml-2 h-12 cursor-pointer rounded-xs px-4 font-bold whitespace-nowrap text-(--pentle-text) hover:border-(--pentle-active) hover:text-accent-hover max-lg:hidden sm:ml-2.5 sm:h-14",
							guess.length !== WORD_LENGTH && "invisible"
						]}
						onclick={submit}
						disabled={guess.length !== WORD_LENGTH}
					>
						{translate(displayLanguage, "submit")}
					</button>
				</div>
			{/key}
		{:else}
			<div
				class="relative mb-2 flex items-center justify-center gap-2 sm:mb-2.5 sm:gap-2.5"
				aria-hidden="true"
			>
				{#each rowNumbers.slice(0, WORD_LENGTH) as index (index)}
					<div
						class="glass size-12 items-center justify-center rounded-xs border-2 border-dashed border-(--pentle-empty-border) bg-(--pentle-empty-tile) p-0 font-mono text-2xl font-bold text-(--pentle-text) select-none sm:size-14 sm:text-3xl"
					></div>
				{/each}
			</div>
		{/if}
	{/each}
</div>

{#if playing}
	<p
		class="mb-2 min-h-6 text-sm font-semibold text-(--pentle-error)"
		aria-live="polite"
		aria-atomic="true"
	>
		{announcedError ? translate(displayLanguage, announcedError) : "\u00a0"}
	</p>
	<p class="sr-only" aria-live="polite" aria-atomic="true">{feedbackAnnouncement}</p>
	<Keyboard rows={attempts} {feedback} {gameLanguage} {displayLanguage} onKey={handleVirtualKey} />
{/if}

<style>
	@keyframes -global-pentle-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20%,
		60% {
			transform: translateX(-0.25rem);
		}
		40%,
		80% {
			transform: translateX(0.25rem);
		}
		0%,
		80% {
			border-color: var(--pentle-error);
		}
		100% {
			border-color: var(--pentle-border);
		}
	}
</style>
