import { browser } from "$app/environment";

export type Theme = "light" | "dark";
export type Background = "animated" | "static";

// The reactive states
let currentTheme = $state<Theme>("dark");
let currentBackground = $state<Background>("animated");

// Initialize on client
if (browser) {
	// Theme: read from DOM (blocking script already set the class)
	currentTheme = document.documentElement.classList.contains("dark")
		? "dark"
		: "light";

	// Background: read from localStorage
	const savedBg = localStorage.getItem("bgMode");
	currentBackground = savedBg === "static" ? "static" : "animated";

	// Enable smooth transitions after initial load (prevents flash)
	requestAnimationFrame(() => {
		document.documentElement.classList.add("theme-transition");
	});
}

export const theme = {
	get current() {
		return currentTheme;
	},

	set current(value: Theme) {
		currentTheme = value;
		if (browser) {
			document.documentElement.classList.toggle("dark", value === "dark");
			localStorage.setItem("theme", value);
		}
	},

	toggle() {
		this.current = currentTheme === "dark" ? "light" : "dark";
	},
};

export const background = {
	get current() {
		return currentBackground;
	},

	set current(value: Background) {
		currentBackground = value;
		if (browser) {
			document.documentElement.classList.toggle(
				"bg-animated",
				value === "animated",
			);
			document.documentElement.classList.toggle(
				"bg-static",
				value === "static",
			);
			localStorage.setItem("bgMode", value);
		}
	},

	toggle() {
		this.current = currentBackground === "animated" ? "static" : "animated";
	},
};
