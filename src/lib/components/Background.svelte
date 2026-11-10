<div class="background pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
	<div class="glow absolute inset-0"></div>
	<div class="beam absolute inset-0"></div>
</div>

<style>
	/* One light source for both themes: the sun sits just outside the top-left corner.
	 * Light: open sky. Dark: the same sun seen from below the surface, fading into the depths. */
	.background {
		--gradient-top: light-dark(oklch(82.836% 0.0927 243.863), oklch(17% 0.04 240));
		--gradient-bottom: light-dark(oklch(63.867% 0.1448 251.385), oklch(4% 0.012 255));
		--sun-origin: -10% -10%;

		background: linear-gradient(155deg, var(--gradient-top), var(--gradient-bottom));
	}

	.glow {
		background: radial-gradient(
			ellipse 75% 85% at var(--sun-origin),
			light-dark(oklch(97% 0.03 230 / 55%), oklch(52% 0.11 225 / 38%)),
			transparent
		);
	}

	.beam {
		--ray: light-dark(oklch(100% 0 none / 40%), oklch(82% 0.09 215 / 9%));
		--ray-thin: light-dark(oklch(100% 0 none / 16%), oklch(82% 0.09 215 / 6%));

		background: conic-gradient(
			from calc(180deg - atan2(100vw, 100vh) - 35deg) at var(--sun-origin),
			transparent,
			var(--ray-thin) 12deg 16deg,
			transparent 22deg,
			var(--ray) 30deg 55deg,
			transparent 68deg,
			var(--ray-thin) 74deg 80deg,
			transparent 100deg
		);
		mask-image: radial-gradient(ellipse at var(--sun-origin), black, transparent);
	}
</style>
