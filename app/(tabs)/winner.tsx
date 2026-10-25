/**
 * Merkato Fund — Winner Experience & Financial Simulation Hub
 *
 * Models the core value proposition described in the marketing PDF:
 * 1. 1,000,000 ETB 6-month blocked escrow account at Commercial Bank of Ethiopia (CBE)
 * 2. 22% annualized simple interest accrual (602.74 ETB/day via ACT/365)
 * 3. Daily repayment schedule (Scenario A: 500 ETB + 50 ETB fee vs Scenario B: 550 ETB flat)
 * 4. 15-day / 7,500 ETB rolling buffer cycle with cash flow reality check
 *
 * Full English & Amharic localization support.
 * ALL FIGURES ARE SYNTHETIC DEMONSTRATION ESTIMATES — NOT AN AUTHORITATIVE BANK CONTRACT.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { Card, AppButton, DisclaimerNotice } from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useDemoConfigStore } from '@/src/stores/useDemoConfigStore';
import { formatETB } from '@/src/domain/calculations/currency';
import {
  calculateDailyInterest,
  calculateAccruedInterest,
} from '@/src/domain/calculations/interest';
import {
  calculateRepaymentScenario,
  calculateBufferStatus,
  calculateBufferReplenishment,
  calculateRealityCheck,
  calculateFullPayoffDetails,
} from '@/src/domain/calculations/repayment';
import { useTranslation } from '@/src/i18n/useTranslation';

function formatETBSuffix(amount: number, showSign: boolean = false): string {
  return formatETB(amount, { compact: true, showSign });
}

export default function WinnerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, format, isAmharic } = useTranslation();

  const currentUser = useUserStore((s) => s.currentUser);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const simulationDay = useWinnerStore((s) => s.simulationDay);
  const setSimulationDay = useWinnerStore((s) => s.setSimulationDay);
  const resetSimulationDay = useWinnerStore((s) => s.resetSimulationDay);
  const loadWinnerData = useWinnerStore((s) => s.loadWinnerData);

  const isLoading = useWinnerStore((s) => s.isLoading);
  const recordRepayment = useWinnerStore((s) => s.recordRepayment);
  const replenishBuffer = useWinnerStore((s) => s.replenishBuffer);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);

  const config = useDemoConfigStore((s) => s.config);
  const repaymentDailyModel = useDemoConfigStore((s) => s.repaymentDailyModel);
  const setRepaymentDailyModel = useDemoConfigStore((s) => s.setRepaymentDailyModel);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Sync / load winner data on mount or persona switch
  useEffect(() => {
    const targetUserId =
      activeDraw?.winnerUserId ||
      (currentUser.role === 'winner' ? currentUser.id : 'user-bethlehem-002');
    if (targetUserId) {
      loadWinnerData(targetUserId);
    }
  }, [currentUser.id, activeDraw?.winnerUserId]);

  // Determine winner identity
  const isCompletedDraw = activeDraw?.status === 'completed';
  const hasEscrowAccount = escrowAccount !== null;
  const isWinnerPersona = currentUser.role === 'winner';

  const hasWinner = Boolean(
    isCompletedDraw || hasEscrowAccount || isWinnerPersona || lastDrawResult !== null
  );

  // Repayment parameters
  const isScenarioA = repaymentDailyModel === '500_plus_50';
  const dailyPrincipal = isScenarioA ? 500 : 550;
  const dailyAdminFee = isScenarioA ? 50 : 0;
  const dailyTotalPayment = dailyPrincipal + dailyAdminFee;

  // Timeline values (strictly clamped 0 to 180)
  const totalLockDays = 180;
  const clampedDay = Math.max(0, Math.min(180, simulationDay));
  const principalAmount = 1_000_000;
  const annualRate = config.annualInterestRate || 0.22;

  // Domain Calculations
  const dailyInterest = calculateDailyInterest(principalAmount, annualRate, 365);
  const accruedInterest = calculateAccruedInterest(principalAmount, annualRate, clampedDay, 365);
  const projected180Interest = calculateAccruedInterest(principalAmount, annualRate, 180, 365);

  // Payoff details calculated from domain engine
  const scenarioA = calculateRepaymentScenario(clampedDay, {
    prizeAmountETB: principalAmount,
    dailyPrincipalRepaymentETB: 500,
    dailyAdminFeeETB: 50,
  });
  const payoffDetailsA = calculateFullPayoffDetails('500_plus_50', { prizeAmountETB: principalAmount });

  const scenarioB = calculateRepaymentScenario(clampedDay, {
    prizeAmountETB: principalAmount,
    dailyPrincipalRepaymentETB: 550,
    dailyAdminFeeETB: 0,
  });
  const payoffDetailsB = calculateFullPayoffDetails('550_bundle', { prizeAmountETB: principalAmount });

  const activeScenario = isScenarioA ? scenarioA : scenarioB;
  const activePayoffDetails = isScenarioA ? payoffDetailsA : payoffDetailsB;

  // Buffer calculations
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
        isAmharic
          ? `የ1 ቀን የሙከራ ክፍያ ተመዝግቧል፡ ${formatETBSuffix(dailyTotalPayment)}።`
          : `Recorded 1-day simulated payment: ${formatETBSuffix(dailyTotalPayment)}.`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : (isAmharic ? 'ክፍያው አልተሳካም' : 'Repayment failed');
      Alert.alert(isAmharic ? 'ማሳሰቢያ' : 'Simulation', msg);
    }
  };

  const handleReplenishBuffer = async () => {
    try {
      setActionNotice(null);
      await replenishBuffer(currentUser.id, 2500);
      setActionNotice(
        isAmharic
          ? 'የጥበቃ ፈንዱ በ2,500.00 ብር ተሞልቷል።'
          : 'Buffer replenished by 2,500.00 ETB in mock service.'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : (isAmharic ? 'መሙላት አልተቻለም' : 'Replenish failed');
      Alert.alert(isAmharic ? 'ማሳሰቢያ' : 'Simulation', msg);
    }
  };

  const checkpoints = [
    { day: 0, label: isAmharic ? 'ቀን 0' : 'Day 0' },
    { day: 15, label: isAmharic ? 'ቀን 15' : 'Day 15' },
    { day: 45, label: isAmharic ? 'ቀን 45' : 'Day 45' },
    { day: 90, label: isAmharic ? 'ቀን 90' : 'Day 90' },
    { day: 135, label: isAmharic ? 'ቀን 135' : 'Day 135' },
    { day: 180, label: isAmharic ? 'ቀን 180' : 'Day 180' },
  ];

  // Empty state when no winner exists yet
  if (!hasWinner) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={[styles.backIcon, { color: theme.textPrimary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.winner.title}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
          showsVerticalScrollIndicator={false}>
          <Card style={styles.emptyCard} variant="surface">
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {isAmharic ? 'ንቁ አሸናፊ የለም' : 'No Active Winner'}
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              {isAmharic
                ? 'በዕጣ ክፍሉ ውስጥ የዛሬ ማታውን ዕጣ ያካሂዱ ወይም የ6 ወር ኤስክሮውን ለማየት መገለጫዎን ወደ ቤተልሔም ታደሰ ይቀይሩ።'
                : "Execute tonight's draw in the Draw Room or switch to Bethlehem Tadesse to explore the 6-month escrow and repayment model."}
            </Text>
            <AppButton
              title={isAmharic ? 'ወደ ዕጣ ክፍል ይሂዱ' : 'Go to Draw Room'}
              variant="primary"
              onPress={() => router.push('/(tabs)/draw')}
              style={{ marginTop: 16, width: '100%' }}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* 1. Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.winner.title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
        showsVerticalScrollIndicator={false}>

        {/* 2. Scenario Switcher (Pill Selector) */}
        <View style={[styles.scenarioSelector, { backgroundColor: isDark ? '#162032' : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[
              styles.scenarioPill,
              isScenarioA && { backgroundColor: theme.primary },
            ]}
            onPress={() => setRepaymentDailyModel('500_plus_50')}
            accessibilityRole="button"
            accessibilityLabel="Select Scenario A">
            <Text
              style={[
                styles.scenarioPillText,
                { color: isScenarioA ? '#FFFFFF' : theme.textSecondary },
              ]}>
              {t.winner.scenarioA}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scenarioPill,
              !isScenarioA && { backgroundColor: theme.primary },
            ]}
            onPress={() => setRepaymentDailyModel('550_bundle')}
            accessibilityRole="button"
            accessibilityLabel="Select Scenario B">
            <Text
              style={[
                styles.scenarioPillText,
                { color: !isScenarioA ? '#FFFFFF' : theme.textSecondary },
              ]}>
              {t.winner.scenarioB}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Hero Timeline & Accrued Interest Card */}
        <Card style={styles.heroInterestCard} variant="surface">
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={[styles.timelineLabel, { color: theme.textSecondary }]}>
                {isAmharic ? 'የኤስክሮው ጊዜ ሰሌዳ ሂደት' : 'Escrow Timeline Progress'}
              </Text>
              <Text style={[styles.timelineDayText, { color: theme.textPrimary }]}>
                {isAmharic ? `ቀን ${clampedDay}` : `Day ${clampedDay}`} <Text style={styles.totalDaySpan}>/ 180 {isAmharic ? 'ቀናት' : 'Days'} ({progressPercent}%)</Text>
              </Text>
            </View>
            <View style={[styles.yieldRateTag, { backgroundColor: isDark ? '#0B1220' : '#F1F5F9' }]}>
              <Text style={[styles.yieldRateText, { color: theme.primary }]}>
                ~602.74 {t.common.currencyETB} / {isAmharic ? 'ቀን' : 'day'}
              </Text>
            </View>
          </View>

          {/* Progress Bar Track */}
          <View style={[styles.progressTrackBackground, { backgroundColor: isDark ? '#0B1220' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressTrackFill,
                { width: `${progressPercent}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>

          {/* Accrued Interest Value Display */}
          <View style={styles.interestHighlightBox}>
            <Text style={[styles.accruedLabel, { color: theme.textSecondary }]}>
              {isAmharic ? 'የተከማቸ ወለድ (ACT/365 @ 22%)' : 'Cumulative Accrued Interest (ACT/365 @ 22%)'}
            </Text>
            <Text style={[styles.accruedAmount, { color: theme.primary }]}>
              +{formatETBSuffix(accruedInterest)}
            </Text>
          </View>

          {/* Locked Interest Notice directly near the interest figure */}
          <View style={[styles.lockedNoticePill, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)' }]}>
            <Text style={[styles.lockedNoticeText, { color: theme.primary }]}>
              ⓘ {t.winner.interestLockedNotice}
            </Text>
          </View>
        </Card>

        {/* 4. Checkpoint Quick Navigation */}
        <View style={styles.checkpointSection}>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {isAmharic ? 'ወደ ዋና ዋና የጊዜ መፈተሻዎች ይሂዱ' : 'Jump to Timeline Checkpoint'}
          </Text>

          <View style={styles.checkpointsRow}>
            {checkpoints.map((cp) => {
              const isSelected = clampedDay === cp.day;
              return (
                <TouchableOpacity
                  key={cp.day}
                  style={[
                    styles.checkpointBtn,
                    {
                      backgroundColor: isSelected ? theme.primary : (isDark ? '#162032' : '#F1F5F9'),
                    },
                  ]}
                  onPress={() => setSimulationDay(cp.day)}
                  accessibilityRole="button"
                  accessibilityLabel={`Jump to ${cp.label}`}>
                  <Text
                    style={[
                      styles.checkpointBtnText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}>
                    {cp.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Stepper controls */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}
              onPress={() => setSimulationDay(clampedDay - 15)}
              disabled={clampedDay <= 0}>
              <Text style={[styles.stepperBtnText, { color: clampedDay <= 0 ? theme.textMuted : theme.textPrimary }]}>
                −15 {isAmharic ? 'ቀን' : 'Days'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepperBtn, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}
              onPress={() => setSimulationDay(clampedDay - 1)}
              disabled={clampedDay <= 0}>
              <Text style={[styles.stepperBtnText, { color: clampedDay <= 0 ? theme.textMuted : theme.textPrimary }]}>
                −1 {isAmharic ? 'ቀን' : 'Day'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepperBtn, styles.resetBtn, { borderColor: theme.primary }]}
              onPress={resetSimulationDay}>
              <Text style={[styles.stepperBtnText, { color: theme.primary, fontWeight: '700' }]}>
                {isAmharic ? 'መነሻ (D45)' : 'Reset (D45)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepperBtn, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}
              onPress={() => setSimulationDay(clampedDay + 1)}
              disabled={clampedDay >= 180}>
              <Text style={[styles.stepperBtnText, { color: clampedDay >= 180 ? theme.textMuted : theme.textPrimary }]}>
                +1 {isAmharic ? 'ቀን' : 'Day'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepperBtn, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}
              onPress={() => setSimulationDay(clampedDay + 15)}
              disabled={clampedDay >= 180}>
              <Text style={[styles.stepperBtnText, { color: clampedDay >= 180 ? theme.textMuted : theme.textPrimary }]}>
                +15 {isAmharic ? 'ቀን' : 'Days'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Key Details Summary Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {isAmharic ? 'ዋና ዋና የአከፋፈል ዝርዝሮች' : 'Key Repayment Details'}
          </Text>
        </View>

        <Card style={styles.keyDetailsCard} variant="surface">
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {isAmharic ? 'ሙሉ የክፍያ ቀናት' : 'Full-Installment Days'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {activePayoffDetails.fullInstallmentDays.toLocaleString()} {isAmharic ? 'ቀናት' : 'Days'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {isAmharic ? 'የመጨረሻው የተስተካከለ ቀን' : 'Final Adjusted Payment Day'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {isAmharic ? `ቀን ${activePayoffDetails.finalAdjustedPaymentDay.toLocaleString()}` : `Day ${activePayoffDetails.finalAdjustedPaymentDay.toLocaleString()}`} ({formatETBSuffix(activePayoffDetails.finalInstallmentTotalETB)})
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {isAmharic ? 'ከኤስክሮው በኋላ የሚከፈል' : 'Post-Escrow Payoff'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              +{activePayoffDetails.postEscrowPayoffDays.toLocaleString()} {isAmharic ? 'ቀናት' : 'Days'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              {isAmharic ? 'ጠቅላላ የክፍያ ጊዜ' : 'Total Duration'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {activePayoffDetails.totalPayoffDays.toLocaleString()} {isAmharic ? 'ቀናት' : 'Days'} (~{(activePayoffDetails.totalPayoffDays / 365).toFixed(1)} {isAmharic ? 'ዓመት' : 'yrs'})
            </Text>
          </View>
        </Card>

        {actionNotice && (
          <View style={[styles.actionNoticeBox, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}>
            <Text style={[styles.actionNoticeText, { color: theme.primary }]}>{actionNotice}</Text>
          </View>
        )}

        {/* 6. Expandable Financial Calculations & Buffer Analysis */}
        <TouchableOpacity
          style={[styles.accordionToggle, { borderColor: theme.surfaceBorder, backgroundColor: theme.surface }]}
          onPress={() => setShowTechnicalDetails(!showTechnicalDetails)}
          accessibilityRole="button">
          <Text style={[styles.accordionToggleText, { color: theme.textPrimary }]}>
            {showTechnicalDetails
              ? (isAmharic ? '▾ ዝርዝር የሂሳብ ስሌቶች' : '▾ Detailed Calculations')
              : (isAmharic ? '▸ ዝርዝር የሂሳብ ስሌቶች' : '▸ Detailed Calculations')}
          </Text>
        </TouchableOpacity>

        {showTechnicalDetails && (
          <View style={styles.technicalContainer}>
            {/* Escrow Details */}
            <Card style={styles.subCard} variant="surface">
              <Text style={[styles.subCardTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'የኤስክሮው እና የወለድ ስሌት ቀመር' : 'Escrow & Yield Formula'}
              </Text>
              <Text style={[styles.subCardBody, { color: theme.textSecondary }]}>
                Principal: 1,000,000.00 ETB • Annual Yield: 22% (ACT/365 convention)
              </Text>
              <Text style={[styles.subCardFormula, { color: theme.primary }]}>
                1,000,000 × 22% × ({clampedDay} ÷ 365) = {formatETBSuffix(accruedInterest, true)}
              </Text>
              <Text style={[styles.subCardFootnote, { color: theme.textMuted }]}>
                {isAmharic
                  ? `የ180ኛው ቀን የሚጠበቅ ወለድ፡ ${formatETBSuffix(projected180Interest)}። ሁሉም የተከማቸ ወለድ በባንክ ጥበቃ ውስጥ ይቆያል።`
                  : `Day 180 projected yield: ${formatETBSuffix(projected180Interest)}. All accrued interest remains in bank custody.`}
              </Text>
            </Card>

            {/* Fee Separation for Scenario A */}
            {isScenarioA && (
              <Card style={styles.subCard} variant="surface">
                <Text style={[styles.subCardTitle, { color: theme.textPrimary }]}>
                  {isAmharic ? 'የአስተዳደር ክፍያ መለያየት' : 'Administrative Fee Separation'}
                </Text>
                <Text style={[styles.subCardBody, { color: theme.textSecondary }]}>
                  {isAmharic
                    ? 'የ50 ብር/ቀን አስተዳደራዊ ክፍያ የመድረኩን አሠራር የሚሸፍን ሲሆን ዋናውን የብድር ዕዳ አይቀንስም።'
                    : 'The 50 ETB/day administrative fee covers platform operations and does NOT reduce principal debt.'}
                </Text>
                <Text style={[styles.subCardFormula, { color: theme.textSecondary }]}>
                  Admin fees paid to Day {clampedDay}: {formatETBSuffix(scenarioA.adminFeesRepaidETB)} • Lifetime fees: {formatETBSuffix(activePayoffDetails.totalAdminFeesETB)}
                </Text>
              </Card>
            )}

            {/* Buffer & Cash Flow Deficit */}
            <Card style={styles.subCard} variant="surface">
              <Text style={[styles.subCardTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'የ15 ቀን ጥበቃ ፈንድ (7,500 ብር)' : '15-Day Buffer Simulator (7,500 ETB Target)'}
              </Text>
              <Text style={[styles.subCardBody, { color: theme.textSecondary }]}>
                Buffer balance: {formatETBSuffix(bufferStatus.currentBalanceETB)} ({Math.round(bufferStatus.percentRemaining)}%) • Cycle Day {cycleDay} of 15
              </Text>
              <Text style={[styles.subCardBody, { color: theme.textSecondary, marginTop: 4 }]}>
                {isScenarioA
                  ? (isAmharic
                      ? 'የ15 ቀን ዕዳ፡ 15 × 550 ብር = 8,250 ብር። የ7,500 ብር ፈንድ የ500 ብር ዋና ዕዳ ብቻ ይሸፍናል (-750 ብር ጉድለት)። በኤስክሮው የታገደው ወለድ ይህን መሸፈን አይችልም።'
                      : '15-Day Obligation: 15 × 550 ETB = 8,250 ETB. The 7,500 ETB buffer covers only 500 ETB/day principal (-750 ETB fee deficit). Locked escrow interest cannot bridge this gap.')
                  : (isAmharic
                      ? 'የ15 ቀን ዕዳ፡ 15 × 550 ብር = 8,250 ብር። የ7,500 ብር ፈንድ ከ15 ቀን ክፍያ ጋር በ750 ብር ጉድለት አለበት፤ የታገደው ወለድ ይህን አይሸፍንም።'
                      : '15-Day Obligation: 15 × 550 ETB = 8,250 ETB. The 7,500 ETB buffer is 750 ETB short of the 15-day repayment obligation, and locked escrow interest cannot cover the deficit.')}
              </Text>
              <Text style={[styles.subCardFootnote, { color: theme.textMuted, marginTop: 4 }]}>
                {isAmharic
                  ? 'የገንዘብ ፍሰት ክፍተት፡ ዕለታዊ የወለድ ትርፍ (+52.74 ብር/ቀን) ለ180 ቀናት በኤስክሮው የታገደ በመሆኑ ለጥበቃ ፈንዱ መሙያ ሊውል አይችልም።'
                  : 'Cash flow gap: Theoretical daily interest surplus (+52.74 ETB/d) is locked in escrow for 180 days and cannot fund buffer replenishment.'}
              </Text>

              <View style={styles.subActionsRow}>
                <AppButton
                  title={isAmharic ? `የ1 ቀን ክፍያ (${dailyTotalPayment} ብር)` : `Simulate 1-Day Installment (${dailyTotalPayment} ETB)`}
                  variant="outline"
                  loading={isLoading}
                  onPress={handleRecordRepayment}
                  style={{ flex: 1.2, marginRight: 8 }}
                />
                <AppButton
                  title={isAmharic ? 'ፈንድ ሙላ' : 'Top-Up Buffer'}
                  variant="outline"
                  onPress={handleReplenishBuffer}
                  style={{ flex: 0.8 }}
                />
              </View>
            </Card>
          </View>
        )}

        <DisclaimerNotice compact />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scenarioSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  scenarioPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  scenarioPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroInterestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineDayText: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalDaySpan: {
    fontSize: 12,
    fontWeight: '500',
  },
  yieldRateTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yieldRateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrackBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  interestHighlightBox: {
    marginBottom: 10,
  },
  accruedLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  accruedAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  lockedNoticePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  lockedNoticeText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  checkpointSection: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  checkpointsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  checkpointBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkpointBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepperBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  keyDetailsCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  actionNoticeBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  actionNoticeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  accordionToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  accordionToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  technicalContainer: {
    gap: 12,
    marginBottom: 14,
  },
  subCard: {
    borderRadius: 14,
    padding: 14,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  subCardBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  subCardFormula: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 6,
  },
  subCardFootnote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  subActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
