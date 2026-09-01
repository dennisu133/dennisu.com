<script lang="ts">
	import { onMount } from "svelte";
	import vertexShader from "./shaders/clouds.vert.glsl?raw";
	import fragmentShader from "./shaders/clouds.frag.glsl?raw";

	let canvas: HTMLCanvasElement | null = null;
	let isVisible = $state(false);

	const SPEED = 0.03;
	const SCALE = 1.1;
	const DENSITY = 0.2;
	const RESOLUTION_SCALE = 0.85;
	const MAX_CANVAS_WIDTH = 1920;
	const MAX_CANVAS_HEIGHT = 1080;
	const FRAME_INTERVAL = 1000 / 30;
	const MAX_DELTA = 0.1;
	const MAX_CLOUD_TIME = 1024;
	const FULL_TURN = Math.PI * 2;

	function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
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
	}

	// Computed styles can use color spaces that JavaScript cannot parse directly.
	// A 2D canvas resolves them to sRGB for the shader uniforms.
	let colorScratch: CanvasRenderingContext2D | null = null;
	function parseColor(color: string): [number, number, number] {
		if (!colorScratch) {
			const scratchCanvas = document.createElement("canvas");
			scratchCanvas.width = 1;
			scratchCanvas.height = 1;
			colorScratch = scratchCanvas.getContext("2d", { willReadFrequently: true });
			if (!colorScratch) return [0, 0, 0];
		}

		colorScratch.fillStyle = "#000";
		colorScratch.fillStyle = color;
		colorScratch.fillRect(0, 0, 1, 1);
		const [r, g, b] = colorScratch.getImageData(0, 0, 1, 1).data;
		return [r / 255, g / 255, b / 255];
	}

	function adjustLightness(
		r: number,
		g: number,
		b: number,
		delta: number
	): [number, number, number] {
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0;
		let s = 0;
		let l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h /= 6;
		}

		l = Math.max(0, Math.min(1, l + delta));
		if (s === 0) return [l, l, l];

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		const hue = (t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
	}

	function usesSoftwareRendering(gl: WebGL2RenderingContext) {
		const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
		if (!debugInfo) return false;

		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		return typeof renderer === "string" && /swiftshader|llvmpipe|software/i.test(renderer);
	}

	onMount(() => {
		if (!canvas) return;

		const target = canvas;
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		let destroyed = false;
		let stopRenderer = () => {};
		let cloudTime = 0;
		let cloudDirection = 1;
		let twinklePhase = 0;

		function startRenderer() {
			stopRenderer();
			isVisible = false;

			if (destroyed || motionPreference.matches) return;

			const context = target.getContext("webgl2", {
				alpha: false,
				antialias: false,
				depth: false,
				stencil: false,
				failIfMajorPerformanceCaveat: true,
				preserveDrawingBuffer: false
			});

			if (!context) return;
			const gl: WebGL2RenderingContext = context;
			if (usesSoftwareRendering(gl)) return;

			const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
			const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
			if (!vertex || !fragment) {
				if (vertex) gl.deleteShader(vertex);
				if (fragment) gl.deleteShader(fragment);
				return;
			}

			const program = gl.createProgram();
			if (!program) {
				gl.deleteShader(vertex);
				gl.deleteShader(fragment);
				return;
			}

			gl.attachShader(program, vertex);
			gl.attachShader(program, fragment);
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.error("Program link error:", gl.getProgramInfoLog(program));
				gl.deleteProgram(program);
				gl.deleteShader(vertex);
				gl.deleteShader(fragment);
				return;
			}

			const vao = gl.createVertexArray();
			if (!vao) {
				gl.deleteProgram(program);
				gl.deleteShader(vertex);
				gl.deleteShader(fragment);
				return;
			}

			gl.useProgram(program);
			gl.bindVertexArray(vao);

			const uniforms = {
				time: gl.getUniformLocation(program, "u_time"),
				twinklePhase: gl.getUniformLocation(program, "u_twinklePhase"),
				aspect: gl.getUniformLocation(program, "u_aspect"),
				scale: gl.getUniformLocation(program, "u_scale"),
				density: gl.getUniformLocation(program, "u_density"),
				skyColor1: gl.getUniformLocation(program, "u_skyColor1"),
				skyColor2: gl.getUniformLocation(program, "u_skyColor2"),
				cloudColor: gl.getUniformLocation(program, "u_cloudColor"),
				starsStrength: gl.getUniformLocation(program, "u_starsStrength")
			};

			gl.uniform1f(uniforms.scale, SCALE);
			gl.uniform1f(uniforms.density, DENSITY);

			let animationFrame = 0;
			let previousTimestamp = performance.now();

			function drawFrame() {
				if (gl.isContextLost()) return;
				gl.uniform1f(uniforms.time, cloudTime);
				gl.uniform1f(uniforms.twinklePhase, twinklePhase);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			}

			function resize() {
				const width = Math.max(1, window.innerWidth);
				const height = Math.max(1, window.innerHeight);
				const renderWidth = Math.min(MAX_CANVAS_WIDTH, Math.round(width * RESOLUTION_SCALE));
				const renderHeight = Math.min(MAX_CANVAS_HEIGHT, Math.round(height * RESOLUTION_SCALE));

				if (target.width !== renderWidth || target.height !== renderHeight) {
					target.width = renderWidth;
					target.height = renderHeight;
				}

				gl.viewport(0, 0, renderWidth, renderHeight);
				gl.uniform1f(uniforms.aspect, width / height);
				drawFrame();
			}

			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

			function applyColors() {
				const override = document.documentElement.dataset.theme;
				const isDark = override === "dark" || (override !== "light" && systemTheme.matches);
				const [r, g, b] = parseColor(getComputedStyle(target.parentElement!).backgroundColor);
				const [tr, tg, tb] = adjustLightness(r, g, b, isDark ? 0.02 : -0.2);

				gl.uniform3f(uniforms.skyColor2, r, g, b);
				gl.uniform3f(uniforms.skyColor1, tr, tg, tb);
				if (isDark) gl.uniform3f(uniforms.cloudColor, 0.4, 0.4, 0.5);
				else gl.uniform3f(uniforms.cloudColor, 1.1, 1.1, 0.9);
				gl.uniform1f(uniforms.starsStrength, isDark ? 1 : 0);
				drawFrame();
			}

			function tick(now: number) {
				animationFrame = 0;
				if (document.hidden) return;

				const elapsed = now - previousTimestamp;
				if (elapsed < FRAME_INTERVAL) {
					animationFrame = requestAnimationFrame(tick);
					return;
				}

				const delta = Math.min(elapsed / 1000, MAX_DELTA);
				previousTimestamp = now;
				cloudTime += delta * SPEED * cloudDirection;

				// Ping-pong after roughly nine hours to keep the float precise without a visual jump.
				if (cloudTime >= MAX_CLOUD_TIME || cloudTime <= 0) {
					cloudTime = Math.max(0, Math.min(MAX_CLOUD_TIME, cloudTime));
					cloudDirection *= -1;
				}

				twinklePhase = (twinklePhase + delta * 2) % FULL_TURN;
				drawFrame();
				animationFrame = requestAnimationFrame(tick);
			}

			function startAnimation() {
				if (animationFrame || document.hidden) return;
				previousTimestamp = performance.now();
				animationFrame = requestAnimationFrame(tick);
			}

			function stopAnimation() {
				cancelAnimationFrame(animationFrame);
				animationFrame = 0;
			}

			function handleVisibilityChange() {
				if (document.hidden) stopAnimation();
				else startAnimation();
			}

			const themeObserver = new MutationObserver(applyColors);
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme"]
			});
			systemTheme.addEventListener("change", applyColors);
			document.addEventListener("visibilitychange", handleVisibilityChange);
			window.addEventListener("resize", resize);

			resize();
			applyColors();
			isVisible = true;
			startAnimation();

			let stopped = false;
			stopRenderer = () => {
				if (stopped) return;
				stopped = true;
				stopAnimation();
				themeObserver.disconnect();
				systemTheme.removeEventListener("change", applyColors);
				document.removeEventListener("visibilitychange", handleVisibilityChange);
				window.removeEventListener("resize", resize);

				if (!gl.isContextLost()) {
					gl.deleteVertexArray(vao);
					gl.deleteProgram(program);
					gl.deleteShader(vertex);
					gl.deleteShader(fragment);
				}
			};
		}

		function handleContextLost(event: Event) {
			event.preventDefault();
			stopRenderer();
			isVisible = false;
		}

		function handleContextRestored() {
			startRenderer();
		}

		function handleMotionPreference() {
			if (motionPreference.matches) {
				stopRenderer();
				isVisible = false;
			} else {
				startRenderer();
			}
		}

		target.addEventListener("webglcontextlost", handleContextLost);
		target.addEventListener("webglcontextrestored", handleContextRestored);
		motionPreference.addEventListener("change", handleMotionPreference);
		startRenderer();

		return () => {
			destroyed = true;
			stopRenderer();
			target.removeEventListener("webglcontextlost", handleContextLost);
			target.removeEventListener("webglcontextrestored", handleContextRestored);
			motionPreference.removeEventListener("change", handleMotionPreference);
		};
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
		background-color: var(--color-background);
	}

	canvas {
		display: block;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 300ms ease-out;
	}

	canvas.visible {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		canvas {
			display: none;
		}
	}
</style>
