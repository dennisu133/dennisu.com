<script lang="ts">
	import type { Snippet } from "svelte";

	let { children, images }: { children: Snippet; images: string[] } = $props();

	const LIMIT = 50;
	const SPAWN_INTERVAL = 80;
	const GRAVITY = 720;
	const KEYFRAME_COUNT = 12;

	function dispenseImages(trigger: HTMLButtonElement) {
		const container = document.createElement("span");
		container.ariaHidden = "true";
		container.style.cssText =
			"position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:9999";
		document.body.appendChild(container);

		let spawnTimer: ReturnType<typeof setInterval> | undefined;
		let stopTimer: ReturnType<typeof setTimeout> | undefined;
		let pointerX = 0;
		let pointerY = 0;

		function spawnParticle() {
			if (container.childElementCount >= LIMIT || !images.length) return;

			const source = images[Math.floor(Math.random() * images.length)];
			const size = 50 + Math.random() * 20;
			const startX = pointerX - size / 2;
			const startY = pointerY - size / 2;
			const velocityX = (Math.random() - 0.5) * 960;
			const velocityY = 360 + Math.random() * 360;
			const startRotation = Math.random() * 360;
			const spin = (Math.random() - 0.5) * 1200;
			const duration =
				(velocityY +
					Math.sqrt(velocityY ** 2 + 2 * GRAVITY * (window.innerHeight + size - startY))) /
				GRAVITY;

			const element = document.createElement("img");
			element.src = source;
			element.alt = "";
			element.draggable = false;
			element.width = size;
			element.height = size;
			element.style.cssText =
				"position:absolute;left:0;top:0;border-radius:8px;object-fit:cover;display:block";
			container.appendChild(element);

			const animation = element.animate(
				Array.from({ length: KEYFRAME_COUNT }, (_, index) => {
					const progress = index / (KEYFRAME_COUNT - 1);
					const elapsed = duration * progress;
					const x = startX + velocityX * elapsed;
					const y = startY - velocityY * elapsed + (GRAVITY * elapsed ** 2) / 2;
					const rotation = startRotation + spin * elapsed;

					return {
						offset: progress,
						transform: `translate3d(${x}px,${y}px,0) rotate(${rotation}deg)`
					};
				}),
				{ duration: duration * 1000, easing: "linear" }
			);
			animation.onfinish = () => element.remove();
		}

		function start() {
			if (spawnTimer !== undefined) return;
			spawnParticle();
			spawnTimer = setInterval(spawnParticle, SPAWN_INTERVAL);
		}

		function stop() {
			clearInterval(spawnTimer);
			spawnTimer = undefined;
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
			if (event.detail) return;

			const { left, top, width, height } = trigger.getBoundingClientRect();
			pointerX = left + width / 2;
			pointerY = top + height / 2;
			startTemporarily();
		}

		const controller = new AbortController();
		const listener = { signal: controller.signal };
		trigger.addEventListener("pointerenter", handlePointerEnter, listener);
		trigger.addEventListener("pointerleave", handlePointerLeave, listener);
		trigger.addEventListener("pointermove", updatePointer, listener);
		trigger.addEventListener("pointerdown", handlePointerDown, listener);
		trigger.addEventListener("click", handleClick, listener);

		return () => {
			controller.abort();
			stop();
			clearTimeout(stopTimer);
			container.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
			container.remove();
		};
	}
</script>

<button
	type="button"
	class="interactive-word"
	aria-label="programming — dispense technology icons"
	{@attach dispenseImages}
>
	{@render children()}
</button>
