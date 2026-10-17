import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
} from 'react-native';

import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import { Card, DemoBadge, DisclaimerNotice } from '@/src/components/ui';

interface AmbiguityItem {
  number: string;
  title: string;
  sourceStatement: string;
  architectAnalysis: string;
  demoResolution: string;
}

const ambiguities: AmbiguityItem[] = [
  {
    number: '2.1',
    title: 'Repayment Conflict (500 vs 550 vs 15,000 ETB/mo)',
    sourceStatement:
      'Page 3 says "500 ETB/day". Page 4 says "550 ETB/day". Page 6 says "15,000 ETB monthly".',
    architectAnalysis:
      '500 × 30 = 15,000 ETB (matches monthly claim). 550 × 30 = 16,500 ETB (1,500 ETB excess). The extra 50 ETB is labeled as an administrative fee on Page 6.',
    demoResolution:
      'Both rates are supported and configurable. Admin fee is explicitly isolated from principal so it never amortizes loan balance.',
  },
  {
    number: '2.2',
    title: '22% Yield & Capital Markets Claim',
    sourceStatement:
      'Page 4 claims "22% annual interest on 1,000,000 ETB blocked for exactly 6 months".',
    architectAnalysis:
      'Commercial bank fixed deposits in Ethiopia typically range 7%–16%. A guaranteed 22% return requires either Treasury bill secondary markets, high-risk microfinance, or an unstated subsidy.',
    demoResolution:
      'Treated as a configurable demonstration parameter. Calculated using standard ACT/365 simple interest arithmetic with clear disclaimer labeling.',
  },
  {
    number: '2.3',
    title: 'Six-Month Duration (180 Days vs Calendar Months)',
    sourceStatement:
      'Page 4 states "exactly 6 months blocked period".',
    architectAnalysis:
      'Six calendar months range from 181 to 184 days depending on start month. Fixed-deposit contracts specify exact maturity dates, not a vague 180-day assumption.',
    demoResolution:
      'Configurable lock period defaulting to 180 days with ACT/365 day-count convention clearly documented.',
  },
  {
    number: '2.4',
    title: '7,500 ETB Buffer (Holdback vs Separate Contribution)',
    sourceStatement:
      'Page 6 introduces a 7,500 ETB buffer replenished every 15 days.',
    architectAnalysis:
      'The source material is silent on whether the buffer is withheld from the 1M ETB prize at disbursement or contributed out-of-pocket by the winner.',
    demoResolution:
      'Modeled as a 15-day burn cycle (500 ETB/day) with percentage health tracking (healthy >50%, caution 20-50%, critical <=20%, depleted 0%).',
  },
  {
    number: '2.5',
    title: 'Algorithmic Draw Legal Classification',
    sourceStatement:
      'PDF describes a daily automated algorithm selecting a 1,000,000 ETB winner from 50 ETB contributors.',
    architectAnalysis:
      'Under Ethiopian law, prize draws dependent on chance fall under National Lottery Administration (NLA) jurisdiction. Pure Equbs (ROSCA) are traditional mutual-aid associations without randomized lottery payouts.',
    demoResolution:
      'Client-side seeded demonstration generator clearly tagged with "DEMO SIMULATION" and "SYNTHETIC PROTOTYPE" notices.',
  },
];

export default function RulesVerificationScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.headerRow}>
            <Text style={styles.heroTitle}>Rules & Boundaries</Text>
            <DemoBadge label="DAY 1 AUDIT" />
          </View>
          <Text style={styles.heroSubtitle}>
            Architectural Analysis of Source Material Ambiguities & Demo Boundaries
          </Text>
        </View>

        {/* Verification Summary Card */}
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryTitle}>Day 1 Verification Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Project Foundation:</Text>
            <Text style={styles.statusValue}>Expo SDK 58 + React 19 + TypeScript</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Domain Calculations:</Text>
            <Text style={styles.statusValue}>33 Automated Tests Passing (node:test)</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Type Safety:</Text>
            <Text style={styles.statusValue}>tsc --noEmit (0 Errors)</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>• Financial Boundaries:</Text>
            <Text style={styles.statusValue}>Configurable & Isolated from UI</Text>
          </View>
        </Card>

        {/* Ambiguities List */}
        <Text style={styles.sectionHeader}>Key Financial Ambiguities Handled</Text>

        {ambiguities.map((item) => (
          <Card key={item.number} style={styles.ambiguityCard} variant="surface">
            <View style={styles.itemHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RULE {item.number}</Text>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>

            <View style={styles.fieldBox}>
              <Text style={styles.fieldLabel}>SOURCE STATEMENT</Text>
              <Text style={styles.fieldContent}>{item.sourceStatement}</Text>
            </View>

            <View style={styles.fieldBox}>
              <Text style={styles.fieldLabel}>MATHEMATICAL / LEGAL ANALYSIS</Text>
              <Text style={styles.fieldContent}>{item.architectAnalysis}</Text>
            </View>

            <View style={[styles.fieldBox, styles.resolutionBox]}>
              <Text style={[styles.fieldLabel, { color: colors.primaryLight }]}>
                DEMO IMPLEMENTATION BOUNDARY
              </Text>
              <Text style={styles.resolutionContent}>{item.demoResolution}</Text>
            </View>
          </Card>
        ))}

        <DisclaimerNotice />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroSection: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  summaryCard: {
    marginBottom: spacing.xl,
    backgroundColor: '#0F1E1E',
    borderColor: colors.primaryMuted,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  statusValue: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.md,
  },
  ambiguityCard: {
    marginBottom: spacing.lg,
  },
  itemHeader: {
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accentGoldDark,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.accentGoldLight,
  },
  itemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
  },
  fieldBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.sm,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldContent: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  resolutionBox: {
    backgroundColor: '#0D211F',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  resolutionContent: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textPrimary,
    lineHeight: 18,
  },
});
