/**
 * Merkato Fund — Status Pill Indicator
 *
 * Visual badge for buffer status ('healthy' | 'caution' | 'critical' | 'depleted')
 * and draw/escrow states.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { BufferHealthStatus } from '@/src/domain/types';

interface StatusPillProps {
  status: BufferHealthStatus | 'scheduled' | 'in_progress' | 'completed' | 'locked' | 'unlocked';
  label?: string;
  style?: ViewStyle;
}

export function StatusPill({ status, label, style }: StatusPillProps) {
  const displayLabel = (label || status).toUpperCase();
  const theme = statusColors[status] || statusColors.healthy;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: theme.color }]} />
      <Text style={[styles.text, { color: theme.color }]}>{displayLabel}</Text>
    </View>
  );
}

const statusColors: Record<string, { color: string; bg: string }> = {
  healthy: { color: colors.status.healthy, bg: colors.status.healthyBg },
  caution: { color: colors.status.caution, bg: colors.status.cautionBg },
  critical: { color: colors.status.critical, bg: colors.status.criticalBg },
  depleted: { color: colors.status.depleted, bg: colors.status.depletedBg },
  scheduled: { color: colors.primaryLight, bg: colors.primaryMuted },
  in_progress: { color: colors.accentGold, bg: colors.accentGoldDark },
  completed: { color: colors.status.healthy, bg: colors.status.healthyBg },
  locked: { color: colors.accentGold, bg: colors.accentGoldDark },
  unlocked: { color: colors.status.healthy, bg: colors.status.healthyBg },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
});
