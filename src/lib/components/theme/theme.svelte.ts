import { browser } from "$app/environment";

export type Theme = "light" | "dark";

type ThemeTransitionOrigin = {
	x: number;
	y: number;
};

const storageKey = "theme";

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";

class ThemeState {
	mode = $state<Theme>("light");
	private activeTransition: ViewTransition | null = null;

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

	private apply(mode: Theme) {
		this.mode = mode;

		const doc = document.documentElement;
		doc.setAttribute("theme", mode);

		try {
			localStorage.setItem(storageKey, mode);
		} catch {
			// The current-page override still works when storage is unavailable.
		}
	}

	private applyWithoutMotion(mode: Theme) {
		const doc = document.documentElement;
		doc.classList.add("theme-transition-capture");
		this.apply(mode);

		requestAnimationFrame(() => {
			doc.classList.remove("theme-transition-capture");
		});
	}

	toggle(origin?: ThemeTransitionOrigin) {
		const nextMode = this.mode === "light" ? "dark" : "light";

		if (!browser) {
			this.mode = nextMode;
			return;
		}

		const doc = document.documentElement;
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (!document.startViewTransition || prefersReducedMotion) {
			this.applyWithoutMotion(nextMode);
			return;
		}

		this.activeTransition?.skipTransition();

		const transitionOrigin = origin ?? {
			x: window.innerWidth,
			y: 0
		};
		const transitionStart =
			((window.innerWidth - transitionOrigin.x + transitionOrigin.y) /
				(window.innerWidth + window.innerHeight)) *
			100;

		doc.style.setProperty("--theme-transition-start", `${transitionStart}%`);
		doc.classList.add("theme-transition-active", "theme-transition-capture");

		const transition = document.startViewTransition(() => {
			this.apply(nextMode);
		});
		this.activeTransition = transition;

		const finishCapture = () => {
			doc.classList.remove("theme-transition-capture");
		};
		void transition.ready.then(finishCapture, finishCapture);

		const finishTransition = () => {
			if (this.activeTransition === transition) {
				this.activeTransition = null;
				doc.classList.remove("theme-transition-active", "theme-transition-capture");
				doc.style.removeProperty("--theme-transition-start");
			}
		};
		void transition.finished.then(finishTransition, finishTransition);
	}
}

export const themeState = new ThemeState();
