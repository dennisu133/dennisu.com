import type { Component } from "svelte";
import type { PageLoad } from "./$types";

const components = import.meta.glob<{ default: Component }>("/src/lib/blog/posts/*/index.svx");

export const load: PageLoad = async ({ data }) => {
	const { default: Content } =
		await components[`/src/lib/blog/posts/${data.post.slug}/index.svx`]();
	return { ...data, Content };
};
