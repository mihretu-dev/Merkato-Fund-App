/**
 * Merkato Fund — Winner Experience & Financial Simulation Hub
 *
 * Models the core value proposition described in the marketing PDF:
 * 1. 1,000,000 ETB 6-month blocked escrow account at Commercial Bank of Ethiopia (CBE)
 * 2. 22% annualized simple interest accrual (602.74 ETB/day via ACT/365)
 * 3. Daily repayment schedule (Scenario A: 500 ETB + 50 ETB fee vs Scenario B: 550 ETB flat)
 * 4. 15-day / 7,500 ETB rolling buffer cycle with cash flow reality check
 *
 * ALL FIGURES ARE SYNTHETIC DEMONSTRATION ESTIMATES — NOT AN AUTHORITATIVE BANK CONTRACT.
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
import {
  calculateDailyInterest,
  calculateAccruedInterest,
  calculateNetDailyFlow,
} from '@/src/domain/calculations/interest';
import {
  calculateRepaymentScenario,
  calculateBufferStatus,
  calculateBufferReplenishment,
  calculateRealityCheck,
  estimateRepaymentDays,
} from '@/src/domain/calculations/repayment';

export default function WinnerScreen() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const repaymentSchedule = useWinnerStore((s) => s.repaymentSchedule);
  const winnerBuffer = useWinnerStore((s) => s.winnerBuffer);
  const simulationDay = useWinnerStore((s) => s.simulationDay);
  const setSimulationDay = useWinnerStore((s) => s.setSimulationDay);
  const resetSimulationDay = useWinnerStore((s) => s.resetSimulationDay);

  const isLoading = useWinnerStore((s) => s.isLoading);
  const recordRepayment = useWinnerStore((s) => s.recordRepayment);
  const replenishBuffer = useWinnerStore((s) => s.replenishBuffer);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);
  const resetActiveDraw = useDrawStore((s) => s.resetActiveDraw);

  const config = useDemoConfigStore((s) => s.config);
  const repaymentDailyModel = useDemoConfigStore((s) => s.repaymentDailyModel);
  const setRepaymentDailyModel = useDemoConfigStore((s) => s.setRepaymentDailyModel);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isWinnerPersona = currentUser.role === 'winner' || escrowAccount !== null;

  // Repayment parameters based on selected model
  const isScenarioA = repaymentDailyModel === '500_plus_50';
  const dailyPrincipal = isScenarioA ? 500 : 550;
  const dailyAdminFee = isScenarioA ? 50 : 0;
  const dailyTotalPayment = dailyPrincipal + dailyAdminFee;

  // Dynamic simulation values at simulationDay (clamped 0 to 180)
  const totalLockDays = 180;
  const clampedDay = Math.max(0, Math.min(180, simulationDay));
  const principalAmount = 1_000_000;
  const annualRate = config.annualInterestRate || 0.22;

  // Pure domain calculations
  const dailyInterest = calculateDailyInterest(principalAmount, annualRate, 365);
  const accruedInterest = calculateAccruedInterest(principalAmount, annualRate, clampedDay, 365);
  const totalAccountValue = principalAmount + accruedInterest;
  const projected180Interest = calculateAccruedInterest(principalAmount, annualRate, 180, 365);
  const netDailyCashFlow = dailyInterest - dailyTotalPayment;

  // Repayment calculations at simulationDay
  const repaymentScenario = calculateRepaymentScenario(clampedDay, {
    prizeAmountETB: principalAmount,
    dailyPrincipalRepaymentETB: dailyPrincipal,
    dailyAdminFeeETB: dailyAdminFee,
  });

  const estimatedPayoffDays = estimateRepaymentDays(principalAmount, dailyPrincipal);
  const remainingPrincipalAtDay180 = Math.max(0, principalAmount - (180 * dailyPrincipal));
  const daysAfterLockRemaining = Math.ceil(remainingPrincipalAtDay180 / dailyPrincipal);

  // Buffer calculations at simulationDay
  // Day within the current 15-day cycle (1 to 15, or 0 if day 0)
  const cycleDay = clampedDay === 0 ? 0 : ((clampedDay - 1) % 15) + 1;
  const bufferStatus = calculateBufferStatus(cycleDay, {
    bufferAmountETB: 7_500,
    bufferCycleDays: 15,
    dailyPrincipalRepaymentETB: dailyPrincipal,
  });

  const replenishmentSummary = calculateBufferReplenishment(clampedDay, {
    bufferAmountETB: 7_500,
    bufferCycleDays: 15,
  });

  // Comprehensive reality check
  const realityCheck = calculateRealityCheck(
    clampedDay,
    config,
    isScenarioA ? '500_plus_50' : '550_bundle'
  );

  const progressPercent = Math.min(100, Math.round((clampedDay / totalLockDays) * 100));

  const handleRecordRepayment = async () => {
    try {
      setActionNotice(null);
      await recordRepayment(currentUser.id, 'telebirr');
      setActionNotice(
        `✅ Recorded 1-day simulated payment: ${formatETB(dailyTotalPayment)} (${formatETB(dailyPrincipal)} principal + ${formatETB(dailyAdminFee)} fee). Buffer balance adjusted.`
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
      setActionNotice('✅ Buffer replenished by 2,500 ETB in mock service.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Replenish failed';
      Alert.alert('Simulation', msg);
    }
  };

  const checkpoints = [0, 15, 30, 45, 90, 135, 180];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Winner Hub & Escrow</Text>
            <Text style={styles.screenSubtitle}>
              6-Month Blocked Escrow • 22% ACT/365 Yield • Buffer Reality Check
            </Text>
          </View>
          <DemoBadge label="DAY 6 SIMULATOR" />
        </View>

        {/* Mandatory Safety Notice */}
        <Card style={styles.winnerNoticeCard} variant="surface">
          <View style={styles.winnerNoticeHeader}>
            <Text style={styles.winnerNoticeIcon}>🛡️</Text>
            <Text style={styles.winnerNoticeTitle}>SIMULATED WINNER — NO MONEY AWARDED</Text>
          </View>
          <Text style={styles.winnerNoticeBody}>
            The 1,000,000 ETB payout, 22% CBE interest rate, and buffer accounts are demonstration models for concept evaluation. Commercial Bank of Ethiopia (CBE) has no verified agreement to hold funds or guarantee yields. Accrued interest remains strictly locked in escrow.
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

        {/* ================================================================= */}
        {/* 1. INTERACTIVE 6-MONTH TIMELINE CONTROLLER                        */}
        {/* ================================================================= */}
        <Card style={styles.timelineCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>⏱️ Six-Month Timeline Controller</Text>
              <Text style={styles.cardSubtitle}>
                Inspect financial state across Day 0 to Day 180 checkpoints.
              </Text>
            </View>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>DAY {clampedDay}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelLeft}>Day 0 (Lock Start)</Text>
            <Text style={styles.progressLabelCenter}>{progressPercent}% Elapsed ({clampedDay}/180d)</Text>
            <Text style={styles.progressLabelRight}>Day 180 (Unlock)</Text>
          </View>

          {/* Quick Checkpoint Buttons */}
          <Text style={styles.checkpointHeading}>KEY CHECKPOINTS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.checkpointsRow}>
            {checkpoints.map((day) => {
              const isSelected = clampedDay === day;
              let label = `Day ${day}`;
              if (day === 0) label = 'Day 0 (Start)';
              else if (day === 15) label = 'Day 15 (Buf 1)';
              else if (day === 45) label = 'Day 45 (Current)';
              else if (day === 90) label = 'Day 90 (Half)';
              else if (day === 180) label = 'Day 180 (Unlock)';

              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.checkpointChip, isSelected && styles.checkpointChipSelected]}
                  onPress={() => setSimulationDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select checkpoint ${label}`}
                >
                  <Text style={[styles.checkpointChipText, isSelected && styles.checkpointChipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Step Adjustment Controls */}
          <View style={styles.stepControlsRow}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setSimulationDay(clampedDay - 15)}
              disabled={clampedDay <= 0}
              accessibilityRole="button"
              accessibilityLabel="Rewind 15 days"
            >
              <Text style={[styles.stepButtonText, clampedDay <= 0 && styles.stepButtonDisabled]}>-15d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setSimulationDay(clampedDay - 1)}
              disabled={clampedDay <= 0}
              accessibilityRole="button"
              accessibilityLabel="Rewind 1 day"
            >
              <Text style={[styles.stepButtonText, clampedDay <= 0 && styles.stepButtonDisabled]}>-1d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stepButton, styles.stepButtonReset]}
              onPress={resetSimulationDay}
              accessibilityRole="button"
              accessibilityLabel="Reset to baseline day 45"
            >
              <Text style={styles.stepButtonResetText}>Reset (D45)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setSimulationDay(clampedDay + 1)}
              disabled={clampedDay >= 180}
              accessibilityRole="button"
              accessibilityLabel="Advance 1 day"
            >
              <Text style={[styles.stepButtonText, clampedDay >= 180 && styles.stepButtonDisabled]}>+1d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setSimulationDay(clampedDay + 15)}
              disabled={clampedDay >= 180}
              accessibilityRole="button"
              accessibilityLabel="Advance 15 days"
            >
              <Text style={[styles.stepButtonText, clampedDay >= 180 && styles.stepButtonDisabled]}>+15d</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* ================================================================= */}
        {/* 2. ESCROW ACCOUNT BREAKDOWN (1M ETB @ 22% ACT/365)               */}
        {/* ================================================================= */}
        <Card style={styles.escrowCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.bankName}>Commercial Bank of Ethiopia (CBE)</Text>
              <Text style={styles.accountNumber}>
                ESCROW A/C: {escrowAccount?.escrowAccountNumber?.startsWith('DEMO-') ? escrowAccount.escrowAccountNumber : `DEMO-${escrowAccount?.escrowAccountNumber || '1000-ESC-8392-ETB'}`}
              </Text>
            </View>
            <StatusPill status="locked" label="BLOCKED 6-MO" />
          </View>

          <View style={styles.principalRow}>
            <CurrencyDisplay
              amountETB={totalAccountValue}
              label={`Total Escrow Value (Day ${clampedDay})`}
              size="lg"
              color={colors.accentGold}
            />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.daysBadgeLabel}>Lock Progress</Text>
              <Text style={styles.daysBadgeValue}>
                Day {clampedDay} / {totalLockDays}
              </Text>
            </View>
          </View>

          {/* Segregated Principal vs Interest */}
          <View style={styles.segregatedBox}>
            <View style={styles.segregatedItem}>
              <Text style={styles.segregatedLabel}>Blocked Principal</Text>
              <Text style={styles.segregatedVal}>{formatETB(principalAmount)}</Text>
              <Text style={styles.segregatedSub}>Non-withdrawable</Text>
            </View>
            <Text style={styles.segregatedPlus}>+</Text>
            <View style={styles.segregatedItem}>
              <Text style={styles.segregatedLabel}>Accrued Interest</Text>
              <Text style={[styles.segregatedVal, { color: colors.status.healthy }]}>
                {formatETB(accruedInterest)}
              </Text>
              <Text style={styles.segregatedSub}>{clampedDay} days @ 22%</Text>
            </View>
          </View>

          {/* Rate & Day-Count Notice */}
          <View style={styles.metricsGrid}>
            <MetricTile
              label="Annual Rate"
              value="22.0%"
              subtitle="Unverified assumption"
            />
            <MetricTile
              label="Day-Count"
              value="ACT/365"
              subtitle="Simple arithmetic"
            />
          </View>

          <View style={styles.fullProjectedBox}>
            <View>
              <Text style={styles.projectedLabel}>180-Day Projected Total Yield</Text>
              <Text style={styles.projectedSub}>
                1,000,000 ETB × 22% × (180 / 365)
              </Text>
            </View>
            <Text style={styles.projectedAmount}>{formatETB(projected180Interest)}</Text>
          </View>

          {/* Blocked funds disclaimer */}
          <View style={styles.modelDisclaimerBox}>
            <Text style={styles.modelDisclaimerText}>
              🔒 NON-SPENDABLE ACCRUAL: Simple interest accrues daily at ~602.74 ETB/day under ACT/365 convention. Accrued interest is locked in bank custody and is NOT spendable cash or withdrawable until escrow maturity.
            </Text>
          </View>
        </Card>

        {/* ================================================================= */}
        {/* 3. REPAYMENT SCENARIO COMPARISON (SCENARIO A vs B)               */}
        {/* ================================================================= */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💳 Repayment Scenario Inspector</Text>
            <StatusPill status="info" label={`${dailyTotalPayment} ETB / DAY`} size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            Compare the two competing repayment interpretations from the marketing text.
          </Text>

          {/* Scenario Selector Tabs */}
          <View style={styles.scenarioTabsRow}>
            <TouchableOpacity
              style={[styles.scenarioTab, isScenarioA && styles.scenarioTabActive]}
              onPress={() => setRepaymentDailyModel('500_plus_50')}
              accessibilityRole="button"
              accessibilityLabel="Select Scenario A: 500 ETB principal plus 50 ETB fee"
            >
              <Text style={[styles.scenarioTabText, isScenarioA && styles.scenarioTabTextActive]}>
                Scenario A (500 + 50)
              </Text>
              <Text style={styles.scenarioTabSub}>500 Principal • 50 Fee</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scenarioTab, !isScenarioA && styles.scenarioTabActive]}
              onPress={() => setRepaymentDailyModel('550_bundle')}
              accessibilityRole="button"
              accessibilityLabel="Select Scenario B: 550 ETB flat principal"
            >
              <Text style={[styles.scenarioTabText, !isScenarioA && styles.scenarioTabTextActive]}>
                Scenario B (550 Flat)
              </Text>
              <Text style={styles.scenarioTabSub}>550 Principal • 0 Fee</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Breakdown for Selected Scenario */}
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
              <Text style={styles.breakdownItemLabel}>Daily Payment</Text>
              <Text style={[styles.breakdownItemVal, { color: colors.accentGold }]}>
                {formatETB(dailyTotalPayment)}
              </Text>
            </View>
          </View>

          {/* Cumulative Metrics at simulationDay */}
          <View style={styles.metricsGrid}>
            <MetricTile
              label={`Principal Repaid (D${clampedDay})`}
              value={formatETB(repaymentScenario.principalRepaidETB)}
              subtitle={`${clampedDay} × ${formatETB(dailyPrincipal)}`}
              highlight
            />
            <MetricTile
              label="Remaining Principal"
              value={formatETB(repaymentScenario.remainingPrincipalETB)}
              subtitle="From 1,000,000 ETB"
            />
          </View>

          {isScenarioA && (
            <View style={styles.feeNoticeBox}>
              <Text style={styles.feeNoticeText}>
                ⚠️ ADMIN FEE SEPARATION: The 50 ETB/day administrative fee ({formatETB(repaymentScenario.adminFeesRepaidETB)} paid by Day {clampedDay}) does NOT reduce principal debt.
              </Text>
            </View>
          )}

          {/* Post-Escrow Payoff Reality */}
          <View style={styles.payoffRealityBox}>
            <View style={styles.payoffHeaderRow}>
              <Text style={styles.payoffTitle}>⚠️ 180-Day Escrow vs Full Payoff Reality</Text>
            </View>
            <Text style={styles.payoffBody}>
              At Day 180 unlock, only {formatETB(180 * dailyPrincipal)} of principal has been repaid. An outstanding balance of <Text style={{ color: colors.accentGold, fontWeight: '700' }}>{formatETB(remainingPrincipalAtDay180)}</Text> remains!
            </Text>
            <View style={styles.payoffStatsRow}>
              <View>
                <Text style={styles.payoffStatLabel}>Total Payoff Duration</Text>
                <Text style={styles.payoffStatVal}>{estimatedPayoffDays} Days (~{(estimatedPayoffDays / 365).toFixed(1)} Years)</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.payoffStatLabel}>Post-Escrow Payments</Text>
                <Text style={styles.payoffStatVal}>+{daysAfterLockRemaining} Days (~{(daysAfterLockRemaining / 365).toFixed(1)} Yrs)</Text>
              </View>
            </View>
          </View>

          <AppButton
            title={isLoading ? 'Processing...' : `Simulate 1-Day Installment (${formatETB(dailyTotalPayment)})`}
            variant="primary"
            loading={isLoading}
            onPress={handleRecordRepayment}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* ================================================================= */}
        {/* 4. 15-DAY / 7,500 ETB WINNER BUFFER SIMULATOR                     */}
        {/* ================================================================= */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🛡️ 15-Day Buffer Simulator</Text>
            <StatusPill status={bufferStatus.healthStatus} />
          </View>

          <Text style={styles.cardSubtitle}>
            Guarantees repayment continuity. 500 ETB/day burned over a 15-day cycle.
          </Text>

          <View style={styles.bufferMetricsRow}>
            <CurrencyDisplay
              amountETB={bufferStatus.currentBalanceETB}
              label={`Buffer Balance (${Math.round(bufferStatus.percentRemaining)}%)`}
              size="md"
              color={
                bufferStatus.healthStatus === 'healthy'
                  ? colors.status.healthy
                  : bufferStatus.healthStatus === 'caution'
                  ? colors.status.caution
                  : colors.status.critical
              }
            />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.bufferSubLabel}>Cycle Progress</Text>
              <Text style={styles.bufferSubVal}>Day {cycleDay} of 15</Text>
              <Text style={styles.bufferSubNote}>{bufferStatus.daysRemaining} days until reset</Text>
            </View>
          </View>

          {/* Replenishment History */}
          <View style={styles.replenishStatsBox}>
            <View style={styles.replenishStatItem}>
              <Text style={styles.replenishStatLabel}>Completed Cycles</Text>
              <Text style={styles.replenishStatVal}>{replenishmentSummary.completedCycles}</Text>
            </View>
            <View style={styles.replenishStatItem}>
              <Text style={styles.replenishStatLabel}>Cumulative Needed</Text>
              <Text style={styles.replenishStatVal}>{formatETB(replenishmentSummary.cumulativeReplenishedETB)}</Text>
            </View>
            <View style={styles.replenishStatItem}>
              <Text style={styles.replenishStatLabel}>Next Checkpoint</Text>
              <Text style={styles.replenishStatVal}>Day {replenishmentSummary.nextReplenishmentDay}</Text>
            </View>
          </View>

          {/* Unresolved Buffer Funding Rule Callout */}
          <View style={styles.unresolvedBox}>
            <Text style={styles.unresolvedTitle}>❓ UNRESOLVED ASSUMPTION: Who Funds the Buffer?</Text>
            <Text style={styles.unresolvedBody}>
              {replenishmentSummary.fundingNote}
            </Text>
          </View>

          <AppButton
            title="Simulate Buffer Top-Up (+2,500 ETB)"
            variant="outline"
            onPress={handleReplenishBuffer}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* ================================================================= */}
        {/* 5. FINANCIAL CONSISTENCY & REALITY CHECK                          */}
        {/* ================================================================= */}
        <Card style={styles.realityCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.realityTitle}>⚖️ Financial Reality Check & Cash Flow</Text>
              <Text style={styles.realitySubtitle}>
                Rigorous mathematical reconciliation of marketing claims.
              </Text>
            </View>
            <StatusPill status="critical" label="DEFICIT GAP" size="small" />
          </View>

          {/* Daily Cash Flow Comparison */}
          <View style={styles.cashFlowTable}>
            <View style={styles.cashFlowRow}>
              <Text style={styles.cashFlowCellLabel}>Daily Simple Interest Yield (ACT/365)</Text>
              <Text style={[styles.cashFlowCellVal, { color: colors.status.healthy }]}>
                +{formatETB(realityCheck.dailyInterestYieldETB)} / day
              </Text>
            </View>
            <View style={styles.cashFlowRow}>
              <Text style={styles.cashFlowCellLabel}>Daily Total Repayment ({isScenarioA ? 'Scenario A' : 'Scenario B'})</Text>
              <Text style={[styles.cashFlowCellVal, { color: colors.status.critical }]}>
                -{formatETB(realityCheck.dailyTotalRepaymentETB)} / day
              </Text>
            </View>
            <View style={[styles.cashFlowRow, styles.cashFlowRowTotal]}>
              <Text style={styles.cashFlowCellTotalLabel}>Daily Net Surplus (Pre-Buffer)</Text>
              <Text style={styles.cashFlowCellTotalVal}>
                +{formatETB(realityCheck.dailyInterestSurplusETB)} / day
              </Text>
            </View>
          </View>

          {/* 15-Day Buffer Cash Flow Contradiction */}
          <View style={styles.bufferContradictionBox}>
            <Text style={styles.contradictionTitle}>
              🚨 15-Day Buffer Cash Flow Contradiction:
            </Text>
            <View style={styles.contradictionRow}>
              <Text style={styles.contradictionText}>15-Day Interest Surplus Accumulated:</Text>
              <Text style={[styles.contradictionNumber, { color: colors.status.healthy }]}>
                +{formatETB(realityCheck.cycle15InterestSurplusETB)}
              </Text>
            </View>
            <View style={styles.contradictionRow}>
              <Text style={styles.contradictionText}>15-Day Buffer Replenishment Required:</Text>
              <Text style={[styles.contradictionNumber, { color: colors.status.critical }]}>
                -{formatETB(realityCheck.cycle15BufferRequirementETB)}
              </Text>
            </View>
            <View style={[styles.contradictionRow, { borderTopWidth: 1, borderColor: '#7F1D1D', paddingTop: 6, marginTop: 4 }]}>
              <Text style={[styles.contradictionText, { fontWeight: '700', color: '#FCA5A5' }]}>
                15-Day Net Cash Flow Deficit:
              </Text>
              <Text style={[styles.contradictionNumber, { fontWeight: '800', color: '#EF4444' }]}>
                {formatETB(realityCheck.cycle15NetCashFlowETB)}
              </Text>
            </View>

            <Text style={styles.contradictionExplanation}>
              {realityCheck.realityCheckConclusion}
            </Text>
          </View>
        </Card>

        {/* ================================================================= */}
        {/* 6. EVALUATOR SHORTCUTS & NAVIGATION CONTROLS                      */}
        {/* ================================================================= */}
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
  timelineCard: {
    marginBottom: spacing.md,
    backgroundColor: '#0F172A',
    borderColor: colors.primaryDark,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 16,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  dayBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  dayBadgeText: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
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
    marginBottom: spacing.md,
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
  checkpointHeading: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  checkpointsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: 2,
  },
  checkpointChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  checkpointChipText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  checkpointChipTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  stepControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  stepButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryLight,
    fontSize: 13,
  },
  stepButtonDisabled: {
    color: colors.dark.textMuted,
    opacity: 0.4,
  },
  stepButtonReset: {
    flex: 1.4,
    borderColor: colors.accentGoldDark,
    backgroundColor: '#1E170A',
  },
  stepButtonResetText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.accentGold,
    fontSize: 11,
  },
  escrowCard: {
    marginBottom: spacing.md,
    backgroundColor: '#0C1C16',
    borderColor: colors.primaryDark,
    borderWidth: 1.5,
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
  segregatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.sm,
  },
  segregatedItem: {
    flex: 1,
    alignItems: 'center',
  },
  segregatedLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  segregatedVal: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  segregatedSub: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  segregatedPlus: {
    color: colors.dark.textMuted,
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 4,
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
  modelDisclaimerBox: {
    backgroundColor: '#1E1609',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  modelDisclaimerText: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 15,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  scenarioTabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  scenarioTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  scenarioTabActive: {
    backgroundColor: '#0F261E',
    borderColor: colors.primaryLight,
  },
  scenarioTabText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.dark.textSecondary,
    fontSize: 12,
  },
  scenarioTabTextActive: {
    color: colors.primaryLight,
  },
  scenarioTabSub: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    marginTop: 2,
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
  feeNoticeBox: {
    backgroundColor: '#1E170A',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  feeNoticeText: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 15,
  },
  payoffRealityBox: {
    backgroundColor: '#1A1829',
    borderColor: '#4338CA',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  payoffHeaderRow: {
    marginBottom: 4,
  },
  payoffTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  payoffBody: {
    ...typography.caption,
    color: '#E0E7FF',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  payoffStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#312E81',
    paddingTop: spacing.xs,
  },
  payoffStatLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 10,
  },
  payoffStatVal: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 1,
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
  bufferSubNote: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  replenishStatsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  replenishStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  replenishStatLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  replenishStatVal: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginTop: 2,
  },
  unresolvedBox: {
    backgroundColor: '#1E1408',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  unresolvedTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.accentGold,
    marginBottom: 2,
  },
  unresolvedBody: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 15,
  },
  realityCard: {
    marginBottom: spacing.md,
    backgroundColor: '#181216',
    borderColor: '#7F1D1D',
    borderWidth: 1.5,
  },
  realityTitle: {
    ...typography.h3,
    color: '#F87171',
    fontSize: 15,
  },
  realitySubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  cashFlowTable: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.md,
  },
  cashFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  cashFlowRowTotal: {
    borderTopWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginTop: 4,
    paddingTop: 6,
  },
  cashFlowCellLabel: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  cashFlowCellVal: {
    ...typography.bodySmall,
    fontWeight: '700',
    fontSize: 12,
  },
  cashFlowCellTotalLabel: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  cashFlowCellTotalVal: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.status.healthy,
  },
  bufferContradictionBox: {
    backgroundColor: '#261215',
    borderColor: '#991B1B',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  contradictionTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: '#FCA5A5',
    marginBottom: spacing.xs,
  },
  contradictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  contradictionText: {
    ...typography.caption,
    color: '#E2E8F0',
    fontSize: 11,
  },
  contradictionNumber: {
    ...typography.bodySmall,
    fontWeight: '700',
    fontSize: 12,
  },
  contradictionExplanation: {
    ...typography.caption,
    color: '#FECACA',
    lineHeight: 16,
    marginTop: spacing.sm,
    fontSize: 11,
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
