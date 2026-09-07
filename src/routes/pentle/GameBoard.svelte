<script lang="ts">
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
		onSubmit,
		onAnnounce
	}: {
		attempts: readonly string[];
		feedback: readonly (readonly FeedbackStatus[])[];
		gameLanguage: Language;
		displayLanguage: Language;
		playing: boolean;
		error: GameError | null;
		onSubmit: (attempt: string) => boolean;
		onAnnounce: (message: string) => void;
	} = $props();

	const rowClass = "relative mb-2 flex items-center justify-center gap-2 sm:mb-2.5 sm:gap-2.5";

	const rowNumbers = Array.from({ length: MAX_ATTEMPTS }, (_, index) => index);
	const visibleRows = $derived(playing ? rowNumbers : rowNumbers.slice(0, attempts.length));

	let values = $state<string[]>(Array(WORD_LENGTH).fill(""));
	let activeIndex = $state(0);
	let hiddenInput: HTMLInputElement | null = null;
	let rejectionId = $state(0);

	const placeholder = " ";
	const guess = $derived(values.join(""));
	const guessDescription = $derived(
		translate(displayLanguage, "currentGuess", {
			guess: values.map((value) => value || translate(displayLanguage, "empty")).join(", ")
		})
	);

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
		announceCursor();
	}

	function announceCursor() {
		onAnnounce(
			translate(displayLanguage, "position", {
				position: activeIndex + 1,
				letter: values[activeIndex] || translate(displayLanguage, "empty")
			})
		);
	}

	function announceGuess() {
		onAnnounce(guessDescription);
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

	function submit() {
		if (onSubmit(guess)) {
			values = Array(WORD_LENGTH).fill("");
			activeIndex = 0;
			return;
		}

		rejectionId += 1;
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
			document.querySelector("dialog[open]") ||
			!(event.target instanceof Element) ||
			!event.target.closest("[data-pentle-input], #pentle-keyboard")
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
			case "Delete":
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

	function focusInput(index: number, event: MouseEvent) {
		activeIndex = index;
		announceCursor();
		if (event.detail === 0 && window.matchMedia("(pointer: fine)").matches) {
			document.querySelector<HTMLButtonElement>("#pentle-keyboard button")?.focus();
		} else {
			hiddenInput?.focus();
		}
	}

	function captureInput(input: HTMLInputElement) {
		hiddenInput = input;
		input.value = placeholder;
		// Keep Tab/Enter players on the keyboard when a new row mounts.
		if (!document.activeElement?.closest("#pentle-keyboard")) input.focus();
		return () => (hiddenInput = null);
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div data-pentle-input class={playing ? "mb-1.5" : "mb-4"}>
	{#each visibleRows as rowIndex (rowIndex)}
		{@const attempt = attempts[rowIndex]}
		{#if attempt}
			<div
				class={rowClass}
				role="group"
				aria-label={`${translate(displayLanguage, "row")} ${rowIndex + 1}`}
			>
				{#each [...attempt] as character, index (index)}
					<div
						class="glass flex size-12 items-center justify-center rounded-xs border-2 border-(--pentle-border) bg-(--pentle-tile) p-0 font-mono text-2xl font-bold text-(--pentle-text) select-none sm:size-14 sm:text-3xl"
						data-feedback={feedback[rowIndex]?.[index]}
						role="img"
						aria-label={squareLabel(
							index,
							displayCharacter(character),
							feedback[rowIndex]?.[index]
						)}
					>
						{displayCharacter(character)}
						{#if feedback[rowIndex]?.[index]}
							<span
								aria-hidden="true"
								class="pointer-events-none absolute right-0.5 bottom-0.5 font-sans text-xs leading-none font-bold"
								>{feedback[rowIndex][index] === "correct"
									? "✓"
									: feedback[rowIndex][index] === "present"
										? "↔"
										: "×"}</span
							>
						{/if}
					</div>
				{/each}
			</div>
		{:else if playing && rowIndex === attempts.length}
			<div
				class={rowClass}
				role="group"
				aria-label={`${translate(displayLanguage, "row")} ${rowIndex + 1}`}
			>
				<input
					type="text"
					class="pointer-events-none absolute size-px opacity-0"
					inputmode="text"
					enterkeyhint="done"
					tabindex="-1"
					aria-label={translate(displayLanguage, "characterLabel")}
					aria-describedby="pentle-input-instructions pentle-current-guess pentle-input-error"
					aria-invalid={error ? true : undefined}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="characters"
					spellcheck="false"
					{@attach captureInput}
					onfocus={(event) => ((event.currentTarget as HTMLInputElement).value = placeholder)}
					oninput={handleInput}
					onpaste={handlePaste}
				/>
				{#key rejectionId}
					{#each values as value, index (index)}
						<button
							type="button"
							class={[
								"accent-focus glass interactive-surface flex size-12 items-center justify-center rounded-xs border-2 bg-(--pentle-tile) p-0 font-mono text-2xl font-bold text-(--pentle-text) select-none not-forced-colors:focus-visible:border-(--pentle-border) sm:size-14 sm:text-3xl",
								index === activeIndex
									? "border-(--pentle-active) forced-colors:outline-2 forced-colors:-outline-offset-4 forced-colors:outline-[Highlight]"
									: "border-(--pentle-border)",
								error &&
									"motion-safe:animate-[pentle-shake_500ms_ease-in-out] motion-reduce:border-(--pentle-error) forced-colors:border-dashed"
							]}
							tabindex={index === activeIndex ? 0 : -1}
							onclick={(event) => focusInput(index, event)}
							onfocus={() => (activeIndex = index)}
							aria-describedby="pentle-input-instructions pentle-current-guess"
							aria-label={squareLabel(index, value)}
						>
							{value}
						</button>
					{/each}
				{/key}

				<button
					type="button"
					class={[
						"glass interactive-surface absolute left-full ml-2 h-12 rounded-xs px-4 font-bold whitespace-nowrap text-(--pentle-text) hover:text-accent-hover max-lg:hidden sm:ml-2.5 sm:h-14",
						guess.length !== WORD_LENGTH && "invisible"
					]}
					onclick={submit}
					disabled={guess.length !== WORD_LENGTH}
				>
					{translate(displayLanguage, "submit")}
				</button>
			</div>
		{:else}
			<div class={rowClass} aria-hidden="true">
				{#each rowNumbers.slice(0, WORD_LENGTH) as index (index)}
					<div
						class="glass size-12 rounded-xs border-2 border-dashed border-(--pentle-empty-border) bg-(--pentle-empty-tile) sm:size-14"
					></div>
				{/each}
			</div>
		{/if}
	{/each}
</div>

{#if playing}
	<!-- min-h-6 reserves the row, so leave this empty when there is no error:
	     it is referenced by the input's aria-describedby and a placeholder would be read out. -->
	<p class="mb-2 min-h-6 text-sm font-semibold text-(--pentle-error)" id="pentle-input-error">
		{error ? translate(displayLanguage, error) : ""}
	</p>
	<p id="pentle-input-instructions" class="sr-only">
		{translate(displayLanguage, "inputInstructions")}
	</p>
	<p id="pentle-current-guess" class="sr-only">{guessDescription}</p>
	<Keyboard rows={attempts} {feedback} {gameLanguage} {displayLanguage} onKey={handleVirtualKey} />
	<button
		type="button"
		class="glass interactive-surface mt-3 min-h-11 rounded-xs px-5 py-3 font-semibold pointer-fine:hidden"
		onclick={submit}
	>
		{translate(displayLanguage, "submit")}
	</button>
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
