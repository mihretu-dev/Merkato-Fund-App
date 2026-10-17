import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView, View, Text } from 'react-native';

import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import { Card, DemoBadge, DisclaimerNotice } from '@/src/components/ui';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>About Merkato Fund Demo</Text>
          <DemoBadge label="FINANCIAL PROTOTYPE" />
        </View>

        <Card style={styles.card} variant="elevated">
          <Text style={styles.cardTitle}>Purpose & Safety Policy</Text>
          <Text style={styles.cardBody}>
            This application is a Day 1 technology demonstration built with React Native and Expo Router.
            It provides a visual, interactive evaluation of the concepts described in the Merkato Fund
            Telegram marketing materials.
          </Text>
          <Text style={styles.cardBody}>
            Under no circumstances does this prototype perform actual monetary transactions, connect
            to live Ethiopian banking infrastructure, or conduct official lottery prize draws.
          </Text>
        </Card>

        <Card style={styles.card} variant="surface">
          <Text style={styles.cardTitle}>Key Boundaries Enforced</Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Synthetic Data Only:</Text> All balances, streak counts, and ticket numbers are client-generated sample records.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Fee Separation:</Text> The 50 ETB administration fee is isolated from principal repayment and does not amortize loan debt.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Interest Convention:</Text> The claimed 22% rate is computed via documented ACT/365 simple interest arithmetic, not an unverified compound schedule.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Seeded Draw Simulator:</Text> The algorithmic draw is an explicit client-side demonstration, not a verified production lottery.
          </Text>
        </Card>

        <DisclaimerNotice />
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.accentGold,
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontSize: typography.fontSizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  bulletPoint: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 20,
    color: colors.dark.textSecondary,
    marginVertical: 2,
  },
  bold: {
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
});
