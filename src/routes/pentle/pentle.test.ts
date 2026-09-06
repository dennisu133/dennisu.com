import { describe, expect, test } from "bun:test";

import { calculateScore, evaluateAttempt, normalizeWord, pickWord } from "./pentle";

describe("Pentle rules", () => {
	test("does not reuse duplicate letters", () => {
		expect(evaluateAttempt("allee", "apple")).toEqual([
			"correct",
			"present",
			"absent",
			"absent",
			"correct"
		]);
	});

	test("normalizes German guesses", () => {
		expect(normalizeWord(" ÄPFEL ", "de")).toBe("äpfel");
	});

	test("keeps the original time and attempt scoring", () => {
		expect(calculateScore(1, 30)).toBe(1000);
		expect(calculateScore(6, 200)).toBe(225);
	});

	test.each([
		[30, 1000],
		[31, 800],
		[60, 800],
		[61, 600],
		[120, 600],
		[121, 400],
		[180, 400],
		[181, 300],
		[300, 300],
		[301, 200]
	])("scores a first-attempt win at %i seconds as %i", (seconds, score) => {
		expect(calculateScore(1, seconds)).toBe(score);
	});

	test("rejects an empty word list", () => {
		expect(() => pickWord([])).toThrow("Cannot pick a word from an empty list.");
	});
});
