import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const buildDirectory = path.resolve("build");
const emailPattern = /[\w.+-]+@(?:[\w-]+\.)+[\w-]+/;
const leaks: string[] = [];

async function verifyDirectory(directory: string) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			await verifyDirectory(entryPath);
			continue;
		}

		const contents = await readFile(entryPath, "utf8");
		if (emailPattern.test(contents)) {
			leaks.push(path.relative(buildDirectory, entryPath));
		}
	}
}

await verifyDirectory(buildDirectory);

if (leaks.length > 0) {
	throw new Error(`Plaintext email leaked into the production build:\n${leaks.join("\n")}`);
}

console.log("Email obfuscation verified: no plaintext address found in the production build.");
