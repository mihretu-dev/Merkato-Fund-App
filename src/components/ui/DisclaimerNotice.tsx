/**
 * Merkato Fund — Disclaimer & Integrity Notice
 *
 * Clean, restrained disclosure callout reminding users that Merkato Fund is a
 * demonstration prototype utilizing synthetic figures and simulated mechanics.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radii, spacing, fontFamilies, useTheme } from '@/src/theme/tokens';

interface DisclaimerNoticeProps {
  message?: string;
  icon?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export function DisclaimerNotice({
  message = 'Demonstration prototype with synthetic data. Not connected to real banks, CBE, or the National Lottery Administration.',
  icon = '🔒',
  style,
  compact = false,
}: DisclaimerNoticeProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F1F5F9',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginVertical: spacing.md,
  },
  icon: {
    fontSize: 14,
  },
  message: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 17,
  },
});
