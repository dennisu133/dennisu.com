<script lang="ts">
	import { onMount, tick as nextTick, type Snippet } from "svelte";
	import nekoSheet from "$lib/assets/neko_java.png";

	interface Props {
		children: Snippet;
	}

	type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
	type Frame = readonly [column: number, row: number];
	type Phase = "idle" | "chasing" | "caught" | "returning" | "resting";

	const SPRITE_SIZE = 64;
	const FRAME_SIZE = 32;
	const FRAME_GUTTER = 1;
	const SPRITE_SCALE = SPRITE_SIZE / FRAME_SIZE;
	const CATCH_DISTANCE = 22;
	const HOLD_DURATION = 320;

	const frames: Record<Direction, readonly [Frame, Frame]> = {
		S: [
			[0, 0],
			[1, 0]
		],
		SE: [
			[2, 0],
			[3, 0]
		],
		E: [
			[4, 0],
			[5, 0]
		],
		NE: [
			[6, 0],
			[7, 0]
		],
		N: [
			[0, 1],
			[1, 1]
		],
		NW: [
			[2, 1],
			[3, 1]
		],
		W: [
			[4, 1],
			[5, 1]
		],
		SW: [
			[6, 1],
			[7, 1]
		]
	};

	let { children }: Props = $props();

	let trigger: HTMLButtonElement;
	let catElement = $state<HTMLDivElement>();
	let isActive = $state(false);
	let phase = $state<Phase>("idle");
	let direction = $state<Direction>("W");
	let frameIndex = $state(0);
	let catX = $state(0);
	let catY = $state(0);
	let announcement = $state("");

	let pointerX = 0;
	let pointerY = 0;
	let returnX = 0;
	let returnY = 0;
	let startedAt = 0;
	let caughtAt = 0;
	let previousTimestamp = 0;
	let animationFrame = 0;
	let reducedMotion = false;
	let reducedMotionTimer: ReturnType<typeof setTimeout>;

	const currentFrame = $derived(frames[direction][frameIndex]);
	const catStyle = $derived(
		[
			`transform:translate3d(${catX - SPRITE_SIZE / 2}px, ${catY - SPRITE_SIZE / 2}px, 0)`,
			`background-image:url("${nekoSheet}")`,
			`background-position:-${currentFrame[0] * (FRAME_SIZE + FRAME_GUTTER) * SPRITE_SCALE}px -${currentFrame[1] * (FRAME_SIZE + FRAME_GUTTER) * SPRITE_SCALE}px`
		].join(";")
	);

	onMount(() => {
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		function updateMotionPreference() {
			reducedMotion = motionQuery.matches;
		}

		updateMotionPreference();
		motionQuery.addEventListener("change", updateMotionPreference);

		return () => {
			motionQuery.removeEventListener("change", updateMotionPreference);
			stopChase();
		};
	});

	function clamp(value: number, minimum: number, maximum: number) {
		return Math.min(Math.max(value, minimum), maximum);
	}

	function getDirection(dx: number, dy: number): Direction {
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

		if (angle >= -22.5 && angle < 22.5) return "E";
		if (angle >= 22.5 && angle < 67.5) return "SE";
		if (angle >= 67.5 && angle < 112.5) return "S";
		if (angle >= 112.5 && angle < 157.5) return "SW";
		if (angle >= 157.5 || angle < -157.5) return "W";
		if (angle >= -157.5 && angle < -112.5) return "NW";
		if (angle >= -112.5 && angle < -67.5) return "N";
		return "NE";
	}

	function trackPointer(event: PointerEvent) {
		if (!event.isPrimary) return;
		pointerX = event.clientX;
		pointerY = event.clientY;
	}

	async function showCat() {
		await nextTick();
		catElement?.showPopover();
	}

	function moveTowards(targetX: number, targetY: number, speed: number, deltaTime: number) {
		const dx = targetX - catX;
		const dy = targetY - catY;
		const distance = Math.hypot(dx, dy);

		if (distance === 0) return true;

		direction = getDirection(dx, dy);
		const step = Math.min(speed * deltaTime, distance);
		catX += (dx / distance) * step;
		catY += (dy / distance) * step;

		return step === distance;
	}

	function catchPointer(timestamp: number) {
		phase = "caught";
		caughtAt = timestamp;
		announcement = "Java caught the pointer.";
		document.documentElement.classList.add("java-caught-pointer");
	}

	function tick(timestamp: number) {
		if (!isActive) return;

		if (previousTimestamp === 0) previousTimestamp = timestamp;
		const deltaTime = Math.min((timestamp - previousTimestamp) / 1000, 0.05);
		previousTimestamp = timestamp;
		frameIndex = Math.floor(timestamp / 100) % 2;

		if (phase === "chasing") {
			const distance = Math.hypot(pointerX - catX, pointerY - catY);

			if (distance <= CATCH_DISTANCE) {
				catchPointer(timestamp);
			} else {
				const elapsed = timestamp - startedAt;
				const chaseSpeed = 520 + Math.min(elapsed / 4000, 1) * 480;
				moveTowards(pointerX, pointerY, chaseSpeed, deltaTime);
			}
		} else if (phase === "caught" && timestamp - caughtAt >= HOLD_DURATION) {
			phase = "returning";
			announcement = "Java is running away with the pointer.";
		} else if (phase === "returning") {
			if (moveTowards(returnX, returnY, 680, deltaTime)) {
				stopChase("Java ran back off screen.");
				return;
			}
		}

		animationFrame = requestAnimationFrame(tick);
	}

	function showReducedMotionCat(targetX: number, targetY: number) {
		const offsetX = targetX < window.innerWidth / 2 ? 42 : -42;
		catX = clamp(targetX + offsetX, SPRITE_SIZE / 2, window.innerWidth - SPRITE_SIZE / 2);
		catY = clamp(targetY, SPRITE_SIZE / 2, window.innerHeight - SPRITE_SIZE / 2);
		direction = offsetX > 0 ? "W" : "E";
		frameIndex = 0;
		phase = "resting";
		isActive = true;
		void showCat();
		announcement = "Java appeared beside the pointer.";
		reducedMotionTimer = setTimeout(() => stopChase("Java went back off screen."), 1200);
	}

	function startChase(event: MouseEvent) {
		if (isActive) return;

		const triggerRect = trigger.getBoundingClientRect();
		const targetX = event.detail === 0 ? triggerRect.left + triggerRect.width / 2 : event.clientX;
		const targetY = event.detail === 0 ? triggerRect.top + triggerRect.height / 2 : event.clientY;

		pointerX = targetX;
		pointerY = targetY;

		if (reducedMotion) {
			showReducedMotionCat(targetX, targetY);
			return;
		}

		const entersFromLeft = targetX < window.innerWidth / 2;
		const verticalOffset = targetY < window.innerHeight / 2 ? 120 : -120;

		catX = entersFromLeft ? -SPRITE_SIZE / 2 : window.innerWidth + SPRITE_SIZE / 2;
		catY = clamp(targetY + verticalOffset, SPRITE_SIZE / 2, window.innerHeight - SPRITE_SIZE / 2);
		returnX = catX;
		returnY = catY;
		direction = getDirection(targetX - catX, targetY - catY);
		frameIndex = 0;
		phase = "chasing";
		isActive = true;
		void showCat();
		announcement = "Java is chasing the pointer.";
		startedAt = performance.now();
		previousTimestamp = 0;
		animationFrame = requestAnimationFrame(tick);
	}

	function stopChase(message = "") {
		if (animationFrame) cancelAnimationFrame(animationFrame);
		clearTimeout(reducedMotionTimer);
		document.documentElement.classList.remove("java-caught-pointer");
		animationFrame = 0;
		previousTimestamp = 0;
		isActive = false;
		phase = "idle";
		announcement = message;
	}
</script>

<svelte:window onpointermove={trackPointer} onblur={() => stopChase()} />

<button
	bind:this={trigger}
	type="button"
	class="neko-trigger inline-block cursor-pointer appearance-none border-0 bg-transparent p-0 underline decoration-2 underline-offset-4"
	aria-label="cats — summon Java"
	aria-busy={isActive}
	onmouseenter={startChase}
	onclick={startChase}
>
	{@render children()}
</button>

{#if isActive}
	<div
		bind:this={catElement}
		popover="manual"
		class="neko fixed inset-auto top-0 left-0 m-0 h-16 w-16 border-0 bg-transparent p-0"
		class:resting={phase === "resting"}
		style={catStyle}
		aria-hidden="true"
	></div>
{/if}

<span class="sr-only" aria-live="polite">{announcement}</span>

<style>
	.neko-trigger {
		font: inherit;
		color: inherit;
	}

	.neko {
		pointer-events: none;
		background-repeat: no-repeat;
		background-size: 526px 130px;
		image-rendering: pixelated;
		user-select: none;
		will-change: transform;
	}

	.neko.resting {
		will-change: auto;
	}

	:global(html.java-caught-pointer),
	:global(html.java-caught-pointer *) {
		cursor: none !important;
	}
</style>
