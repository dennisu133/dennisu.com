<script lang="ts">
	import type { Snippet } from "svelte";

	let { children, images }: { children: Snippet; images: string[] } = $props();

	const LIMIT = 50;
	const SPAWN_INTERVAL = 80;
	const GRAVITY = 720;
	const KEYFRAME_COUNT = 12;
	const TEMPORARY_DURATION = 2000;
	const STATIC_CLEARANCE = 80;
	const STATIC_EDGE_MARGIN = 12;
	const STATIC_ICON_GAP = 8;
	const STATIC_PLACEMENT_ATTEMPTS = 40;

	type Box = { left: number; top: number; right: number; bottom: number };

	function overlaps(first: Box, second: Box, gap = 0) {
		return (
			first.left < second.right + gap &&
			first.right + gap > second.left &&
			first.top < second.bottom + gap &&
			first.bottom + gap > second.top
		);
	}

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
		let staticElements: HTMLImageElement[] = [];
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

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

		function clearStaticIcons() {
			staticElements.forEach((element) => element.remove());
			staticElements = [];
		}

		function showStaticIcons() {
			clearStaticIcons();

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const triggerBounds = trigger.getBoundingClientRect();
			const safeZone: Box = {
				left: triggerBounds.left - STATIC_CLEARANCE,
				top: triggerBounds.top - STATIC_CLEARANCE,
				right: triggerBounds.right + STATIC_CLEARANCE,
				bottom: triggerBounds.bottom + STATIC_CLEARANCE
			};
			const occupied: Box[] = [];

			for (const source of images) {
				const size = Math.round(50 + Math.random() * 20);
				const availableWidth = viewportWidth - STATIC_EDGE_MARGIN * 2 - size;
				const availableHeight = viewportHeight - STATIC_EDGE_MARGIN * 2 - size;
				if (availableWidth < 0 || availableHeight < 0) continue;

				let placement: Box | undefined;
				for (let attempt = 0; attempt < STATIC_PLACEMENT_ATTEMPTS; attempt++) {
					const left = STATIC_EDGE_MARGIN + Math.random() * availableWidth;
					const top = STATIC_EDGE_MARGIN + Math.random() * availableHeight;
					const candidate = { left, top, right: left + size, bottom: top + size };

					if (overlaps(candidate, safeZone)) continue;
					if (occupied.some((box) => overlaps(candidate, box, STATIC_ICON_GAP))) continue;

					placement = candidate;
					break;
				}

				if (!placement) continue;

				const element = document.createElement("img");
				element.src = source;
				element.alt = "";
				element.draggable = false;
				element.width = size;
				element.height = size;
				element.style.cssText = `position:absolute;left:${placement.left}px;top:${placement.top}px;border-radius:8px;object-fit:cover;display:block`;
				container.appendChild(element);
				staticElements.push(element);
				occupied.push(placement);
			}
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

		function clearAll() {
			stop();
			clearTimeout(stopTimer);
			container.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
			container.replaceChildren();
			staticElements = [];
		}

		function startTemporarily() {
			clearTimeout(stopTimer);

			if (motionPreference.matches) {
				showStaticIcons();
				stopTimer = setTimeout(clearStaticIcons, TEMPORARY_DURATION);
				return;
			}

			start();
			stopTimer = setTimeout(stop, TEMPORARY_DURATION);
		}

		function updatePointer(event: PointerEvent) {
			if (!event.isPrimary) return;
			pointerX = event.clientX;
			pointerY = event.clientY;
		}

		function handlePointerEnter(event: PointerEvent) {
			updatePointer(event);
			if (event.pointerType === "touch") return;

			if (motionPreference.matches) showStaticIcons();
			else start();
		}

		function handlePointerLeave(event: PointerEvent) {
			if (event.pointerType === "touch") return;

			if (motionPreference.matches) clearStaticIcons();
			else stop();
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

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") clearAll();
		}

		const controller = new AbortController();
		const listener = { signal: controller.signal };
		motionPreference.addEventListener("change", clearAll, listener);
		trigger.addEventListener("pointerenter", handlePointerEnter, listener);
		trigger.addEventListener("pointerleave", handlePointerLeave, listener);
		trigger.addEventListener("pointermove", updatePointer, listener);
		trigger.addEventListener("pointerdown", handlePointerDown, listener);
		trigger.addEventListener("click", handleClick, listener);
		trigger.addEventListener("keydown", handleKeyDown, listener);

		return () => {
			controller.abort();
			clearAll();
			container.remove();
		};
	}
</script>

<button type="button" class="interactive-word" {@attach dispenseImages}>
	{@render children()}
	<span class="sr-only">dispense technology icons</span>
</button>
