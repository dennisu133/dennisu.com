// Global theme state
export const themeState = $state({
	mode: "light" as "light" | "dark",
});

export function toggleTheme() {
	themeState.mode = themeState.mode === "light" ? "dark" : "light";
	updateDom();
	try {
		localStorage.setItem("theme", themeState.mode);
	} catch (e) {}
}

export function setTheme(mode: "light" | "dark") {
	themeState.mode = mode;
	updateDom();
	try {
		localStorage.setItem("theme", themeState.mode);
	} catch (e) {}
}

function updateDom() {
	if (typeof document !== "undefined") {
		if (themeState.mode === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}
}

export function initTheme() {
	if (typeof document !== "undefined") {
		try {
			const saved = localStorage.getItem("theme");
			const isDarkClass = document.documentElement.classList.contains("dark");

			// Sync state with what's already in DOM (handled by app.html script)
			if (isDarkClass) {
				themeState.mode = "dark";
			} else if (saved === "light") {
				themeState.mode = "light";
			} else if (
				!saved &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
			) {
				themeState.mode = "dark";
			} else {
				themeState.mode = "light";
			}
		} catch (e) {}

		// Ensure DOM matches state (double check)
		updateDom();
	}
}
