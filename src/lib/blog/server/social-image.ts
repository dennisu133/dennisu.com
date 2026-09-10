import sharp from "sharp";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { formatPostDate } from "../posts";

const width = 1200;
const height = 630;

// Fixed dark-theme counterpart of layout.css: foreground, muted text and accent.
const colors = { foreground: "#ebebeb", muted: "#9ca3af", accent: "#38bdf8" };
const fonts = [
	["dm-serif-display-400", "DM Serif Display"],
	["geist-400-700", "Geist"],
	["commit-mono-400", "CommitMono"]
] as const;

function escapeMarkup(text: string) {
	return text.replace(/[&<>"']/g, (character) => {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character]!;
	});
}

const fontverter = createRequire(import.meta.url)("fontverter") as {
	convert(source: Buffer, format: "truetype"): Promise<Buffer>;
};

// Pango caches font paths for the process lifetime. Keep complete fonts available
// across posts and dev requests; SvelteKit's ignored directory owns these outputs.
let preparedFonts: Promise<string> | undefined;
function prepareFonts() {
	return (preparedFonts ??= (async () => {
		const sources = await Promise.all(
			fonts.map(([file]) => readFile(resolve("src/lib/assets/fonts", `${file}.woff2`)))
		);
		const hash = createHash("sha256");
		for (const source of sources) hash.update(source);
		const directory = resolve(".svelte-kit/social-fonts", hash.digest("hex").slice(0, 16));
		await mkdir(directory, { recursive: true });
		for (const [index, [file]] of fonts.entries()) {
			await writeFile(
				join(directory, `${file}.ttf`),
				await fontverter.convert(sources[index]!, "truetype")
			);
		}
		return directory;
	})());
}

export async function renderSocialImage(post: {
	title: string;
	description: string;
	date: string;
}) {
	const directory = await prepareFonts();
	const date = formatPostDate(post.date);

	// Rasterize the static background directly: a soft blue glow and square glass panel.
	// The panel follows .glass.interactive-surface: dark fill, border and sheen,
	// plus 1px top/left highlights fading from the dark theme’s 25% white.
	const pixels = Buffer.alloc(width * height * 3);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const glow = Math.exp(-((x / 850) ** 2 + (y / 650) ** 2));
			let rgb = [3 + 6 * glow, 5 + 12 * glow, 7 + 16 * glow];
			if (x >= 48 && x < 1152 && y >= 136 && y < 534) {
				const border = x === 48 || x === 1151 || y === 136 || y === 533;
				const sheen = 0.05 * Math.max(0, 1 - (x - 48 + (y - 136)) / 525);
				// Background highlights sit just inside the border, like the CSS surface.
				const highlight =
					y === 137
						? 0.25 * (1 - (x - 49) / 1102)
						: x === 49 && y >= 138
							? 0.25 * (1 - (y - 138) / 396)
							: 0;
				rgb = rgb.map((value) => {
					const glass = value * 0.85 + 10 * 0.15;
					const surface = glass * (1 - sheen) + 250 * sheen;
					return border ? glass * 0.88 + 255 * 0.12 : surface * (1 - highlight) + 250 * highlight;
				});
			}
			const offset = (y * width + x) * 3;
			rgb.forEach((value, channel) => {
				pixels[offset + channel] = Math.round(value);
			});
		}
	}

	async function textLayer(
		text: string,
		fontIndex: number,
		size: number,
		color: string,
		top: number,
		left: number,
		maxWidth: number,
		maxHeight: number
	) {
		const [file, family] = fonts[fontIndex]!;
		// Shrink only when necessary; fail rather than silently clip unusually long metadata.
		for (let fontSize = size; fontSize >= 22; fontSize -= 2) {
			const { data, info } = await sharp({
				text: {
					text: `<span foreground="${color}">${escapeMarkup(text)}</span>`,
					font: `${family} ${fontSize}`,
					fontfile: join(directory, `${file}.ttf`),
					width: maxWidth,
					wrap: "word-char",
					rgba: true,
					dpi: 72
				}
			})
				.png()
				.toBuffer({ resolveWithObject: true });
			if (info.height <= maxHeight) return { input: data, top, left };
		}
		throw new Error(`Social image text does not fit: ${text}`);
	}

	const layers = [
		await textLayer("dennisu.com", 2, 24, colors.accent, 64, 48, 650, 40),
		await textLayer("BLOG", 2, 22, colors.muted, 67, 1048, 104, 32),
		await textLayer(post.title, 0, 64, colors.foreground, 174, 88, 1024, 172),
		await textLayer(post.description, 1, 28, colors.muted, 374, 88, 1024, 112),
		await textLayer(date, 2, 22, colors.muted, 566, 48, 600, 32)
	];
	return await sharp(pixels, { raw: { width, height, channels: 3 } })
		.composite(layers)
		.png()
		.toBuffer();
}
