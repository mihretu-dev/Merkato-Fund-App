/**
 * Merkato Fund — Admin & Auditor Preview Screen
 *
 * Provides a comprehensive evaluator overview of:
 * 1. Synthetic demo personas, contribution counts, and roles.
 * 2. Active draw status, participant counts, and simulated winner state.
 * 3. Core financial-model assumptions, scale floor (20,000 members), and cash flow warnings.
 * 4. Direct evaluator navigation across all app modules.
 * 5. Full demo reset with deliberate confirmation dialog.
 *
 * ALL FIGURES ARE SYNTHETIC DEMONSTRATION ESTIMATES — NOT ACTUAL FINANCIAL METRICS.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
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
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDemoConfigStore } from '@/src/stores/useDemoConfigStore';
import { resetAllDemoStores } from '@/src/stores';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { PoolStatistics, User } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';

export default function AdminScreen() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.currentUser);
  const switchPersona = useUserStore((s) => s.switchPersona);
  const availablePersonas = useUserStore((s) => s.availablePersonas);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const eligibleTickets = useDrawStore((s) => s.eligibleDrawTickets);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);

  const repaymentDailyModel = useDemoConfigStore((s) => s.repaymentDailyModel);
  const setRepaymentDailyModel = useDemoConfigStore((s) => s.setRepaymentDailyModel);

  const [poolStats, setPoolStats] = useState<PoolStatistics | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    mockMerkatoService.getPoolStatistics().then(setPoolStats);
    loadDrawData(currentUser.id);
  }, [currentUser.id]);

  const isAdmin = currentUser.role === 'admin';

  const handleSwitchToAdmin = async () => {
    try {
      await switchPersona('admin');
      const stats = await mockMerkatoService.getPoolStatistics();
      setPoolStats(stats);
      await loadDrawData('user-admin-003');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSolvencyAudit = () => {
    const requiredMembers = 20000;
    const currentMembers = poolStats?.activeContributorsCount || 24850;
    const surplusMembers = currentMembers - requiredMembers;

    setAuditMessage(
      `ℹ️ SCALE SENSITIVITY EVALUATION: Under the hypothetical assumption of ${currentMembers.toLocaleString()} daily contributors paying 50 ETB/day, daily inflow (${formatETB(currentMembers * 50)}) mathematically covers the 1,000,000 ETB daily prize with a +${formatETB(surplusMembers * 50)} surplus buffer. However, if daily contributors drop below 20,000, the daily pool cannot fund the 1M ETB prize without external subsidies. This is a mathematical sensitivity model, NOT operating data.`
    );
  };

  const handleConfirmFullReset = async () => {
    setIsResetting(true);
    try {
      await resetAllDemoStores();
      const freshStats = await mockMerkatoService.getPoolStatistics();
      setPoolStats(freshStats);
      setShowResetModal(false);
      Alert.alert(
        'Demo Reset Complete',
        'All Zustand stores, mock service data, contributions, tickets, and financial simulation states have been restored to initial demo baseline.'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      Alert.alert('Reset Error', msg);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.screenTitle}>Admin & Auditor View</Text>
              <Text style={styles.screenSubtitle}>System Feasibility & Compliance</Text>
            </View>
            <DemoBadge label="ROLE GUARDED" />
          </View>

          <Card style={styles.restrictedCard} variant="elevated">
            <Text style={styles.lockIcon}>🛡️</Text>
            <Text style={styles.restrictedTitle}>Auditor View Restricted</Text>
            <Text style={styles.restrictedDesc}>
              This screen provides administrative sensitivity modeling, pool statistics, and full demo reset controls. You are currently viewing as "{currentUser.fullName}" ({currentUser.role.toUpperCase()}).
            </Text>
            <Text style={styles.restrictedHelp}>
              To evaluate the auditor ledger and system metrics, switch to Abebe Kebede (Compliance Auditor):
            </Text>

            <AppButton
              title="Switch to Admin Persona (Abebe Kebede)"
              variant="primary"
              onPress={handleSwitchToAdmin}
              style={{ marginTop: spacing.md, width: '100%' }}
            />
          </Card>

          <DisclaimerNotice />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const activeMembers = poolStats?.activeContributorsCount || 24850;
  const poolBalance = poolStats?.totalPoolBalanceETB || 1242500;
  const prizeAllocated = poolStats?.drawPrizeAllocatedETB || 1000000;
  const reserveFund = poolStats?.reserveFundETB || 242500;
  const totalDraws = poolStats?.totalDrawsCompleted || 76;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Auditor & System Overview</Text>
            <Text style={styles.screenSubtitle}>
              Auditor: {currentUser.fullName} • {currentUser.occupation}
            </Text>
          </View>
          <DemoBadge label="AUDITOR ACCESS" />
        </View>

        {auditMessage && (
          <View style={styles.auditNotice}>
            <Text style={styles.auditNoticeText}>{auditMessage}</Text>
          </View>
        )}

        {/* 1. Synthetic Solvency & Scale Floor Card */}
        <Card style={styles.solvencyCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Pool Feasibility & Scale Floor</Text>
            <StatusPill status="caution" label="SYNTHETIC MODEL (20K FLOOR)" />
          </View>

          <View style={styles.disclaimerCallout}>
            <Text style={styles.disclaimerCalloutText}>
              ⚠️ SYNTHETIC SCALE ASSUMPTIONS: The figures below (24,850 contributors, 1,242,500 ETB inflow, and 242,500 ETB reserve) are purely illustrative modeling parameters. They do NOT represent verified Merkato Fund operating data, live bank balances, or audited financial solvency.
            </Text>
          </View>

          <Text style={styles.cardSubtitle}>
            To sustain a daily 1,000,000 ETB prize at 50 ETB/member, a mathematical scale floor of exactly 20,000 active daily contributors is strictly required (20,000 × 50 ETB = 1,000,000 ETB). Any shortfall below 20,000 members creates an immediate daily deficit unless subsidized.
          </Text>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Assumed Contributors"
              value={activeMembers.toLocaleString()}
              subtitle="Model assumption"
              highlight
            />
            <MetricTile
              label="Model Daily Inflow"
              value={formatETB(poolBalance)}
              subtitle="@ 50 ETB / assumed member"
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Draw Prize Allocated"
              value={formatETB(prizeAllocated)}
              subtitle="Stated daily prize"
            />
            <MetricTile
              label="Model Reserve Buffer"
              value={formatETB(reserveFund)}
              subtitle="Theoretical difference"
            />
          </View>

          <AppButton
            title="Evaluate Scale Sensitivity Scenario"
            variant="outline"
            onPress={handleRunSolvencyAudit}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* 2. Synthetic Demo Personas Overview */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👥 Evaluator Demo Personas</Text>
            <StatusPill status="info" label="3 PERSONAS" size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            Three predefined Ethiopian personas map to each role in the system:
          </Text>

          {Object.values(availablePersonas).map((p: User) => {
            const isCurrent = p.id === currentUser.id;
            return (
              <View key={p.id} style={[styles.personaItem, isCurrent && styles.personaItemActive]}>
                <View style={styles.personaAvatar}>
                  <Text style={styles.personaAvatarText}>
                    {p.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personaName}>
                    {p.fullName} {isCurrent && '(Active)'}
                  </Text>
                  <Text style={styles.personaRoleSub}>
                    Role: {p.role.toUpperCase()} • {p.occupation} ({p.location})
                  </Text>
                  <Text style={styles.personaScope}>
                    {p.role === 'member'
                      ? 'Simulates daily 50 ETB contributions, USSD payments, and ticket issuance.'
                      : p.role === 'winner'
                      ? 'Simulates 1M ETB CBE blocked escrow, repayments, and buffer cycle.'
                      : 'Audits pool scale, draw integrity, and system model parameters.'}
                  </Text>
                </View>
                {!isCurrent && (
                  <TouchableOpacity
                    style={styles.switchPersonaBtn}
                    onPress={() => switchPersona(p.id === 'user-dawit-001' ? 'dawit' : p.id === 'user-bethlehem-002' ? 'bethlehem' : 'admin')}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${p.fullName}`}
                  >
                    <Text style={styles.switchPersonaBtnText}>Switch</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </Card>

        {/* 3. Active Draw & Ticket State */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎲 Active Draw & Participant State</Text>
            <StatusPill
              status={activeDraw?.status === 'completed' ? 'healthy' : 'info'}
              label={activeDraw?.status?.toUpperCase() || 'SCHEDULED'}
              size="small"
            />
          </View>

          <View style={styles.drawStatusBox}>
            <View style={styles.drawRow}>
              <Text style={styles.drawLabel}>Scheduled Draw Date:</Text>
              <Text style={styles.drawVal}>{activeDraw?.drawDate || '2026-10-17'} (20:00:00 EAT)</Text>
            </View>
            <View style={styles.drawRow}>
              <Text style={styles.drawLabel}>Eligible Demo Tickets:</Text>
              <Text style={styles.drawVal}>{eligibleTickets.length} Tickets Loaded</Text>
            </View>
            <View style={styles.drawRow}>
              <Text style={styles.drawLabel}>Draw Seed Algorithm:</Text>
              <Text style={styles.drawVal}>FNV-1a 32-bit Hash (Demonstration Only)</Text>
            </View>

            {activeDraw?.status === 'completed' && (
              <View style={styles.completedDrawBox}>
                <Text style={styles.completedDrawTitle}>TODAY'S SIMULATED WINNER:</Text>
                <Text style={styles.completedDrawWinner}>
                  {activeDraw.winnerName || lastDrawResult?.winner.fullName || 'Demo Winner'}
                </Text>
                <Text style={styles.completedDrawTicket}>
                  Winning Ticket: {activeDraw.winningTicketNumber || lastDrawResult?.winningTicket.ticketNumber}
                </Text>
                <Text style={styles.completedDrawTime}>
                  Completed At: {activeDraw.completedAt || '20:00:05 EAT'}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* 4. Model Assumptions & Risk Warnings */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⚠️ Key Financial Ambiguities & Model Warnings</Text>
            <StatusPill status="critical" label="DOCUMENTED RISKS" size="small" />
          </View>

          <View style={styles.warningList}>
            <View style={styles.warningItem}>
              <Text style={styles.warningItemTitle}>1. Buffer Cash Flow Deficit (-6,708.90 ETB / 15 days)</Text>
              <Text style={styles.warningItemBody}>
                The marketing PDF implies that interest yield covers repayments and buffer replenishments. In reality, the +52.74 ETB/day interest surplus yields only +791.10 ETB over 15 days, leaving a 6,708.90 ETB deficit against the 7,500 ETB buffer requirement. Who funds this difference is undefined.
              </Text>
            </View>

            <View style={styles.warningItem}>
              <Text style={styles.warningItemTitle}>2. Unamortized Post-Lock Principal (~910,000 ETB Remaining)</Text>
              <Text style={styles.warningItemBody}>
                The 180-day lock period clears only ~90,000 ETB of principal debt. At Month 6 escrow unlock, ~910,000 ETB of principal remains unpaid, requiring 1,820 additional days (~5.0 years) of payments. Interest ceases at unlock, ending the cash flow offset.
              </Text>
            </View>

            <View style={styles.warningItem}>
              <Text style={styles.warningItemTitle}>3. Unverified Bank Custody & 22% Escrow Rate</Text>
              <Text style={styles.warningItemBody}>
                Commercial Bank of Ethiopia (CBE) custody is an illustrative simulation partner with explicit DEMO- prefixes. The claimed 22% annual interest rate is computed using simple ACT/365 arithmetic and represents an unverified model assumption.
              </Text>
            </View>
          </View>
        </Card>

        {/* 5. Evaluator Navigation Shortcuts */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🗺️ Evaluator Screen Navigation</Text>
            <StatusPill status="info" label="SHORTCUTS" size="small" />
          </View>

          <View style={styles.navGrid}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Member Dashboard"
            >
              <Text style={styles.navButtonIcon}>🏠</Text>
              <Text style={styles.navButtonText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/contribute')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Contribution Flow"
            >
              <Text style={styles.navButtonIcon}>💳</Text>
              <Text style={styles.navButtonText}>Contribute</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/draw')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Draw Room"
            >
              <Text style={styles.navButtonIcon}>🎲</Text>
              <Text style={styles.navButtonText}>Draw Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/winner')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Winner Hub & Escrow"
            >
              <Text style={styles.navButtonIcon}>🏆</Text>
              <Text style={styles.navButtonText}>Winner Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/verify')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Verification Harness"
            >
              <Text style={styles.navButtonIcon}>🔬</Text>
              <Text style={styles.navButtonText}>Verification</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 6. Full Demo Reset Action */}
        <Card style={styles.resetCard} variant="outline">
          <View style={styles.cardHeader}>
            <Text style={styles.resetTitle}>🔄 Full Demonstration Reset</Text>
            <StatusPill status="critical" label="TEARDOWN" size="small" />
          </View>
          <Text style={styles.resetDesc}>
            Clears all temporary data across all Zustand stores (user persona, contributions, streak, tickets, active draw, winner escrow, buffer) and restores initial mock service seed state.
          </Text>

          <AppButton
            title="Reset All Demo Stores & Services"
            variant="outline"
            onPress={() => setShowResetModal(true)}
            style={{ marginTop: spacing.md, borderColor: colors.status.critical }}
          />
        </Card>

        <DisclaimerNotice />

        {/* Deliberate Confirmation Modal for Full Reset */}
        <Modal
          visible={showResetModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalIcon}>⚠️</Text>
              <Text style={styles.modalTitle}>Confirm Full Demo Reset</Text>
              <Text style={styles.modalBody}>
                This will restore all stores, mock personas, contribution ledgers, draw tickets, and winner simulation data back to the initial day 1 baseline.
              </Text>
              <Text style={styles.modalSub}>
                Are you sure you want to proceed with resetting the demonstration state?
              </Text>

              <View style={styles.modalActionsRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowResetModal(false)}
                  style={{ flex: 1 }}
                />
                <AppButton
                  title={isResetting ? 'Resetting...' : 'Yes, Reset Demo'}
                  variant="primary"
                  loading={isResetting}
                  onPress={handleConfirmFullReset}
                  style={{ flex: 1.2, backgroundColor: colors.status.critical }}
                />
              </View>
            </View>
          </View>
        </Modal>
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
  restrictedCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#0F172A',
    borderColor: colors.status.critical,
    borderWidth: 1.5,
    marginVertical: spacing.xl,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  restrictedTitle: {
    ...typography.h2,
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },
  restrictedDesc: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  restrictedHelp: {
    ...typography.bodySmall,
    color: colors.dark.textMuted,
    textAlign: 'center',
    fontSize: 12,
  },
  auditNotice: {
    backgroundColor: '#064E3B',
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  auditNoticeText: {
    ...typography.bodySmall,
    color: '#E6FFFA',
    fontWeight: '600',
    lineHeight: 18,
  },
  solvencyCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  disclaimerCallout: {
    backgroundColor: '#1C1608',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  disclaimerCalloutText: {
    ...typography.caption,
    color: colors.accentGoldLight,
    lineHeight: 15,
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  personaItemActive: {
    borderColor: colors.primaryLight,
    backgroundColor: '#0F261E',
  },
  personaAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  personaAvatarText: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 13,
  },
  personaName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 13,
  },
  personaRoleSub: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 10,
    marginTop: 1,
  },
  personaScope: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  switchPersonaBtn: {
    backgroundColor: colors.dark.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchPersonaBtnText: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  drawStatusBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  drawRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  drawLabel: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  drawVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 11,
  },
  completedDrawBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    backgroundColor: '#1E170A',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  completedDrawTitle: {
    ...typography.caption,
    color: colors.accentGold,
    fontWeight: '800',
    fontSize: 10,
  },
  completedDrawWinner: {
    ...typography.body,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginTop: 2,
  },
  completedDrawTicket: {
    ...typography.caption,
    color: colors.accentGold,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 1,
  },
  completedDrawTime: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  warningList: {
    gap: spacing.sm,
  },
  warningItem: {
    backgroundColor: '#1C1215',
    borderColor: '#7F1D1D',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  warningItemTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: '#F87171',
    marginBottom: 2,
  },
  warningItemBody: {
    ...typography.caption,
    color: '#FECACA',
    lineHeight: 15,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  navButton: {
    flex: 1,
    minWidth: '30%',
    minHeight: 52,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  navButtonIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 10,
  },
  resetCard: {
    marginBottom: spacing.md,
    backgroundColor: '#1E1214',
    borderColor: '#7F1D1D',
  },
  resetTitle: {
    ...typography.h3,
    color: '#F87171',
    fontSize: 15,
  },
  resetDesc: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.dark.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.status.critical,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.dark.textPrimary,
    fontSize: 18,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalBody: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  modalSub: {
    ...typography.caption,
    color: colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
});
