<script lang="ts">
	import { onMount, type Snippet } from "svelte";

	interface Props {
		children: Snippet;
		paths?: Record<string, unknown>;
		options?: ParticleOptions;
	}

	interface ParticleOptions {
		size?: number;
		speedHorz?: number;
		speedUp?: number;
	}

	interface Particle {
		element: HTMLElement;
		left: number;
		size: number;
		top: number;
		direction: number;
		speedHorz: number;
		speedUp: number;
		spinSpeed: number;
		spinVal: number;
	}

	let { children, paths = {}, options = {} }: Props = $props();

	const images = Object.values(paths).map((path) => {
		return path as string;
	});

	let element: HTMLElement;

	function getContainer(): HTMLElement {
		const id = "_image_dispenser_container";
		let container = document.getElementById(id);

		if (!container) {
			container = document.createElement("div");
			container.setAttribute("id", id);
			container.setAttribute(
				"style",
				"overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; \
        bottom:0; pointer-events:none; z-index:9999;"
			);
			document.body.appendChild(container);
		}
		return container;
	}

	onMount(() => {
		if (!element) return;

		let particles: Particle[] = [];
		let animationFrame: number;
		let autoAddParticle = false;
		let lastParticleTimestamp = 0;
		let mouseX = 0;
		let mouseY = 0;
		const limit = 50;
		const particleGenerationDelay = 80;

		const container = getContainer();

		function generateParticle() {
			const size = options.size || 50 + Math.random() * 20;
			const speedHorz = options.speedHorz || Math.random() * 8;
			const speedUp = options.speedUp || 6 + Math.random() * 6;
			const spinVal = Math.random() * 360;
			const spinSpeed = Math.random() * 10 * (Math.random() <= 0.5 ? -1 : 1);
			const top = mouseY - size / 2;
			const left = mouseX - size / 2;
			const direction = Math.random() <= 0.5 ? -1 : 1;

			const particle = document.createElement("div");

			// Content
			if (images && images.length > 0) {
				const imgSrc = images[Math.floor(Math.random() * images.length)];
				const img = document.createElement("img");
				img.src = imgSrc;
				img.width = size;
				img.height = size;
				img.style.borderRadius = "8px"; // Optional rounding
				img.style.objectFit = "cover";
				particle.appendChild(img);
			} else {
				// Fallback: Colored Circle
				const svgNS = "http://www.w3.org/2000/svg";
				const circleSVG = document.createElementNS(svgNS, "svg");
				const circle = document.createElementNS(svgNS, "circle");
				circle.setAttributeNS(null, "cx", (size / 2).toString());
				circle.setAttributeNS(null, "cy", (size / 2).toString());
				circle.setAttributeNS(null, "r", (size / 2).toString());
				circle.setAttributeNS(null, "fill", `hsl(${Math.random() * 360}, 70%, 50%)`);
				circleSVG.appendChild(circle);
				circleSVG.setAttribute("width", size.toString());
				circleSVG.setAttribute("height", size.toString());
				particle.appendChild(circleSVG);
			}

			particle.style.position = "absolute";
			particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`;

			container.appendChild(particle);

			particles.push({
				element: particle,
				left,
				top,
				size,
				direction,
				speedHorz,
				speedUp,
				spinSpeed,
				spinVal
			});
		}

		let lastFrameTime = 0;

		function refreshParticles() {
			const currentTime = performance.now();
			// Calculate delta time in seconds (defaulting to ~60fps on first frame)
			const dt = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0.016;
			lastFrameTime = currentTime;

			// Target 60 FPS as the baseline (dt approx 0.016s)
			// If screen is 120Hz (dt approx 0.008s), this factor will be 0.5, slowing down per-frame movement
			const timeScale = dt * 60;

			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.left = p.left - p.speedHorz * p.direction * timeScale;
				p.top = p.top - p.speedUp * timeScale;
				p.speedUp = p.speedUp - 0.2 * timeScale;
				p.spinVal = p.spinVal + p.spinSpeed * timeScale;

				// Remove if out of bounds (bottom)
				if (p.top >= window.innerHeight + p.size) {
					particles.splice(i, 1);
					p.element.remove();
					continue;
				}

				p.element.style.top = `${p.top}px`;
				p.element.style.left = `${p.left}px`;
				p.element.style.transform = `rotate(${p.spinVal}deg)`;
			}
		}

		function loop(currentTime: number) {
			if (
				autoAddParticle &&
				particles.length < limit &&
				currentTime - lastParticleTimestamp > particleGenerationDelay
			) {
				generateParticle();
				lastParticleTimestamp = currentTime;
			}

			refreshParticles();
			animationFrame = requestAnimationFrame(loop);
		}

		animationFrame = requestAnimationFrame(loop);

		const onMouseEnter = () => {
			autoAddParticle = true;
		};

		const onMouseLeave = () => {
			autoAddParticle = false;
		};

		const onMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		let touchTimeout: ReturnType<typeof setTimeout>;

		const onTouch = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (touch) {
				mouseX = touch.clientX;
				mouseY = touch.clientY;
			}

			autoAddParticle = true;

			clearTimeout(touchTimeout);

			touchTimeout = setTimeout(() => {
				autoAddParticle = false;
			}, 2000);
		};

		element.addEventListener("mouseenter", onMouseEnter);
		element.addEventListener("mouseleave", onMouseLeave);
		element.addEventListener("mousemove", onMouseMove);

		// Mobile support
		element.addEventListener("touchstart", onTouch, { passive: true });
		element.addEventListener("touchmove", onTouch, { passive: true });
		// Also handle click just in case for hybrid devices or simple click interaction
		element.addEventListener("click", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			autoAddParticle = true;
			clearTimeout(touchTimeout);
			touchTimeout = setTimeout(() => {
				autoAddParticle = false;
			}, 2000);
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			element.removeEventListener("mouseenter", onMouseEnter);
			element.removeEventListener("mouseleave", onMouseLeave);
			element.removeEventListener("mousemove", onMouseMove);
			element.removeEventListener("touchstart", onTouch);
			element.removeEventListener("touchmove", onTouch);

			// Cleanup remaining particles
			particles.forEach((p) => p.element.remove());
			particles = [];
			clearTimeout(touchTimeout);
		};
	});
</script>

<span
	bind:this={element}
	class="inline-block underline decoration-2 underline-offset-4"
	role="presentation"
>
	{@render children()}
</span>
