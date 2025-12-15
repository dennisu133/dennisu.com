<!--
  @component
  Renders a 2D clouds shader as a background using raw WebGL2.
  Adapted from Shadertoy "2D clouds" by drift. 
  Permission has been granted to use the shader in any way that you choose.

  Usage:
  ```html
  <Background speed={0.03} scale={1.1} density={0.2} />
  ```
-->

<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { themeState } from "./theme.svelte";
	import vertexShader from "./shaders/clouds.vert.glsl?raw";
	import fragmentShader from "./shaders/clouds.frag.glsl?raw";

	// Props to fine-tune the effect
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
	let glContext:
		| { updateColors: (mode: "light" | "dark") => void; updateQuality: (level: 0 | 1 | 2) => void }
		| undefined = $state();
	let isInitializing = $state(false);
	let isVisible = $state(false);

	// Resolution scale based on quality
	const getResolutionScale = (level: 0 | 1 | 2) => {
		return level === 0 ? 0.5 : level === 1 ? 0.7 : 0.85;
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

	const initialize = async () => {
		if (themeState.bg !== "animated" || !canvas || teardown || isInitializing) return;

		isInitializing = true;

		// Defer loading until browser is idle
		await new Promise<void>((resolve) => {
			if ("requestIdleCallback" in window) {
				window.requestIdleCallback(() => resolve(), { timeout: 200 });
			} else {
				setTimeout(resolve, 50);
			}
		});

		if (themeState.bg !== "animated" || !canvas || !isInitializing) {
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

		// Compile shaders
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

		// Get uniform locations
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

		// Set static uniforms
		gl.uniform1f(uniforms.u_scale, scale);
		gl.uniform1f(uniforms.u_speed, speed);
		gl.uniform1f(uniforms.u_density, density);
		gl.uniform1i(uniforms.u_quality, themeState.qualityLevel);

		// Create empty VAO for the fullscreen triangle
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		// Helper to parse CSS color
		const parseColor = (color: string): [number, number, number] => {
			const temp = document.createElement("div");
			temp.style.color = color;
			document.body.appendChild(temp);
			const computed = getComputedStyle(temp).color;
			document.body.removeChild(temp);
			const match = computed.match(/(\d+)/g);
			if (match && match.length >= 3) {
				return [parseInt(match[0]) / 255, parseInt(match[1]) / 255, parseInt(match[2]) / 255];
			}
			return [0, 0, 0];
		};

		// Helper to adjust lightness
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

		let isDestroyed = false;

		const doUpdateColors = (mode: "light" | "dark") => {
			// Defer to next tick to ensure CSS vars are updated
			setTimeout(() => {
				if (isDestroyed) return; // Guard against stale closure

				const styles = getComputedStyle(document.documentElement);
				const bgBase = styles.getPropertyValue("--bg-base").trim();
				const [r, g, b] = parseColor(bgBase);

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
			}, 0);
		};

		const doUpdateQuality = (level: 0 | 1 | 2) => {
			gl.uniform1i(uniforms.u_quality, level);
			resize();
		};

		// Initial colors
		doUpdateColors(themeState.current);

		// Expose functions via reactive state
		glContext = { updateColors: doUpdateColors, updateQuality: doUpdateQuality };

		let currentScale = getResolutionScale(themeState.qualityLevel);

		const resize = () => {
			if (!canvas) return;
			const w = window.innerWidth;
			const h = window.innerHeight;
			const MAX_W = 1920;
			const MAX_H = 1080;
			const iw = Math.max(1, Math.min(MAX_W, Math.round(w * currentScale)));
			const ih = Math.max(1, Math.min(MAX_H, Math.round(h * currentScale)));
			canvas.width = iw;
			canvas.height = ih;
			gl.viewport(0, 0, iw, ih);
			gl.uniform1f(uniforms.u_aspect, w / h);
		};

		resize();
		window.addEventListener("resize", resize);

		let raf = 0;
		let last = performance.now();
		let time = 0;
		let smoothedDt = 1 / 60;
		const dtSmoothing = 0.12;
		const MAX_DT = 0.1;

		// Adaptive resolution scaling
		const scaleMin = 0.4;
		let running = true;
		let inView = true;

		const tick = (now: number) => {
			if (!running || !inView) return;

			let dt = (now - last) / 1000;
			last = now;

			if (dt > MAX_DT) dt = MAX_DT;
			if (dt < 0) dt = 0;

			smoothedDt = smoothedDt * (1 - dtSmoothing) + dt * dtSmoothing;
			time += smoothedDt;

			gl.uniform1f(uniforms.u_time, time);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			// Adaptive scaling
			const scaleMax = getResolutionScale(themeState.qualityLevel);
			const ms = smoothedDt * 1000;
			let next = currentScale;
			if (ms > 19.0 && currentScale > scaleMin) {
				next = Math.max(scaleMin, currentScale - 0.01);
			} else if (ms < 15.0 && currentScale < scaleMax) {
				next = Math.min(scaleMax, currentScale + 0.01);
			}
			if (Math.abs(next - currentScale) > 0.001) {
				currentScale = next;
				resize();
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

		io.observe(canvas!);
		raf = requestAnimationFrame(tick);

		// Trigger fade in
		isVisible = true;

		teardown = () => {
			isDestroyed = true;
			cancelAnimationFrame(raf);
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
		if (themeState.bg === "animated") {
			initialize();
		}
	});

	onDestroy(() => {
		teardown?.();
	});

	// React to background toggle
	$effect(() => {
		const isAnimated = themeState.bg === "animated";

		if (isAnimated && !teardown && !isInitializing) {
			initialize();
		} else if (!isAnimated && (teardown || isInitializing)) {
			isVisible = false;
			// Delay teardown for fade out
			setTimeout(() => {
				if (teardown) {
					teardown();
					teardown = undefined;
				}
			}, 300);
			isInitializing = false;
		}
	});

	// React to theme changes
	$effect(() => {
		glContext?.updateColors(themeState.current);
	});

	// React to quality changes
	$effect(() => {
		glContext?.updateQuality(themeState.qualityLevel);
	});
</script>

<div class="clouds-layer" aria-hidden="true">
	<canvas bind:this={canvas} class:visible={isVisible}></canvas>
</div>

<style>
	.clouds-layer {
		position: fixed;
		inset: 0;
		z-index: -10;
		pointer-events: none;
		/* Always show the static background color */
		background-color: var(--bg-base);
	}

	canvas {
		display: block;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		will-change: transform;
		transform: translateZ(0);
		/* Canvas fades in/out, container stays visible */
		opacity: 0;
		transition: opacity 300ms ease-out;
	}

	canvas.visible {
		opacity: 1;
	}
</style>
