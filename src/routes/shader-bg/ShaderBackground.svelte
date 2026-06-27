<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { themeState } from "$lib/components/theme/theme.svelte";
	import vertexShader from "./shaders/clouds.vert.glsl?raw";
	import fragmentShader from "./shaders/clouds.frag.glsl?raw";

	let {
		speed = 0.03,
		scale = 1.1,
		density = 0.2
	}: {
		speed?: number;
		scale?: number;
		density?: number;
	} = $props();

	let canvas: HTMLCanvasElement | null = null;
	let teardown: (() => void) | undefined;
	let glContext: { updateColors: (mode: "light" | "dark") => void } | undefined = $state();
	let isInitializing = $state(false);
	let isVisible = $state(false);

	const RESOLUTION_SCALES: Record<0 | 1 | 2, number> = { 0: 0.5, 1: 0.7, 2: 0.85 };
	const SCALE_MIN = 0.4;
	const MAX_DT = 0.1;
	const DT_SMOOTHING = 0.12;
	const MAX_CANVAS_W = 1920;
	const MAX_CANVAS_H = 1080;

	const detectQualityLevel = (): 0 | 1 | 2 => {
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
		const isLowPower = navigator.hardwareConcurrency <= 4;
		const isSmallScreen = window.innerWidth < 768;
		if (isMobile || (isLowPower && isSmallScreen)) return 0;
		if (isLowPower || isSmallScreen) return 1;
		return 2;
	};

	const compileShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("Shader compile error:", gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	};

	// Parse a computed rgb()/rgba() color string to normalized [0-1] RGB values.
	// getComputedStyle().backgroundColor always returns rgb() or rgba() format.
	const parseColor = (color: string): [number, number, number] => {
		const match = color.match(/(\d+)/g);
		if (match && match.length >= 3) {
			return [parseInt(match[0]) / 255, parseInt(match[1]) / 255, parseInt(match[2]) / 255];
		}
		return [0, 0, 0];
	};

	const adjustLightness = (
		r: number,
		g: number,
		b: number,
		delta: number
	): [number, number, number] => {
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0,
			s = 0,
			l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h /= 6;
		}

		l = Math.max(0, Math.min(1, l + delta));

		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		if (s === 0) return [l, l, l];
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
	};

	const initialize = async () => {
		if (!canvas || teardown || isInitializing) return;

		isInitializing = true;

		// Defer until browser is idle
		await new Promise<void>((resolve) => {
			if ("requestIdleCallback" in window) {
				window.requestIdleCallback(() => resolve(), { timeout: 200 });
			} else {
				setTimeout(resolve, 50);
			}
		});

		if (!canvas || !isInitializing) {
			isInitializing = false;
			return;
		}

		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance",
			preserveDrawingBuffer: false
		});

		if (!gl) {
			console.error("WebGL2 not supported");
			isInitializing = false;
			return;
		}

		const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
		if (!vs || !fs) {
			isInitializing = false;
			return;
		}

		const program = gl.createProgram();
		if (!program) {
			isInitializing = false;
			return;
		}
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("Program link error:", gl.getProgramInfoLog(program));
			isInitializing = false;
			return;
		}

		gl.useProgram(program);

		const uniforms = {
			u_time: gl.getUniformLocation(program, "u_time"),
			u_aspect: gl.getUniformLocation(program, "u_aspect"),
			u_scale: gl.getUniformLocation(program, "u_scale"),
			u_speed: gl.getUniformLocation(program, "u_speed"),
			u_density: gl.getUniformLocation(program, "u_density"),
			u_quality: gl.getUniformLocation(program, "u_quality"),
			u_skyColor1: gl.getUniformLocation(program, "u_skyColor1"),
			u_skyColor2: gl.getUniformLocation(program, "u_skyColor2"),
			u_cloudColor: gl.getUniformLocation(program, "u_cloudColor"),
			u_starsStrength: gl.getUniformLocation(program, "u_starsStrength")
		};

		gl.uniform1f(uniforms.u_scale, scale);
		gl.uniform1f(uniforms.u_speed, speed);
		gl.uniform1f(uniforms.u_density, density);
		const qualityLevel = detectQualityLevel();
		gl.uniform1i(uniforms.u_quality, qualityLevel);

		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		let isDestroyed = false;
		let currentScale = RESOLUTION_SCALES[qualityLevel];

		const applyColors = (mode: "light" | "dark") => {
			if (isDestroyed || !canvas) return;

			// Read the resolved background-color from the .clouds-layer container.
			// This gives us the fully resolved RGB value (the browser resolves
			// light-dark() based on color-scheme), unlike getPropertyValue which
			// returns the raw CSS function.
			const bgResolved = getComputedStyle(canvas.parentElement!).backgroundColor;
			const [r, g, b] = parseColor(bgResolved);

			gl.uniform3f(uniforms.u_skyColor2, r, g, b);

			const [tr, tg, tb] = adjustLightness(r, g, b, mode === "dark" ? 0.02 : -0.2);
			gl.uniform3f(uniforms.u_skyColor1, tr, tg, tb);

			if (mode === "dark") {
				gl.uniform3f(uniforms.u_cloudColor, 0.4, 0.4, 0.5);
				gl.uniform1f(uniforms.u_starsStrength, 1.0);
			} else {
				gl.uniform3f(uniforms.u_cloudColor, 1.1, 1.1, 0.9);
				gl.uniform1f(uniforms.u_starsStrength, 0.0);
			}
		};

		const doUpdateColors = (mode: "light" | "dark") => {
			// Defer one frame to ensure CSS variables have been updated by the browser
			requestAnimationFrame(() => applyColors(mode));
		};

		const resize = () => {
			if (!canvas) return;
			const w = window.innerWidth;
			const h = window.innerHeight;
			const iw = Math.max(1, Math.min(MAX_CANVAS_W, Math.round(w * currentScale)));
			const ih = Math.max(1, Math.min(MAX_CANVAS_H, Math.round(h * currentScale)));
			canvas.width = iw;
			canvas.height = ih;
			gl.viewport(0, 0, iw, ih);
			gl.uniform1f(uniforms.u_aspect, w / h);
		};

		resize();
		window.addEventListener("resize", resize);

		// Apply initial colors synchronously (CSS vars are already set at this point)
		applyColors(themeState.mode);

		// Expose for reactive effects
		glContext = { updateColors: doUpdateColors };

		let raf = 0;
		let time = 0;
		let smoothedDt = 1 / 60;
		let running = true;
		let inView = true;
		let prevTimestamp = 0;

		const tick = (now: number) => {
			if (!running || !inView) return;

			// On first frame (or after resume), just record timestamp without advancing time
			if (prevTimestamp === 0) {
				prevTimestamp = now;
				gl.uniform1f(uniforms.u_time, time);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
				raf = requestAnimationFrame(tick);
				return;
			}

			let dt = (now - prevTimestamp) / 1000;
			prevTimestamp = now;

			if (dt > MAX_DT) dt = MAX_DT;
			if (dt <= 0) dt = 1 / 60;

			smoothedDt = smoothedDt * (1 - DT_SMOOTHING) + dt * DT_SMOOTHING;
			time += smoothedDt;

			gl.uniform1f(uniforms.u_time, time);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			// Adaptive resolution: adjust scale based on frame time
			const scaleMax = RESOLUTION_SCALES[qualityLevel];
			const ms = smoothedDt * 1000;
			let nextScale = currentScale;
			if (ms > 19.0 && currentScale > SCALE_MIN) {
				nextScale = Math.max(SCALE_MIN, currentScale - 0.01);
			} else if (ms < 15.0 && currentScale < scaleMax) {
				nextScale = Math.min(scaleMax, currentScale + 0.01);
			}
			if (Math.abs(nextScale - currentScale) > 0.001) {
				currentScale = nextScale;
				resize();
			}

			raf = requestAnimationFrame(tick);
		};

		const pause = () => {
			if (raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
			prevTimestamp = 0;
		};

		const resume = () => {
			if (!raf && running && inView) {
				prevTimestamp = 0;
				raf = requestAnimationFrame(tick);
			}
		};

		const onVisibility = () => {
			running = !document.hidden;
			if (document.hidden) pause();
			else resume();
		};
		document.addEventListener("visibilitychange", onVisibility);

		const io = new IntersectionObserver(
			(entries) => {
				inView = entries[0]?.isIntersecting ?? true;
				if (!inView) pause();
				else resume();
			},
			{ root: null, threshold: 0 }
		);
		io.observe(canvas!);

		// Draw the first frame, then fade in
		raf = requestAnimationFrame((now) => {
			prevTimestamp = now;
			gl.uniform1f(uniforms.u_time, time);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			isVisible = true;
			raf = requestAnimationFrame(tick);
		});

		teardown = () => {
			isDestroyed = true;
			pause();
			document.removeEventListener("visibilitychange", onVisibility);
			io.disconnect();
			window.removeEventListener("resize", resize);
			gl.deleteProgram(program);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
			gl.deleteVertexArray(vao);
			glContext = undefined;
		};

		isInitializing = false;
	};

	onMount(() => {
		initialize();
	});

	onDestroy(() => {
		teardown?.();
	});

	// React to theme changes
	$effect(() => {
		glContext?.updateColors(themeState.mode);
	});
</script>

<div class="clouds-layer" aria-hidden="true">
	<canvas bind:this={canvas} class:visible={isVisible}></canvas>
</div>

<style>
	.clouds-layer {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background-color: var(--bg-base);
	}

	canvas {
		display: block;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		will-change: opacity;
		opacity: 0;
		transition: opacity 300ms ease-out;
	}

	canvas.visible {
		opacity: 1;
	}
</style>
