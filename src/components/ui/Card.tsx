/**
 * Merkato Fund — Reusable Card Primitive
 *
 * Glass-morphism-ready surface card with subtle border and elevation.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/src/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'elevated' | 'outline';
}

export function Card({ children, style, variant = 'surface' }: CardProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
});

const variantStyles: Record<'surface' | 'elevated' | 'outline', ViewStyle> = {
  surface: {
    backgroundColor: colors.dark.surface,
  },
  elevated: {
    backgroundColor: colors.dark.surfaceElevated,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.dark.surfaceBorder,
  },
};
