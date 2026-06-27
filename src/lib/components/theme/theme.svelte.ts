import { browser } from "$app/environment";

export type Theme = "light" | "dark";

class ThemeState {
	mode = $state<Theme>("light");

	constructor() {
		if (browser) {
			const doc = document.documentElement;
			this.mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

			$effect.root(() => {
				$effect(() => {
					doc.setAttribute("theme", this.mode);
				});
			});
		}
	}

	toggle() {
		this.mode = this.mode === "light" ? "dark" : "light";
	}
}

export const themeState = new ThemeState();
