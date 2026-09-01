<script lang="ts">
	import { onDestroy, tick, type Snippet } from "svelte";
	import { MediaQuery } from "svelte/reactivity";
	import { asset } from "$app/paths";
	import type { Asset } from "$app/types";

	interface Props {
		children: Snippet;
		src: Asset; // Full-size image at a stable URL from static/.
		previewSrc?: string; // Optional imported asset used only inside the preview.
		alt: string;
	}

	let { children, src, previewSrc, alt }: Props = $props();
	const previewId = $props.id();

	let trigger: HTMLButtonElement;
	let preview = $state<HTMLAnchorElement>();
	let isOpen = $state(false);
	let previewStyle = $state("");
	let imageAspectRatio = $state(3 / 2);
	let closeTimer: ReturnType<typeof setTimeout>;

	const supportsHover = new MediaQuery("(hover: hover) and (pointer: fine)");

	function positionPreview() {
		if (!isOpen) return;

		const triggerRect = trigger.getBoundingClientRect();
		const margin = 12;
		const gap = 10;
		const desiredWidth = Math.min(800, window.innerWidth - margin * 2);
		const desiredHeight = desiredWidth / imageAspectRatio;
		const spaceBelow = window.innerHeight - triggerRect.bottom - gap - margin;
		const spaceAbove = triggerRect.top - gap - margin;
		const placeBelow = spaceBelow >= desiredHeight || spaceBelow >= spaceAbove;
		const availableHeight = Math.max(placeBelow ? spaceBelow : spaceAbove, 0);
		const width = Math.min(desiredWidth, availableHeight * imageAspectRatio);
		const height = width / imageAspectRatio;
		const idealLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
		const left = Math.min(Math.max(idealLeft, margin), window.innerWidth - width - margin);
		const top = placeBelow ? triggerRect.bottom + gap : triggerRect.top - gap - height;

		previewStyle = `left:${left}px; top:${top}px; width:${width}px; aspect-ratio:${imageAspectRatio};`;
	}

	async function showPreview() {
		cancelScheduledHide();
		if (isOpen) return;
		isOpen = true;
		await tick();
		preview?.showPopover();
		positionPreview();
	}

	function hidePreview() {
		cancelScheduledHide();
		preview?.hidePopover();
		isOpen = false;
	}

	function cancelScheduledHide() {
		clearTimeout(closeTimer);
	}

	function scheduleHide() {
		cancelScheduledHide();
		closeTimer = setTimeout(hidePreview, 120);
	}

	function scheduleHideIfHoverSupported() {
		if (supportsHover.current) scheduleHide();
	}

	function handleWindowClick(event: MouseEvent) {
		if (!isOpen || !(event.target instanceof Node)) return;
		if (trigger.contains(event.target) || preview?.contains(event.target)) return;
		hidePreview();
	}

	function handleImageLoad(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		imageAspectRatio = image.naturalWidth / image.naturalHeight;
		positionPreview();
	}

	onDestroy(cancelScheduledHide);
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={(event) => event.key === "Escape" && hidePreview()}
	onresize={positionPreview}
	onscroll={positionPreview}
/>

<button
	bind:this={trigger}
	type="button"
	class="interactive-word"
	aria-expanded={isOpen}
	aria-controls={previewId}
	onmouseenter={showPreview}
	onmouseleave={scheduleHideIfHoverSupported}
	onfocus={showPreview}
	onblur={scheduleHideIfHoverSupported}
	onclick={showPreview}
>
	{@render children()}
</button>

{#if isOpen}
	<a
		bind:this={preview}
		id={previewId}
		href={asset(src)}
		target="_blank"
		rel="noopener"
		popover="manual"
		class="fixed m-0 block overflow-hidden rounded-lg border border-border bg-black p-0 shadow-2xl"
		style={previewStyle}
		aria-label={`Open ${alt} full size in a new tab`}
		onmouseenter={cancelScheduledHide}
		onmouseleave={scheduleHideIfHoverSupported}
		onfocus={cancelScheduledHide}
		onblur={scheduleHideIfHoverSupported}
	>
		<img
			class="block h-full w-full object-contain"
			src={previewSrc ?? asset(src)}
			{alt}
			draggable="false"
			onload={handleImageLoad}
		/>
		<span
			class="pointer-events-none absolute right-2 bottom-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white"
		>
			Open full size ↗
		</span>
	</a>
{/if}
