<!--
  @component
  Renders a 2D clouds shader as a background.
  Adapted from Shadertoy "2D clouds" by drift.

  Usage:
  ```html
  <Background
    enabled={true}
    speed={0.03}
    scale={1.1}
    density={0.2}
    resolutionScale={0.85}
  />
  ```
-->

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { themeState } from "./theme.svelte";
	import vertexShader from "./shaders/clouds.vert.glsl?raw";
	import fragmentShader from "./shaders/clouds.frag.glsl?raw";

	let host: HTMLDivElement | null = null;

	// Public props to fine-tune the effect without editing shaders
	let {
		speed = 0.03,
		scale = 1.1,
		density = 0.2, // "cloudcover" in shader
		resolutionScale = 0.85 // Internal render scale
	} = $props();

	let teardown: (() => void) | undefined;
	let updateColors: ((mode: "light" | "dark") => void) | undefined = $state();
	let isInitializing = $state(false);

	// Initialize WebGL when background is animated
	const initialize = async () => {
		if (themeState.bg !== "animated" || !host || teardown || isInitializing) return;

		isInitializing = true;

		// Defer loading until browser is idle to not block LCP
		await new Promise<void>((resolve) => {
			if ("requestIdleCallback" in window) {
				(window as Window).requestIdleCallback(() => resolve(), {
					timeout: 200
				});
			} else {
				setTimeout(resolve, 50);
			}
		});

		// Check if we should abort (mode changed during async operations)
		if (themeState.bg !== "animated" || !host || !isInitializing) {
			isInitializing = false;
			return;
		}

		// Tree-shake Three.js - import only what we need
		const {
			WebGLRenderer,
			Scene,
			OrthographicCamera,
			ShaderMaterial,
			Mesh,
			PlaneGeometry,
			Vector3,
			Color
		} = await import("three");

		// Check again after async import
		if (themeState.bg !== "animated" || !host || !isInitializing) {
			isInitializing = false;
			return;
		}

		// Renderer
		const renderer = new WebGLRenderer({
			alpha: false, // Opaque sky
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
		renderer.setClearColor(0x000000, 1);
		renderer.domElement.style.display = "block";
		renderer.domElement.style.position = "absolute";
		renderer.domElement.style.inset = "0";
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";
		renderer.domElement.style.pointerEvents = "none";
		renderer.domElement.style.willChange = "transform";
		renderer.domElement.style.transform = "translateZ(0)";

		// Final check before appending to DOM
		if (themeState.bg !== "animated" || !host || !isInitializing) {
			isInitializing = false;
			return;
		}

		host.appendChild(renderer.domElement);

		// Scene + Camera (screen-space quad)
		const scene = new Scene();
		const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		// Uniforms
		const uniforms = {
			u_time: { value: 0.0 },
			u_aspect: { value: 1.0 },
			u_scale: { value: scale },
			u_speed: { value: speed },
			u_density: { value: density },

			u_skyColor1: { value: new Vector3(0, 0, 0) },
			u_skyColor2: { value: new Vector3(0, 0, 0) },
			u_cloudColor: { value: new Vector3(1, 1, 1) },
			u_starsStrength: { value: 0.0 }
		};

		updateColors = (mode: "light" | "dark") => {
			// Wait a tick to ensure CSS var is updated
			setTimeout(() => {
				const styles = getComputedStyle(document.documentElement);
				// Read the theme-specific variable directly to avoid parsing light-dark()
				const bgBaseVar = mode === "dark" ? "--bg-base-dark" : "--bg-base-light";
				const bgBase = styles.getPropertyValue(bgBaseVar).trim();

				const baseColor = new Color(bgBase);

				// Dynamic Gradient:
				// Sky2 (bottom) matches the background exactly
				uniforms.u_skyColor2.value.set(baseColor.r, baseColor.g, baseColor.b);

				// Sky1 (top) is a slightly adjusted version to keep some depth
				const hsl = { h: 0, s: 0, l: 0 };
				baseColor.getHSL(hsl);
				if (mode === "dark") {
					hsl.l = Math.max(0, hsl.l + 0.02);
				} else {
					hsl.l = Math.max(0, hsl.l - 0.2);
				}
				const topColor = new Color().setHSL(hsl.h, hsl.s, hsl.l);
				uniforms.u_skyColor1.value.set(topColor.r, topColor.g, topColor.b);

				if (mode === "dark") {
					uniforms.u_cloudColor.value.set(0.4, 0.4, 0.5);
					uniforms.u_starsStrength.value = 1.0;
				} else {
					uniforms.u_cloudColor.value.set(1.1, 1.1, 0.9);
					uniforms.u_starsStrength.value = 0.0;
				}
			}, 0);
		};

		// Initial update
		updateColors(themeState.current);

		// Shaders (imported from separate files)
		let currentScale = resolutionScale;

		const material = new ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: false,
			depthTest: false,
			depthWrite: false
		});

		const quad = new Mesh(new PlaneGeometry(2, 2), material);
		scene.add(quad);

		// Resize handler
		const resize = () => {
			if (!host) return;
			const w = window.innerWidth;
			const h = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
			renderer.setPixelRatio(dpr);
			const MAX_W = 1920;
			const MAX_H = 1080;
			const iw = Math.max(1, Math.min(MAX_W, Math.round(w * currentScale)));
			const ih = Math.max(1, Math.min(MAX_H, Math.round(h * currentScale)));
			renderer.setSize(iw, ih, false);
			uniforms.u_aspect.value = w / h;
		};

		resize();
		window.addEventListener("resize", resize);

		let raf = 0;
		let last = performance.now();
		let smoothedDt = 1 / 60;
		const dtSmoothing = 0.12;

		// Adaptive resolution scaling
		let adaptiveResolution = true;
		const scaleMin = 0.65;
		const scaleMax = resolutionScale;
		const scaleStep = 0.01;

		const MAX_DT = 0.1; // Cap max frame time to 100ms

		let running = true;
		let inView = true;

		const tick = (now: number) => {
			if (!running || !inView) return;

			let dt = (now - last) / 1000;
			last = now;

			// Cap dt to prevent huge jumps after pauses/inactive tabs
			if (dt > MAX_DT) dt = MAX_DT;
			if (dt < 0) dt = 0; // prevent negative dt

			smoothedDt = smoothedDt * (1 - dtSmoothing) + dt * dtSmoothing;
			uniforms.u_time.value += smoothedDt;

			// Add context loss check if possible, though rare in WebGL1
			if (!renderer.getContext().isContextLost()) {
				renderer.render(scene, camera);
			}

			// Adaptive resolution scaling based on smoothed frame time
			if (adaptiveResolution) {
				const ms = smoothedDt * 1000.0;
				let next = currentScale;
				if (ms > 19.0 && currentScale > scaleMin) {
					next = Math.max(scaleMin, currentScale - scaleStep);
				} else if (ms < 15.0 && currentScale < scaleMax) {
					next = Math.min(scaleMax, currentScale + scaleStep);
				}
				if (Math.abs(next - currentScale) > 0.001) {
					currentScale = next;
					resize();
				}
			}

			raf = requestAnimationFrame(tick);
		};

		const onVisibility = () => {
			const hidden = document.hidden;
			running = !hidden;
			if (hidden && raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			} else if (!hidden && inView && !raf) {
				last = performance.now();
				raf = requestAnimationFrame(tick);
			}
		};
		document.addEventListener("visibilitychange", onVisibility);

		const io = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				inView = entry?.isIntersecting ?? true;
				if (!inView && raf) {
					cancelAnimationFrame(raf);
					raf = 0;
				} else if (inView && running && !raf) {
					last = performance.now();
					raf = requestAnimationFrame(tick);
				}
			},
			{ root: null, threshold: 0 }
		);

		io.observe(host!);

		raf = requestAnimationFrame(tick);

		teardown = () => {
			cancelAnimationFrame(raf);
			document.removeEventListener("visibilitychange", onVisibility);
			io.disconnect();
			window.removeEventListener("resize", resize);
			quad.geometry.dispose();
			material.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode) {
				renderer.domElement.parentNode.removeChild(renderer.domElement);
			}
		};

		isInitializing = false;
	};

	onMount(() => {
		// Initial mount - initialize if animated
		if (themeState.bg === "animated") {
			initialize();
		}
	});

	onDestroy(() => {
		teardown?.();
	});

	// React to background toggle changes
	$effect(() => {
		const isAnimated = themeState.bg === "animated";

		if (isAnimated && !teardown && !isInitializing) {
			// Switch to animated - initialize
			initialize();
		} else if (!isAnimated && (teardown || isInitializing)) {
			// Switch to static - tear down or abort initialization
			if (teardown) {
				teardown();
				teardown = undefined;
				updateColors = undefined;
			}
			// If initializing, set flag to abort (initialize will check and return early)
			isInitializing = false;
		}
	});

	// React to theme changes
	$effect(() => {
		if (updateColors) {
			updateColors(themeState.current);
		}
	});
</script>

<div bind:this={host} class="clouds-layer" aria-hidden="true"></div>

<style>
	.clouds-layer {
		position: fixed;
		inset: 0;
		z-index: -10; /* sit beneath content layers */
		pointer-events: none;
		background-color: var(--bg-base); /* Prevent FOUC while canvas loads */
	}
</style>
