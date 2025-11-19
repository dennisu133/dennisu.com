// Global theme state
export const themeState = $state({
  mode: 'light' as 'light' | 'dark'
});

export function toggleTheme() {
  themeState.mode = themeState.mode === 'light' ? 'dark' : 'light';
  updateDom();
  try {
    localStorage.setItem('theme', themeState.mode);
  } catch (e) {}
}

export function setTheme(mode: 'light' | 'dark') {
  themeState.mode = mode;
  updateDom();
  try {
    localStorage.setItem('theme', themeState.mode);
  } catch (e) {}
}

function updateDom() {
  if (typeof document !== 'undefined') {
    if (themeState.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function initTheme() {
  if (typeof document !== 'undefined') {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        themeState.mode = saved;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeState.mode = 'dark';
      }
    } catch (e) {}
    updateDom();
  }
}

