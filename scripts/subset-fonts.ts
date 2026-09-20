import { basename } from "node:path";
import subsetFont from "subset-font";

// Generate separate inputs before Vite hashes assets. Basic Latin protects
// runtime text; extras cover typography, footnote entities and email scramble
// escapes. Add any future characters that do not appear literally in sources.
const keepCharacters = new Set<string>("\u00a0–—‘’“”…™↩░▒▓█•");
const textFiles = new Bun.Glob(
	"{src,static}/**/*.{svelte,svx,md,ts,js,css,html,json,svg,txt,webmanifest,xml}"
);
const fontFiles = new Bun.Glob("src/lib/assets/fonts/*.woff2");

for (let codePoint = 0x0020; codePoint <= 0x007e; codePoint++) {
	keepCharacters.add(String.fromCodePoint(codePoint));
}

for await (const file of textFiles.scan(".")) {
	for (const character of await Bun.file(file).text()) {
		keepCharacters.add(character);
	}
}

const fontPaths = (await Array.fromAsync(fontFiles.scan("."))).filter(
	(file) => !file.endsWith(".subset.woff2")
);
if (fontPaths.length === 0) {
	throw new Error("No source woff2 fonts found; nothing to subset.");
}

const text = [...keepCharacters].sort().join("");
// @types/subset-font does not yet declare keepFeatures, supported since 2.7.0.
const options: NonNullable<Parameters<typeof subsetFont>[2]> & { keepFeatures: string[] } = {
	targetFormat: "woff2",
	// Keep normal text shaping and tabular figures used by tabular-nums.
	// Revisit this list when adding fonts, writing systems, or CSS font features.
	keepFeatures: ["ccmp", "locl", "liga", "rlig", "kern", "mark", "mkmk", "tnum"]
};

for (const fontPath of fontPaths) {
	const original = Buffer.from(await Bun.file(fontPath).arrayBuffer());
	// Full fonts in dev allow new characters without restarting the server.
	const subset = process.argv.includes("--dev")
		? original
		: await subsetFont(original, text, options);
	const output = subset.length < original.length ? subset : original;

	await Bun.write(fontPath.replace(/\.woff2$/, ".subset.woff2"), output);
	console.log(
		`Fonts: ${basename(fontPath)} ${(original.length / 1024).toFixed(1)} KB -> ${(output.length / 1024).toFixed(1)} KB`
	);
}
