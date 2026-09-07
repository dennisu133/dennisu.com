import { expect, test } from "bun:test";
import { formatGuessFeedback } from "./i18n";
import { evaluateAttempt } from "./pentle";

test("spoken feedback pairs every repeated letter with its own position and result", () => {
	expect(formatGuessFeedback("en", "eerie", evaluateAttempt("eerie", "serve"), 2)).toBe(
		"Attempt 2 of 6: E E R I E. 1: E, not in the word. 2: E, correct position. 3: R, correct position. 4: I, not in the word. 5: E, correct position."
	);
});

test("German feedback preserves five positions when a guess contains sharp s", () => {
	expect(formatGuessFeedback("de", "grüße", evaluateAttempt("grüße", "grüße"), 6)).toBe(
		"Versuch 6 von 6: G R Ü ß E. 1: G, richtige Stelle. 2: R, richtige Stelle. 3: Ü, richtige Stelle. 4: ß, richtige Stelle. 5: E, richtige Stelle."
	);
});
