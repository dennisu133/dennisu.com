import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';
export type Background = 'animated' | 'static';
export type Quality = 'low' | 'medium' | 'high' | 'auto';

class ThemeState {
	mode = $state<Theme>('system');
	bg = $state<Background>('animated');
	quality = $state<Quality>('auto');

	// Track what the OS specifically wants currently
	systemPref = $state<'light' | 'dark'>('light');

	// Derived: The actual resolved theme (useful for JS logic/charts)
	get current() {
		return this.mode === 'system' ? this.systemPref : this.mode;
	}

	// Derived: Resolved quality level (0=low, 1=medium, 2=high)
	get qualityLevel(): 0 | 1 | 2 {
		if (this.quality !== 'auto') {
			return this.quality === 'low' ? 0 : this.quality === 'medium' ? 1 : 2;
		}
		// Auto-detect: check if mobile/low-power device
		if (!browser) return 2;
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
		const isLowPower = navigator.hardwareConcurrency <= 4;
		const isSmallScreen = window.innerWidth < 768;
		if (isMobile || (isLowPower && isSmallScreen)) return 0;
		if (isLowPower || isSmallScreen) return 1;
		return 2;
	}

	constructor() {
		if (browser) {
			const doc = document.documentElement;

			// 1. Initialize from DOM/localStorage
			this.mode = (doc.getAttribute('theme') as Theme) || 'system';
			this.bg = (doc.getAttribute('bg') as Background) || 'animated';
			this.quality = (localStorage.getItem('quality') as Quality) || 'auto';

			// 2. Initialize System Preference
			const match = window.matchMedia('(prefers-color-scheme: dark)');
			this.systemPref = match.matches ? 'dark' : 'light';

			// 3. Create root effect scope
			$effect.root(() => {
				// Sync Theme Attribute/Storage
				$effect(() => {
					doc.setAttribute('theme', this.mode);
					if (this.mode === 'system') localStorage.removeItem('theme');
					else localStorage.setItem('theme', this.mode);
				});

				// Sync Background Attribute/Storage
				$effect(() => {
					doc.setAttribute('bg', this.bg);
					if (this.bg === 'animated') localStorage.removeItem('bg');
					else localStorage.setItem('bg', this.bg);
				});

				// Sync Quality Storage
				$effect(() => {
					if (this.quality === 'auto') localStorage.removeItem('quality');
					else localStorage.setItem('quality', this.quality);
				});

				// Listen for System Changes
				$effect(() => {
					const updateSystem = (e: MediaQueryListEvent) => {
						this.systemPref = e.matches ? 'dark' : 'light';
					};

					match.addEventListener('change', updateSystem);

					return () => {
						match.removeEventListener('change', updateSystem);
					};
				});
			});
		}
	}
}

export const themeState = new ThemeState();
