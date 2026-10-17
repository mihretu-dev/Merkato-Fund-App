import { colors } from '@/src/theme/tokens';

export default {
  light: {
    text: colors.light.textPrimary,
    background: colors.light.background,
    tint: colors.primary,
    tabIconDefault: colors.light.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.dark.textPrimary,
    background: colors.dark.background,
    tint: colors.primaryLight,
    tabIconDefault: colors.dark.textMuted,
    tabIconSelected: colors.primaryLight,
  },
};
