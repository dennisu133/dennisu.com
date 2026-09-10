import { error } from "@sveltejs/kit";
import { posts } from "$lib/blog/server/posts";
import { renderSocialImage } from "$lib/blog/server/social-image";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;
export const entries: EntryGenerator = () => posts.map(({ slug }) => ({ slug }));

export const GET: RequestHandler = async ({ params }) => {
	const post = posts.find((post) => post.slug === params.slug);
	if (!post) error(404, "Post not found");
	const image = await renderSocialImage(post);
	return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
};
