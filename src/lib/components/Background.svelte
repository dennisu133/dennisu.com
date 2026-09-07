<div class="background pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
	<div class="beam absolute inset-0"></div>
	<div class="noise absolute inset-0 opacity-5"></div>
</div>

<style>
	.background {
		--gradient-top: light-dark(oklch(82.836% 0.0927 243.863), oklch(15% 0.025 250));
		--gradient-bottom: light-dark(oklch(63.867% 0.1448 251.385), oklch(4% 0.008 250));

		background: linear-gradient(155deg, var(--gradient-top), var(--gradient-bottom));
	}

	.beam {
		background: conic-gradient(
			from calc(180deg - atan2(100vw, 100vh) - 35deg) at -10% -10%,
			transparent,
			light-dark(oklch(100% 0 none / 40%), transparent) 30deg 55deg,
			transparent 100deg
		);
		mask-image: radial-gradient(ellipse at -10% -10%, black, transparent);
	}
</style>
