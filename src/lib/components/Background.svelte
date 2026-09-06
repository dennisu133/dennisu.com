<div class="background" aria-hidden="true"></div>

<style>
	.background {
		--sky-dark: oklch(10.457% 0.0125 250.212);
		--sky-top: light-dark(oklch(82.836% 0.0927 243.863), var(--sky-dark));
		--sky-bottom: light-dark(oklch(63.867% 0.1448 251.385), var(--sky-dark));
		--cloud: light-dark(oklch(100% 0 none / 0.32), transparent);

		position: fixed;
		z-index: -1;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 65% 45% at 25% 48%, var(--cloud), transparent 75%),
			radial-gradient(ellipse 55% 40% at 85% 62%, var(--cloud), transparent 75%),
			linear-gradient(155deg, var(--sky-top), var(--sky-bottom));
	}

	@media (forced-colors: active) {
		.background {
			display: none;
		}
	}
</style>
