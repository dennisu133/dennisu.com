import type { Attachment } from "svelte/attachments";

export const copyCode: Attachment<HTMLElement> = (element) => {
	const cleanups = Array.from(element.querySelectorAll("pre"), (pre) => {
		const code = pre.querySelector("code");
		if (!code) return () => {};

		const wrapper = document.createElement("div");
		wrapper.className = "group/code relative my-6";
		pre.before(wrapper);
		wrapper.append(pre);
		pre.classList.add("!my-0");

		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "Copy";
		button.setAttribute("aria-label", "Copy code");
		button.className =
			"absolute top-2 right-2 border border-current bg-background px-2 py-1 text-xs text-foreground hover:text-accent [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 group-hover/code:pointer-events-auto group-hover/code:opacity-100 group-focus-within/code:pointer-events-auto group-focus-within/code:opacity-100";
		const status = document.createElement("span");
		status.className = "sr-only";
		status.setAttribute("role", "status");
		wrapper.append(button, status);

		let timeout: ReturnType<typeof setTimeout>;
		button.onclick = async () => {
			clearTimeout(timeout);
			try {
				await navigator.clipboard.writeText(code.textContent ?? "");
				button.textContent = "Copied!";
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
			pre.classList.remove("!my-0");
			wrapper.remove();
		};
	});
	return () => cleanups.forEach((cleanup) => cleanup());
};
