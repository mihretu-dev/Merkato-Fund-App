/**
 * Merkato Fund — Winner Experience Screen
 *
 * Models the core value proposition described in the marketing PDF:
 * 1. 1,000,000 ETB 6-month blocked escrow account at CBE
 * 2. 22% annualized interest accrual (602.74 ETB/day via ACT/365)
 * 3. Daily repayment schedule (500 ETB principal + 50 ETB platform fee)
 * 4. 15-day / 7,500 ETB operational buffer management
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import {
  Card,
  AppButton,
  CurrencyDisplay,
  DemoBadge,
  StatusPill,
  DisclaimerNotice,
  MetricTile,
} from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useDemoConfigStore } from '@/src/stores/useDemoConfigStore';
import { formatETB } from '@/src/domain/calculations/currency';

export default function WinnerScreen() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const repaymentSchedule = useWinnerStore((s) => s.repaymentSchedule);
  const winnerBuffer = useWinnerStore((s) => s.winnerBuffer);
  const isLoading = useWinnerStore((s) => s.isLoading);
  const recordRepayment = useWinnerStore((s) => s.recordRepayment);
  const replenishBuffer = useWinnerStore((s) => s.replenishBuffer);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);
  const resetActiveDraw = useDrawStore((s) => s.resetActiveDraw);

  const config = useDemoConfigStore((s) => s.config);
  const repaymentDailyModel = useDemoConfigStore((s) => s.repaymentDailyModel);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isWinnerPersona = currentUser.role === 'winner' || escrowAccount !== null;

  const dailyPrincipal = config.dailyPrincipalRepaymentETB;
  const dailyAdminFee = config.dailyAdminFeeETB;
  const dailyTotalOutflow = dailyPrincipal + dailyAdminFee;

  const handleRecordRepayment = async () => {
    try {
      setActionNotice(null);
      await recordRepayment(currentUser.id, 'telebirr');
      setActionNotice(
        `✅ Daily repayment installment of ${formatETB(dailyTotalOutflow)} recorded (${formatETB(dailyPrincipal)} principal + ${formatETB(dailyAdminFee)} fee). ${formatETB(dailyPrincipal)} buffer drawn.`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Repayment failed';
      Alert.alert('Simulation', msg);
    }
  };

  const handleReplenishBuffer = async () => {
    try {
      setActionNotice(null);
      await replenishBuffer(currentUser.id, 2500);
      setActionNotice('✅ Buffer replenished by 2,500 ETB. Health restored.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Replenish failed';
      Alert.alert('Simulation', msg);
    }
  };

  // Safe fallback figures if not yet hydrated
  const principalAmount = escrowAccount?.principalAmountETB || 1_000_000;
  const elapsedDays = escrowAccount?.elapsedDays || 45;
  const totalDays = escrowAccount?.totalDaysLocked || 180;
  const dailyYield = escrowAccount?.dailyInterestYieldETB || 602.74;
  const accruedYield = escrowAccount?.accruedInterestETB || 27123.3;
  const projectedYield = escrowAccount?.projectedTotalInterestETB || 108493.15;
  const netDailyFlow = dailyYield - dailyTotalOutflow;

  const remainingPrincipal = repaymentSchedule?.remainingPrincipalETB || 977_500;
  const installmentsDone = repaymentSchedule?.installmentsCompleted || 45;
  const totalRepaid = repaymentSchedule?.totalRepaidETB || 24_750;

  const currentBuffer = winnerBuffer?.currentBufferBalanceETB || 5_000;
  const targetBuffer = winnerBuffer?.targetBufferAmountETB || 7_500;
  const bufferHealth = winnerBuffer?.healthStatus || 'healthy';
  const daysInCycleLeft = winnerBuffer?.daysRemainingInCycle || 10;

  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Winner Hub & Escrow</Text>
            <Text style={styles.screenSubtitle}>
              6-Month Blocked Bank Account • 22% Yield
            </Text>
          </View>
          <DemoBadge label="FINANCIAL DEMO" />
        </View>

        {/* Mandatory Simulated Winner Disclaimer */}
        <Card style={styles.winnerNoticeCard} variant="surface">
          <View style={styles.winnerNoticeHeader}>
            <Text style={styles.winnerNoticeIcon}>🛡️</Text>
            <Text style={styles.winnerNoticeTitle}>SIMULATED WINNER — NO MONEY AWARDED</Text>
          </View>
          <Text style={styles.winnerNoticeBody}>
            The 1,000,000 ETB payout and 22% CBE escrow account shown below are purely synthetic models for concept evaluation. Under no circumstances does this represent an actual bank deposit, verified lottery payout, or liquid funds.
          </Text>
        </Card>

        {/* Live Draw Winner Banner if completed */}
        {(activeDraw?.status === 'completed' || lastDrawResult) && (
          <Card style={styles.todayWinnerBanner} variant="elevated">
            <View style={styles.todayWinnerHeader}>
              <Text style={styles.todayWinnerIcon}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.todayWinnerSubtitle}>TODAY’S DRAW SELECTION</Text>
                <Text style={styles.todayWinnerName}>
                  Winner: {activeDraw?.winnerName || lastDrawResult?.winner.fullName || 'Demo Winner'}
                </Text>
                <Text style={styles.todayWinnerTicket}>
                  Winning Ticket: {activeDraw?.winningTicketNumber || lastDrawResult?.winningTicket.ticketNumber}
                </Text>
              </View>
              <StatusPill status="healthy" label="DRAW WINNER" size="small" />
            </View>
          </Card>
        )}

        {!isWinnerPersona && (
          <View style={styles.personaWarning}>
            <Text style={styles.personaWarningText}>
              💡 Note: Currently viewing as "{currentUser.fullName}" ({currentUser.role}). For the authentic winner demonstration, switch to Bethlehem Tadesse using the Persona Selector.
            </Text>
          </View>
        )}

        {actionNotice && (
          <View style={styles.actionNoticeBox}>
            <Text style={styles.actionNoticeText}>{actionNotice}</Text>
          </View>
        )}

        {/* 1. Blocked Escrow Card */}
        <Card style={styles.escrowCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.bankName}>Commercial Bank of Ethiopia (CBE)</Text>
              <Text style={styles.accountNumber}>
                ESCROW A/C: {escrowAccount?.escrowAccountNumber?.startsWith('DEMO-') ? escrowAccount.escrowAccountNumber : `DEMO-${escrowAccount?.escrowAccountNumber || 'CBE-ESC-8392'}`}
              </Text>
            </View>
            <StatusPill status="locked" label="BLOCKED 6-MO" />
          </View>

          <View style={styles.principalRow}>
            <CurrencyDisplay
              amountETB={principalAmount}
              label="Custody Principal Deposit"
              size="lg"
              color={colors.accentGold}
            />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.daysBadgeLabel}>Lock Progress</Text>
              <Text style={styles.daysBadgeValue}>
                Day {elapsedDays} / {totalDays}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelLeft}>Locked: 2026-09-01</Text>
            <Text style={styles.progressLabelCenter}>{progressPercent}% Elapsed</Text>
            <Text style={styles.progressLabelRight}>Unlock: 2027-02-28</Text>
          </View>
        </Card>

        {/* 2. 22% Interest Accrual Card */}
        <Card style={styles.yieldCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>22% Annualized Escrow Yield</Text>
            <StatusPill status="healthy" label="ACT/365 SIMPLE" size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            Illustrative simple interest accrual at 22% per annum on 1,000,000 ETB.
          </Text>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Daily Interest"
              value={formatETB(dailyYield)}
              subtitle="Accrued per day"
              highlight
            />
            <MetricTile
              label="Accrued (45 Days)"
              value={formatETB(accruedYield)}
              subtitle="Month 2 of 6"
            />
          </View>

          <View style={styles.fullProjectedBox}>
            <View>
              <Text style={styles.projectedLabel}>180-Day Projected Total Yield</Text>
              <Text style={styles.projectedSub}>
                1,000,000 ETB × 22% × (180 / 365)
              </Text>
            </View>
            <Text style={styles.projectedAmount}>{formatETB(projectedYield)}</Text>
          </View>

          {/* Net Cash Flow Callout */}
          <View style={styles.cashFlowBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cashFlowTitle}>Net Daily Cash Flow During Lock:</Text>
              <Text style={styles.cashFlowCalc}>
                +{formatETB(dailyYield)} (Yield) - {formatETB(dailyTotalOutflow)} (Repayment)
              </Text>
            </View>
            <Text style={styles.cashFlowSurplus}>
              {netDailyFlow >= 0 ? '+' : ''}{formatETB(netDailyFlow)} / day
            </Text>
          </View>

          <View style={styles.modelDisclaimerBox}>
            <Text style={styles.modelDisclaimerText}>
              ⚠️ NON-CONTRACTUAL ARITHMETIC: This illustrative surplus applies strictly during the 180-day lock while 1M ETB remains on deposit at CBE. Once unlocked at Month 6, interest ceases, leaving ~910,000 ETB in unpaid debt requiring ongoing repayment. This does not constitute an authoritative bank offer or proof of long-term viability.
            </Text>
          </View>
        </Card>

        {/* 3. Post-Win Repayment Schedule */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Repayment Obligation</Text>
            <StatusPill status="info" label={`${dailyTotalOutflow} ETB / DAY`} size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            {repaymentDailyModel === '500_plus_50'
              ? 'Model A: 50 ETB administrative fee is segregated from 500 ETB principal debt.'
              : repaymentDailyModel === '550_bundle'
              ? 'Model B: 550 ETB flat repayment is applied directly to principal (no separate fee).'
              : 'Model C: 500 ETB flat repayment without administrative fee.'}
          </Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Daily Principal</Text>
              <Text style={styles.breakdownItemVal}>{formatETB(dailyPrincipal)}</Text>
            </View>
            <Text style={styles.breakdownPlus}>+</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Admin Fee</Text>
              <Text style={styles.breakdownItemVal}>{formatETB(dailyAdminFee)}</Text>
            </View>
            <Text style={styles.breakdownEquals}>=</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Total Outflow</Text>
              <Text style={[styles.breakdownItemVal, { color: colors.accentGold }]}>
                {formatETB(dailyTotalOutflow)}
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Remaining Principal"
              value={formatETB(remainingPrincipal)}
              subtitle="From 1,000,000 ETB"
            />
            <MetricTile
              label="Completed Payments"
              value={`${installmentsDone} Days`}
              subtitle={`${formatETB(totalRepaid)} paid`}
            />
          </View>

          <AppButton
            title={isLoading ? 'Processing...' : `Simulate 1-Day Repayment Installment (${formatETB(dailyTotalOutflow)})`}
            variant="primary"
            loading={isLoading}
            onPress={handleRecordRepayment}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* 4. 15-Day / 7,500 ETB Winner Buffer */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>15-Day Winner Operational Buffer</Text>
            <StatusPill status={bufferHealth} />
          </View>

          <Text style={styles.cardSubtitle}>
            Guarantees repayment continuity. 500 ETB daily burn rate cushioned for 15 days.
          </Text>

          <View style={styles.bufferMetricsRow}>
            <CurrencyDisplay
              amountETB={currentBuffer}
              label={`Current Balance (${Math.round((currentBuffer / targetBuffer) * 100)}%)`}
              size="md"
              color={
                bufferHealth === 'healthy'
                  ? colors.status.healthy
                  : bufferHealth === 'caution'
                  ? colors.status.caution
                  : colors.status.critical
              }
            />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bufferSubLabel}>Cycle Remaining</Text>
              <Text style={styles.bufferSubVal}>{daysInCycleLeft} of 15 Days</Text>
            </View>
          </View>

          <AppButton
            title="Replenish Buffer (+2,500 ETB)"
            variant="outline"
            onPress={handleReplenishBuffer}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* 5. Evaluator Navigation Controls */}
        <Card style={styles.navCard} variant="outline">
          <View style={styles.cardHeader}>
            <Text style={styles.navTitle}>🛠️ Evaluator Shortcuts</Text>
            <StatusPill status="info" label="CONTROLS" size="small" />
          </View>
          <Text style={styles.navSubtitle}>
            Return to the draw room to simulate another draw, or reset the active draw instance.
          </Text>

          <View style={styles.navButtonsRow}>
            <AppButton
              title="← Return to Draw Room"
              variant="primary"
              onPress={() => router.push('/(tabs)/draw')}
              style={{ flex: 1 }}
            />
            {activeDraw?.status === 'completed' && (
              <AppButton
                title="Reset Active Draw"
                variant="outline"
                onPress={async () => {
                  await resetActiveDraw('draw-20261017');
                  Alert.alert('Draw Reset', 'Today’s active draw has been reset to SCHEDULED state.');
                }}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </Card>

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
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.dark.textPrimary,
  },
  screenSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 12,
  },
  personaWarning: {
    backgroundColor: '#1E170A',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  personaWarningText: {
    ...typography.bodySmall,
    color: colors.accentGoldLight,
    lineHeight: 18,
  },
  actionNoticeBox: {
    backgroundColor: '#064E3B',
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionNoticeText: {
    ...typography.bodySmall,
    color: '#E6FFFA',
    fontWeight: '600',
  },
  escrowCard: {
    marginBottom: spacing.md,
    backgroundColor: '#0C1C16',
    borderColor: colors.primaryDark,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bankName: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 15,
  },
  accountNumber: {
    ...typography.caption,
    color: colors.primaryLight,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 2,
  },
  principalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: spacing.md,
  },
  daysBadgeLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  daysBadgeValue: {
    ...typography.h3,
    color: colors.accentGold,
    fontSize: 15,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.surfaceBorder,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryLight,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelLeft: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
  },
  progressLabelCenter: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 10,
  },
  progressLabelRight: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
  },
  yieldCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 16,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fullProjectedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.sm,
  },
  projectedLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  projectedSub: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
  },
  projectedAmount: {
    ...typography.h3,
    color: colors.status.healthy,
    fontSize: 16,
  },
  cashFlowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F261E',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  cashFlowTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  cashFlowCalc: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 10,
  },
  cashFlowSurplus: {
    ...typography.h3,
    color: colors.status.healthy,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownItemLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
  },
  breakdownItemVal: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  breakdownPlus: {
    color: colors.dark.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  breakdownEquals: {
    color: colors.dark.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  bufferMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bufferSubLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  bufferSubVal: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  modelDisclaimerBox: {
    backgroundColor: '#1E1609',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  modelDisclaimerText: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 15,
  },
  winnerNoticeCard: {
    backgroundColor: '#1E1408',
    borderColor: 'rgba(217, 162, 59, 0.4)',
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  winnerNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  winnerNoticeIcon: {
    fontSize: 18,
  },
  winnerNoticeTitle: {
    ...typography.h3,
    fontSize: 13,
    color: colors.accentGold,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  winnerNoticeBody: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 16,
    fontSize: 11,
  },
  todayWinnerBanner: {
    backgroundColor: '#1E170A',
    borderColor: colors.accentGold,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  todayWinnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todayWinnerIcon: {
    fontSize: 28,
  },
  todayWinnerSubtitle: {
    ...typography.label,
    fontSize: 9,
    color: colors.accentGold,
    letterSpacing: 0.8,
  },
  todayWinnerName: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 15,
    marginTop: 2,
  },
  todayWinnerTicket: {
    ...typography.caption,
    color: colors.accentGold,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 1,
  },
  navCard: {
    marginBottom: spacing.md,
    backgroundColor: '#0F172A',
    borderColor: colors.dark.surfaceBorder,
  },
  navTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  navSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
