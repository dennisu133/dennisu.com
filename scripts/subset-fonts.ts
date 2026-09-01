import { basename } from "node:path";
import subsetFont from "subset-font";

// Runs after `vite build`, modifying only the generated font copies. Basic
// Latin protects runtime-generated text, while the extra characters cover
// common typography that may appear as HTML entities rather than literal text.
const buildDirectory = "build";
const keepCharacters = new Set<string>("\u00a0–—‘’“”…™");
const textFiles = new Bun.Glob("**/*.{css,html,js,json,svg,txt,webmanifest,xml}");
const fontFiles = new Bun.Glob("**/*.woff2");

for (let codePoint = 0x0020; codePoint <= 0x007e; codePoint++) {
	keepCharacters.add(String.fromCodePoint(codePoint));
}

for await (const file of textFiles.scan(buildDirectory)) {
	for (const character of await Bun.file(`${buildDirectory}/${file}`).text()) {
		keepCharacters.add(character);
	}
}

const fontPaths = await Array.fromAsync(fontFiles.scan(buildDirectory));
if (fontPaths.length === 0) {
	throw new Error("No woff2 fonts found in the build output; nothing to subset.");
}

const text = [...keepCharacters].join("");

for (const file of fontPaths) {
	const fontPath = `${buildDirectory}/${file}`;
	const original = Buffer.from(await Bun.file(fontPath).arrayBuffer());
	const subset = await subsetFont(original, text, { targetFormat: "woff2" });

	if (subset.length >= original.length) {
		console.log(`Fonts: ${basename(fontPath)} left unchanged (subset would not shrink it)`);
		continue;
	}

	await Bun.write(fontPath, subset);
	console.log(
		`Fonts: ${basename(fontPath)} subset ${(original.length / 1024).toFixed(1)} KB -> ${(subset.length / 1024).toFixed(1)} KB`
	);
}
