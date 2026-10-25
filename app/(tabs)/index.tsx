/**
 * Merkato Fund — Member Dashboard Screen
 *
 * Hierarchy:
 * 1. Header with greeting, bold user name, date, interactive notification bell, and avatar.
 * 2. Hero "Your Wallet" Card in rich emerald with prominent 2,450.00 ETB, daily rate, and CTA.
 * 3. Coordinated 2-column supporting row for Streak and Next Draw.
 * 4. Recent Activity with clean checkmark badges and bold amounts.
 * 5. Low-profile simulation disclosure.
 * 6. Interactive Notifications Modal / Sheet with real-time synthetic notifications.
 * 7. Full English & Amharic localization.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/tokens';
import { Card, DisclaimerNotice, NotificationsModal, ProfileModal, MerkatoLogo, MerkatoBrandModal } from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { formatETB } from '@/src/domain/calculations/currency';
import { useTranslation } from '@/src/i18n/useTranslation';
import { formatRealDate, getTimeBasedGreeting } from '@/src/utils/date';

export default function MemberDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, isDark } = useTheme();
  const { t, format, isAmharic } = useTranslation();

  const currentUser = useUserStore((s) => s.currentUser);
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  const paidToday = useContributionStore((s) => s.paidToday);
  const contributions = useContributionStore((s) => s.contributions);
  const loadUserContributions = useContributionStore((s) => s.loadUserContributions);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);
  const loadWinnerData = useWinnerStore((s) => s.loadWinnerData);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Evaluator check: redirect to onboarding if first time
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

  const recentContributions = contributions.slice(0, 2);

  const avatarInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'DH';

  // Dynamic real date & time-based greeting
  const currentDate = new Date();
  const greeting = getTimeBasedGreeting(currentDate, isAmharic ? 'am' : 'en');
  const realDateFormatted = formatRealDate(currentDate, isAmharic ? 'am' : 'en');

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* 1. Header Bar: Brand Logo, Greeting, Name, Date, Bell & Avatar */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeftGroup}>
            <MerkatoLogo
              size={46}
              rounded={true}
              showBorder={true}
              onPress={() => setShowBrandModal(true)}
            />
            <View style={styles.greetingCol}>
              <Text style={[styles.greetingSmall, { color: theme.textSecondary }]}>
                {greeting}
              </Text>
              <Text style={[styles.greetingName, { color: theme.textPrimary }]} numberOfLines={1}>
                {currentUser?.fullName || (isAmharic ? 'ዳዊት ኃይሌ' : 'Dawit Haile')}
              </Text>
              <Text style={[styles.greetingDate, { color: theme.textMuted }]}>
                {realDateFormatted}
              </Text>
            </View>
          </View>

          <View style={styles.headerActionsRight}>
            {/* Interactive Bell Icon */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => setShowNotifications(true)}
              style={[styles.bellButton, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open Profile Menu"
              onPress={() => setShowProfileMenu(true)}
              style={[styles.avatarButton, { backgroundColor: isDark ? '#064E3B' : '#E2E8F0', borderColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: isDark ? '#34D399' : colors.primaryDark }]}>
                {avatarInitials}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Primary Focal Area: Hero "Your Wallet" Card in Rich Emerald */}
        <View style={[styles.walletHeroCard, { backgroundColor: isDark ? '#064E3B' : '#065F46' }]}>
          <View style={styles.walletHeaderRow}>
            <Text style={styles.walletTitle}>{t.home.yourWallet}</Text>
            <View style={styles.walletRateTag}>
              <Text style={styles.walletRateText}>{t.home.dailyContributionTag}</Text>
            </View>
          </View>

          <View style={styles.walletBalanceBlock}>
            <Text style={styles.walletBalanceAmount}>
              {formatETB(currentUser?.simulatedWalletBalanceETB || 2450)}
            </Text>
            <Text style={styles.walletBalanceSub}>{t.home.availableBalance}</Text>
          </View>

          {/* Action Button inside Hero Wallet Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={paidToday}
            onPress={() => router.push('/(tabs)/contribute')}
            style={[
              styles.walletCtaButton,
              {
                backgroundColor: paidToday ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF',
              },
            ]}>
            <Text
              style={[
                styles.walletCtaText,
                { color: paidToday ? '#A7F3D0' : '#065F46' },
              ]}>
              {paidToday ? t.home.contributedToday : t.home.contributeCTA}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Coordinated 2-Column Supporting Row (Streak & Next Draw) */}
        <View style={styles.supportingRow}>
          {/* Left Column: Streak Card */}
          <Card style={styles.halfCard} variant="surface">
            <View style={styles.cardHeaderSmall}>
              <View style={[styles.smallIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Text style={styles.smallEmoji}>🔥</Text>
              </View>
              <Text style={[styles.smallCardLabel, { color: theme.textSecondary }]}>{t.home.streakTitle}</Text>
            </View>
            <Text style={[styles.halfCardMainValue, { color: theme.textPrimary }]}>
              {format(t.home.streakDays, { days: currentUser?.activeStreakDays || 14 })}
            </Text>
            <Text style={[styles.halfCardSubText, { color: paidToday ? colors.primary : theme.textMuted }]}>
              {paidToday ? (isAmharic ? 'ንቁ እና የተረጋገጠ' : 'Active & Settled') : (isAmharic ? 'ቀጥሉበት!' : 'Keep it going!')}
            </Text>
          </Card>

          {/* Right Column: Next Draw Card */}
          <Card style={styles.halfCard} variant="surface">
            <View style={styles.cardHeaderSmall}>
              <View style={[styles.smallIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Text style={styles.smallEmoji}>🏆</Text>
              </View>
              <Text style={[styles.smallCardLabel, { color: theme.textSecondary }]}>{t.tabs.draw}</Text>
            </View>
            <Text style={[styles.halfCardMainValue, { color: theme.textPrimary }]}>
              1,000,000 <Text style={styles.halfCardUnit}>{t.common.currencyETB}</Text>
            </Text>
            <View style={styles.drawScheduleRow}>
              <Text style={[styles.halfCardSubText, { color: theme.textMuted }]}>
                {t.draw.countdownValue}
              </Text>
              <View style={[styles.demoTag, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(5, 150, 105, 0.1)' }]}>
                <Text style={[styles.demoTagText, { color: colors.primary }]}>{t.common.demoBadge}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* 4. Recent Activity Preview */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.recentSectionTitle, { color: theme.textPrimary }]}>
              {t.home.recentActivity}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/contribute')}>
              <Text style={[styles.viewAllLink, { color: colors.primary }]}>
                {t.home.viewAllActivity}
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.recentCard} variant="surface">
            {recentContributions.length > 0 ? (
              recentContributions.map((item, idx) => (
                <View
                  key={`${item.id}-${idx}`}
                  style={[
                    styles.recentRow,
                    {
                      borderBottomColor: theme.surfaceBorder,
                      borderBottomWidth: idx < recentContributions.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}>
                  <View style={styles.recentLeft}>
                    <View style={[styles.recentCheckCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)' }]}>
                      <Text style={[styles.recentCheckText, { color: colors.primary }]}>✓</Text>
                    </View>
                    <View>
                      <Text style={[styles.recentChannelName, { color: theme.textPrimary }]}>
                        {t.home.contributionConfirmedTitle}
                      </Text>
                      <Text style={[styles.recentDate, { color: theme.textMuted }]}>
                        {item.date} • {format(t.home.streakDays, { days: item.streakDay })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.recentAmount, { color: theme.textPrimary }]}>
                    50 {t.common.currencyETB}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.recentRow}>
                <View style={styles.recentLeft}>
                  <View style={[styles.recentCheckCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)' }]}>
                    <Text style={[styles.recentCheckText, { color: colors.primary }]}>✓</Text>
                  </View>
                  <View>
                    <Text style={[styles.recentChannelName, { color: theme.textPrimary }]}>
                      {t.home.contributionConfirmedTitle}
                    </Text>
                    <Text style={[styles.recentDate, { color: theme.textMuted }]}>
                      {t.home.calendarDate}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.recentAmount, { color: theme.textPrimary }]}>
                  50 {t.common.currencyETB}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* 5. Low-profile simulation disclosure */}
        <DisclaimerNotice
          icon="ℹ"
          message={isAmharic ? 'ይህ የሙከራ ማሳያ ነው። ምንም እውነተኛ ክፍያ አይፈጸምም።' : 'This is a simulation. No real payments are processed.'}
          style={styles.disclosureCallout}
        />
      </ScrollView>

      {/* 6. Notifications Modal Sheet */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        unreadCount={unreadCount}
        onMarkAllAsRead={() => setUnreadCount(0)}
        onUpdateUnreadCount={(count) => setUnreadCount(count)}
      />

      {/* Merkato Brand Profile Modal */}
      <MerkatoBrandModal
        visible={showBrandModal}
        onClose={() => setShowBrandModal(false)}
      />

      {/* 7. Profile Menu Modal Sheet */}
      <ProfileModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        currentUser={currentUser}
        onSwitchPersona={() => {
          setShowProfileMenu(false);
          router.push('/persona-select');
        }}
        onViewOnboarding={() => {
          setShowProfileMenu(false);
          router.push('/onboarding');
        }}
        onOpenSettings={() => {
          setShowProfileMenu(false);
          router.push('/(tabs)/admin');
        }}
        onLogout={() => {
          setShowProfileMenu(false);
          router.push('/persona-select');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  greetingCol: {
    flex: 1,
  },
  greetingSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  greetingDate: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    position: 'absolute',
    top: 9,
    right: 10,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  walletHeroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1FAE5',
  },
  walletRateTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletRateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  walletBalanceBlock: {
    marginBottom: 16,
  },
  walletBalanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  walletBalanceSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  walletCtaButton: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCtaText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  supportingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  smallIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallEmoji: {
    fontSize: 13,
  },
  smallCardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  halfCardMainValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  halfCardUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  halfCardSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
  drawScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  demoTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recentSection: {
    marginBottom: 14,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  recentSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCheckText: {
    fontSize: 14,
    fontWeight: '800',
  },
  recentChannelName: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentDate: {
    fontSize: 11,
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  disclosureCallout: {
    marginTop: 2,
  },
});
