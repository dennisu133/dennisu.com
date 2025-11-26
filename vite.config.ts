import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: true,
	},
	build: {
		target: "esnext", // Smaller output for modern browsers
		modulePreload: { polyfill: false }, // Skip polyfill for module preload
	},
});
