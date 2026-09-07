<script lang="ts">
	import { CornerDownLeft, Delete } from "@lucide/svelte";

	import { translate } from "./i18n";
	import type { FeedbackStatus, Language } from "./pentle";

	let { rows, feedback, gameLanguage, displayLanguage, onKey } = $props<{
		rows: readonly string[];
		feedback: readonly (readonly FeedbackStatus[])[];
		gameLanguage: Language;
		displayLanguage: Language;
		onKey: (key: string) => void;
	}>();

	const keyClass =
		"glass interactive-surface inline-flex min-h-11 max-w-11 min-w-0 flex-1 items-center justify-center rounded-xs px-1 py-2 text-center font-mono text-(--pentle-text)";

	const keyboardRows = $derived(
		gameLanguage === "de"
			? ["QWERTZUIOPÜ", "ASDFGHJKLÖÄ", "YXCVBNMß"]
			: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
	);

	const letterStates = $derived.by(() => {
		const states: Record<string, FeedbackStatus> = {};
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			for (let letterIndex = 0; letterIndex < rows[rowIndex].length; letterIndex++) {
				const letter = rows[rowIndex][letterIndex];
				const status = feedback[rowIndex]?.[letterIndex];
				if (
					status === "correct" ||
					(status === "present" && states[letter] !== "correct") ||
					(status === "absent" && !states[letter])
				) {
					states[letter] = status;
				}
			}
		}
		return states;
	});

	function stateFor(letter: string): FeedbackStatus | undefined {
		return letterStates[letter.toLocaleLowerCase(gameLanguage)];
	}

	function labelFor(letter: string): string {
		const state = stateFor(letter);
		return state ? `${letter}, ${translate(displayLanguage, state)}` : letter;
	}

	function skipKeyboard(event: MouseEvent) {
		event.preventDefault();
		document.querySelector<HTMLButtonElement>("#pentle-settings")?.focus();
	}
</script>

<a
	class="fixed top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-full border border-(--pentle-border) bg-(--pentle-dialog) px-3 py-2 text-(--pentle-text) focus-visible:translate-y-4 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out pointer-coarse:hidden"
	href="#pentle-settings"
	onclick={skipKeyboard}
>
	{translate(displayLanguage, "skipKeyboard")}
</a>

<div
	class="hidden w-full max-w-sm shrink-0 gap-1 select-none pointer-coarse:grid"
	role="group"
	aria-label={translate(displayLanguage, "letterHints")}
>
	{#each keyboardRows as row (row)}
		<div class="flex justify-center gap-1">
			{#each [...row] as letter (letter)}
				<span
					class="glass inline-flex h-8 max-w-8 min-w-0 flex-1 items-center justify-center rounded-xs font-mono text-xs text-(--pentle-text)"
					role="img"
					aria-label={labelFor(letter)}
					data-feedback={stateFor(letter)}
				>
					{letter}
					{#if stateFor(letter)}
						<span
							aria-hidden="true"
							class="pointer-events-none absolute right-0.5 bottom-0.5 font-sans text-xs leading-none font-bold"
							>{stateFor(letter) === "correct"
								? "✓"
								: stateFor(letter) === "present"
									? "↔"
									: "×"}</span
						>
					{/if}
				</span>
			{/each}
		</div>
	{/each}
</div>

<div
	id="pentle-keyboard"
	class="grid w-full max-w-xl gap-2 select-none pointer-coarse:hidden"
	role="group"
	aria-label={translate(displayLanguage, "keyboard")}
>
	{#each keyboardRows as row, rowIndex (row)}
		<div class="flex justify-center gap-1">
			{#each [...row] as letter (letter)}
				<button
					type="button"
					class={keyClass}
					aria-label={labelFor(letter)}
					data-feedback={stateFor(letter)}
					onclick={() => onKey(letter)}
				>
					{letter}
					{#if stateFor(letter)}
						<span
							aria-hidden="true"
							class="pointer-events-none absolute right-0.5 bottom-0.5 font-sans text-xs leading-none font-bold"
							>{stateFor(letter) === "correct"
								? "✓"
								: stateFor(letter) === "present"
									? "↔"
									: "×"}</span
						>
					{/if}
				</button>
			{/each}
			{#if rowIndex === keyboardRows.length - 2}
				<button
					type="button"
					class={keyClass}
					aria-label={translate(displayLanguage, "backspace")}
					onclick={() => onKey("Backspace")}
				>
					<Delete size={18} aria-hidden="true" />
				</button>
			{:else if rowIndex === keyboardRows.length - 1}
				<button
					type="button"
					class={keyClass}
					aria-label={translate(displayLanguage, "submit")}
					onclick={() => onKey("Enter")}
				>
					<CornerDownLeft size={18} aria-hidden="true" />
				</button>
			{/if}
		</div>
	{/each}
</div>
