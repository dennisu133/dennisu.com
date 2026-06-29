import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { decodeEmail } from "../src/lib/emailObfuscation";

const buildDirectory = path.resolve("build");
const email = decodeEmail();
const encodedEmail = Buffer.from(email);
const leaks: string[] = [];

async function verifyDirectory(directory: string) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			await verifyDirectory(entryPath);
			continue;
		}

		const contents = await readFile(entryPath);

		if (contents.includes(encodedEmail)) {
			leaks.push(path.relative(buildDirectory, entryPath));
			continue;
		}

		if (entry.name.endsWith(".html")) {
			const textContent = contents.toString("utf8").replace(/<[^>]+>/g, "");

			if (textContent.includes(email)) {
				leaks.push(`${path.relative(buildDirectory, entryPath)} (HTML text content)`);
			}
		}
	}
}

await verifyDirectory(buildDirectory);

if (leaks.length > 0) {
	throw new Error(`Plaintext email leaked into the production build:\n${leaks.join("\n")}`);
}

console.log("Email obfuscation verified: no plaintext address found in the production build.");
