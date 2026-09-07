import type { Language } from "./pentle";

const translations = {
	de: {
		description:
			"Spiele Pentle auf Deutsch oder Englisch. Das Spiel läuft vollständig in deinem Browser.",
		home: "Zurück\u00a0zur Startseite",
		displayLanguage: "Anzeigesprache ändern",
		themeToggle: "Farbschema wechseln",
		switchToDarkMode: "Zum dunklen Modus wechseln",
		switchToLightMode: "Zum hellen Modus wechseln",
		chooseGameLanguage: "Spielsprache wählen",
		introductionBeforeHelp: "In Pentle errätst du Wörter mit fünf Buchstaben. Über ",
		introductionAfterHelp: " erfährst du, wie das Spiel funktioniert.",
		dictionaryDisclaimer:
			"Die Wortliste ist bewusst kuratiert.\nEinige gültige Wörter werden möglicherweise nicht akzeptiert.",
		playInGerman: "Auf Deutsch spielen",
		playInEnglish: "Auf Englisch spielen",
		score: "Punktzahl",
		streak: "Serie",
		time: "Zeit",
		seconds: "{count} s",
		submit: "Versuch absenden",
		backspace: "Letzten Buchstaben löschen",
		skipKeyboard: "Bildschirmtastatur überspringen",
		currentGuess: "Aktueller Versuch: {guess}",
		guessResult: "Ergebnis für {guess}: {feedback}",
		keyboard: "Bildschirmtastatur",
		correct: "richtige Stelle",
		present: "im Wort an der falschen Stelle",
		absent: "nicht im Wort",
		row: "Zeile",
		letter: "Buchstabe",
		empty: "leer",
		characterLabel: "Versuch eingeben",
		wonTitle: "Richtig!",
		roundScore: "+{score} Punkte",
		nextWord: "Nächstes Wort",
		lostTitle: "Spiel beendet",
		wordWas: "Das Wort war {word}.",
		finalScore: "Endpunktzahl: {score}",
		finalStreak: "Letzte Serie: {streak}",
		newGame: "Neues Spiel",
		wrongLength: "Das Wort muss fünf Buchstaben lang sein.",
		notInList: "Das Wort steht nicht in der Liste.",
		helpButton: "Spielregeln anzeigen",
		close: "Spielregeln schließen",
		helpTitle: "Spielregeln",
		goalLabel: "Ziel",
		goalText: "Errate das geheime Wort in höchstens sechs Versuchen.",
		guessLabel: "Versuch",
		guessText: "Gib ein Wort mit fünf Buchstaben ein und drücke die Eingabetaste.",
		feedbackLabel: "Rückmeldung",
		feedbackText:
			"Grün und ✓ bedeuten, dass der Buchstabe an der richtigen Stelle steht. Gelb und ↔ bedeuten, dass er im Wort vorkommt, aber an einer anderen Stelle. Rot und × bedeuten, dass er nicht im Wort vorkommt.",
		scoringLabel: "Punkte",
		scoringText:
			"Je schneller du rätst und je weniger Versuche du brauchst, desto mehr Punkte bekommst du. Jedes erratene Wort verlängert deine Serie.",
		inspirationBeforeLink:
			"Der Name Pentle leitet sich von penta ab, dem griechischen Wort für fünf. Du errätst Wörter mit fünf Buchstaben. Das Spiel ist von ",
		inspirationAfterLink: " inspiriert und steht in keiner Verbindung zur New York Times."
	},
	en: {
		description: "Play Pentle in English or German. It runs entirely in your browser.",
		home: "Back\u00a0home",
		displayLanguage: "Change display language",
		themeToggle: "Change color theme",
		switchToDarkMode: "Switch to dark mode",
		switchToLightMode: "Switch to light mode",
		chooseGameLanguage: "Choose game language",
		introductionBeforeHelp: "Pentle is a word guessing game with five-letter words. Use ",
		introductionAfterHelp: " to learn how to play.",
		dictionaryDisclaimer:
			"The dictionary is intentionally curated.\nSome valid words may not be accepted.",
		playInGerman: "Play in German",
		playInEnglish: "Play in English",
		score: "Score",
		streak: "Streak",
		time: "Time",
		seconds: "{count} s",
		submit: "Submit guess",
		backspace: "Delete last letter",
		skipKeyboard: "Skip on-screen keyboard",
		currentGuess: "Current guess: {guess}",
		guessResult: "Result for {guess}: {feedback}",
		keyboard: "On-screen keyboard",
		correct: "correct position",
		present: "in the word at the wrong position",
		absent: "not in the word",
		row: "Row",
		letter: "letter",
		empty: "empty",
		characterLabel: "Enter your guess",
		wonTitle: "Correct!",
		roundScore: "+{score} points",
		nextWord: "Next word",
		lostTitle: "Game over",
		wordWas: "The word was {word}.",
		finalScore: "Final score: {score}",
		finalStreak: "Final streak: {streak}",
		newGame: "New game",
		wrongLength: "The word must be five letters long.",
		notInList: "That word isn't in the list.",
		helpButton: "Show game rules",
		close: "Close game rules",
		helpTitle: "How to play",
		goalLabel: "Goal",
		goalText: "Guess the secret word in six attempts or fewer.",
		guessLabel: "Guess",
		guessText: "Enter a five-letter word and press Enter.",
		feedbackLabel: "Feedback",
		feedbackText:
			"Green and ✓ mean the letter is in the right place. Yellow and ↔ mean it is in the word but in the wrong place. Red and × mean it is not in the word.",
		scoringLabel: "Scoring",
		scoringText:
			"The faster you guess and the fewer attempts you need, the more points you earn. Every win extends your streak.",
		inspirationBeforeLink:
			"Pentle gets its name from penta, Greek for five. You guess five-letter words. The game is inspired by ",
		inspirationAfterLink: " and isn't affiliated with The New York Times."
	}
} as const;

export type TranslationKey = keyof (typeof translations)["de"];

export function translate(
	language: Language,
	key: TranslationKey,
	params: Record<string, string | number> = {}
): string {
	let text: string = translations[language][key];
	for (const [name, value] of Object.entries(params)) {
		text = text.replace(`{${name}}`, String(value));
	}
	return text;
}

export function ordinal(language: Language, index: number): string {
	const english = ["first", "second", "third", "fourth", "fifth"];
	const german = ["erster", "zweiter", "dritter", "vierter", "fünfter"];
	return (language === "de" ? german : english)[index] ?? String(index + 1);
}
