/**
 * Merkato Fund — Disclaimer & Integrity Notice
 *
 * Prominent card reminding users that Merkato Fund is a demonstration prototype
 * utilizing synthetic figures and simulated mechanics.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { DemoBadge } from './DemoBadge';

interface DisclaimerNoticeProps {
  message?: string;
  style?: ViewStyle;
}

export function DisclaimerNotice({
  message = 'Demonstration prototype with synthetic data. Not connected to real banks, CBE, or the National Lottery Administration.',
  style,
}: DisclaimerNoticeProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <DemoBadge compact label="PROTOTYPE NOTICE" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1B18',
    borderColor: '#78350F',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    marginBottom: spacing.xs,
  },
  message: {
    color: '#D1D5DB',
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});
