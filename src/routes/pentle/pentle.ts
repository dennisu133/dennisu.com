export type Language = "de" | "en";
export type FeedbackStatus = "correct" | "present" | "absent";

export const MAX_ATTEMPTS = 6;
export const WORD_LENGTH = 5;

const SCORING = {
	base: 1000,
	attemptPenalty: 50,
	minimum: 100,
	timeBrackets: [
		{ maxSeconds: 30, multiplier: 1 },
		{ maxSeconds: 60, multiplier: 0.8 },
		{ maxSeconds: 120, multiplier: 0.6 },
		{ maxSeconds: 180, multiplier: 0.4 },
		{ maxSeconds: 300, multiplier: 0.3 },
		{ maxSeconds: Infinity, multiplier: 0.2 }
	]
} as const;

export function normalizeWord(word: string, language: Language): string {
	return word.trim().toLocaleLowerCase(language === "de" ? "de-DE" : "en-US");
}

export function evaluateAttempt(attempt: string, target: string): FeedbackStatus[] {
	const result: FeedbackStatus[] = Array(target.length).fill("absent");
	const remaining = new Map<string, number>();

	for (const letter of target) {
		remaining.set(letter, (remaining.get(letter) ?? 0) + 1);
	}

	for (let index = 0; index < target.length; index++) {
		if (attempt[index] === target[index]) {
			result[index] = "correct";
			remaining.set(attempt[index], (remaining.get(attempt[index]) ?? 0) - 1);
		}
	}

	for (let index = 0; index < target.length; index++) {
		const letter = attempt[index];
		if (result[index] !== "correct" && (remaining.get(letter) ?? 0) > 0) {
			result[index] = "present";
			remaining.set(letter, (remaining.get(letter) ?? 0) - 1);
		}
	}

	return result;
}

export function calculateScore(attempts: number, seconds: number): number {
	const base = SCORING.base - (attempts - 1) * SCORING.attemptPenalty;
	const bracket = SCORING.timeBrackets.find(({ maxSeconds }) => seconds <= maxSeconds);
	return Math.ceil(Math.max(SCORING.minimum, base * (bracket?.multiplier ?? 0.2)));
}

export function pickWord(words: readonly string[], previousWord = ""): string {
	if (words.length === 0) throw new Error("Cannot pick a word from an empty list.");

	const candidates = words.length > 1 ? words.filter((word) => word !== previousWord) : words;
	const randomValue = new Uint32Array(1);
	crypto.getRandomValues(randomValue);
	return candidates[randomValue[0] % candidates.length];
}
