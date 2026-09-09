export type Post = {
	slug: string;
	title: string;
	date: string;
	description: string;
	readingMinutes: number;
};

const metadata = import.meta.glob<Record<string, unknown>>("../posts/*/index.svx", {
	eager: true,
	import: "metadata"
});

const sources = import.meta.glob<string>("../posts/*/index.svx", {
	eager: true,
	query: "?raw",
	import: "default"
});

const WORDS_PER_MINUTE = 200;

function readingMinutes(source: string) {
	const body = source.replace(/^---[\s\S]*?---/, "");
	const words = body.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export const posts: Post[] = Object.entries(metadata)
	.map(([path, data]) => {
		const slug = path.slice("../posts/".length, -"/index.svx".length);
		const { title, date, description } = data;
		if (
			!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
			typeof title !== "string" ||
			!title.trim() ||
			typeof description !== "string" ||
			!description.trim() ||
			typeof date !== "string" ||
			!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
			!Number.isFinite(Date.parse(date)) ||
			new Date(date).toISOString().slice(0, 10) !== date
		) {
			throw new Error(`Invalid blog frontmatter or filename: ${path}`);
		}
		return { slug, title, date, description, readingMinutes: readingMinutes(sources[path]) };
	})
	.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
