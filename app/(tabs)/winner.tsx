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
} from 'react-native';

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
import { formatETB } from '@/src/domain/calculations/currency';

export default function WinnerScreen() {
  const currentUser = useUserStore((s) => s.currentUser);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const repaymentSchedule = useWinnerStore((s) => s.repaymentSchedule);
  const winnerBuffer = useWinnerStore((s) => s.winnerBuffer);
  const isLoading = useWinnerStore((s) => s.isLoading);
  const recordRepayment = useWinnerStore((s) => s.recordRepayment);
  const replenishBuffer = useWinnerStore((s) => s.replenishBuffer);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isWinnerPersona = currentUser.role === 'winner' || escrowAccount !== null;

  const handleRecordRepayment = async () => {
    try {
      setActionNotice(null);
      await recordRepayment(currentUser.id, 'telebirr');
      setActionNotice('✅ Daily repayment installment of 550 ETB recorded (500 principal + 50 fee). 500 ETB buffer drawn.');
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
                ESCROW A/C: {escrowAccount?.escrowAccountNumber || '1000-ESC-8392-ETB'}
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
                +602.74 ETB (Yield) - 550.00 ETB (Repayment)
              </Text>
            </View>
            <Text style={styles.cashFlowSurplus}>+52.74 ETB / day</Text>
          </View>
        </Card>

        {/* 3. Post-Win Repayment Schedule */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Repayment Obligation</Text>
            <StatusPill status="info" label="550 ETB / DAY" size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            Administrative fees (50 ETB) are segregated from principal debt (500 ETB).
          </Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Daily Principal</Text>
              <Text style={styles.breakdownItemVal}>500.00 ETB</Text>
            </View>
            <Text style={styles.breakdownPlus}>+</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Admin Fee</Text>
              <Text style={styles.breakdownItemVal}>50.00 ETB</Text>
            </View>
            <Text style={styles.breakdownEquals}>=</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownItemLabel}>Total Outflow</Text>
              <Text style={[styles.breakdownItemVal, { color: colors.accentGold }]}>
                550.00 ETB
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
            title={isLoading ? 'Processing...' : 'Simulate 1-Day Repayment Installment (550 ETB)'}
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
});
