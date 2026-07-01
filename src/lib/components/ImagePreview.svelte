<script lang="ts">
	import { onMount, tick, type Snippet } from "svelte";

	interface Props {
		children: Snippet;
		src: string;
		alt: string;
	}

	let { children, src, alt }: Props = $props();
	const previewId = $props.id();

	let trigger: HTMLButtonElement;
	let preview = $state<HTMLAnchorElement>();
	let isOpen = $state(false);
	let supportsHover = $state(false);
	let previewStyle = $state("");
	let imageAspectRatio = $state(3 / 2);
	let closeTimer: ReturnType<typeof setTimeout>;

	onMount(() => {
		const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

		function updateHoverSupport() {
			supportsHover = hoverQuery.matches;
		}

		updateHoverSupport();
		hoverQuery.addEventListener("change", updateHoverSupport);

		return () => {
			clearTimeout(closeTimer);
			hoverQuery.removeEventListener("change", updateHoverSupport);
		};
	});

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
		clearTimeout(closeTimer);
		if (isOpen) return;
		isOpen = true;
		await tick();
		preview?.showPopover();
		positionPreview();
	}

	function hidePreview() {
		clearTimeout(closeTimer);
		preview?.hidePopover();
		isOpen = false;
	}

	function scheduleHide() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(hidePreview, 120);
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
	onmouseenter={() => void showPreview()}
	onmouseleave={() => supportsHover && scheduleHide()}
	onfocus={() => void showPreview()}
	onblur={() => supportsHover && scheduleHide()}
	onclick={() => void showPreview()}
>
	{@render children()}
</button>

{#if isOpen}
	<a
		bind:this={preview}
		id={previewId}
		href={src}
		target="_blank"
		rel="noopener"
		popover="manual"
		class="fixed m-0 block overflow-hidden rounded-lg border border-border bg-black p-0 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-link"
		style={previewStyle}
		aria-label={`Open ${alt} full size in a new tab`}
		onmouseenter={() => clearTimeout(closeTimer)}
		onmouseleave={() => supportsHover && scheduleHide()}
		onfocus={() => clearTimeout(closeTimer)}
		onblur={() => supportsHover && scheduleHide()}
	>
		<img
			class="block h-full w-full object-contain"
			{src}
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
