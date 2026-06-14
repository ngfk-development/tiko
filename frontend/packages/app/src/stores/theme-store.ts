import { createStore } from '@tanstack/react-store';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function getSystemTheme(): Theme {
  return media.matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function getInitialPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const initialPreference = getInitialPreference();
applyTheme(resolveTheme(initialPreference));

export const themeStore = createStore(
  { preference: initialPreference, theme: resolveTheme(initialPreference) },
  ({ setState, get }) => ({
    setPreference(preference: ThemePreference) {
      const theme = resolveTheme(preference);
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, preference);
      setState((state) => ({ ...state, preference, theme }));
    },
    syncSystemTheme() {
      if (get().preference !== 'system') return;

      const theme = getSystemTheme();
      applyTheme(theme);
      setState((state) => ({ ...state, theme }));
    },
  }),
);

media.addEventListener('change', () => themeStore.actions.syncSystemTheme());
