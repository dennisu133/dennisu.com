<script module lang="ts">
	const imageCache = new Map<string, Promise<boolean>>();

	function preloadImage(source: string) {
		const cached = imageCache.get(source);
		if (cached) return cached;

		const image = new Image();
		image.decoding = "async";
		image.fetchPriority = "low";
		image.src = source;

		const pending = image.decode().then(
			() => true,
			() => false
		);
		imageCache.set(source, pending);
		void pending.then((loaded) => {
			if (!loaded && imageCache.get(source) === pending) imageCache.delete(source);
		});
		return pending;
	}
</script>

<script lang="ts">
	import { onDestroy, type Snippet } from "svelte";

	interface Particle {
		element: HTMLElement;
		x: number;
		y: number;
		size: number;
		direction: number;
		speedHorz: number;
		speedUp: number;
		spinSpeed: number;
		spinVal: number;
	}

	let { children, images }: { children: Snippet; images: string[] } = $props();

	const LIMIT = 50;
	const SPAWN_INTERVAL = 80;
	const GRAVITY = 0.2;

	let trigger: HTMLButtonElement;
	let container: HTMLElement | undefined;
	let decodedImages: string[] = [];
	let imagesReady = false;
	let particles: Particle[] = [];
	let animationFrame = 0;
	let active = false;
	let previousTimestamp = 0;
	let lastSpawnTime = 0;
	let pointerX = 0;
	let pointerY = 0;
	let stopTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const sources = [...new Set(images)];
		let cancelled = false;

		decodedImages = [];
		imagesReady = sources.length === 0;

		void Promise.all(
			sources.map(async (source) => ((await preloadImage(source)) ? source : null))
		).then((results) => {
			if (cancelled) return;
			decodedImages = results.filter((source): source is string => source !== null);
			imagesReady = true;
		});

		return () => {
			cancelled = true;
		};
	});

	function getContainer() {
		const id = "_image_dispenser_container";
		const existing = document.getElementById(id);
		if (existing) return existing;

		const element = document.createElement("div");
		element.id = id;
		element.ariaHidden = "true";
		element.style.cssText =
			"position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:9999";
		document.body.appendChild(element);
		return element;
	}

	function createParticleElement(source: string | null, size: number) {
		if (!source) {
			const element = document.createElement("div");
			element.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;background:hsl(${Math.random() * 360},70%,50%);will-change:transform`;
			return element;
		}

		const element = document.createElement("img");
		element.src = source;
		element.alt = "";
		element.draggable = false;
		element.width = size;
		element.height = size;
		element.style.cssText =
			"position:absolute;left:0;top:0;border-radius:8px;object-fit:cover;display:block;will-change:transform";
		return element;
	}

	function spawnParticle(now: number) {
		if (particles.length >= LIMIT || now - lastSpawnTime < SPAWN_INTERVAL) return;
		if (!imagesReady) return;

		const source = decodedImages[Math.floor(Math.random() * decodedImages.length)] ?? null;
		const size = 50 + Math.random() * 20;
		const x = pointerX - size / 2;
		const y = pointerY - size / 2;
		const spinVal = Math.random() * 360;
		const element = createParticleElement(source, size);

		lastSpawnTime = now;
		element.style.transform = `translate3d(${x}px,${y}px,0) rotate(${spinVal}deg)`;
		(container ??= getContainer()).appendChild(element);
		particles.push({
			element,
			x,
			y,
			size,
			direction: Math.random() <= 0.5 ? -1 : 1,
			speedHorz: Math.random() * 8,
			speedUp: 6 + Math.random() * 6,
			spinSpeed: Math.random() * 10 * (Math.random() <= 0.5 ? -1 : 1),
			spinVal
		});
	}

	function tick(now: number) {
		if (!previousTimestamp) {
			previousTimestamp = now;
			animationFrame = requestAnimationFrame(tick);
			return;
		}

		const timeScale = Math.min((now - previousTimestamp) / 1000, 0.1) * 60;
		previousTimestamp = now;
		if (active) spawnParticle(now);

		for (let index = particles.length - 1; index >= 0; index--) {
			const particle = particles[index];
			particle.x -= particle.speedHorz * particle.direction * timeScale;
			particle.y -= particle.speedUp * timeScale;
			particle.speedUp -= GRAVITY * timeScale;
			particle.spinVal += particle.spinSpeed * timeScale;

			if (particle.y > window.innerHeight + particle.size) {
				particle.element.remove();
				particles.splice(index, 1);
			} else {
				particle.element.style.transform = `translate3d(${particle.x}px,${particle.y}px,0) rotate(${particle.spinVal}deg)`;
			}
		}

		if (particles.length || active) {
			animationFrame = requestAnimationFrame(tick);
		} else {
			animationFrame = 0;
			previousTimestamp = 0;
		}
	}

	function start() {
		active = true;
		if (!animationFrame) animationFrame = requestAnimationFrame(tick);
	}

	function stop() {
		active = false;
	}

	function startTemporarily() {
		start();
		clearTimeout(stopTimer);
		stopTimer = setTimeout(stop, 2000);
	}

	function updatePointer(event: PointerEvent) {
		if (!event.isPrimary) return;
		pointerX = event.clientX;
		pointerY = event.clientY;
	}

	function handlePointerEnter(event: PointerEvent) {
		updatePointer(event);
		if (event.pointerType !== "touch") start();
	}

	function handlePointerLeave(event: PointerEvent) {
		if (event.pointerType !== "touch") stop();
	}

	function handlePointerDown(event: PointerEvent) {
		updatePointer(event);
		if (event.pointerType === "touch") startTemporarily();
	}

	function handleClick(event: MouseEvent) {
		const bounds = trigger.getBoundingClientRect();
		pointerX = event.detail ? event.clientX : bounds.left + bounds.width / 2;
		pointerY = event.detail ? event.clientY : bounds.top + bounds.height / 2;
		startTemporarily();
	}

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
		clearTimeout(stopTimer);
		particles.forEach(({ element }) => element.remove());
		particles = [];
		if (!container?.childElementCount) container?.remove();
	});
</script>

<button
	bind:this={trigger}
	type="button"
	class="interactive-word"
	aria-label="programming — dispense technology icons"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onpointermove={updatePointer}
	onpointerdown={handlePointerDown}
	onclick={handleClick}
>
	{@render children()}
</button>
