<script lang="ts">
	import { CircleQuestionMark, X } from "@lucide/svelte";

	import { translate } from "./i18n";
	import type { Language } from "./pentle";

	let { displayLanguage }: { displayLanguage: Language } = $props();
	let dialog: HTMLDialogElement;

	export function open() {
		dialog?.showModal();
	}

	function closeFromBackdrop(event: MouseEvent) {
		if (event.target !== dialog) return;

		const { left, right, top, bottom } = dialog.getBoundingClientRect();
		if (
			event.clientX < left ||
			event.clientX > right ||
			event.clientY < top ||
			event.clientY > bottom
		) {
			dialog.close();
		}
	}
</script>

<button
	type="button"
	class="group/help glass relative inline-flex cursor-pointer items-center justify-center rounded-xs p-2 text-muted-foreground hover:border-(--pentle-active) hover:text-foreground"
	aria-label={translate(displayLanguage, "helpButton")}
	onclick={open}
>
	<CircleQuestionMark size={20} aria-hidden="true" />
	<span class="tooltip right-0 bottom-full mb-1.5 group-hover/help:opacity-100">
		{translate(displayLanguage, "helpButton")}
	</span>
</button>

<dialog
	class="glass m-auto w-11/12 max-w-lg rounded-xs border-(--pentle-border) bg-(--pentle-dialog) p-5 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:grid open:gap-5 motion-safe:open:animate-[pentle-dialog-open_200ms_ease-out] contrast-more:shadow-none contrast-less:shadow-none sm:p-10 forced-colors:bg-[Canvas] forced-colors:backdrop:bg-[Canvas] forced-colors:backdrop:opacity-80 forced-colors:backdrop:backdrop-blur-none"
	bind:this={dialog}
	aria-labelledby="pentle-help-title"
	onclick={closeFromBackdrop}
>
	<button
		type="button"
		class="glass absolute top-3 right-3 inline-flex cursor-pointer items-center justify-center rounded-xs p-2 text-muted-foreground hover:border-(--pentle-active) hover:text-foreground"
		aria-label={translate(displayLanguage, "close")}
		onclick={() => dialog?.close()}
	>
		<X size={20} aria-hidden="true" />
	</button>
	<h2 class="pr-8 font-display text-2xl" id="pentle-help-title">
		{translate(displayLanguage, "helpTitle")}
	</h2>
	<dl class="grid gap-4">
		<div>
			<dt class="font-bold">{translate(displayLanguage, "goalLabel")}</dt>
			<dd class="mt-1 text-muted-foreground">{translate(displayLanguage, "goalText")}</dd>
		</div>
		<div>
			<dt class="font-bold">{translate(displayLanguage, "guessLabel")}</dt>
			<dd class="mt-1 text-muted-foreground">{translate(displayLanguage, "guessText")}</dd>
		</div>
		<div>
			<dt class="font-bold">{translate(displayLanguage, "feedbackLabel")}</dt>
			<dd class="mt-1 text-muted-foreground">
				{translate(displayLanguage, "feedbackText")}
			</dd>
		</div>
		<div>
			<dt class="font-bold">{translate(displayLanguage, "scoringLabel")}</dt>
			<dd class="mt-1 text-muted-foreground">{translate(displayLanguage, "scoringText")}</dd>
		</div>
	</dl>
	<p class="text-sm text-foreground/80">
		{translate(displayLanguage, "inspirationBeforeLink")}<a
			class="text-accent underline underline-offset-2 hover:text-accent-hover"
			href="https://www.nytimes.com/games/wordle/index.html"
			target="_blank"
			rel="noreferrer">Wordle</a
		>{translate(displayLanguage, "inspirationAfterLink")}
	</p>
</dialog>

<style>
	@keyframes -global-pentle-dialog-open {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}
</style>
