/**
 * Merkato Fund — Accessible AppButton Primitive
 *
 * Ensures compliance with Apple HIG and WCAG 2.1 AA:
 * - Minimum touch target height: 48pt (exceeds 44pt minimum)
 * - Clear accessibility labels & roles
 * - Loading indicator state
 * - Color contrast compliant variants
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
import { colors, radii, spacing, typography, layout, fontFamilies } from '@/src/theme/tokens';

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
  const isInteractive = !disabled && !loading;

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
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primaryLight : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            variantTextStyles[variant],
            disabled && styles.disabledText,
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
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
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
  disabledText: {
    color: colors.dark.textMuted,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
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
    borderColor: colors.primaryLight,
  },
  danger: {
    backgroundColor: colors.status.critical,
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeights.bold,
  },
  secondary: {
    color: colors.dark.textPrimary,
  },
  gold: {
    color: '#0A0E17',
    fontWeight: typography.fontWeights.bold,
  },
  outline: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.semibold,
  },
  danger: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeights.bold,
  },
};

