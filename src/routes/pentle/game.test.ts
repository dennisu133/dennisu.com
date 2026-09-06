import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { plugin, Transpiler } from "bun";
import { compileModule } from "svelte/compiler";

// Bun does not compile Svelte runes or Vite's raw text imports itself.
plugin({
	name: "pentle-tests",
	setup(build) {
		build.onLoad({ filter: /game\.svelte\.ts$/ }, async ({ path }) => ({
			contents: compileModule(
				new Transpiler({ loader: "ts" }).transformSync(await Bun.file(path).text()),
				{
					filename: path,
					generate: "client"
				}
			).js.code,
			loader: "js"
		}));
		build.onLoad({ filter: /words\.(de|en)\.txt\?raw$/ }, async ({ path }) => ({
			contents: `export default ${JSON.stringify(await Bun.file(path.replace(/\?raw$/, "")).text())}`,
			loader: "js"
		}));
	}
});

const { Game } = await import("./game.svelte");
const { wordsByLanguage } = await import("./words");
const [firstWord, secondWord] = wordsByLanguage.en;
let game: InstanceType<typeof Game>;

afterEach(() => {
	game?.destroy();
	mock.restore();
});

function start() {
	// Pick the first candidate deterministically; retain the real dictionaries.
	spyOn(crypto, "getRandomValues").mockImplementation((array: Uint32Array) => {
		array.fill(0);
		return array;
	});
	game = new Game();
	game.start("en");
	return game;
}

describe("Pentle rounds", () => {
	test("rejects invalid guesses without consuming attempts", () => {
		const game = start();
		expect(game.submitAttempt("app")).toBe(false);
		expect(game.error).toBe("wrongLength");
		expect(game.submitAttempt("zzzzz")).toBe(false);
		expect(game.error).toBe("notInList");
		expect(game.attempts).toEqual([]);
		expect(game.feedbackGrid).toEqual([]);
		expect(game.submitAttempt(` ${secondWord.toUpperCase()} `)).toBe(true);
		expect(game.error).toBeNull();
		expect(game.attempts).toEqual([secondWord]);
	});

	test("scores wins once and carries totals into a clean next round", () => {
		const game = start();
		expect(game.submitAttempt(firstWord)).toBe(true);
		expect(game.state).toBe("won");
		expect(game.roundScore).toBe(1000);
		expect(game.totalScore).toBe(1000);
		expect(game.streak).toBe(1);
		expect(game.submitAttempt(firstWord)).toBe(false);
		const roundId = game.roundId;
		game.startNextRound();
		expect(game.roundId).toBe(roundId + 1);
		expect(game.state).toBe("running");
		expect(game.attempts).toEqual([]);
		expect(game.feedbackGrid).toEqual([]);
		expect(game.roundScore).toBe(0);
		expect(game.elapsedSeconds).toBe(0);
		expect(game.submitAttempt(secondWord)).toBe(true);
		expect(game.totalScore).toBe(2000);
		expect(game.streak).toBe(2);
	});

	test("ends after six wrong guesses, preserves final totals, and resets setup", () => {
		const game = start();
		game.submitAttempt(firstWord);
		game.startNextRound();
		for (let index = 0; index < 6; index++) expect(game.submitAttempt(firstWord)).toBe(true);
		expect(game.state).toBe("lost");
		expect(game.revealedWord).toBe(secondWord);
		expect(game.totalScore).toBe(1000);
		expect(game.streak).toBe(1);
		expect(game.submitAttempt(secondWord)).toBe(false);
		game.startNextRound();
		expect(game.state).toBe("lost");
		game.returnToSetup();
		expect(game.state).toBe("setup");
		expect(game.gameLanguage).toBeNull();
		expect(game.revealedWord).toBeNull();
		expect(game.attempts).toEqual([]);
		expect(game.feedbackGrid).toEqual([]);
		expect(game.error).toBeNull();
		expect([game.totalScore, game.roundScore, game.streak, game.elapsedSeconds]).toEqual([
			0, 0, 0, 0
		]);
		expect(game.submitAttempt(firstWord)).toBe(false);
	});

	test("uses actual elapsed time at submission and clears each timer", () => {
		let now = 1000;
		spyOn(Date, "now").mockImplementation(() => now);
		const clearTimer = spyOn(globalThis, "clearInterval");
		const game = start();
		now += 31_000;
		game.submitAttempt(firstWord);
		expect(game.elapsedSeconds).toBe(31);
		expect(game.roundScore).toBe(800);
		expect(clearTimer).toHaveBeenCalledTimes(1);
		game.startNextRound();
		game.returnToSetup();
		expect(clearTimer).toHaveBeenCalledTimes(2);
		game.start("de");
		game.destroy();
		expect(clearTimer).toHaveBeenCalledTimes(3);
		game.destroy();
		expect(clearTimer).toHaveBeenCalledTimes(3);
	});
});
