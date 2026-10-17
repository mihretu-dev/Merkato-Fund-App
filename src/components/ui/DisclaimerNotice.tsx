/**
 * Merkato Fund — Disclaimer & Integrity Notice
 *
 * Prominent card reminding users that Merkato Fund is a demonstration prototype
 * utilizing synthetic figures and simulated mechanics.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography, fontFamilies } from '@/src/theme/tokens';
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
      <View style={styles.topRow}>
        <DemoBadge compact label="PROTOTYPE NOTICE" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 34, 52, 0.6)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  topRow: {
    marginBottom: 6,
  },
  message: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

