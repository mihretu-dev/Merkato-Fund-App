/**
 * Merkato Fund — useTheme Hook
 *
 * Provides reactive access to active theme colors, current mode,
 * and user theme preferences across light, dark, and system modes.
 */

import { useColorScheme } from '@/components/useColorScheme';
import { useThemeStore, ThemePreference } from '@/src/stores/useThemeStore';
import { colors, spacing, radii, typography, fontFamilies } from './tokens';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const themePreference = useThemeStore((s) => s.themePreference);
  const setThemePreference = useThemeStore((s) => s.setThemePreference);

  return {
    colorScheme,
    isDark,
    theme,
    themePreference,
    setThemePreference,
    colors,
    spacing,
    radii,
    typography,
    fontFamilies,
  };
}

export type { ThemePreference };
