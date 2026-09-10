import { mdsvex, escapeSvelte } from "mdsvex";
import { codeToHtml } from "shiki";
import rehypeSlug from "rehype-slug";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: [".svx", ".md"],
					rehypePlugins: [rehypeSlug],
					highlight: {
						highlighter: async (code, lang) =>
							// Emit ordinary markup so shell continuations stay literal.
							escapeSvelte(
								await codeToHtml(code, {
									lang: lang || "text",
									tabindex: false,
									themes: { light: "github-light", dark: "github-dark-default" },
									defaultColor: false
								})
							)
					}
				})
			],
			inlineStyleThreshold: 40000,
			prerender: {
				// An empty blog has no pages or social images to prerender.
				handleUnseenRoutes: ({ routes }) => {
					const unexpected = routes.filter(
						(route) => route !== "/blog/[slug]" && route !== "/blog/[slug]/og.png"
					);
					if (unexpected.length) throw new Error(`Unprerendered routes: ${unexpected.join(", ")}`);
				}
			},
			adapter: adapter({
				// precompress: true | ignored by Cloudflare
			}),
			extensions: [".svelte", ".svx", ".md"]
		})
	],
	server: { host: true },
	build: {
		target: "esnext", // Smaller output for modern browsers
		modulePreload: { polyfill: false }
	}
});
