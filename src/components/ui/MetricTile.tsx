/**
 * Merkato Fund — Financial MetricTile Primitive
 *
 * Clean, high-contrast metric container displaying financial parameters,
 * pool counts, yields, or days remaining with accessible labels.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography, fontFamilies } from '@/src/theme/tokens';
import { StatusPill } from './StatusPill';

interface MetricTileProps {
  label: string;
  value: string;
  subtitle?: string;
  statusLabel?: string;
  statusType?: 'healthy' | 'caution' | 'critical' | 'info';
  style?: ViewStyle;
  highlight?: boolean;
}

export function MetricTile({
  label,
  value,
  subtitle,
  statusLabel,
  statusType = 'healthy',
  style,
  highlight = false,
}: MetricTileProps) {
  return (
    <View
      style={[
        styles.container,
        highlight && styles.highlightContainer,
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${value}${subtitle ? `, ${subtitle}` : ''}`}>
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label.toUpperCase()}
        </Text>
        {statusLabel && (
          <StatusPill status={statusType} label={statusLabel} size="small" />
        )}
      </View>

      <Text style={[styles.value, highlight && styles.highlightValue]} numberOfLines={1}>
        {value}
      </Text>

      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    flex: 1,
  },
  highlightContainer: {
    borderColor: 'rgba(13, 148, 136, 0.4)',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.4,
  },
  value: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 2,
  },
  highlightValue: {
    color: colors.primaryLight,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});

