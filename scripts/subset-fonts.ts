import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

// Runs after `vite build`: subsets the woff2 files in the build output so the
// full source fonts stay in the repo. The kept character set is the Latin +
// Latin-1 ranges below plus every character that actually appears in the
// built text assets, so new content can never end up without glyphs.
const baseRanges: [number, number][] = [
	[0x0020, 0x007e], // Basic Latin
	[0x00a0, 0x00ff], // Latin-1 Supplement (umlauts etc.)
	[0x2013, 0x2014], // en/em dash
	[0x2018, 0x201d], // curly quotes
	[0x2026, 0x2026], // ellipsis
	[0x2122, 0x2122] // trademark
];

const buildDirectory = path.resolve("build");
const keepCharacters = new Set<string>();

for (const [start, end] of baseRanges) {
	for (let codePoint = start; codePoint <= end; codePoint++) {
		keepCharacters.add(String.fromCodePoint(codePoint));
	}
}

const fontPaths: string[] = [];

async function collectFiles(directory: string) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			await collectFiles(entryPath);
		} else if (entry.name.endsWith(".woff2")) {
			fontPaths.push(entryPath);
		} else if (/\.(html|js|css|json|txt|xml|webmanifest)$/.test(entry.name)) {
			for (const character of await readFile(entryPath, "utf8")) {
				keepCharacters.add(character);
			}
		}
	}
}

await collectFiles(buildDirectory);

if (fontPaths.length === 0) {
	throw new Error("No woff2 fonts found in the build output; nothing to subset.");
}

const text = [...keepCharacters].join("");

for (const fontPath of fontPaths) {
	const original = await readFile(fontPath);
	const subset = await subsetFont(original, text, { targetFormat: "woff2" });

	if (subset.length >= original.length) {
		console.log(`Fonts: ${path.basename(fontPath)} left unchanged (subset would not shrink it)`);
		continue;
	}

	await writeFile(fontPath, subset);
	console.log(
		`Fonts: ${path.basename(fontPath)} subset ${(original.length / 1024).toFixed(1)} KB -> ${(subset.length / 1024).toFixed(1)} KB`
	);
}
