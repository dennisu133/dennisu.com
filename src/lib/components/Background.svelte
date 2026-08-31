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
		--sky-dark: oklch(10.457% 0.0125 250.212);
		--sky-top: light-dark(oklch(82.836% 0.0927 243.863), var(--sky-dark));
		--sky-middle: light-dark(oklch(74.685% 0.1352 250.366), var(--sky-dark));
		--sky-bottom: light-dark(oklch(63.867% 0.1448 251.385), var(--sky-dark));
		--sky-highlight: light-dark(rgba(255, 255, 255, 0.14), transparent);
		--primary-glow: rgba(255, 255, 255, 0.72);
		--secondary-glow: rgba(186, 230, 253, 0.62);
		--accent-glow: rgba(224, 242, 254, 0.52);
		--horizon-glow: rgba(239, 248, 255, 0.66);
		--beam-core: rgba(255, 255, 255, 0.3);
		--vignette: light-dark(rgba(30, 64, 175, 0.18), rgba(0, 0, 0, 0.72));

		position: fixed;
		z-index: -1;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		background:
			radial-gradient(circle at 50% -20%, var(--sky-highlight), transparent 42%),
			linear-gradient(155deg, var(--sky-top) 0%, var(--sky-middle) 48%, var(--sky-bottom) 100%);
		isolation: isolate;
	}

	.light-atmosphere {
		display: var(--show-light);
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
	}

	.glow {
		border-radius: 50%;
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
	}

	.vignette {
		inset: 0;
		background:
			linear-gradient(to bottom, transparent 55%, var(--vignette) 140%),
			radial-gradient(ellipse at center, transparent 55%, var(--vignette) 145%);
	}

	.dither {
		display: var(--show-dark);
		inset: 0;
		background-image: url("$lib/assets/dither.png");
		background-size: 64px 64px;
		mix-blend-mode: soft-light;
		opacity: 0.045;
	}

	@keyframes drift-primary {
		0% {
			transform: translate(-5%, -4%) scale(1);
		}
		50% {
			transform: translate(6%, 7%) scale(1.08);
		}
		100% {
			transform: translate(13%, 0) scale(0.98);
		}
	}

	@keyframes drift-secondary {
		0% {
			transform: translate(4%, 5%) scale(1.04);
		}
		55% {
			transform: translate(-8%, -7%) scale(0.96);
		}
		100% {
			transform: translate(-15%, 3%) scale(1.08);
		}
	}

	@keyframes drift-accent {
		0% {
			transform: translate(-9%, 4%) rotate(-4deg);
		}
		100% {
			transform: translate(14%, -11%) rotate(5deg);
		}
	}

	@keyframes sweep {
		0% {
			transform: translate(-8%, 0) rotate(-3deg);
		}
		100% {
			transform: translate(12%, 3%) rotate(4deg);
		}
	}

	@keyframes breathe {
		0% {
			transform: translate(0, 4%) scale(0.96);
		}
		100% {
			transform: translate(0, -3%) scale(1.05);
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
			transform: translate(3%, 2%);
		}

		.glow-secondary {
			transform: translate(-4%, -2%);
		}
	}

	@media (forced-colors: active) {
		.background {
			display: none;
		}
	}
</style>
