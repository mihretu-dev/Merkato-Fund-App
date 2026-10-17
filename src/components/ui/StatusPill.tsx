/**
 * Merkato Fund — Status Pill Indicator
 *
 * Visual badge for buffer status ('healthy' | 'caution' | 'critical' | 'depleted')
 * and draw/escrow states.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography, fontFamilies } from '@/src/theme/tokens';
import { BufferHealthStatus } from '@/src/domain/types';

interface StatusPillProps {
  status:
    | BufferHealthStatus
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'locked'
    | 'unlocked'
    | 'info';
  label?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function StatusPill({ status, label, size = 'medium', style }: StatusPillProps) {
  const displayLabel = (label || status).toUpperCase();
  const theme = statusColors[status] || statusColors.healthy;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        isSmall && styles.containerSmall,
        { backgroundColor: theme.bg, borderColor: theme.border },
        style,
      ]}>
      <View
        style={[
          styles.dot,
          isSmall && styles.dotSmall,
          { backgroundColor: theme.color },
        ]}
      />
      <Text
        style={[
          styles.text,
          isSmall && styles.textSmall,
          { color: theme.color },
        ]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const statusColors: Record<string, { color: string; bg: string; border: string }> = {
  healthy: {
    color: colors.status.healthy,
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  caution: {
    color: colors.status.caution,
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  critical: {
    color: colors.status.critical,
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
  },
  depleted: {
    color: colors.status.depleted,
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.25)',
  },
  scheduled: {
    color: colors.primaryLight,
    bg: 'rgba(13, 148, 136, 0.12)',
    border: 'rgba(13, 148, 136, 0.25)',
  },
  in_progress: {
    color: colors.accentGold,
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  completed: {
    color: colors.status.healthy,
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  locked: {
    color: colors.accentGold,
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  unlocked: {
    color: colors.status.healthy,
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  info: {
    color: colors.primaryLight,
    bg: 'rgba(45, 212, 191, 0.12)',
    border: 'rgba(45, 212, 191, 0.25)',
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
});

