/**
 * Merkato Fund — Accessible AppButton Primitive
 *
 * Ensures compliance with Apple HIG and WCAG 2.1 AA:
 * - Minimum touch target height: 48pt (exceeds 44pt minimum)
 * - Clear accessibility labels & roles
 * - Loading indicator state
 * - Color contrast compliant variants
 * - Dynamic light/dark theme adaptation
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { radii, spacing, typography, layout, fontFamilies, useTheme } from '@/src/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'outline' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = true,
}: AppButtonProps) {
  const { theme, colors, isDark } = useTheme();
  const isInteractive = !disabled && !loading;

  const dynamicVariantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    secondary: {
      backgroundColor: theme.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.surfaceBorder,
    },
    gold: {
      backgroundColor: colors.accentGold,
      shadowColor: colors.accentGold,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.surfaceBorder,
    },
    danger: {
      backgroundColor: colors.status.critical,
    },
  };

  const dynamicVariantTextStyles: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: '#FFFFFF',
      fontWeight: typography.fontWeights.bold,
    },
    secondary: {
      color: theme.textPrimary,
    },
    gold: {
      color: '#0A0E17',
      fontWeight: typography.fontWeights.bold,
    },
    outline: {
      color: theme.textPrimary,
      fontWeight: typography.fontWeights.semibold,
    },
    danger: {
      color: '#FFFFFF',
      fontWeight: typography.fontWeights.bold,
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        dynamicVariantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            dynamicVariantTextStyles[variant],
            disabled && { color: theme.textMuted },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  baseText: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
