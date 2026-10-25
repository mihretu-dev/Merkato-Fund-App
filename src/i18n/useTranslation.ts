/**
 * Merkato Fund — useTranslation Hook
 *
 * Provides reactive translation strings based on the active language in useLanguageStore.
 */

import { useLanguageStore, Language } from '@/src/stores/useLanguageStore';
import { translations, TranslationDictionary } from './translations';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const t: TranslationDictionary = (translations[language] || translations.en) as TranslationDictionary;

  /**
   * Helper to format strings with {placeholders}
   */
  const format = (text: string, params?: Record<string, string | number>): string => {
    if (!params) return text;
    let result = text;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }
    return result;
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    isAmharic: language === 'am',
    t,
    format,
  };
}
