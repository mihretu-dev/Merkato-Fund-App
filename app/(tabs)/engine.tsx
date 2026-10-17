import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import {
  Card,
  AppButton,
  CurrencyDisplay,
  DemoBadge,
  StatusPill,
  DisclaimerNotice,
} from '@/src/components/ui';

import {
  formatETB,
  formatETBCompact,
} from '@/src/domain/calculations/currency';
import {
  calculateDailyInterest,
  calculateAccruedInterest,
  calculateNetDailyFlow,
} from '@/src/domain/calculations/interest';
import {
  calculateTotalContributions,
  calculateRepaymentScenario,
  estimateRepaymentDays,
  calculateBufferStatus,
} from '@/src/domain/calculations/repayment';
import {
  simulateDemoDraw,
  DrawSimulationResult,
} from '@/src/domain/calculations/drawSimulation';
import { DEFAULT_DEMO_CONFIG } from '@/src/domain/types';

export default function EnginePlaygroundScreen() {
  // 1. Contribution state
  const [contributionDays, setContributionDays] = useState<number>(30);

  // 2. Repayment scenario state (500 + 50 admin vs 550 flat)
  const [repaymentScenario, setRepaymentScenario] = useState<'withAdminFee' | 'flat550'>('withAdminFee');
  const [elapsedRepaymentDays, setElapsedRepaymentDays] = useState<number>(30);

  // 3. Buffer cycle state
  const [bufferDay, setBufferDay] = useState<number>(5);

  // 4. Draw simulation state
  const [drawResult, setDrawResult] = useState<DrawSimulationResult | null>(null);

  // Computed values
  const totalContributed = calculateTotalContributions(contributionDays, DEFAULT_DEMO_CONFIG.dailyContributionETB);

  const dailyInterest = calculateDailyInterest(
    DEFAULT_DEMO_CONFIG.prizeAmountETB,
    DEFAULT_DEMO_CONFIG.annualInterestRate,
    365
  );
  const accrued180Interest = calculateAccruedInterest(
    DEFAULT_DEMO_CONFIG.prizeAmountETB,
    DEFAULT_DEMO_CONFIG.annualInterestRate,
    180,
    365
  );

  const activePrincipalRate = repaymentScenario === 'withAdminFee' ? 500 : 550;
  const activeAdminFee = repaymentScenario === 'withAdminFee' ? 50 : 0;

  const repaymentCalc = calculateRepaymentScenario(elapsedRepaymentDays, {
    prizeAmountETB: DEFAULT_DEMO_CONFIG.prizeAmountETB,
    dailyPrincipalRepaymentETB: activePrincipalRate,
    dailyAdminFeeETB: activeAdminFee,
  });

  const netDaily = calculateNetDailyFlow({
    prizeAmountETB: DEFAULT_DEMO_CONFIG.prizeAmountETB,
    annualInterestRate: DEFAULT_DEMO_CONFIG.annualInterestRate,
    dailyPrincipalRepaymentETB: activePrincipalRate,
    dailyAdminFeeETB: activeAdminFee,
  });

  const estimatedPayoffDays = estimateRepaymentDays(
    DEFAULT_DEMO_CONFIG.prizeAmountETB,
    activePrincipalRate
  );

  const bufferStatus = calculateBufferStatus(bufferDay, {
    bufferAmountETB: DEFAULT_DEMO_CONFIG.bufferAmountETB,
    bufferCycleDays: DEFAULT_DEMO_CONFIG.bufferCycleDays,
    dailyPrincipalRepaymentETB: activePrincipalRate,
  });

  const handleRunDrawSimulation = () => {
    const demoTickets = [
      'TKT-0911-2026-AA',
      'TKT-0912-2026-BB',
      'TKT-0913-2026-CC',
      'TKT-0914-2026-DD',
      'TKT-0915-2026-EE',
      'TKT-0916-2026-FF',
    ];
    const result = simulateDemoDraw({
      drawId: `DRAW-${Date.now().toString().slice(-4)}`,
      eligibleTickets: demoTickets,
      demoSeed: `MERKATO-SEED-${Date.now()}`,
    });
    setDrawResult(result);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <View style={styles.headerRow}>
            <Text style={styles.heroTitle}>Merkato Fund</Text>
            <DemoBadge label="DEMO ENGINE" />
          </View>
          <Text style={styles.heroSubtitle}>
            Day 1 Verified Financial Domain Arithmetic & Demonstration Simulator
          </Text>
        </View>

        {/* 1. Contribution Engine */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Daily Contribution Engine</Text>
            <DemoBadge compact label="SYNTHETIC" />
          </View>
          <Text style={styles.cardDesc}>
            Calculates pool accumulation based on explicitly supplied days @ 50 ETB/day.
          </Text>

          <View style={styles.pillSelector}>
            {[14, 30, 90, 180, 365].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setContributionDays(d)}
                style={[
                  styles.selectorPill,
                  contributionDays === d && styles.selectorPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    contributionDays === d && styles.selectorPillTextActive,
                  ]}
                >
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsRow}>
            <CurrencyDisplay
              amountETB={totalContributed}
              label={`Total for ${contributionDays} Days`}
              size="lg"
              color={colors.primaryLight}
            />
            <View style={styles.subStat}>
              <Text style={styles.subStatLabel}>Rate</Text>
              <Text style={styles.subStatValue}>50 ETB / day</Text>
            </View>
          </View>
        </Card>

        {/* 2. Escrow & Interest Engine */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. Escrow & 22% Yield (ACT/365)</Text>
            <StatusPill status="locked" label="6-MO BLOCKED" />
          </View>
          <Text style={styles.cardDesc}>
            Source claims 22% annual interest on 1M ETB blocked deposit. Computed using standard ACT/365 simple interest arithmetic.
          </Text>

          <View style={styles.statsGrid}>
            <CurrencyDisplay
              amountETB={dailyInterest}
              label="Daily Interest Yield"
              size="md"
              color={colors.accentGold}
            />
            <CurrencyDisplay
              amountETB={accrued180Interest}
              label="180-Day Full Yield"
              size="md"
              color={colors.status.healthy}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <CurrencyDisplay
              amountETB={netDaily.netDailyFlowETB}
              showSign
              label="Net Daily Cash Flow (Yield - Payment)"
              size="lg"
              color={netDaily.netDailyFlowETB >= 0 ? colors.status.healthy : colors.status.critical}
            />
            <View style={styles.subStat}>
              <Text style={styles.subStatLabel}>Convention</Text>
              <Text style={styles.subStatValue}>ACT/365 Simple</Text>
            </View>
          </View>
        </Card>

        {/* 3. Repayment & Fee Separation */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Post-Win Repayment & Fee Separation</Text>
          </View>
          <Text style={styles.cardDesc}>
            The 50 ETB admin fee is kept separate from principal. Admin fees do not reduce the 1M ETB principal balance.
          </Text>

          <View style={styles.pillSelector}>
            <TouchableOpacity
              onPress={() => setRepaymentScenario('withAdminFee')}
              style={[
                styles.scenarioButton,
                repaymentScenario === 'withAdminFee' && styles.selectorPillActive,
              ]}
            >
              <Text
                style={[
                  styles.selectorPillText,
                  repaymentScenario === 'withAdminFee' && styles.selectorPillTextActive,
                ]}
              >
                500 Principal + 50 Fee (550 Total)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRepaymentScenario('flat550')}
              style={[
                styles.scenarioButton,
                repaymentScenario === 'flat550' && styles.selectorPillActive,
              ]}
            >
              <Text
                style={[
                  styles.selectorPillText,
                  repaymentScenario === 'flat550' && styles.selectorPillTextActive,
                ]}
              >
                550 Flat Principal (0 Fee)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <CurrencyDisplay
              amountETB={repaymentCalc.principalRepaidETB}
              label={`Principal Repaid (${elapsedRepaymentDays}d)`}
              size="md"
            />
            <CurrencyDisplay
              amountETB={repaymentCalc.adminFeesRepaidETB}
              label="Admin Fees Paid (Separate)"
              size="md"
              color={colors.accentGold}
            />
          </View>

          <View style={styles.statsGrid}>
            <CurrencyDisplay
              amountETB={repaymentCalc.remainingPrincipalETB}
              label="Remaining Principal"
              size="md"
              color={colors.dark.textSecondary}
            />
            <View style={styles.subStat}>
              <Text style={styles.subStatLabel}>Estimated Payoff</Text>
              <Text style={styles.subStatValue}>
                ~{estimatedPayoffDays} days ({(estimatedPayoffDays / 365).toFixed(1)} yrs)
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. Winner Buffer Health */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>4. Winner Buffer (7,500 ETB / 15-Day)</Text>
            <StatusPill status={bufferStatus.healthStatus} />
          </View>
          <Text style={styles.cardDesc}>
            Tracks 15-day burn rate of 500 ETB/day to cushion repayments.
          </Text>

          <View style={styles.pillSelector}>
            {[0, 5, 8, 13, 15].map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setBufferDay(day)}
                style={[
                  styles.selectorPill,
                  bufferDay === day && styles.selectorPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    bufferDay === day && styles.selectorPillTextActive,
                  ]}
                >
                  Day {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsRow}>
            <CurrencyDisplay
              amountETB={bufferStatus.currentBalanceETB}
              label="Remaining Buffer"
              size="lg"
              color={
                bufferStatus.healthStatus === 'healthy'
                  ? colors.status.healthy
                  : bufferStatus.healthStatus === 'caution'
                  ? colors.status.caution
                  : colors.status.critical
              }
            />
            <View style={styles.subStat}>
              <Text style={styles.subStatLabel}>Cycle Remaining</Text>
              <Text style={styles.subStatValue}>
                {bufferStatus.daysRemaining} days ({bufferStatus.percentRemaining.toFixed(0)}%)
              </Text>
            </View>
          </View>
        </Card>

        {/* 5. Demonstration Draw Simulator */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5. Algorithmic Draw Demonstration</Text>
            <DemoBadge compact label="DEMO SIMULATION" />
          </View>
          <Text style={styles.cardDesc}>
            Client-side seeded FNV-1a demonstration generator. Isolated from financial calculations and clearly identified as synthetic.
          </Text>

          <AppButton
            title="Simulate Demonstration Draw"
            onPress={handleRunDrawSimulation}
            variant="gold"
            style={{ marginVertical: spacing.md }}
          />

          {drawResult && (
            <View style={styles.drawResultBox}>
              <View style={styles.drawResultHeader}>
                <Text style={styles.drawWinningTicket}>
                  {drawResult.winningTicketNumber}
                </Text>
                <StatusPill status="completed" label="SIMULATED WINNER" />
              </View>
              <Text style={styles.drawDetailText}>
                Draw ID: {drawResult.drawId} • Pool: {drawResult.totalParticipants} demo tickets
              </Text>
              <Text style={styles.drawDetailText}>
                Method: {drawResult.selectionMethod}
              </Text>
              <Text style={styles.drawDisclaimerText}>
                ⚠️ {drawResult.disclaimer}
              </Text>
            </View>
          )}
        </Card>

        {/* Global Mandatory Disclaimer */}
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
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    lineHeight: typography.lineHeights.xs,
    marginBottom: spacing.md,
  },
  pillSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selectorPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    minHeight: 36,
    justifyContent: 'center',
  },
  selectorPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  selectorPillText: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  selectorPillTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeights.bold,
  },
  scenarioButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
    borderRadius: radii.md,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.xs,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  subStat: {
    alignItems: 'flex-end',
  },
  subStatLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
  },
  subStatValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.surfaceBorder,
    marginVertical: spacing.md,
  },
  drawResultBox: {
    backgroundColor: '#0F172A',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  drawResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  drawWinningTicket: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.heavy,
    color: colors.accentGold,
  },
  drawDetailText: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  drawDisclaimerText: {
    fontSize: 10,
    color: colors.accentGold,
    marginTop: spacing.sm,
    lineHeight: 14,
  },
});
