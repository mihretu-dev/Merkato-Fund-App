/**
 * Merkato Fund — Contribution & Payment Screen
 *
 * Implements the complete Day 4 daily 50 ETB contribution flow:
 * 1. Review daily amount and contribution status (Due vs Paid).
 * 2. Select simulated payment method (Telebirr, CBE Birr, Awash Birr).
 * 3. Deliberate Review & Confirmation modal with demo reference preview.
 * 4. Synthetic contribution processing with rapid-tap debounce and store sync.
 * 5. Success state displaying issued draw ticket, streak update, and navigation shortcuts.
 * 6. Detailed contribution ledger displaying deterministic synthetic records.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
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
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { PaymentChannel, DrawTicket } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';

interface ChannelOption {
  id: PaymentChannel;
  label: string;
  amharicLabel: string;
  color: string;
  desc: string;
  icon: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: 'telebirr',
    label: 'Telebirr',
    amharicLabel: 'ቴሌብር',
    color: colors.telebirr,
    desc: 'Instant mobile wallet USSD push simulation',
    icon: '📱',
  },
  {
    id: 'cbe_birr',
    label: 'CBE Birr',
    amharicLabel: 'ሲቢኢ ብር',
    color: colors.cbeBirr,
    desc: 'Commercial Bank of Ethiopia debit simulation',
    icon: '🏦',
  },
  {
    id: 'awash_birr',
    label: 'Awash Birr',
    amharicLabel: 'አዋሽ ብር',
    color: '#B45309',
    desc: 'Awash Bank digital micro-payment simulation',
    icon: '💳',
  },
];

export default function ContributeScreen() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.currentUser);
  const updateCurrentUser = useUserStore((s) => s.updateCurrentUser);

  const contributions = useContributionStore((s) => s.contributions);
  const paidToday = useContributionStore((s) => s.paidToday);
  const submitDailyContribution = useContributionStore((s) => s.submitDailyContribution);

  const addUserTicket = useDrawStore((s) => s.addUserTicket);

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('telebirr');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success state payload
  const [successData, setSuccessData] = useState<{
    reference: string;
    ticket: DrawTicket;
    streak: number;
    channel: PaymentChannel;
  } | null>(null);

  const selectedChannelInfo = CHANNELS.find((c) => c.id === selectedChannel) || CHANNELS[0];

  // Open review modal with validation
  const handleOpenReview = () => {
    if (paidToday) {
      Alert.alert(
        'Contribution Already Settled',
        'You have already contributed 50 ETB for today (2026-10-17). Duplicate payments are blocked.'
      );
      return;
    }
    setShowReviewModal(true);
  };

  // Confirm and execute simulated payment
  const handleConfirmPayment = async () => {
    if (isSubmitting) return; // Prevent double tap

    setIsSubmitting(true);
    try {
      // Natural local simulation delay (600ms) to provide clear feedback
      await new Promise((resolve) => setTimeout(resolve, 600));

      const result = await submitDailyContribution(currentUser.id, selectedChannel, 50);

      // Ensure stores are in exact sync
      updateCurrentUser(result.updatedUser);
      addUserTicket(result.ticket);

      // Close review modal and trigger success state
      setShowReviewModal(false);
      setSuccessData({
        reference: result.contribution.transactionReference,
        ticket: result.ticket,
        streak: result.updatedUser.activeStreakDays,
        channel: selectedChannel,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Contribution submission failed.';
      Alert.alert('Payment Simulation Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.amharicHeader}>የዕለት መዋጮ ማዕከል</Text>
            <Text style={styles.screenTitle}>Daily Contribution</Text>
            <Text style={styles.screenSubtitle}>
              50.00 ETB / day • Equb Micro-Contribution Pool
            </Text>
          </View>
          <DemoBadge label="SIMULATED CHECKOUT" />
        </View>

        {/* Status Metrics Bar */}
        <View style={styles.metricsRow}>
          <MetricTile
            label="Daily Amount"
            value="50.00 ETB"
            subtitle="Standard micro-payment"
            highlight
          />
          <MetricTile
            label="Current Streak"
            value={`${currentUser.activeStreakDays} Days`}
            subtitle={paidToday ? 'Completed today' : '15 days if paid today'}
          />
          <MetricTile
            label="Simulated Balance"
            value={formatETB(currentUser.simulatedWalletBalanceETB)}
            subtitle="Demo wallet fund"
          />
        </View>

        {/* Primary Action Card: Due vs Paid */}
        <Card style={styles.actionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Today's Contribution Status</Text>
              <Text style={styles.cardDate}>Cycle Date: 2026-10-17 (ጥቅምት 7 2019 ዓ.ም)</Text>
            </View>
            <StatusPill
              status={paidToday ? 'healthy' : 'caution'}
              label={paidToday ? 'PAID FOR TODAY' : 'PAYMENT DUE'}
            />
          </View>

          {paidToday ? (
            /* Completed State View */
            <View style={styles.completedNotice}>
              <View style={styles.completedBadgeRow}>
                <Text style={styles.completedIcon}>✨</Text>
                <Text style={styles.completedTitle}>50 ETB Settled for Today</Text>
              </View>
              <Text style={styles.completedDesc}>
                Your 50 ETB daily contribution for today (2026-10-17) is completed. Your active streak of{' '}
                <Text style={styles.boldText}>{currentUser.activeStreakDays} days</Text> is maintained, and your algorithmic draw ticket is secured in tonight’s 1,000,000 ETB draw pool.
              </Text>

              <View style={styles.completedInfoBox}>
                <Text style={styles.completedInfoLabel}>POOL INTEGRITY POLICY:</Text>
                <Text style={styles.completedInfoText}>
                  Duplicate daily contributions are blocked to preserve fair participation and prevent unintended overcharges. The next contribution window opens tomorrow at 00:00:00 EAT.
                </Text>
              </View>

              <View style={styles.completedButtonsRow}>
                <AppButton
                  title="View in Tonight's Draw Room →"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/draw')}
                  style={{ flex: 1 }}
                />
                <AppButton
                  title="Dashboard"
                  variant="outline"
                  onPress={() => router.push('/(tabs)')}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            /* Unpaid State: Method Selection & Review Trigger */
            <>
              <Text style={styles.channelSectionLabel}>
                CHOOSE SIMULATED PAYMENT CHANNEL:
              </Text>

              <View style={styles.channelList}>
                {CHANNELS.map((ch) => {
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <TouchableOpacity
                      key={ch.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${ch.label} payment channel`}
                      accessibilityState={{ selected: isSelected }}
                      activeOpacity={0.8}
                      onPress={() => setSelectedChannel(ch.id)}
                      style={[
                        styles.channelItem,
                        isSelected && {
                          borderColor: ch.color,
                          backgroundColor: '#0E2429',
                        },
                      ]}>
                      <View style={styles.channelLeft}>
                        <View style={[styles.channelDot, { backgroundColor: ch.color }]}>
                          <Text style={styles.channelIconText}>{ch.icon}</Text>
                        </View>
                        <View style={styles.channelMeta}>
                          <View style={styles.channelTitleRow}>
                            <Text style={styles.channelName}>{ch.label}</Text>
                            <Text style={styles.channelAmharic}>{ch.amharicLabel}</Text>
                          </View>
                          <Text style={styles.channelDesc}>{ch.desc}</Text>
                        </View>
                      </View>

                      <View style={styles.channelRight}>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && { borderColor: ch.color },
                          ]}>
                          {isSelected && (
                            <View
                              style={[
                                styles.radioDot,
                                { backgroundColor: ch.color },
                              ]}
                            />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Card style={styles.safetyCallout} variant="surface">
                <Text style={styles.safetyCalloutTitle}>🛡️ Simulation Notice</Text>
                <Text style={styles.safetyCalloutText}>
                  Payment channels above are demonstration mockups. No real mobile money API (Telebirr USSD, CBE Birr debit) is connected, and no live funds are withdrawn.
                </Text>
              </Card>

              <AppButton
                title={`Review & Pay 50 ETB via ${selectedChannelInfo.label} →`}
                variant="primary"
                onPress={handleOpenReview}
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
        </Card>

        {/* Synthetic Contribution History Ledger */}
        <Card style={styles.historyCard} variant="elevated">
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.cardTitle}>Contribution History Ledger</Text>
              <Text style={styles.cardSubtitle}>
                Verified synthetic contribution records for {currentUser.fullName}.
              </Text>
            </View>
            <View style={styles.historyCountBadge}>
              <Text style={styles.historyCountText}>{contributions.length} Records</Text>
            </View>
          </View>

          <View style={styles.historyList}>
            {contributions.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.historyChannelBadge}>
                      {item.channel === 'telebirr'
                        ? '📱 Telebirr'
                        : item.channel === 'cbe_birr'
                        ? '🏦 CBE Birr'
                        : '💳 Awash Birr'}
                    </Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyRef}>{item.transactionReference}</Text>
                  <Text style={styles.historyStreakLabel}>
                    Maintained Streak Day #{item.streakDay}
                  </Text>
                </View>

                <View style={styles.historyItemRight}>
                  <Text style={styles.historyAmount}>-{formatETB(item.amountETB)}</Text>
                  <StatusPill status="healthy" label="COMPLETED" size="small" />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Mandatory Safety Notice */}
        <DisclaimerNotice />
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* 1. Review & Deliberate Confirmation Modal                     */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSubmitting) setShowReviewModal(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalAmharic}>የክፍያ ማረጋገጫ</Text>
                <Text style={styles.modalTitle}>Review Contribution</Text>
              </View>
              <DemoBadge label="SIMULATION REVIEW" />
            </View>

            {/* Amount Summary */}
            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmountLabel}>CONTRIBUTION AMOUNT</Text>
              <Text style={styles.modalAmountValue}>50.00 ETB</Text>
              <Text style={styles.modalAmountSub}>
                Daily Equb Micro-Contribution • 2026-10-17
              </Text>
            </View>

            {/* Payment Details Table */}
            <View style={styles.reviewTable}>
              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>Payment Channel:</Text>
                <Text style={styles.reviewTableValue}>
                  {selectedChannelInfo.icon} {selectedChannelInfo.label} (Simulated)
                </Text>
              </View>

              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>Payer Profile:</Text>
                <Text style={styles.reviewTableValue}>{currentUser.fullName}</Text>
              </View>

              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>Mobile Number:</Text>
                <Text style={styles.reviewTableValue}>{currentUser.phoneNumber}</Text>
              </View>

              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>New Streak Status:</Text>
                <Text style={[styles.reviewTableValue, { color: colors.accentGold }]}>
                  🔥 {currentUser.activeStreakDays + 1} Consecutive Days
                </Text>
              </View>

              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>Draw Entitlement:</Text>
                <Text style={[styles.reviewTableValue, { color: colors.primaryLight }]}>
                  🎟️ 1 Ticket in Tonight’s 1M ETB Draw
                </Text>
              </View>

              <View style={[styles.reviewTableRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.reviewTableLabel}>Demo Reference:</Text>
                <Text style={[styles.reviewTableValue, styles.monoText]}>
                  DEMO-TX-20261017-PREVIEW
                </Text>
              </View>
            </View>

            {/* Deliberate Confirmation Notice */}
            <View style={styles.reviewNoticeBox}>
              <Text style={styles.reviewNoticeText}>
                ⚠️ This is an offline simulation. Tapping confirm will record one synthetic transaction, increment your streak, and auto-issue your draw ticket. No real money will be charged.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <AppButton
                title="Cancel"
                variant="outline"
                disabled={isSubmitting}
                onPress={() => setShowReviewModal(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title={isSubmitting ? 'Confirming...' : 'Confirm 50 ETB Demo Pay →'}
                variant="gold"
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={handleConfirmPayment}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 2. Success Celebration Modal                                  */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={successData !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Celebration Header */}
            <View style={styles.successHeader}>
              <Text style={styles.successCelebrationIcon}>🎉</Text>
              <Text style={styles.successAmharicTitle}>መዋጮዎ በተሳካ ሁኔታ ተመዝግቧል!</Text>
              <Text style={styles.successTitle}>Contribution Confirmed</Text>
              <StatusPill status="healthy" label="SIMULATED PAYMENT SUCCESS" size="small" />
            </View>

            {/* Receipt Card */}
            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount Paid:</Text>
                <Text style={styles.receiptAmount}>50.00 ETB</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction Reference:</Text>
                <Text style={[styles.receiptValue, styles.monoText]}>
                  {successData?.reference}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Channel:</Text>
                <Text style={styles.receiptValue}>
                  {successData?.channel.toUpperCase()} (Simulated)
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Active Streak:</Text>
                <Text style={[styles.receiptValue, { color: colors.accentGold, fontWeight: '700' }]}>
                  🔥 {successData?.streak} Days Continuous
                </Text>
              </View>
            </View>

            {/* Issued Ticket Display */}
            {successData?.ticket && (
              <View style={styles.issuedTicketCard}>
                <Text style={styles.issuedTicketHeading}>TONIGHT'S ENTRY TICKET ISSUED</Text>
                <Text style={styles.issuedTicketNumber}>
                  {successData.ticket.ticketNumber}
                </Text>
                <Text style={styles.issuedTicketSub}>
                  Entered in 20:00:00 EAT Algorithmic Draw (1,000,000 ETB Prize)
                </Text>
              </View>
            )}

            {/* Navigation Shortcuts */}
            <View style={styles.successActions}>
              <AppButton
                title="View in Tonight's Draw Room →"
                variant="primary"
                onPress={() => {
                  handleCloseSuccess();
                  router.push('/(tabs)/draw');
                }}
                fullWidth
                style={{ marginBottom: spacing.xs }}
              />

              <AppButton
                title="Return to Member Dashboard"
                variant="outline"
                onPress={() => {
                  handleCloseSuccess();
                  router.push('/(tabs)');
                }}
                fullWidth
                style={{ marginBottom: spacing.xs }}
              />

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close receipt and review ledger"
                onPress={handleCloseSuccess}
                style={styles.dismissLink}>
                <Text style={styles.dismissLinkText}>Dismiss & Review Ledger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amharicHeader: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  screenTitle: {
    ...typography.h1,
    fontSize: 24,
    color: colors.dark.textPrimary,
  },
  screenSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.dark.textPrimary,
    fontSize: 16,
  },
  cardDate: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  channelSectionLabel: {
    ...typography.label,
    color: colors.dark.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  channelList: {
    gap: spacing.xs,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    minHeight: 56,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  channelIconText: {
    fontSize: 18,
  },
  channelMeta: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  channelAmharic: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
  },
  channelDesc: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  channelRight: {
    marginLeft: spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  safetyCallout: {
    backgroundColor: '#1E1A10',
    borderColor: 'rgba(217, 162, 59, 0.25)',
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  safetyCalloutTitle: {
    ...typography.h3,
    fontSize: 12,
    color: colors.accentGold,
    marginBottom: 2,
  },
  safetyCalloutText: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
    color: colors.dark.textSecondary,
  },
  completedNotice: {
    backgroundColor: '#0A261D',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  completedIcon: {
    fontSize: 18,
  },
  completedTitle: {
    ...typography.h3,
    color: colors.primaryLight,
    fontSize: 15,
  },
  completedDesc: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    lineHeight: 19,
    fontSize: 13,
  },
  boldText: {
    color: colors.dark.textPrimary,
    fontWeight: '700',
  },
  completedInfoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginVertical: spacing.md,
  },
  completedInfoLabel: {
    ...typography.label,
    fontSize: 9,
    color: colors.dark.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  completedInfoText: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  completedButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  historyCountBadge: {
    backgroundColor: colors.dark.surfaceElevated,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  historyCountText: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  historyList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyItemLeft: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  historyChannelBadge: {
    ...typography.caption,
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 11,
  },
  historyDate: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
  },
  historyRef: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
    marginVertical: 1,
  },
  historyStreakLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 10,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: spacing.sm,
  },
  historyAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalAmharic: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.dark.textPrimary,
  },
  modalAmountBox: {
    backgroundColor: '#0F261E',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalAmountLabel: {
    ...typography.label,
    color: colors.primaryLight,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalAmountValue: {
    ...typography.h1,
    fontSize: 32,
    color: colors.accentGold,
    fontWeight: '800',
  },
  modalAmountSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  reviewTable: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  reviewTableLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 12,
  },
  reviewTableValue: {
    ...typography.caption,
    color: colors.dark.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  reviewNoticeBox: {
    backgroundColor: 'rgba(217, 162, 59, 0.1)',
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(217, 162, 59, 0.25)',
    marginBottom: spacing.md,
  },
  reviewNoticeText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Success Modal Specifics
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successCelebrationIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  successAmharicTitle: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  successTitle: {
    ...typography.h1,
    fontSize: 22,
    color: colors.dark.textPrimary,
    marginBottom: 6,
  },
  receiptCard: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 12,
  },
  receiptValue: {
    ...typography.caption,
    color: colors.dark.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  receiptAmount: {
    ...typography.h3,
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '700',
  },
  issuedTicketCard: {
    backgroundColor: '#0F1E19',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  issuedTicketHeading: {
    ...typography.label,
    color: colors.primaryLight,
    fontSize: 10,
    letterSpacing: 1,
  },
  issuedTicketNumber: {
    ...typography.h2,
    color: colors.accentGold,
    fontSize: 24,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  issuedTicketSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  successActions: {
    gap: spacing.xs,
  },
  dismissLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dismissLinkText: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
