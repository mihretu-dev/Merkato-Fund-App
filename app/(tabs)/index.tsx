/**
 * Merkato Fund — Member Dashboard Screen
 *
 * Primary landing screen displaying active persona status, daily streak,
 * contribution status (paid vs due), and today's draw ticket status.
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
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
  PersonaSelector,
  MetricTile,
} from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { formatETB } from '@/src/domain/calculations/currency';

export default function MemberDashboardScreen() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.currentUser);
  const currentPersonaId = useUserStore((s) => s.currentPersonaId);

  const paidToday = useContributionStore((s) => s.paidToday);
  const loadUserContributions = useContributionStore((s) => s.loadUserContributions);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const userTickets = useDrawStore((s) => s.userTickets);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const loadWinnerData = useWinnerStore((s) => s.loadWinnerData);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserContributions(currentUser.id);
      loadDrawData(currentUser.id);
      loadWinnerData(currentUser.id);
    }
  }, [currentUser?.id]);

  const activeTodayTickets = userTickets.filter((t) => t.drawId === activeDraw?.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Branding & Demo Badge */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandTitle}>Merkato Fund</Text>
            <Text style={styles.brandSubtitle}>የመርካቶ የዕቁብ ፈንድ • Demo Prototype</Text>
          </View>
          <DemoBadge label="DEMO PROTOTYPE" />
        </View>

        {/* Compact Persona Switcher */}
        <View style={styles.personaSwitcherSection}>
          <Text style={styles.sectionLabel}>SWITCH DEMO PERSONA</Text>
          <PersonaSelector compact />
        </View>

        {/* Active Persona Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{currentUser.fullName}</Text>
                <StatusPill
                  status={
                    currentUser.role === 'winner'
                      ? 'caution'
                      : currentUser.role === 'admin'
                      ? 'info'
                      : 'healthy'
                  }
                  label={currentUser.role.toUpperCase()}
                  size="small"
                />
              </View>
              <Text style={styles.occupationText}>{currentUser.occupation}</Text>
              <Text style={styles.locationText}>📍 {currentUser.location}</Text>
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricTile
              label="Active Streak"
              value={`${currentUser.activeStreakDays} Days`}
              subtitle="50 ETB / day"
              highlight
            />
            <MetricTile
              label="Total Contributed"
              value={formatETB(currentUser.totalContributedETB)}
              subtitle="All-time micro pool"
            />
            <MetricTile
              label="Demo Balance"
              value={formatETB(currentUser.simulatedWalletBalanceETB)}
              subtitle="Simulated wallet"
            />
          </View>
        </Card>

        {/* Role-Specific Context Banners */}
        {currentUser.role === 'winner' && (
          <Card style={styles.bannerCardWinner} variant="elevated">
            <View style={styles.bannerHeader}>
              <Text style={styles.bannerTitle}>🏆 Active Winner Experience</Text>
              <StatusPill status="locked" label="DAY 45 OF 180" size="small" />
            </View>
            <Text style={styles.bannerText}>
              1,000,000 ETB locked in Commercial Bank of Ethiopia (CBE) escrow. Generating 602.74 ETB daily interest (22% p.a.).
            </Text>
            <AppButton
              title="Inspect 6-Month Escrow & Repayments →"
              variant="gold"
              onPress={() => router.push('/(tabs)/winner')}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        {currentUser.role === 'admin' && (
          <Card style={styles.bannerCardAdmin} variant="elevated">
            <View style={styles.bannerHeader}>
              <Text style={styles.bannerTitle}>🛡️ Auditor & Compliance Dashboard</Text>
              <StatusPill status="info" label="ADMIN PREVIEW" size="small" />
            </View>
            <Text style={styles.bannerText}>
              Reviewing pool solvency, daily 1M ETB prize reserve, and algorithmic draw audit trails.
            </Text>
            <AppButton
              title="Open Compliance & Pool Analytics →"
              variant="outline"
              onPress={() => router.push('/(tabs)/admin')}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        {/* Daily Contribution Status Card */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Daily 50 ETB Micro-Contribution</Text>
            <StatusPill
              status={paidToday ? 'healthy' : 'caution'}
              label={paidToday ? 'PAID TODAY' : 'PAYMENT DUE'}
            />
          </View>

          <Text style={styles.cardSectionDesc}>
            {paidToday
              ? 'Your 50 ETB daily contribution for today (2026-10-17) is completed. You are entered into tonight’s 1,000,000 ETB draw.'
              : 'Pay your 50 ETB daily contribution to maintain your 14-day streak and secure your algorithmic draw ticket for tonight.'}
          </Text>

          <View style={styles.actionRow}>
            {paidToday ? (
              <AppButton
                title="View Transaction History"
                variant="outline"
                onPress={() => router.push('/(tabs)/contribute')}
                fullWidth
              />
            ) : (
              <AppButton
                title="Pay 50 ETB Now (Telebirr / CBE) →"
                variant="primary"
                onPress={() => router.push('/(tabs)/contribute')}
                fullWidth
              />
            )}
          </View>
        </Card>

        {/* Tonight's Algorithmic Draw Card */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Tonight's Algorithmic Draw</Text>
            <StatusPill status="info" label="20:00:00 EAT" />
          </View>

          <View style={styles.drawPrizeRow}>
            <CurrencyDisplay
              amountETB={activeDraw?.prizeAmountETB || 1_000_000}
              label="Stated Draw Prize"
              size="lg"
              color={colors.accentGold}
            />
            <View style={styles.ticketBadgeContainer}>
              <Text style={styles.ticketBadgeLabel}>Your Tickets</Text>
              <Text style={styles.ticketBadgeCount}>
                {activeTodayTickets.length} Active
              </Text>
            </View>
          </View>

          {activeTodayTickets.length > 0 ? (
            <View style={styles.ticketCard}>
              <Text style={styles.ticketLabel}>ENTRY TICKET NUMBER</Text>
              <Text style={styles.ticketNumber}>
                {activeTodayTickets[0].ticketNumber}
              </Text>
              <Text style={styles.ticketSub}>
                Issued {activeTodayTickets[0].issuedAt.split('T')[1].slice(0, 5)} EAT • Verified Deterministic Seed
              </Text>
            </View>
          ) : (
            <View style={styles.noTicketNotice}>
              <Text style={styles.noTicketText}>
                ⚠️ No ticket issued yet for today’s draw. Complete today’s 50 ETB contribution to generate your ticket.
              </Text>
            </View>
          )}

          <AppButton
            title="Open Draw Room & Test Simulator →"
            variant="secondary"
            onPress={() => router.push('/(tabs)/draw')}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Developer Day 2 Quick Verification Link */}
        <Card style={styles.devCard} variant="outline">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.devTitle}>🛠️ Day 2 Verification Harness</Text>
            <StatusPill status="info" label="DEV TESTER" size="small" />
          </View>
          <Text style={styles.devDesc}>
            Verify persona transitions, state updates across stores, contribution submissions, draw simulations, and demo resets in one screen.
          </Text>
          <AppButton
            title="Open State Verification Harness"
            variant="outline"
            onPress={() => router.push('/(tabs)/verify')}
            style={{ marginTop: spacing.xs }}
          />
        </Card>

        {/* Mandatory Safety Notice */}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.dark.textPrimary,
    fontSize: 22,
  },
  brandSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 12,
  },
  personaSwitcherSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.dark.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  profileCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.dark.surface,
    borderColor: colors.dark.surfaceBorder,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 17,
  },
  occupationText: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
  },
  locationText: {
    ...typography.caption,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bannerCardWinner: {
    marginBottom: spacing.md,
    backgroundColor: '#1E170A',
    borderColor: colors.accentGoldDark,
    borderWidth: 1.5,
  },
  bannerCardAdmin: {
    marginBottom: spacing.md,
    backgroundColor: '#0F172A',
    borderColor: colors.telebirr,
    borderWidth: 1.5,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 15,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardSectionTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 16,
  },
  cardSectionDesc: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  actionRow: {
    marginTop: spacing.xs,
  },
  drawPrizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  ticketBadgeContainer: {
    alignItems: 'flex-end',
  },
  ticketBadgeLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  ticketBadgeCount: {
    ...typography.h3,
    color: colors.primaryLight,
    fontSize: 16,
  },
  ticketCard: {
    backgroundColor: '#0F1E19',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  ticketLabel: {
    ...typography.label,
    color: colors.primaryLight,
    fontSize: 9,
    letterSpacing: 1,
  },
  ticketNumber: {
    ...typography.h2,
    color: colors.accentGold,
    fontSize: 20,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  ticketSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  noTicketNotice: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    marginBottom: spacing.xs,
  },
  noTicketText: {
    ...typography.bodySmall,
    color: colors.dark.textMuted,
    lineHeight: 18,
  },
  devCard: {
    marginBottom: spacing.md,
    backgroundColor: '#111827',
    borderColor: colors.dark.surfaceBorder,
  },
  devTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  devDesc: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 4,
  },
});
