<script lang="ts">
	import { AtSign } from "@lucide/svelte";

	const OBFUSCATED_EMAIL = new Uint8Array([
		62, 26, 202, 167, 135, 96, 83, 60, 240, 201, 163, 134, 127, 79, 19, 230, 194, 143, 147, 116, 95,
		10, 228, 131, 177, 152, 113
	]);
	const SCRAMBLE_CHARACTERS = "\u2588\u2593\u2592\u2591#$%&*@!?";
	const SCRAMBLE_TRANSFORMS = [
		["-3px", "-6deg"],
		["4px", "8deg"],
		["-2px", "-4deg"]
	] as const;
	const characters = Array.from(OBFUSCATED_EMAIL, (_, index) => {
		const [offsetY, rotate] = SCRAMBLE_TRANSFORMS[index % SCRAMBLE_TRANSFORMS.length]!;
		return {
			index,
			offsetY,
			rotate,
			scramble: SCRAMBLE_CHARACTERS[(index * 7 + 3) % SCRAMBLE_CHARACTERS.length] ?? "\u2022"
		};
	});

	let email = $state("");
	const href = $derived(email ? `mailto:${email}` : "#");

	function decodeEmail() {
		return Array.from(OBFUSCATED_EMAIL, (byte, index) =>
			String.fromCharCode(byte ^ ((0x5a + index * 37) & 0xff))
		).join("");
	}

	function reveal() {
		if (!email) email = decodeEmail();
		return email;
	}

	function handleLinkClick(event: MouseEvent) {
		if (!email) {
			event.preventDefault();
			const revealedEmail = reveal();
			setTimeout(() => (window.location.href = `mailto:${revealedEmail}`), 150);
		}
	}
</script>

<div class="group/email flex w-full items-center gap-3">
	<AtSign aria-hidden="true" class="size-7 shrink-0 p-1" />

	<div class="min-w-0">
		<h3 class="text-base font-medium">
			<a
				{href}
				class="inline-flex min-h-6 w-56 items-center transition-colors duration-150 select-none group-hover/email:text-accent-hover"
				onmouseenter={reveal}
				onfocus={reveal}
				onclick={handleLinkClick}
			>
				Get in touch
			</a>
		</h3>
		<div class="relative min-h-6 text-sm text-muted-foreground">
			<a
				{href}
				aria-label="Email address"
				class="inline-flex min-h-6 max-w-full flex-wrap items-center"
				onmouseenter={reveal}
				onfocus={reveal}
				onclick={handleLinkClick}
			>
				{#each characters as character (character.index)}
					<span
						data-scramble={character.scramble}
						class={[
							"relative transition-[translate,rotate,filter] delay-(--delay) duration-500 ease-out motion-reduce:delay-0! motion-reduce:duration-0!",
							"after:absolute after:left-0 after:text-xs after:text-muted-foreground after:transition-opacity after:delay-(--delay) after:duration-500 after:ease-out after:content-[attr(data-scramble)] after:motion-reduce:delay-0! after:motion-reduce:duration-0!",
							email
								? "after:opacity-0"
								: "w-[0.5em] translate-y-(--offset-y) rotate-(--rotate) text-transparent blur-[1px] after:opacity-80"
						]}
						style:--delay={`${character.index * 25}ms`}
						style:--offset-y={character.offsetY}
						style:--rotate={character.rotate}
					>
						{email[character.index] ?? "\u00a0"}
					</span>
				{/each}
			</a>
			{#if !email}
				<button
					type="button"
					class="absolute inset-0 cursor-pointer rounded-sm pointer-fine:hidden"
					aria-label="Email address hidden until interaction"
					onclick={reveal}
				></button>
			{/if}
		</div>
		<noscript class="text-xs text-muted-foreground opacity-80">
			<br /> Revealing email requires JavaScript.
		</noscript>
	</div>

	<a
		{href}
		class="ml-auto inline-flex items-center text-sm leading-none tracking-wider text-accent uppercase group-hover/email:text-accent-hover pointer-fine:hidden"
		onclick={handleLinkClick}
	>
		Email
	</a>
</div>
