import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';
export type Background = 'animated' | 'static';

class ThemeState {
	mode = $state<Theme>('system');
	bg = $state<Background>('animated');
	
	// Track what the OS specifically wants currently
	systemPref = $state<'light' | 'dark'>('light');

	// Derived: The actual resolved theme (useful for JS logic/charts)
	get current() {
		return this.mode === 'system' ? this.systemPref : this.mode;
	}

	constructor() {
		if (browser) {
			const doc = document.documentElement;

			// 1. Initialize from DOM
			this.mode = (doc.getAttribute('theme') as Theme) || 'system';
			this.bg = (doc.getAttribute('bg') as Background) || 'animated';

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

				// Listen for System Changes
				// We use $effect to register the listener so it cleans up if this scope were ever destroyed
				// (though as a singleton, it likely won't be, but it's good practice)
				$effect(() => {
					const updateSystem = (e: MediaQueryListEvent) => {
						this.systemPref = e.matches ? 'dark' : 'light';
					};
					
					// Listen for changes
					match.addEventListener('change', updateSystem);
					
					// Cleanup
					return () => {
						match.removeEventListener('change', updateSystem);
					};
				});
			});
		}
	}
}

export const themeState = new ThemeState();