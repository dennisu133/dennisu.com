type Theme = "light" | "dark";

type ThemeTransitionOrigin = {
	x: number;
	y: number;
};

let activeTransition: ViewTransition | null = null;

function getTheme(root: HTMLElement): Theme {
	const override = root.dataset.theme;
	return override === "light" || override === "dark"
		? override
		: window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
}

function applyTheme(root: HTMLElement, theme: Theme) {
	root.dataset.theme = theme;

	try {
		localStorage.setItem("theme", theme);
	} catch {
		// The current-page override still works when storage is unavailable.
	}
}

function applyImmediately(root: HTMLElement, theme: Theme) {
	root.classList.add("theme-transition-capture");
	applyTheme(root, theme);
	requestAnimationFrame(() => root.classList.remove("theme-transition-capture"));
}

export function toggleTheme(origin: ThemeTransitionOrigin) {
	const root = document.documentElement;
	const nextTheme = getTheme(root) === "light" ? "dark" : "light";
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (!document.startViewTransition || prefersReducedMotion) {
		applyImmediately(root, nextTheme);
		return;
	}

	const transitionStart =
		((window.innerWidth - origin.x + origin.y) / (window.innerWidth + window.innerHeight)) * 100;

	root.style.setProperty("--theme-transition-start", `${transitionStart}%`);
	root.classList.add("theme-transition-active", "theme-transition-capture");

	const transition = document.startViewTransition(() => applyTheme(root, nextTheme));
	activeTransition = transition;

	const finishCapture = () => {
		if (activeTransition === transition) {
			root.classList.remove("theme-transition-capture");
		}
	};
	void transition.ready.then(finishCapture, finishCapture);

	const finishTransition = () => {
		if (activeTransition === transition) {
			activeTransition = null;
			root.classList.remove("theme-transition-active", "theme-transition-capture");
			root.style.removeProperty("--theme-transition-start");
		}
	};
	void transition.finished.then(finishTransition, finishTransition);
}
