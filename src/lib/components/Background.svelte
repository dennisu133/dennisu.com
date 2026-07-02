<div class="background" aria-hidden="true">
	<div class="horizon light-atmosphere"></div>
	<div class="glow glow-primary light-atmosphere"></div>
	<div class="glow glow-secondary light-atmosphere"></div>
	<div class="glow glow-accent light-atmosphere"></div>
	<div class="light-beam light-atmosphere"></div>
	<div class="vignette"></div>
	<div class="dither"></div>
</div>

<style>
	.background {
		--sky-top: oklch(82.836% 0.0927 243.863);
		--sky-middle: oklch(74.685% 0.1352 250.366);
		--sky-bottom: oklch(63.867% 0.1448 251.385);
		--primary-glow: rgba(255, 255, 255, 0.72);
		--secondary-glow: rgba(186, 230, 253, 0.62);
		--accent-glow: rgba(224, 242, 254, 0.52);
		--horizon-glow: rgba(239, 248, 255, 0.66);
		--beam-core: rgba(255, 255, 255, 0.3);
		--vignette: light-dark(rgba(30, 64, 175, 0.18), rgba(0, 0, 0, 0.72));
		--light-atmosphere-display: block;
		--dither-opacity: 0;

		position: fixed;
		z-index: 0;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		background:
			radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.14), transparent 42%),
			linear-gradient(155deg, var(--sky-top) 0%, var(--sky-middle) 48%, var(--sky-bottom) 100%);
		isolation: isolate;
	}

	:global(:root[data-theme="dark"]) .background {
		--light-atmosphere-display: none;
		--dither-opacity: 0.045;

		background: oklch(10.457% 0.0125 250.212);
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme])) .background {
			--light-atmosphere-display: none;
			--dither-opacity: 0.045;

			background: oklch(10.457% 0.0125 250.212);
		}
	}

	@media (scripting: none) and (prefers-color-scheme: light) {
		:global(:root:not([data-theme]):has(#no-script-theme-toggle:checked)) .background {
			--light-atmosphere-display: none;
			--dither-opacity: 0.045;

			background: oklch(10.457% 0.0125 250.212);
		}
	}

	@media (scripting: none) and (prefers-color-scheme: dark) {
		:global(:root:not([data-theme]):has(#no-script-theme-toggle:checked)) .background {
			--light-atmosphere-display: block;
			--dither-opacity: 0;

			background:
				radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.14), transparent 42%),
				linear-gradient(155deg, var(--sky-top) 0%, var(--sky-middle) 48%, var(--sky-bottom) 100%);
		}
	}

	.light-atmosphere {
		display: var(--light-atmosphere-display);
	}

	.horizon,
	.glow,
	.light-beam,
	.vignette,
	.dither {
		position: absolute;
	}

	.horizon {
		right: -15%;
		bottom: -35%;
		left: -15%;
		height: 80%;
		background: radial-gradient(ellipse at 50% 100%, var(--horizon-glow) 0%, transparent 67%);
		animation: breathe 18s ease-in-out infinite alternate;
		will-change: transform;
	}

	.glow {
		border-radius: 9999px;
		will-change: transform;
	}

	.glow-primary {
		top: -29%;
		left: -26%;
		width: min(92rem, 105vw);
		aspect-ratio: 1.45;
		background: radial-gradient(ellipse, var(--primary-glow) 0%, transparent 68%);
		animation: drift-primary 32s ease-in-out infinite alternate;
	}

	.glow-secondary {
		right: -35%;
		bottom: -38%;
		width: min(82rem, 92vw);
		aspect-ratio: 1.2;
		background: radial-gradient(ellipse, var(--secondary-glow) 0%, transparent 70%);
		animation: drift-secondary 38s ease-in-out infinite alternate;
	}

	.glow-accent {
		top: 22%;
		left: 34%;
		width: min(58rem, 68vw);
		aspect-ratio: 1.65;
		background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 72%);
		animation: drift-accent 26s ease-in-out infinite alternate;
	}

	.light-beam {
		top: -42%;
		left: -38%;
		width: 175%;
		height: 185%;
		background: linear-gradient(112deg, transparent 38%, var(--beam-core) 48%, transparent 58%);
		filter: blur(28px);
		animation: sweep 34s ease-in-out infinite alternate;
		will-change: transform;
	}

	.vignette {
		inset: 0;
		background:
			linear-gradient(to bottom, transparent 55%, var(--vignette) 140%),
			radial-gradient(ellipse at center, transparent 55%, var(--vignette) 145%);
	}

	.dither {
		inset: 0;
		background-image: url("data:image/png;base64,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");
		background-size: 64px 64px;
		mix-blend-mode: soft-light;
		opacity: var(--dither-opacity);
	}

	@keyframes drift-primary {
		0% {
			transform: translate3d(-5%, -4%, 0) scale(1);
		}
		50% {
			transform: translate3d(6%, 7%, 0) scale(1.08);
		}
		100% {
			transform: translate3d(13%, 0, 0) scale(0.98);
		}
	}

	@keyframes drift-secondary {
		0% {
			transform: translate3d(4%, 5%, 0) scale(1.04);
		}
		55% {
			transform: translate3d(-8%, -7%, 0) scale(0.96);
		}
		100% {
			transform: translate3d(-15%, 3%, 0) scale(1.08);
		}
	}

	@keyframes drift-accent {
		0% {
			transform: translate3d(-9%, 4%, 0) rotate(-4deg);
		}
		100% {
			transform: translate3d(14%, -11%, 0) rotate(5deg);
		}
	}

	@keyframes sweep {
		0% {
			transform: translate3d(-8%, 0, 0) rotate(-3deg);
		}
		100% {
			transform: translate3d(12%, 3%, 0) rotate(4deg);
		}
	}

	@keyframes breathe {
		0% {
			transform: translate3d(0, 4%, 0) scale(0.96);
		}
		100% {
			transform: translate3d(0, -3%, 0) scale(1.05);
		}
	}

	@media (max-width: 40rem) {
		.glow-primary {
			top: -12%;
			left: -80%;
			width: 180vw;
		}

		.glow-secondary {
			right: -85%;
			bottom: -12%;
			width: 170vw;
		}

		.glow-accent {
			top: 38%;
			left: 5%;
			width: 120vw;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.horizon,
		.glow,
		.light-beam {
			animation: none;
		}

		.glow-primary {
			transform: translate3d(3%, 2%, 0);
		}

		.glow-secondary {
			transform: translate3d(-4%, -2%, 0);
		}
	}

	@media (forced-colors: active) {
		.background {
			display: none;
		}
	}
</style>
