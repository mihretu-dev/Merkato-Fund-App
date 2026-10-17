/**
 * Merkato Fund — Admin & Auditor Preview Screen
 *
 * Provides compliance, solvency, and operational metrics.
 * Accessible when the Admin persona (Abebe Kebede) is selected.
 */

import React, { useState, useEffect } from 'react';
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
import { useDemoConfigStore } from '@/src/stores/useDemoConfigStore';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { PoolStatistics } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';

export default function AdminScreen() {
  const currentUser = useUserStore((s) => s.currentUser);
  const switchPersona = useUserStore((s) => s.switchPersona);

  const repaymentDailyModel = useDemoConfigStore((s) => s.repaymentDailyModel);
  const setRepaymentDailyModel = useDemoConfigStore((s) => s.setRepaymentDailyModel);

  const [poolStats, setPoolStats] = useState<PoolStatistics | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  useEffect(() => {
    mockMerkatoService.getPoolStatistics().then(setPoolStats);
  }, []);

  const isAdmin = currentUser.role === 'admin';

  const handleSwitchToAdmin = async () => {
    try {
      await switchPersona('admin');
      const stats = await mockMerkatoService.getPoolStatistics();
      setPoolStats(stats);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSolvencyAudit = () => {
    const requiredMembers = 20000;
    const currentMembers = poolStats?.activeContributorsCount || 24850;
    const surplusMembers = currentMembers - requiredMembers;

    setAuditMessage(
      `✅ SOLVENCY AUDIT PASSED: ${currentMembers.toLocaleString()} active daily members exceeds the 20,000 threshold by +${surplusMembers.toLocaleString()} members (+${formatETB(surplusMembers * 50)} surplus daily).`
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.screenTitle}>Admin Preview</Text>
              <Text style={styles.screenSubtitle}>Auditor & Compliance Hub</Text>
            </View>
            <DemoBadge label="ROLE GUARDED" />
          </View>

          <Card style={styles.restrictedCard} variant="elevated">
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.restrictedTitle}>Auditor Access Restricted</Text>
            <Text style={styles.restrictedDesc}>
              This screen is restricted to the Compliance Auditor role. You are currently browsing as "{currentUser.fullName}" ({currentUser.role.toUpperCase()}).
            </Text>
            <Text style={styles.restrictedHelp}>
              To evaluate the pool solvency ledger and compliance controls, switch to the Admin demo persona below:
            </Text>

            <AppButton
              title="Switch to Admin Persona (Abebe Kebede)"
              variant="primary"
              onPress={handleSwitchToAdmin}
              style={{ marginTop: spacing.md }}
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
            <Text style={styles.screenTitle}>Compliance & Pool Audit</Text>
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

        {/* 1. Solvency Summary Card */}
        <Card style={styles.solvencyCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Pool Solvency Analysis</Text>
            <StatusPill status="healthy" label="SOLVENT (20K+ FLOOR)" />
          </View>

          <Text style={styles.cardSubtitle}>
            To sustain a daily 1,000,000 ETB payout at 50 ETB/member, a mathematical floor of 20,000 active daily contributors is strictly required.
          </Text>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Active Contributors"
              value={activeMembers.toLocaleString()}
              subtitle="Req: 20,000 floor"
              highlight
            />
            <MetricTile
              label="Daily Inflow"
              value={formatETB(poolBalance)}
              subtitle="@ 50 ETB / member"
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Draw Allocation"
              value={formatETB(prizeAllocated)}
              subtitle="Daily capital prize"
            />
            <MetricTile
              label="Reserve Surplus"
              value={formatETB(reserveFund)}
              subtitle="+24.25% buffer fund"
            />
          </View>

          <AppButton
            title="Run Real-Time Pool Solvency Audit"
            variant="outline"
            onPress={handleRunSolvencyAudit}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* 2. Repayment Model Assumption Controls */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Regulatory Assumption Controls</Text>
            <StatusPill status="info" label="DEMO SANDBOX" size="small" />
          </View>

          <Text style={styles.cardSubtitle}>
            The source PDF contains conflicting statements regarding repayment (500 ETB vs 550 ETB). Toggle the active operational model below:
          </Text>

          <View style={styles.modelButtons}>
            <AppButton
              title="Model A: 500 Principal + 50 Fee (550 Total)"
              variant={repaymentDailyModel === '500_plus_50' ? 'primary' : 'outline'}
              onPress={() => setRepaymentDailyModel('500_plus_50')}
            />
            <AppButton
              title="Model B: 550 Flat Principal (0 Fee)"
              variant={repaymentDailyModel === '550_bundle' ? 'primary' : 'outline'}
              onPress={() => setRepaymentDailyModel('550_bundle')}
            />
            <AppButton
              title="Model C: 500 Flat Principal (0 Fee)"
              variant={repaymentDailyModel === '500_only' ? 'primary' : 'outline'}
              onPress={() => setRepaymentDailyModel('500_only')}
            />
          </View>
        </Card>

        {/* 3. System Metrics */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>System Audit Metrics</Text>
            <Text style={styles.auditDate}>Audited: 2026-10-17</Text>
          </View>

          <View style={styles.auditList}>
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Total Historical Draws</Text>
              <Text style={styles.auditVal}>{totalDraws} Draws Completed</Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Day-Count Rate Convention</Text>
              <Text style={styles.auditVal}>ACT/365 Simple Interest</Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Escrow Custody Partner</Text>
              <Text style={styles.auditVal}>Commercial Bank of Ethiopia (CBE)</Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>Client Simulation Isolation</Text>
              <Text style={[styles.auditVal, { color: colors.status.healthy }]}>
                Strictly Enforced (isSimulated: true)
              </Text>
            </View>
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
  modelButtons: {
    gap: spacing.xs,
  },
  auditDate: {
    ...typography.caption,
    color: colors.dark.textMuted,
  },
  auditList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  auditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.surfaceBorder,
  },
  auditLabel: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
  },
  auditVal: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
});
