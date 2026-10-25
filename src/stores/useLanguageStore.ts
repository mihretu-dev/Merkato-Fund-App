/**
 * Merkato Fund — Language Zustand Store
 *
 * Manages user language preference ('en' | 'am')
 * with persistence and instant reactive updates without app reload.
 */

import { create } from 'zustand';

export type Language = 'en' | 'am';

const STORAGE_KEY = 'merkato_language_preference';

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Language;
      if (saved === 'en' || saved === 'am') {
        return saved;
      }
    } catch {
      // ignore
    }
  }
  return 'en';
};

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    }
    set({ language: lang });
  },

  toggleLanguage: () => {
    const nextLang = get().language === 'en' ? 'am' : 'en';
    get().setLanguage(nextLang);
  },
}));
