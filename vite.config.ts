import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			inlineStyleThreshold: 40000,
			adapter: adapter({
				// precompress: true | ignored by Cloudflare
			})
		})
	],
	server: { host: true },

	build: {
		target: "esnext", // Smaller output for modern browsers
		modulePreload: { polyfill: false }
	}
});
