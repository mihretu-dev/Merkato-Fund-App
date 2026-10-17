/**
 * Merkato Fund — Contribution & Payment Screen
 *
 * Premium mobile payment experience:
 * 1. Compact screen heading with demo checkout indicator
 * 2. Dominant 50.00 ETB payment amount & dynamic Due/Paid status
 * 3. Restrained payment method selection (Telebirr, CBE Birr, Awash Birr)
 * 4. Prominent Review & Confirm action button
 * 5. Refined confirmation modal and success receipt flow
 * 6. Secondary contribution history ledger with tabular numerical alignment
 * 7. Concise prototype disclosures and safe area handling
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

import { colors, spacing, typography, radii, fontFamilies } from '@/src/theme/tokens';
import {
  Card,
  AppButton,
  DemoBadge,
  StatusPill,
  DisclaimerNotice,
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
  const insets = useSafeAreaInsets();

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
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 16) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* 1. Compact Screen Heading */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={styles.screenTitle}>Daily Contribution</Text>
            <Text style={styles.screenSubtitle}>
              Daily 50 ETB micro-contribution • Ethiopian Equb Pool
            </Text>
          </View>
          <DemoBadge compact label="SIMULATED" />
        </View>

        {/* 2. Primary Payment Amount & Status Hero Card */}
        <Card
          style={[styles.heroCard, !paidToday && styles.heroCardDue]}
          variant="elevated">
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>TODAY'S CONTRIBUTION AMOUNT</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroAmount}>50.00</Text>
                <Text style={styles.heroCurrency}>ETB</Text>
              </View>
            </View>
            <StatusPill
              status={paidToday ? 'healthy' : 'caution'}
              label={paidToday ? 'PAID TODAY' : 'DUE TODAY'}
            />
          </View>

          <Text style={styles.heroDescription}>
            {paidToday
              ? `✓ 50 ETB settled for today (2026-10-17). Active streak maintained at ${currentUser.activeStreakDays} days & entered into tonight's 1,000,000 ETB draw.`
              : `Contribute 50 ETB to maintain your ${currentUser.activeStreakDays}-day streak and secure 1 algorithmic ticket for tonight's 1,000,000 ETB CBE escrow draw.`}
          </Text>

          {/* Quick Context Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🔥 Streak: {currentUser.activeStreakDays} Days</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                💼 Wallet: {formatETB(currentUser.simulatedWalletBalanceETB)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Conditional Flow: Paid Today vs Payment Method Selection */}
        {paidToday ? (
          /* Already Paid View */
          <Card style={styles.settledCard} variant="surface">
            <View style={styles.settledHeaderRow}>
              <Text style={styles.settledIcon}>✨</Text>
              <View style={styles.settledTextCol}>
                <Text style={styles.settledTitle}>50 ETB Settled for Today</Text>
                <Text style={styles.settledSub}>
                  Your daily contribution is complete. Duplicate payments are blocked to protect your simulated wallet.
                </Text>
              </View>
            </View>

            <View style={styles.settledActionsRow}>
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
          </Card>
        ) : (
          /* Unpaid View: Channel Selection & Primary Action */
          <Card style={styles.selectionCard} variant="elevated">
            <Text style={styles.sectionHeaderLabel}>
              SELECT SIMULATED PAYMENT CHANNEL
            </Text>

            <View style={styles.channelList}>
              {CHANNELS.map((ch) => {
                const isSelected = selectedChannel === ch.id;
                return (
                  <TouchableOpacity
                    key={ch.id}
                    accessibilityRole="radio"
                    accessibilityLabel={`Select ${ch.label} payment channel`}
                    accessibilityState={{ checked: isSelected }}
                    activeOpacity={0.8}
                    onPress={() => setSelectedChannel(ch.id)}
                    style={[
                      styles.channelItem,
                      isSelected && styles.channelItemSelected,
                    ]}>
                    <View style={styles.channelLeft}>
                      <View style={[styles.channelIconBox, isSelected && styles.channelIconBoxSelected]}>
                        <Text style={styles.channelIcon}>{ch.icon}</Text>
                      </View>
                      <View style={styles.channelMeta}>
                        <View style={styles.channelNameRow}>
                          <Text style={[styles.channelName, isSelected && styles.channelNameSelected]}>
                            {ch.label}
                          </Text>
                          <Text style={styles.channelAmharic}>{ch.amharicLabel}</Text>
                        </View>
                        <Text style={styles.channelDesc}>{ch.desc}</Text>
                      </View>
                    </View>

                    <View style={styles.channelRight}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Simulation Notice Callout */}
            <View style={styles.simNoticeCallout}>
              <Text style={styles.simNoticeIcon}>🛡️</Text>
              <Text style={styles.simNoticeText}>
                Simulation Notice: Payment channels above are offline demonstration mockups. No real mobile money API (Telebirr USSD / CBE debit) is connected, and no live funds are debited.
              </Text>
            </View>

            {/* Primary Action Button */}
            <AppButton
              title={`Review 50 ETB via ${selectedChannelInfo.label} →`}
              variant="primary"
              onPress={handleOpenReview}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* 4. Secondary Section: Contribution History Ledger */}
        <Card style={styles.historyCard} variant="surface">
          <View style={styles.historyHeaderRow}>
            <View>
              <Text style={styles.historyTitle}>Contribution History</Text>
              <Text style={styles.historySubtitle}>
                Verified synthetic contribution records for {currentUser.fullName}
              </Text>
            </View>
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>{contributions.length} Records</Text>
            </View>
          </View>

          <View style={styles.historyList}>
            {contributions.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.historyItemRow,
                  index === contributions.length - 1 && styles.historyItemRowLast,
                ]}>
                <View style={styles.historyItemLeft}>
                  <View style={styles.historyItemIconBox}>
                    <Text style={styles.historyItemIcon}>
                      {item.channel === 'telebirr'
                        ? '📱'
                        : item.channel === 'cbe_birr'
                        ? '🏦'
                        : '💳'}
                    </Text>
                  </View>
                  <View style={styles.historyItemMeta}>
                    <Text style={styles.historyItemChannel}>
                      {item.channel === 'telebirr'
                        ? 'Telebirr Micro-Pay'
                        : item.channel === 'cbe_birr'
                        ? 'CBE Birr'
                        : 'Awash Birr'}
                    </Text>
                    <Text style={styles.historyItemDate}>
                      {item.date} • Streak Day #{item.streakDay}
                    </Text>
                    <Text style={styles.historyItemRef} numberOfLines={1}>
                      {item.transactionReference}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyItemRight}>
                  <Text style={styles.historyItemAmount}>
                    -{formatETB(item.amountETB)}
                  </Text>
                  <StatusPill status="healthy" label="COMPLETED" size="small" />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* 5. Prototype Disclaimer */}
        <DisclaimerNotice />
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* Review & Deliberate Confirmation Modal                        */}
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
              <DemoBadge compact label="SIMULATION" />
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
                <Text style={[styles.reviewTableValue, { color: colors.accentGold, fontWeight: '700' }]}>
                  🔥 {currentUser.activeStreakDays + 1} Consecutive Days
                </Text>
              </View>

              <View style={styles.reviewTableRow}>
                <Text style={styles.reviewTableLabel}>Draw Entitlement:</Text>
                <Text style={[styles.reviewTableValue, { color: colors.primaryLight, fontWeight: '700' }]}>
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
      {/* Success Receipt Celebration Modal                             */}
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
    paddingTop: spacing.xs,
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
  topBarLeft: {
    flex: 1,
    marginRight: spacing.xs,
  },
  screenTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  // 2. Hero Card
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
    marginBottom: spacing.xs,
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
  heroDescription: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  chipText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // 3. Settled State Card
  settledCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderColor: colors.status.healthy,
    borderWidth: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  settledHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  settledIcon: {
    fontSize: 24,
  },
  settledTextCol: {
    flex: 1,
  },
  settledTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.status.healthy,
    fontSize: 16,
    fontWeight: '700',
  },
  settledSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  settledActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  // 4. Selection Card
  selectionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sectionHeaderLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
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
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    minHeight: 56,
  },
  channelItemSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: '#0F2622',
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  channelIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  channelIconBoxSelected: {
    borderColor: colors.primaryLight,
  },
  channelIcon: {
    fontSize: 18,
  },
  channelMeta: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelName: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  channelNameSelected: {
    color: colors.primaryLight,
  },
  channelAmharic: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
  },
  channelDesc: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  channelRight: {
    paddingLeft: spacing.xs,
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
  radioCircleSelected: {
    borderColor: colors.primaryLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
  },
  simNoticeCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  simNoticeIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  simNoticeText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGoldLight,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },

  // 5. History Card
  historyCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  historyTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  historySubtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  historyBadge: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  historyBadgeText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  historyList: {
    marginTop: spacing.xs,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyItemRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  historyItemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  historyItemIcon: {
    fontSize: 15,
  },
  historyItemMeta: {
    flex: 1,
  },
  historyItemChannel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  historyItemDate: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  historyItemRef: {
    fontFamily: fontFamilies.mono,
    color: colors.dark.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  historyItemAmount: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    color: colors.dark.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  // 6. Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.dark.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalAmharic: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark.textPrimary,
  },
  modalAmountBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  modalAmountLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  modalAmountValue: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    fontSize: 30,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginVertical: 4,
  },
  modalAmountSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  reviewTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  reviewTableLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
  },
  reviewTableValue: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  monoText: {
    fontFamily: fontFamilies.mono,
  },
  reviewNoticeBox: {
    backgroundColor: '#1C1608',
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: spacing.md,
  },
  reviewNoticeText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGoldLight,
    fontSize: 11,
    lineHeight: 15,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Success Modal
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successCelebrationIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  successAmharicTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.status.healthy,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  successTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark.textPrimary,
    marginBottom: 6,
  },
  receiptCard: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    gap: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
  },
  receiptAmount: {
    fontFamily: fontFamilies.sans,
    fontVariant: ['tabular-nums'],
    color: colors.status.healthy,
    fontSize: 17,
    fontWeight: '800',
  },
  receiptValue: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  issuedTicketCard: {
    backgroundColor: '#0F261E',
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  issuedTicketHeading: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  issuedTicketNumber: {
    fontFamily: fontFamilies.mono,
    color: colors.accentGold,
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  issuedTicketSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  successActions: {
    alignItems: 'center',
  },
  dismissLink: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  dismissLinkText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
