/**
 * Merkato Fund — Demo Data Integrity Badge
 *
 * Mandatory visual indicator that must appear prominently on screens displaying
 * financial figures, pool sizes, interest yields, or draw results.
 * Prevents synthetic prototype data from being mistaken for real financial figures.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography, fontFamilies } from '@/src/theme/tokens';

interface DemoBadgeProps {
  label?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export function DemoBadge({
  label = 'DEMO DATA',
  style,
  compact = false,
}: DemoBadgeProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={styles.dot} />
      <Text style={[styles.text, compact && styles.textCompact]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.demoBadge.background,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  containerCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGold,
    marginRight: 6,
  },
  text: {
    fontFamily: fontFamilies.sans,
    color: colors.demoBadge.text,
    fontSize: 11,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  textCompact: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
});

