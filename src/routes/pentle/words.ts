import germanWordsRaw from "./words.de.txt?raw";
import englishWordsRaw from "./words.en.txt?raw";

import type { Language } from "./pentle";

function parseWords(raw: string): string[] {
	return [...new Set(raw.trim().toLocaleLowerCase().split(/\s+/))].filter(
		(word) => [...word].length === 5
	);
}

export const wordsByLanguage: Record<Language, readonly string[]> = {
	de: parseWords(germanWordsRaw),
	en: parseWords(englishWordsRaw)
};

export const wordSetsByLanguage: Record<Language, ReadonlySet<string>> = {
	de: new Set(wordsByLanguage.de),
	en: new Set(wordsByLanguage.en)
};
