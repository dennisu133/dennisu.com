<script lang="ts">
	import { onMount, tick as nextTick, type Snippet } from "svelte";
	import nekoSheet from "$lib/assets/neko_java.png";

	interface Props {
		children: Snippet;
	}

	type Phase = "idle" | "chasing" | "caught" | "returning" | "resting";

	const SPRITE_SIZE = 64;
	const FRAME_SIZE = 32;
	const FRAME_GUTTER = 1;
	const SPRITE_SCALE = SPRITE_SIZE / FRAME_SIZE;
	const CATCH_DISTANCE = 22;
	const HOLD_DURATION = 320;

	const SPRITE_DIRECTIONS = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"] as const;
	type Direction = (typeof SPRITE_DIRECTIONS)[number];
	const ANGLE_DIRECTIONS = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"] as const;

	let { children }: Props = $props();

	let trigger: HTMLButtonElement;
	let catElement = $state<HTMLSpanElement>();
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

	const isActive = $derived(phase !== "idle");
	const currentFrame = $derived.by(() => {
		const index = SPRITE_DIRECTIONS.indexOf(direction) * 2 + frameIndex;
		return [index % 8, Math.floor(index / 8)] as const;
	});
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
		const octant = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
		return ANGLE_DIRECTIONS[(octant + 8) % 8];
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
		if (catElement?.matches(":popover-open")) catElement.hidePopover();
		phase = "idle";
		announcement = message;
	}
</script>

<svelte:window onpointermove={trackPointer} onblur={() => stopChase()} />

<!-- Kept flush against the button: intervening whitespace would render as a
     stray space between the trigger word and adjacent punctuation. -->
<button
	bind:this={trigger}
	type="button"
	class="interactive-word"
	aria-label="cats — summon Java"
	aria-busy={isActive}
	onmouseenter={startChase}
	onclick={startChase}
>
	{@render children()}
</button>{#if isActive}
	<span
		bind:this={catElement}
		popover="manual"
		class="neko fixed inset-auto top-0 left-0 m-0 h-16 w-16 border-0 bg-transparent p-0"
		class:resting={phase === "resting"}
		style={catStyle}
		aria-hidden="true"
	></span>
{/if}<span class="sr-only" aria-live="polite">{announcement}</span>

<style>
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
