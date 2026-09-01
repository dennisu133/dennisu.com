export {};

const buildDirectory = "build";
const textFiles = new Bun.Glob("**/*.{css,html,js,json,map,svg,txt,webmanifest,xml}");
const emailPattern = /[\w.+-]+@(?:[\w-]+\.)+[\w-]+/;
const leaks: string[] = [];

for await (const file of textFiles.scan(buildDirectory)) {
	const contents = await Bun.file(`${buildDirectory}/${file}`).text();
	if (emailPattern.test(contents)) leaks.push(file);
}

if (leaks.length > 0) {
	throw new Error(`Plaintext email leaked into the production build:\n${leaks.join("\n")}`);
}

console.log("Email obfuscation verified: no plaintext address found in the production build.");
