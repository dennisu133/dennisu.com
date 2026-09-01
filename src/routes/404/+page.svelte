<script lang="ts">
	import { ArrowLeft } from "@lucide/svelte";

	import { resolve } from "$app/paths";
	import Background from "$lib/components/Background.svelte";
</script>

<svelte:head>
	<title>404 - Dennisu.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Background />

<main class="flex min-h-svh flex-col items-center justify-center gap-10 p-6 select-none">
	<h1
		class="glitch relative text-[clamp(6rem,22vw,11rem)] leading-none tracking-wider before:pointer-events-none before:absolute before:inset-0 after:pointer-events-none after:absolute after:inset-0 forced-colors:before:hidden forced-colors:after:hidden"
		data-text="404"
	>
		404
	</h1>
	<p class="sr-only">Page not found.</p>

	<a
		href={resolve("/")}
		class="home-btn inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-p text-foreground backdrop-blur-md transition duration-200 ease-out hover:-translate-y-0.5 hover:border-accent focus-visible:-translate-y-0.5 focus-visible:border-accent active:translate-y-0 motion-reduce:translate-y-0! motion-reduce:transition-none"
	>
		<ArrowLeft size={18} aria-hidden="true" />
		<span class="label">take me home</span>
	</a>
</main>

<style>
	main {
		--glitch-cyan: light-dark(oklch(45% 0.12 195), oklch(70% 0.14 195));
		--glitch-magenta: light-dark(oklch(48% 0.2 340), oklch(62% 0.23 340));
	}

	.glitch::before,
	.glitch::after {
		content: attr(data-text) / "";
		clip-path: inset(0 0 100% 0);
	}

	.glitch::before {
		color: var(--glitch-cyan);
		animation: glitch-slices 3.7s infinite steps(1);
	}

	.glitch::after {
		color: var(--glitch-magenta);
		animation: glitch-slices 2.9s infinite steps(1) reverse;
	}

	/* Resting >90% of the cycle keeps it a twitch, not a strobe. */
	@keyframes glitch-slices {
		0%,
		90%,
		100% {
			clip-path: inset(0 0 100% 0);
			transform: none;
		}
		91% {
			clip-path: inset(12% 0 58% 0);
			transform: translate(-0.045em, -0.01em);
		}
		93% {
			clip-path: inset(64% 0 12% 0);
			transform: translate(0.04em, 0.015em);
		}
		95% {
			clip-path: inset(38% 0 44% 0);
			transform: translate(-0.03em, 0);
		}
		97% {
			clip-path: inset(78% 0 6% 0);
			transform: translate(0.045em, -0.01em);
		}
	}

	.home-btn {
		background-color: light-dark(rgb(239 248 255 / 0.28), rgb(12 12 12 / 0.6));
		box-shadow:
			inset 0 1px 0 light-dark(rgb(255 255 255 / 0.48), rgb(255 255 255 / 0.09)),
			0 8px 24px light-dark(rgb(30 64 175 / 0.07), rgb(0 0 0 / 0.32));
	}

	.home-btn:hover,
	.home-btn:focus-visible {
		box-shadow:
			inset 0 1px 0 light-dark(rgb(255 255 255 / 0.48), rgb(255 255 255 / 0.09)),
			0 12px 32px light-dark(rgb(30 64 175 / 0.14), rgb(0 0 0 / 0.45));
	}

	/* Chromatic-aberration echo of the glitch above. */
	.home-btn:hover .label,
	.home-btn:focus-visible .label {
		text-shadow:
			0.07em 0 color-mix(in oklab, var(--glitch-cyan) 75%, transparent),
			-0.07em 0 color-mix(in oklab, var(--glitch-magenta) 75%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.glitch::before,
		.glitch::after {
			animation: none;
		}
	}
</style>
