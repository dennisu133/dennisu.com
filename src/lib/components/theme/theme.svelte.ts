import { browser } from "$app/environment";

export type Theme = "light" | "dark";

const storageKey = "theme";

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";

class ThemeState {
	mode = $state<Theme>("light");

	constructor() {
		if (browser) {
			const doc = document.documentElement;
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			let override = doc.getAttribute("theme");

			// The blocking script normally supplies this before CSS loads. Reading
			// storage here as well keeps the component robust if it is used alone.
			if (!isTheme(override)) {
				try {
					override = localStorage.getItem(storageKey);
				} catch {
					override = null;
				}
			}

			if (isTheme(override)) {
				doc.setAttribute("theme", override);
				this.mode = override;
			} else {
				this.mode = mediaQuery.matches ? "dark" : "light";
			}

			mediaQuery.addEventListener("change", (event) => {
				if (!doc.hasAttribute("theme")) {
					this.mode = event.matches ? "dark" : "light";
				}
			});
		}
	}

	toggle() {
		this.mode = this.mode === "light" ? "dark" : "light";

		if (browser) {
			document.documentElement.setAttribute("theme", this.mode);

			try {
				localStorage.setItem(storageKey, this.mode);
			} catch {
				// The current-page override still works when storage is unavailable.
			}
		}
	}
}

export const themeState = new ThemeState();
