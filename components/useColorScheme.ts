import { useColorScheme as useColorSchemeCore } from 'react-native';
import { useThemeStore } from '@/src/stores/useThemeStore';

export const useColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  const preference = useThemeStore((s) => s.themePreference);

  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return coreScheme === 'dark' ? 'dark' : 'light';
};
