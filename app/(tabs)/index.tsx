/**
 * Merkato Fund — Member Dashboard Screen
 *
 * Polished, high-density mobile fintech dashboard:
 * 1. Compact App Header with brand, date, demo badge, and info trigger
 * 2. Segmented Persona Switcher
 * 3. Member Summary with 3 responsive metric tiles (Streak, Contributed, Wallet)
 * 4. Dominant 50 ETB Contribution Hero with slim 7-day streak track
 * 5. Compact Draw Preview with 1M ETB prize pool, ticket snippet & status
 * 6. Recent Activity preview (max 3 items)
 * 7. Secondary Evaluator Shortcuts & Prototype Disclaimer
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, radii, fontFamilies } from '@/src/theme/tokens';
import {
  Card,
  AppButton,
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
  const insets = useSafeAreaInsets();

  const currentUser = useUserStore((s) => s.currentUser);
  const currentPersonaId = useUserStore((s) => s.currentPersonaId);
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  const paidToday = useContributionStore((s) => s.paidToday);
  const contributions = useContributionStore((s) => s.contributions);
  const loadUserContributions = useContributionStore((s) => s.loadUserContributions);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const userTickets = useDrawStore((s) => s.userTickets);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);

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
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        
        {/* 1. Compact App Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <Text style={styles.topBarBrand}>MERKATO FUND</Text>
            <Text style={styles.dateLabel}>ጥቅምት 7 2019 ዓ.ም • Oct 17, 2026</Text>
          </View>
          <View style={styles.topRightActions}>
            <DemoBadge compact label="DEMO" />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Replay Onboarding Tour"
              onPress={() => router.push('/onboarding')}
              style={styles.headerIconButton}>
              <Text style={styles.headerIconText}>📖 Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Safety Boundaries and Project Info"
              onPress={() => router.push('/modal')}
              style={styles.headerInfoButton}>
              <Text style={styles.headerInfoText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Compact Persona Switcher */}
        <View style={styles.personaSection}>
          <View style={styles.personaHeader}>
            <Text style={styles.personaSectionLabel}>ACTIVE DEMO PERSONA</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Full Persona Selector"
              onPress={() => router.push('/persona-select')}>
              <Text style={styles.personaDetailLink}>All Profiles →</Text>
            </TouchableOpacity>
          </View>
          <PersonaSelector compact />
        </View>

        {/* 3. Member Summary & 3 Responsive Metric Tiles */}
        <Card style={styles.memberCard} variant="elevated">
          <View style={styles.memberHeaderRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>
                {currentUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {currentUser.fullName}
                </Text>
                <StatusPill
                  status={
                    currentUser.role === 'winner'
                      ? 'caution'
                      : currentUser.role === 'admin'
                      ? 'info'
                      : 'healthy'
                  }
                  label={
                    currentUser.role === 'admin'
                      ? 'AUDITOR'
                      : currentUser.role === 'winner'
                      ? 'WINNER'
                      : 'ACTIVE MEMBER'
                  }
                  size="small"
                />
              </View>
              <Text style={styles.memberMeta} numberOfLines={1}>
                {currentUser.occupation} • 📍 {currentUser.location}
              </Text>
            </View>
          </View>

          {/* Role-Specific Context Banners */}
          {currentUser.role === 'winner' && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Inspect Winner Escrow Hub"
              onPress={() => router.push('/(tabs)/winner')}
              style={styles.roleBannerWinner}>
              <Text style={styles.roleBannerIcon}>🏆</Text>
              <View style={styles.roleBannerTextCol}>
                <Text style={styles.roleBannerWinnerTitle}>Day 45: 1,000,000 ETB Escrow View</Text>
                <Text style={styles.roleBannerWinnerSub}>602.74 ETB/day interest • Tap to inspect hub →</Text>
              </View>
            </TouchableOpacity>
          )}

          {currentUser.role === 'admin' && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Compliance and Pool Audit Hub"
              onPress={() => router.push('/(tabs)/admin')}
              style={styles.roleBannerAdmin}>
              <Text style={styles.roleBannerIcon}>🛡️</Text>
              <View style={styles.roleBannerTextCol}>
                <Text style={styles.roleBannerAdminTitle}>Compliance & Pool Feasibility Model</Text>
                <Text style={styles.roleBannerAdminSub}>24,850 member model • Tap for auditor view →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* 3 Responsive Metric Tiles */}
          <View style={styles.metricsRow}>
            <MetricTile
              label="Streak"
              value={`${currentUser.activeStreakDays}d`}
              subtitle="50 ETB / day"
              highlight
            />
            <MetricTile
              label="Contributed"
              value={formatETB(currentUser.totalContributedETB)}
              subtitle="All-time pool"
            />
            <MetricTile
              label="Wallet"
              value={formatETB(currentUser.simulatedWalletBalanceETB)}
              subtitle="Demo balance"
            />
          </View>
        </Card>

        {/* 4. Dominant Contribution Action (Hero) */}
        <Card
          style={[styles.heroCard, !paidToday && styles.heroCardDue]}
          variant="elevated">
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>TODAY'S CONTRIBUTION</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroAmount}>50.00</Text>
                <Text style={styles.heroCurrency}>ETB</Text>
              </View>
            </View>
            <StatusPill
              status={paidToday ? 'healthy' : 'caution'}
              label={paidToday ? 'PAID TODAY' : 'PAYMENT DUE'}
            />
          </View>

          {/* Slim Horizontal Streak Tracker */}
          <View style={styles.slimStreakRow}>
            <View style={styles.streakDotsList}>
              {recentDays.map((d, idx) => (
                <View key={idx} style={styles.streakCol}>
                  <View
                    style={[
                      styles.slimStreakDot,
                      d.active ? styles.slimStreakDotActive : styles.slimStreakDotInactive,
                      d.isToday && styles.slimStreakDotToday,
                    ]}>
                    <Text style={styles.slimStreakCheck}>
                      {d.active ? '✓' : d.isToday ? '!' : '·'}
                    </Text>
                  </View>
                  <Text style={[styles.slimStreakLabel, d.isToday && styles.slimStreakLabelToday]}>
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🔥 {currentUser.activeStreakDays}d Streak</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <AppButton
            title={paidToday ? 'View Contribution Receipt & Ledger →' : 'Pay 50 ETB Now (Telebirr / CBE) →'}
            variant={paidToday ? 'secondary' : 'primary'}
            onPress={() => router.push('/(tabs)/contribute')}
            fullWidth
          />
        </Card>

        {/* 5. Compact Draw Preview */}
        <Card style={styles.drawCard} variant="surface">
          <View style={styles.drawHeaderRow}>
            <View style={styles.drawHeaderLeft}>
              <Text style={styles.drawSectionTitle}>Tonight's Algorithmic Draw</Text>
              <Text style={styles.drawSubtitle}>Daily 20:00 EAT • Client-Side Simulation</Text>
            </View>
            <StatusPill status="info" label="20:00 EAT" size="small" />
          </View>

          <View style={styles.drawDetailsRow}>
            <View style={styles.drawPrizeCol}>
              <Text style={styles.drawPrizeLabel}>DEMO PRIZE POOL</Text>
              <Text style={styles.drawPrizeAmount}>1,000,000 ETB</Text>
            </View>
            <View style={styles.drawTicketCol}>
              <Text style={styles.drawTicketLabel}>YOUR TICKETS</Text>
              <Text
                style={[
                  styles.drawTicketCount,
                  activeTodayTickets.length > 0 && styles.drawTicketCountActive,
                ]}>
                {activeTodayTickets.length > 0
                  ? `🎫 ${activeTodayTickets.length} Active`
                  : '0 Active'}
              </Text>
            </View>
          </View>

          {activeTodayTickets.length > 0 ? (
            <View style={styles.ticketSnippet}>
              <View style={styles.ticketSnippetLeft}>
                <Text style={styles.ticketSnippetLabel}>TICKET #</Text>
                <Text style={styles.ticketSnippetNumber} numberOfLines={1}>
                  {activeTodayTickets[0].ticketNumber}
                </Text>
              </View>
              <StatusPill status="healthy" label="ELIGIBLE" size="small" />
            </View>
          ) : (
            <View style={styles.ticketSnippetEmpty}>
              <Text style={styles.ticketSnippetEmptyText}>
                ⚠️ Complete today's 50 ETB contribution to receive tonight's draw ticket.
              </Text>
            </View>
          )}

          <AppButton
            title="Open Draw Room & Test Simulator →"
            variant="secondary"
            onPress={() => router.push('/(tabs)/draw')}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* 6. Recent Activity Preview (Max 3 Items) */}
        {recentContributions.length > 0 && (
          <Card style={styles.activityCard} variant="surface">
            <View style={styles.activityHeaderRow}>
              <Text style={styles.activityTitle}>Recent Activity</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View full transaction history"
                onPress={() => router.push('/(tabs)/contribute')}>
                <Text style={styles.activityViewAll}>View All ({contributions.length}) →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
              {recentContributions.map((rec, index) => (
                <View
                  key={rec.id}
                  style={[
                    styles.activityRow,
                    index === recentContributions.length - 1 && styles.activityRowLast,
                  ]}>
                  <View style={styles.activityLeft}>
                    <View style={styles.activityIconBox}>
                      <Text style={styles.activityIcon}>
                        {rec.channel === 'telebirr' ? '📱' : '🏦'}
                      </Text>
                    </View>
                    <View style={styles.activityMetaCol}>
                      <Text style={styles.activityChannel}>
                        {rec.channel === 'telebirr' ? 'Telebirr Micro-Pay' : 'CBE Birr'}
                      </Text>
                      <Text style={styles.activityDate}>
                        {rec.date} • Streak #{rec.streakDay}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityAmount}>-{formatETB(rec.amountETB)}</Text>
                    <StatusPill status="healthy" label="PAID" size="small" />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 7. Secondary Evaluator Shortcuts */}
        <View style={styles.evaluatorSection}>
          <Text style={styles.evaluatorSectionLabel}>EVALUATOR QUICK ACCESS</Text>
          <View style={styles.evaluatorRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Replay 3-Slide Walkthrough"
              onPress={() => router.push('/onboarding')}
              style={styles.evaluatorBtn}>
              <Text style={styles.evaluatorBtnIcon}>📖</Text>
              <Text style={styles.evaluatorBtnText}>Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Persona Selector Screen"
              onPress={() => router.push('/persona-select')}
              style={styles.evaluatorBtn}>
              <Text style={styles.evaluatorBtnIcon}>👥</Text>
              <Text style={styles.evaluatorBtnText}>Personas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open State Verification Harness"
              onPress={() => router.push('/(tabs)/verify')}
              style={styles.evaluatorBtn}>
              <Text style={styles.evaluatorBtnIcon}>🔍</Text>
              <Text style={styles.evaluatorBtnText}>Verification</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. Compact Prototype Disclosure */}
        <DisclaimerNotice />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  brandContainer: {
    flex: 1,
  },
  topBarBrand: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  dateLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.sm,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    minHeight: 32,
    justifyContent: 'center',
  },
  headerIconText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 11,
  },
  headerInfoButton: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfoText: {
    fontSize: 14,
  },

  // 2. Persona Section
  personaSection: {
    marginBottom: spacing.sm,
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  personaSectionLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  personaDetailLink: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '600',
    fontSize: 11,
  },

  // 3. Member Card
  memberCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.dark.surface,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  memberAvatarText: {
    fontFamily: fontFamilies.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberName: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.xs,
  },
  memberMeta: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  roleBannerWinner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: colors.accentGoldDark,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  roleBannerAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 114, 206, 0.1)',
    borderColor: colors.telebirr,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  roleBannerIcon: {
    fontSize: 20,
  },
  roleBannerTextCol: {
    flex: 1,
  },
  roleBannerWinnerTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 13,
  },
  roleBannerWinnerSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  roleBannerAdminTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.telebirr,
    fontWeight: '700',
    fontSize: 13,
  },
  roleBannerAdminSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  // 4. Contribution Hero Card
  heroCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.dark.surface,
  },
  heroCardDue: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    gap: 4,
  },
  heroAmount: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    color: colors.dark.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroCurrency: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '700',
  },
  slimStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  streakDotsList: {
    flexDirection: 'row',
    gap: 8,
  },
  streakCol: {
    alignItems: 'center',
    gap: 3,
  },
  slimStreakDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slimStreakDotActive: {
    backgroundColor: colors.primary,
  },
  slimStreakDotInactive: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  slimStreakDotToday: {
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  slimStreakCheck: {
    fontFamily: fontFamilies.sans,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 12,
  },
  slimStreakLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 10,
    color: colors.dark.textMuted,
  },
  slimStreakLabelToday: {
    color: colors.accentGold,
    fontWeight: '700',
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakBadgeText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '700',
    fontSize: 11,
  },

  // 5. Draw Card
  drawCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  drawHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  drawHeaderLeft: {
    flex: 1,
    marginRight: spacing.xs,
  },
  drawSectionTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  drawSubtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  drawDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  drawPrizeCol: {
    flex: 1,
  },
  drawPrizeLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  drawPrizeAmount: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    color: colors.accentGold,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  drawTicketCol: {
    alignItems: 'flex-end',
  },
  drawTicketLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  drawTicketCount: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  drawTicketCountActive: {
    color: colors.status.healthy,
  },
  ticketSnippet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1E19',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.4)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: 4,
  },
  ticketSnippetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: spacing.xs,
  },
  ticketSnippetLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  ticketSnippetNumber: {
    fontFamily: fontFamilies.mono,
    color: colors.dark.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  ticketSnippetEmpty: {
    backgroundColor: '#1C1608',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: 4,
  },
  ticketSnippetEmptyText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGoldLight,
    fontSize: 11,
    lineHeight: 15,
  },

  // 6. Recent Activity
  activityCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activityTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  activityViewAll: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontWeight: '600',
    fontSize: 11,
  },
  activityList: {
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  activityRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  activityIcon: {
    fontSize: 15,
  },
  activityMetaCol: {
    flex: 1,
  },
  activityChannel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  activityDate: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  activityAmount: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    color: colors.dark.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  // 7. Evaluator Section
  evaluatorSection: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.xs,
  },
  evaluatorSectionLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  evaluatorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  evaluatorBtn: {
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  evaluatorBtnIcon: {
    fontSize: 14,
  },
  evaluatorBtnText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
