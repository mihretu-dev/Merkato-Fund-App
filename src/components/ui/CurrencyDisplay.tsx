/**
 * Merkato Fund — Accessible Currency Display Primitive
 *
 * Formats Ethiopian Birr (ETB) with clear typography hierarchy and screen reader labeling.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, fontFamilies } from '@/src/theme/tokens';
import { formatETB } from '@/src/domain/calculations/currency';

interface CurrencyDisplayProps {
  amountETB: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'giant';
  showSign?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function CurrencyDisplay({
  amountETB,
  label,
  size = 'md',
  showSign = false,
  color,
  style,
}: CurrencyDisplayProps) {
  const formatted = formatETB(amountETB, { showSign });
  const textColor = color || colors.dark.textPrimary;

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${label ? `${label}: ` : ''}${formatted}`}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={[styles.amount, sizeStyles[size], { color: textColor }]}>
        {formatted}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  label: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  amount: {
    fontFamily: fontFamilies.sans,
    fontWeight: typography.fontWeights.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  md: {
    fontSize: typography.fontSizes.lg,
    lineHeight: typography.lineHeights.lg,
  },
  lg: {
    fontSize: typography.fontSizes.xxl,
    lineHeight: typography.lineHeights.xxl,
  },
  giant: {
    fontSize: typography.fontSizes.display,
    lineHeight: typography.lineHeights.display,
  },
});

