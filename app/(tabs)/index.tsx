/**
 * Merkato Fund — Member Dashboard Screen
 *
 * Primary landing screen delivering a complete first-time & returning member experience:
 * - Ethiopian greeting & active persona indicator
 * - Daily 50 ETB contribution status & quick payment trigger
 * - 14-day visual streak tracker & recent synthetic activity ledger snippet
 * - Tonight's 1,000,000 ETB algorithmic draw ticket display or empty state
 * - Quick evaluator shortcuts to Replay Onboarding, Persona Selection, and Verification
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
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  const paidToday = useContributionStore((s) => s.paidToday);
  const contributions = useContributionStore((s) => s.contributions);
  const loadUserContributions = useContributionStore((s) => s.loadUserContributions);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const userTickets = useDrawStore((s) => s.userTickets);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);

  const escrowAccount = useWinnerStore((s) => s.escrowAccount);
  const loadWinnerData = useWinnerStore((s) => s.loadWinnerData);

  // First-time evaluator check: redirect to onboarding walkthrough if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding]);

  // Hydrate user data on mount and persona change
  useEffect(() => {
    if (currentUser?.id) {
      loadUserContributions(currentUser.id);
      loadDrawData(currentUser.id);
      loadWinnerData(currentUser.id);
    }
  }, [currentUser?.id]);

  const activeTodayTickets = userTickets.filter((t) => t.drawId === activeDraw?.id);

  // Amharic + English greeting tailored to active persona
  const getGreeting = () => {
    const firstName = currentUser.fullName.split(' ')[0];
    if (currentUser.role === 'winner') {
      return {
        amharic: 'እንኳን ደህና መጡ ፣',
        name: `${firstName}!`,
        subtitle: 'የተቆለፈ የ1 ሚሊዮን ብር የባንክ ሒሳብ እና የቀን ወለድ ክትትል',
      };
    }
    if (currentUser.role === 'admin') {
      return {
        amharic: 'እንኳን ደህና መጡ ፣',
        name: `${firstName}!`,
        subtitle: 'የፈንድ ተጠቃሚዎች እና የፋይናንስ ሞዴል ክትትል ዳሽቦርድ',
      };
    }
    return {
      amharic: 'ሰላም ፣',
      name: `${firstName}!`,
      subtitle: 'የመርካቶ የዕቁብ ፈንድ • የቀን 50 ብር መዋጮ እና የዕጣ ተሳትፎ',
    };
  };

  const greeting = getGreeting();
  const recentContributions = contributions.slice(0, 3);

  // Build a 7-day visual streak indicator
  const streakDays = currentUser.activeStreakDays || 0;
  const recentDays = [
    { day: 'M', active: streakDays >= 6 },
    { day: 'T', active: streakDays >= 5 },
    { day: 'W', active: streakDays >= 4 },
    { day: 'T', active: streakDays >= 3 },
    { day: 'F', active: streakDays >= 2 },
    { day: 'S', active: streakDays >= 1 },
    { day: 'Today', active: paidToday, isToday: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarBrand}>Merkato Fund • የመርካቶ ፈንድ</Text>
            <Text style={styles.dateLabel}>ጥቅምት 7 2019 ዓ.ም • Oct 17, 2026</Text>
          </View>
          <View style={styles.topRightActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Replay Onboarding Walkthrough"
              onPress={() => router.push('/onboarding')}
              style={styles.headerIconButton}>
              <Text style={styles.headerIconText}>📖 Tour</Text>
            </TouchableOpacity>
            <DemoBadge label="DEMO PROTOTYPE" />
          </View>
        </View>

        {/* Personalized Welcome Banner */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingAmharic}>
            {greeting.amharic} <Text style={styles.greetingName}>{greeting.name}</Text>
          </Text>
          <Text style={styles.greetingSubtitle}>{greeting.subtitle}</Text>
        </View>

        {/* Inline Persona Switcher Header */}
        <View style={styles.personaSwitcherSection}>
          <View style={styles.personaSectionHeader}>
            <Text style={styles.sectionLabel}>SWITCH DEMO PERSONA</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Full Persona Selector Screen"
              onPress={() => router.push('/persona-select')}>
              <Text style={styles.viewAllPersonasLink}>Detailed View →</Text>
            </TouchableOpacity>
          </View>
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
              1,000,000 ETB locked in Commercial Bank of Ethiopia (CBE) escrow. Generating ~602.74 ETB daily interest (22% p.a.).
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
              Reviewing synthetic pool feasibility assumptions, 20,000-member scale floor, and demo draw audit trails.
            </Text>
            <AppButton
              title="Open Compliance & Pool Analytics →"
              variant="outline"
              onPress={() => router.push('/(tabs)/admin')}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        {/* Daily 50 ETB Contribution Status Card */}
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

          {/* Visual Streak Week Tracker */}
          <View style={styles.streakTrackerContainer}>
            <View style={styles.streakTrackerHeader}>
              <Text style={styles.streakTrackerLabel}>7-DAY CONTRIBUTION STREAK</Text>
              <Text style={styles.streakCountBadge}>🔥 {currentUser.activeStreakDays} Days</Text>
            </View>
            <View style={styles.streakDotsRow}>
              {recentDays.map((d, idx) => (
                <View key={idx} style={styles.streakDotColumn}>
                  <View
                    style={[
                      styles.streakDot,
                      d.active ? styles.streakDotActive : styles.streakDotInactive,
                      d.isToday && styles.streakDotToday,
                    ]}>
                    <Text style={styles.streakDotCheck}>
                      {d.active ? '✓' : d.isToday ? '!' : '·'}
                    </Text>
                  </View>
                  <Text style={[styles.streakDayLabel, d.isToday && styles.streakDayLabelToday]}>
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            {paidToday ? (
              <AppButton
                title="View Contribution Ledger & Receipts"
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
                Issued {activeTodayTickets[0].issuedAt.split('T')[1].slice(0, 5)} EAT • Demonstration Ticket (Client-Side Simulation)
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

        {/* Recent Activity Card */}
        {recentContributions.length > 0 && (
          <Card style={styles.sectionCard} variant="surface">
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>Recent Synthetic Activity</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View full transaction history"
                onPress={() => router.push('/(tabs)/contribute')}>
                <Text style={styles.viewAllPersonasLink}>View All ({contributions.length}) →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentList}>
              {recentContributions.map((rec) => (
                <View key={rec.id} style={styles.recentItemRow}>
                  <View style={styles.recentLeft}>
                    <Text style={styles.recentIcon}>
                      {rec.channel === 'telebirr' ? '📱' : '🏦'}
                    </Text>
                    <View>
                      <Text style={styles.recentChannel}>
                        {rec.channel === 'telebirr' ? 'Telebirr Micro-Pay' : 'CBE Birr'}
                      </Text>
                      <Text style={styles.recentDate}>{rec.date} • Streak #{rec.streakDay}</Text>
                    </View>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentAmount}>-{formatETB(rec.amountETB)}</Text>
                    <StatusPill status="healthy" label="COMPLETED" size="small" />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Evaluator Quick Action Hub */}
        <Card style={styles.devCard} variant="outline">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.devTitle}>🛠️ Evaluator Shortcuts</Text>
            <StatusPill status="info" label="DEMO CONTROLS" size="small" />
          </View>
          <Text style={styles.devDesc}>
            Quickly navigate between demonstration walkthroughs, persona roles, and automated state verification.
          </Text>
          <View style={styles.evaluatorButtonsRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Replay 3-slide Onboarding"
              onPress={() => router.push('/onboarding')}
              style={styles.evaluatorButton}>
              <Text style={styles.evaluatorButtonText}>📖 Replay Onboarding</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Persona Selector Screen"
              onPress={() => router.push('/persona-select')}
              style={styles.evaluatorButton}>
              <Text style={styles.evaluatorButtonText}>👥 Persona Selector</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Day 2 State Verification"
              onPress={() => router.push('/(tabs)/verify')}
              style={styles.evaluatorButton}>
              <Text style={styles.evaluatorButtonText}>🔍 State Verification</Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  topBarBrand: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  headerIconText: {
    ...typography.caption,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 11,
  },
  greetingHeader: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  greetingAmharic: {
    ...typography.h2,
    color: colors.dark.textPrimary,
    fontSize: 22,
  },
  greetingName: {
    color: colors.accentGold,
    fontWeight: '700',
  },
  greetingSubtitle: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  personaSwitcherSection: {
    marginBottom: spacing.md,
  },
  personaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.dark.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  viewAllPersonasLink: {
    ...typography.caption,
    color: colors.accentGold,
    fontWeight: '600',
    fontSize: 11,
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
  streakTrackerContainer: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  streakTrackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTrackerLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.dark.textMuted,
    letterSpacing: 0.8,
  },
  streakCountBadge: {
    ...typography.caption,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 11,
  },
  streakDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDotColumn: {
    alignItems: 'center',
    gap: 4,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDotActive: {
    backgroundColor: colors.primary,
  },
  streakDotInactive: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  streakDotToday: {
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  streakDotCheck: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  streakDayLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.dark.textMuted,
  },
  streakDayLabelToday: {
    color: colors.accentGold,
    fontWeight: '700',
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
  recentList: {
    gap: spacing.xs,
  },
  recentItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentIcon: {
    fontSize: 18,
  },
  recentChannel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  recentDate: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  recentAmount: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 13,
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
  evaluatorButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  evaluatorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  evaluatorButtonText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.accentGold,
    textAlign: 'center',
  },
});
