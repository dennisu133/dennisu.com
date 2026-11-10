import type { Attachment } from "svelte/attachments";

// The wrapper takes over the frame that a bare <pre> draws for itself without scripting.
const preOverrides = ["!my-0", "!border-0", "!bg-transparent"];

export const copyCode: Attachment<HTMLElement> = (element) => {
	const cleanups = Array.from(element.querySelectorAll("pre"), (pre) => {
		const code = pre.querySelector("code");
		if (!code) return () => {};

		// A header strip keeps the button off the code, so long lines never run underneath it.
		const wrapper = document.createElement("div");
		wrapper.className = "my-6 border border-border bg-foreground/5";
		const header = document.createElement("div");
		header.className =
			"flex items-center justify-between gap-3 border-b border-border/50 py-1.5 pr-2 pl-4 font-mono text-xs tracking-wider text-muted-foreground uppercase";
		const language = document.createElement("span");
		language.textContent = pre.dataset.lang ?? "";
		pre.before(wrapper);
		wrapper.append(header, pre);
		pre.classList.add(...preOverrides);

		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "Copy";
		button.setAttribute("aria-label", "Copy code");
		button.className =
			"accent-focus cursor-pointer px-2 py-0.5 tracking-wider text-accent uppercase hover:text-accent-hover motion-safe:transition-colors motion-safe:duration-150";
		const status = document.createElement("span");
		status.className = "sr-only";
		status.setAttribute("role", "status");
		header.append(language, button, status);

		let timeout: ReturnType<typeof setTimeout>;
		button.onclick = async () => {
			clearTimeout(timeout);
			try {
				await navigator.clipboard.writeText(code.textContent ?? "");
				button.textContent = "Copied";
				status.textContent = "Code copied to clipboard.";
			} catch {
				button.textContent = "Try again";
				status.textContent = "Could not copy. Select the code and copy it manually.";
			}
			timeout = setTimeout(() => {
				button.textContent = "Copy";
				status.textContent = "";
			}, 2500);
		};

		return () => {
			clearTimeout(timeout);
			wrapper.before(pre);
			pre.classList.remove(...preOverrides);
			wrapper.remove();
		};
	});
	return () => cleanups.forEach((cleanup) => cleanup());
};
