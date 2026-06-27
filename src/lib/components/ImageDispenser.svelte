<script module lang="ts">
	interface CachedImage {
		source: string;
		template: HTMLImageElement;
	}

	const imageCache = new Map<string, Promise<CachedImage | null>>();

	function preloadImage(source: string): Promise<CachedImage | null> {
		const cached = imageCache.get(source);
		if (cached) return cached;

		const pending = (async () => {
			const image = new Image();
			image.decoding = "async";
			image.fetchPriority = "low";
			image.src = source;

			try {
				await image.decode();
				return { source, template: image };
			} catch {
				return null;
			}
		})();

		imageCache.set(source, pending);
		void pending.then((image) => {
			if (!image && imageCache.get(source) === pending) {
				imageCache.delete(source);
			}
		});
		return pending;
	}
</script>

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
		source: string | null;
		x: number;
		y: number;
		size: number;
		direction: number;
		speedHorz: number;
		speedUp: number;
		spinSpeed: number;
		spinVal: number;
	}

	let { children, paths = {}, options = {} }: Props = $props();

	const images = $derived(Object.values(paths) as string[]);

	let element: HTMLElement;
	let decodedImages: CachedImage[] = [];
	let pendingImages = 0;
	let configuredSources = new Set<string>();
	const particlePools = new Map<string | null, HTMLElement[]>();
	let pooledParticleCount = 0;

	$effect(() => {
		const sources = [...new Set(images)];
		const resolved = new Array<CachedImage | undefined>(sources.length);
		let cancelled = false;

		decodedImages = [];
		pendingImages = sources.length;
		configuredSources = new Set(sources);
		particlePools.clear();
		pooledParticleCount = 0;

		sources.forEach((source, index) => {
			void preloadImage(source).then((image) => {
				if (cancelled) return;

				pendingImages--;
				if (image) resolved[index] = image;
				decodedImages = resolved.filter((entry): entry is CachedImage => entry !== undefined);
			});
		});

		return () => {
			cancelled = true;
		};
	});

	function getContainer(): HTMLElement {
		const id = "_image_dispenser_container";
		let container = document.getElementById(id);

		if (!container) {
			container = document.createElement("div");
			container.id = id;
			container.style.cssText =
				"overflow:hidden; position:fixed; height:100%; inset:0; pointer-events:none; z-index:9999;";
			document.body.appendChild(container);
		}
		return container;
	}

	onMount(() => {
		if (!element) return;

		let particles: Particle[] = [];
		let raf = 0;
		let active = false;
		let prevTimestamp = 0;
		let lastSpawnTime = 0;
		let mouseX = 0;
		let mouseY = 0;

		const LIMIT = 50;
		const SPAWN_INTERVAL = 80;
		const GRAVITY = 0.2;

		const container = getContainer();

		function acquireParticle(source: CachedImage | null, size: number): HTMLElement {
			const poolKey = source?.source ?? null;
			const pool = particlePools.get(poolKey);
			let particle = pool?.pop();
			if (particle) pooledParticleCount--;

			if (!particle) {
				if (source) {
					particle = source.template.cloneNode(false) as HTMLImageElement;
				} else {
					particle = document.createElement("div");
				}
			}

			if (particle instanceof HTMLImageElement) {
				particle.width = size;
				particle.height = size;
				particle.style.cssText =
					"position:absolute; left:0; top:0; border-radius:8px; object-fit:cover; display:block; will-change:transform;";
			} else {
				particle.style.cssText = `position:absolute; left:0; top:0; width:${size}px; height:${size}px; border-radius:50%; background:hsl(${Math.random() * 360}, 70%, 50%); will-change:transform;`;
			}

			return particle;
		}

		function releaseParticle(particle: Particle) {
			particle.element.remove();

			const sourceIsCurrent = particle.source === null || configuredSources.has(particle.source);
			if (!sourceIsCurrent || pooledParticleCount >= LIMIT) return;

			let pool = particlePools.get(particle.source);
			if (!pool) {
				pool = [];
				particlePools.set(particle.source, pool);
			}
			pool.push(particle.element);
			pooledParticleCount++;
		}

		function spawnParticle(now: number) {
			if (particles.length >= LIMIT) return;
			if (now - lastSpawnTime < SPAWN_INTERVAL) return;

			const source =
				decodedImages.length > 0
					? decodedImages[Math.floor(Math.random() * decodedImages.length)]
					: null;

			if (!source && images.length > 0 && pendingImages > 0) return;

			lastSpawnTime = now;

			const size = options.size || 50 + Math.random() * 20;
			const speedHorz = options.speedHorz || Math.random() * 8;
			const speedUp = options.speedUp || 6 + Math.random() * 6;
			const spinVal = Math.random() * 360;
			const spinSpeed = Math.random() * 10 * (Math.random() <= 0.5 ? -1 : 1);
			const x = mouseX - size / 2;
			const y = mouseY - size / 2;
			const direction = Math.random() <= 0.5 ? -1 : 1;

			const el = acquireParticle(source, size);
			el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${spinVal}deg)`;

			container.appendChild(el);

			particles.push({
				element: el,
				source: source?.source ?? null,
				x,
				y,
				size,
				direction,
				speedHorz,
				speedUp,
				spinSpeed,
				spinVal
			});
		}

		function tick(now: number) {
			// On first frame just record timestamp
			if (prevTimestamp === 0) {
				prevTimestamp = now;
				raf = requestAnimationFrame(tick);
				return;
			}

			const dt = Math.min((now - prevTimestamp) / 1000, 0.1);
			prevTimestamp = now;
			const timeScale = dt * 60;

			if (active) {
				spawnParticle(now);
			}

			const viewH = window.innerHeight;

			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.x -= p.speedHorz * p.direction * timeScale;
				p.y -= p.speedUp * timeScale;
				p.speedUp -= GRAVITY * timeScale;
				p.spinVal += p.spinSpeed * timeScale;

				if (p.y > viewH + p.size) {
					releaseParticle(p);
					particles.splice(i, 1);
					continue;
				}

				p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.spinVal}deg)`;
			}

			// Stop the loop when there's nothing left to animate
			if (particles.length > 0 || active) {
				raf = requestAnimationFrame(tick);
			} else {
				raf = 0;
				prevTimestamp = 0;
			}
		}

		function start() {
			active = true;
			if (!raf) {
				prevTimestamp = 0;
				raf = requestAnimationFrame(tick);
			}
		}

		function stop() {
			active = false;
		}

		let touchTimer: ReturnType<typeof setTimeout>;

		const onMouseEnter = () => start();
		const onMouseLeave = () => stop();
		const onMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		const onTouch = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (touch) {
				mouseX = touch.clientX;
				mouseY = touch.clientY;
			}
			start();
			clearTimeout(touchTimer);
			touchTimer = setTimeout(stop, 2000);
		};

		const onClick = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			start();
			clearTimeout(touchTimer);
			touchTimer = setTimeout(stop, 2000);
		};

		element.addEventListener("mouseenter", onMouseEnter);
		element.addEventListener("mouseleave", onMouseLeave);
		element.addEventListener("mousemove", onMouseMove);
		element.addEventListener("touchstart", onTouch, { passive: true });
		element.addEventListener("touchmove", onTouch, { passive: true });
		element.addEventListener("click", onClick);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			clearTimeout(touchTimer);
			element.removeEventListener("mouseenter", onMouseEnter);
			element.removeEventListener("mouseleave", onMouseLeave);
			element.removeEventListener("mousemove", onMouseMove);
			element.removeEventListener("touchstart", onTouch);
			element.removeEventListener("touchmove", onTouch);
			element.removeEventListener("click", onClick);

			for (let i = 0; i < particles.length; i++) {
				particles[i].element.remove();
			}
			particles = [];
			particlePools.clear();
			pooledParticleCount = 0;
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
