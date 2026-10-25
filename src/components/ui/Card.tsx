/**
 * Merkato Fund — Reusable Card Primitive
 *
 * Theme-aware surface card with subtle border and elevation.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { radii, spacing, useTheme } from '@/src/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'elevated' | 'outline';
}

export function Card({ children, style, variant = 'surface' }: CardProps) {
  const { theme, isDark } = useTheme();

  const variantStyle: ViewStyle = {
    surface: {
      backgroundColor: theme.surface,
      borderColor: theme.surfaceBorder,
    },
    elevated: {
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.surfaceBorder,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: 8,
      elevation: isDark ? 3 : 2,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.surfaceBorder,
    },
  }[variant];

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
});
