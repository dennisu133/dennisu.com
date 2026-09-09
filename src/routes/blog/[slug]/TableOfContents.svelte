<script lang="ts">
	import { onMount } from "svelte";

	let { article }: { article: HTMLElement } = $props();

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let active = $state("");

	onMount(() => {
		const els = [...article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")];
		headings = els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: +el.tagName[1] }));

		// Active = last heading whose top has passed 96px; anchor scroll-mt keeps clicked headings above that.
		const update = () => {
			let current = els[0]?.id ?? "";
			for (const el of els) if (el.getBoundingClientRect().top <= 96) current = el.id;
			// Short trailing sections never reach the top; at page end the last heading wins.
			if (innerHeight + scrollY >= document.documentElement.scrollHeight - 1)
				current = els.at(-1)!.id;
			active = current;
		};
		update();
		addEventListener("scroll", update, { passive: true });
		return () => removeEventListener("scroll", update);
	});
</script>

{#if headings.length}
	<nav aria-label="Table of contents" class="glass p-4 text-sm">
		<p class="mb-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">On this page</p>
		<ul class="border-l border-border">
			{#each headings as { id, text, level } (id)}
				<li>
					<a
						href="#{id}"
						aria-current={active === id ? "location" : undefined}
						class={[
							"accent-focus -ml-px block border-l py-1 pr-2 leading-snug text-muted-foreground hover:text-foreground motion-safe:transition-colors motion-safe:duration-150",
							level === 3 ? "pl-6" : "pl-3",
							active === id
								? "border-accent text-foreground forced-colors:border-[Highlight]"
								: "border-transparent"
						]}
					>
						{text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
