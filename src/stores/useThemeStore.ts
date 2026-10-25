/**
 * Merkato Fund — Theme Zustand Store
 *
 * Manages user theme preference ('light' | 'dark' | 'system')
 * with persistence and instant reactive updates without app reload.
 */

import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'merkato_theme_preference';

const getInitialThemePreference = (): ThemePreference => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ThemePreference;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore
    }
  }
  return 'system';
};

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themePreference: getInitialThemePreference(),

  setThemePreference: (preference: ThemePreference) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, preference);
      } catch {
        // ignore
      }
    }
    set({ themePreference: preference });
  },
}));
