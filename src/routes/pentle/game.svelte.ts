import { wordsByLanguage, wordSetsByLanguage } from "./words";
import {
	MAX_ATTEMPTS,
	WORD_LENGTH,
	calculateScore,
	evaluateAttempt,
	normalizeWord,
	pickWord,
	type FeedbackStatus,
	type Language
} from "./pentle";

export type GameState = "setup" | "running" | "won" | "lost";
export type GameError = "wrongLength" | "notInList";

export class Game {
	state = $state<GameState>("setup");
	gameLanguage = $state<Language | null>(null);
	attempts = $state.raw<string[]>([]);
	feedbackGrid = $state.raw<FeedbackStatus[][]>([]);
	elapsedSeconds = $state(0);
	roundScore = $state(0);
	totalScore = $state(0);
	streak = $state(0);
	error = $state<GameError | null>(null);
	roundId = $state(0);

	private targetWord = "";
	private startedAt = 0;
	private timer: ReturnType<typeof setInterval> | null = null;

	get revealedWord(): string | null {
		return this.state === "lost" ? this.targetWord : null;
	}

	start(language: Language) {
		this.totalScore = 0;
		this.streak = 0;
		this.gameLanguage = language;
		this.startRound();
	}

	startNextRound() {
		if (this.gameLanguage && this.state === "won") {
			this.startRound();
		}
	}

	submitAttempt(rawAttempt: string): boolean {
		if (this.state !== "running" || !this.gameLanguage) return false;

		const attempt = normalizeWord(rawAttempt, this.gameLanguage);
		if ([...attempt].length !== WORD_LENGTH) {
			this.rejectAttempt("wrongLength");
			return false;
		}
		if (!wordSetsByLanguage[this.gameLanguage].has(attempt)) {
			this.rejectAttempt("notInList");
			return false;
		}

		this.clearError();
		const feedback = evaluateAttempt(attempt, this.targetWord);
		this.attempts = [...this.attempts, attempt];
		this.feedbackGrid = [...this.feedbackGrid, feedback];

		if (feedback.every((status) => status === "correct")) {
			this.stopTimer();
			this.roundScore = calculateScore(this.attempts.length, this.elapsedSeconds);
			this.totalScore += this.roundScore;
			this.streak += 1;
			this.state = "won";
		} else if (this.attempts.length === MAX_ATTEMPTS) {
			this.stopTimer();
			this.state = "lost";
		}

		return true;
	}

	returnToSetup() {
		this.stopTimer();
		this.clearError();
		this.state = "setup";
		this.gameLanguage = null;
		this.attempts = [];
		this.feedbackGrid = [];
		this.elapsedSeconds = 0;
		this.roundScore = 0;
		this.totalScore = 0;
		this.streak = 0;
	}

	destroy() {
		this.stopTimer();
	}

	private startRound() {
		if (!this.gameLanguage) return;

		this.targetWord = pickWord(wordsByLanguage[this.gameLanguage], this.targetWord);
		this.attempts = [];
		this.feedbackGrid = [];
		this.elapsedSeconds = 0;
		this.roundScore = 0;
		this.clearError();
		this.roundId += 1;
		this.state = "running";
		this.startTimer();
	}

	private startTimer() {
		this.stopTimer();
		this.startedAt = Date.now();
		this.timer = setInterval(() => {
			this.elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
		}, 1000);
	}

	private stopTimer() {
		if (this.startedAt) {
			this.elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
			this.startedAt = 0;
		}
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	private rejectAttempt(error: GameError) {
		this.error = error;
	}

	private clearError() {
		this.error = null;
	}
}
