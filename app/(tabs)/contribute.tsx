/**
 * Merkato Fund — Contribution & Payment Screen
 *
 * Hierarchy:
 * 1. Compact header with back navigation.
 * 2. Focused 50 ETB Daily Contribution card.
 * 3. Grouped payment channels with clear radio selection.
 * 4. "Continue" CTA in comfortable reach right below channels.
 * 5. Low-profile simulation notice.
 * 6. Compact transaction history with "View all" expansion.
 * 7. Preserved two-step confirmation modal & receipt dialog.
 * 8. Complete English and Amharic localization.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/tokens';
import { Card, AppButton, DisclaimerNotice } from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { PaymentChannel, DrawTicket } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';
import { useTranslation } from '@/src/i18n/useTranslation';

interface ChannelOption {
  id: PaymentChannel;
  labelKey: 'telebirr' | 'cbeBirr' | 'awashBirr';
  subtitleKey: 'telebirrDesc' | 'cbeBirrDesc' | 'awashBirrDesc';
  icon: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: 'telebirr',
    labelKey: 'telebirr',
    subtitleKey: 'telebirrDesc',
    icon: '📱',
  },
  {
    id: 'cbe_birr',
    labelKey: 'cbeBirr',
    subtitleKey: 'cbeBirrDesc',
    icon: '🏦',
  },
  {
    id: 'awash_birr',
    labelKey: 'awashBirr',
    subtitleKey: 'awashBirrDesc',
    icon: '💳',
  },
];

export default function ContributeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, isDark } = useTheme();
  const { t, format, isAmharic } = useTranslation();

  const currentUser = useUserStore((s) => s.currentUser);
  const updateCurrentUser = useUserStore((s) => s.updateCurrentUser);

  const contributions = useContributionStore((s) => s.contributions);
  const paidToday = useContributionStore((s) => s.paidToday);
  const submitDailyContribution = useContributionStore((s) => s.submitDailyContribution);

  const addUserTicket = useDrawStore((s) => s.addUserTicket);

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('telebirr');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  // Success state payload
  const [successData, setSuccessData] = useState<{
    reference: string;
    ticket: DrawTicket;
    streak: number;
    channel: PaymentChannel;
  } | null>(null);

  const selectedChannelInfo = CHANNELS.find((c) => c.id === selectedChannel) || CHANNELS[0];
  const visibleContributions = showAllHistory ? contributions : contributions.slice(0, 2);

  const handleOpenReview = () => {
    if (paidToday) {
      Alert.alert(
        isAmharic ? 'መዋጮ ተከናውኗል' : 'Contribution Settled',
        isAmharic
          ? 'የዛሬውን 50 ብር መዋጮ አስቀድመው አጠናቀዋል። ተጨማሪ ተደጋጋሚ ክፍያዎች ተገድበዋል።'
          : 'You have already contributed 50 ETB for today (2026-10-17). Duplicate payments are blocked to protect your simulated balance.'
      );
      return;
    }
    setShowReviewModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await submitDailyContribution(currentUser.id, selectedChannel, 50);

      updateCurrentUser(result.updatedUser);
      addUserTicket(result.ticket);

      setShowReviewModal(false);
      setSuccessData({
        reference: result.contribution.transactionReference,
        ticket: result.ticket,
        streak: result.updatedUser.activeStreakDays,
        channel: selectedChannel,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isAmharic ? 'መዋጮው አልተሳካም' : 'Contribution submission failed.');
      Alert.alert(isAmharic ? 'የክፍያ ማሳሰቢያ' : 'Payment Notice', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* 1. Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard"
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}>
            <Text style={[styles.backArrow, { color: theme.textPrimary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {t.contribute.title}
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* 2. Hero Card: Daily Contribution 50 ETB */}
        <Card style={styles.heroCard} variant="surface">
          <View style={styles.heroRow}>
            <View style={[styles.heroIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Text style={styles.heroIconText}>💵</Text>
            </View>
            <View style={styles.heroTextCol}>
              <Text style={[styles.heroSubLabel, { color: theme.textSecondary }]}>
                {t.contribute.fixedDailyAmount}
              </Text>
              <Text style={[styles.heroAmount, { color: theme.textPrimary }]}>
                50 {t.common.currencyETB}
              </Text>
              <Text style={[styles.heroBenefit, { color: paidToday ? colors.primary : theme.textMuted }]}>
                {paidToday ? (isAmharic ? '✓ የዛሬው ተጠናቋል' : '✓ Settled for today') : t.contribute.streakNotice}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Payment Channel Selection */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.contribute.selectPaymentMethod}
          </Text>
        </View>

        <Card style={styles.channelCard} variant="surface">
          {CHANNELS.map((ch, index) => {
            const isSelected = selectedChannel === ch.id;
            const channelLabel = t.contribute[ch.labelKey];
            const channelSubtitle = t.contribute[ch.subtitleKey];

            return (
              <TouchableOpacity
                key={ch.id}
                accessibilityRole="radio"
                accessibilityLabel={`Select ${channelLabel}`}
                accessibilityState={{ checked: isSelected }}
                onPress={() => setSelectedChannel(ch.id)}
                style={[
                  styles.channelRow,
                  {
                    borderBottomColor: theme.surfaceBorder,
                    borderBottomWidth: index < CHANNELS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}>
                <View style={styles.channelLeft}>
                  <View style={[styles.channelIconBox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' }]}>
                    <Text style={styles.channelIcon}>{ch.icon}</Text>
                  </View>
                  <View>
                    <Text style={[styles.channelLabel, { color: theme.textPrimary }]}>
                      {channelLabel}
                    </Text>
                    <Text style={[styles.channelSub, { color: theme.textMuted }]}>
                      {channelSubtitle}
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? colors.primary : (isDark ? '#334155' : '#CBD5E1'),
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}>
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* 4. Primary Action Button directly below channels */}
        <AppButton
          title={paidToday ? (isAmharic ? 'የዛሬውን የዕጣ ክፍል ይመልከቱ →' : "View in Tonight's Draw Room →") : (isAmharic ? 'ቀጥል →' : 'Continue →')}
          variant="primary"
          onPress={paidToday ? () => router.push('/(tabs)/draw') : handleOpenReview}
          style={styles.continueButton}
        />

        {/* 5. Minimal Disclosure Notice */}
        <DisclaimerNotice
          icon="ℹ"
          message={isAmharic ? 'ይህ የሙከራ ክፍያ ነው። ምንም እውነተኛ ገንዘብ አይቆረጥም።' : 'This is a simulated payment. No real money will be charged.'}
          style={styles.disclosure}
        />

        {/* 6. Recent Contributions (Compact with View All expansion) */}
        {contributions.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
              <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>
                {t.contribute.ledgerTitle}
              </Text>
              {contributions.length > 2 && (
                <TouchableOpacity onPress={() => setShowAllHistory(!showAllHistory)}>
                  <Text style={[styles.toggleHistoryText, { color: colors.primary }]}>
                    {showAllHistory ? (isAmharic ? 'አሳጥር' : 'Show less') : (isAmharic ? `ሁሉንም (${contributions.length})` : `View all (${contributions.length})`)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Card style={styles.historyCard} variant="surface">
              {visibleContributions.map((c, idx) => (
                <View
                  key={c.id}
                  style={[
                    styles.historyItem,
                    {
                      borderBottomColor: theme.surfaceBorder,
                      borderBottomWidth: idx < visibleContributions.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}>
                  <View style={styles.historyItemLeft}>
                    <View style={[styles.recentCheckBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)' }]}>
                      <Text style={[styles.recentCheckMark, { color: colors.primary }]}>✓</Text>
                    </View>
                    <View>
                      <Text style={[styles.historyChannel, { color: theme.textPrimary }]}>
                        {c.date} • {c.channel === 'telebirr' ? 'Telebirr' : c.channel === 'cbe_birr' ? 'CBE Birr' : 'Awash Birr'}
                      </Text>
                      <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                        {t.contribute.statusConfirmed} • 50 {t.common.currencyETB}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyAmount, { color: theme.textPrimary }]}>
                      50 {t.common.currencyETB}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* 7. Review & Confirmation Modal */}
        <Modal
          visible={showReviewModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReviewModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'መዋጮውን ያረጋግጡ' : 'Confirm Contribution'}
              </Text>

              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                {isAmharic ? 'የዕለታዊ መዋጮዎን ዝርዝር ይመልከቱ፡' : 'Review your simulated daily micro-contribution details:'}
              </Text>

              <View style={[styles.reviewRow, { borderBottomColor: theme.surfaceBorder }]}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>{isAmharic ? 'መጠን' : 'Amount'}</Text>
                <Text style={[styles.reviewValue, { color: theme.textPrimary }]}>50.00 {t.common.currencyETB}</Text>
              </View>

              <View style={[styles.reviewRow, { borderBottomColor: theme.surfaceBorder }]}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>{isAmharic ? 'የመክፈያ ዘዴ' : 'Payment Channel'}</Text>
                <Text style={[styles.reviewValue, { color: theme.textPrimary }]}>{t.contribute[selectedChannelInfo.labelKey]}</Text>
              </View>

              <View style={[styles.reviewRow, { borderBottomColor: theme.surfaceBorder }]}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary }]}>{isAmharic ? 'ሽልማት' : 'Reward'}</Text>
                <Text style={[styles.reviewValue, { color: colors.primary }]}>{isAmharic ? '1 የዕጣ ትኬት ተዘጋጅቷል' : '1 Draw Ticket Issued'}</Text>
              </View>

              <View style={styles.modalActions}>
                <AppButton
                  title={t.common.cancel}
                  variant="outline"
                  onPress={() => setShowReviewModal(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <AppButton
                  title={isSubmitting ? t.common.loading : t.common.confirm}
                  variant="primary"
                  loading={isSubmitting}
                  onPress={handleConfirmPayment}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* 8. Success Receipt Modal */}
        <Modal
          visible={successData !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSuccessData(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <View style={[styles.receiptIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Text style={styles.receiptCheckEmoji}>✓</Text>
              </View>

              <Text style={[styles.modalTitle, { color: theme.textPrimary, textAlign: 'center' }]}>
                {t.contribute.successTitle}
              </Text>

              <Text style={[styles.modalSub, { color: theme.textSecondary, textAlign: 'center' }]}>
                {isAmharic
                  ? `50 ብር በ${successData?.channel} በተሳካ ሁኔታ ተመዝግቧል።`
                  : `50 ETB simulated payment recorded via ${successData?.channel}.`}
              </Text>

              <View style={[styles.receiptCard, { backgroundColor: isDark ? '#0B1220' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>{isAmharic ? 'የዕጣ ትኬት' : 'Draw Ticket'}</Text>
                  <Text style={[styles.receiptValueHighlight, { color: colors.primary }]}>
                    #{successData?.ticket.ticketNumber}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>{isAmharic ? 'ተከታታይ ቀናት' : 'Active Streak'}</Text>
                  <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                    {format(t.home.streakDays, { days: successData?.streak || 1 })}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: theme.textSecondary }]}>{isAmharic ? 'የማረጋገጫ ቁጥር' : 'Ref #'}</Text>
                  <Text style={[styles.receiptValueMono, { color: theme.textMuted }]}>
                    {successData?.reference}
                  </Text>
                </View>
              </View>

              <AppButton
                title={isAmharic ? 'ወደ ዕጣ ክፍሉ ይሂዱ →' : "Go to Tonight's Draw Room"}
                variant="primary"
                onPress={() => {
                  setSuccessData(null);
                  router.push('/(tabs)/draw');
                }}
                style={{ width: '100%', marginTop: 8 }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 36,
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroIconText: {
    fontSize: 22,
  },
  heroTextCol: {
    flex: 1,
  },
  heroSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroBenefit: {
    fontSize: 12,
    marginTop: 3,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  channelCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 16,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelIcon: {
    fontSize: 20,
  },
  channelLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  channelSub: {
    fontSize: 12,
    marginTop: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    marginBottom: 12,
  },
  disclosure: {
    marginBottom: 20,
  },
  historySection: {
    marginBottom: 16,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleHistoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentCheckBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCheckMark: {
    fontSize: 13,
    fontWeight: '800',
  },
  historyChannel: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewLabel: {
    fontSize: 13,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  receiptIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  receiptCheckEmoji: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  receiptCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 16,
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
  },
  receiptValueHighlight: {
    fontSize: 14,
    fontWeight: '800',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  receiptValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
