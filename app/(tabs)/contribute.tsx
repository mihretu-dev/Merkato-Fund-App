/**
 * Merkato Fund — Contribution & History Screen
 *
 * Simulates daily 50 ETB micro-contributions across Ethiopian payment channels
 * (Telebirr, CBE Birr, Awash Birr) and displays the synthetic contribution ledger.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
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
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { PaymentChannel } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';

export default function ContributeScreen() {
  const currentUser = useUserStore((s) => s.currentUser);
  const updateCurrentUser = useUserStore((s) => s.updateCurrentUser);

  const contributions = useContributionStore((s) => s.contributions);
  const paidToday = useContributionStore((s) => s.paidToday);
  const isLoading = useContributionStore((s) => s.isLoading);
  const submitDailyContribution = useContributionStore((s) => s.submitDailyContribution);

  const addUserTicket = useDrawStore((s) => s.addUserTicket);

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('telebirr');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const channels: { id: PaymentChannel; label: string; color: string; desc: string }[] = [
    {
      id: 'telebirr',
      label: 'Telebirr',
      color: colors.telebirr,
      desc: 'Instant mobile wallet USSD push',
    },
    {
      id: 'cbe_birr',
      label: 'CBE Birr',
      color: colors.cbeBirr,
      desc: 'Commercial Bank of Ethiopia debit',
    },
    {
      id: 'awash_birr',
      label: 'Awash Birr',
      color: '#B45309',
      desc: 'Awash Bank digital micro-payment',
    },
  ];

  const handlePayContribution = async () => {
    try {
      setSuccessBanner(null);
      const result = await submitDailyContribution(currentUser.id, selectedChannel, 50);

      // Synchronously update stores
      updateCurrentUser(result.updatedUser);
      addUserTicket(result.ticket);

      setSuccessBanner(
        `✅ Simulated 50 ETB payment confirmed via ${selectedChannel.toUpperCase()}! Draw ticket #${result.ticket.ticketNumber} has been issued.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Contribution failed';
      Alert.alert('Payment Simulation', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Daily Contribution</Text>
            <Text style={styles.screenSubtitle}>
              50 ETB / day • Equb Micro-Contribution Pool
            </Text>
          </View>
          <DemoBadge label="SIMULATED PAY" />
        </View>

        {/* Status Metrics */}
        <View style={styles.metricsRow}>
          <MetricTile
            label="Daily Amount"
            value="50.00 ETB"
            subtitle="Standard micro-payment"
            highlight
          />
          <MetricTile
            label="Active Streak"
            value={`${currentUser.activeStreakDays} Days`}
            subtitle="Current persona streak"
          />
        </View>

        {/* Success Banner */}
        {successBanner && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successBanner}</Text>
          </View>
        )}

        {/* Payment Action Card */}
        <Card style={styles.actionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Simulate Today's Contribution</Text>
            <StatusPill
              status={paidToday ? 'healthy' : 'caution'}
              label={paidToday ? 'PAID FOR TODAY' : 'DUE FOR TODAY'}
            />
          </View>

          {paidToday ? (
            <View style={styles.completedNotice}>
              <Text style={styles.completedTitle}>✨ All Set for Today!</Text>
              <Text style={styles.completedDesc}>
                You have already paid your 50 ETB contribution for today (2026-10-17). Your algorithmic draw ticket is active in tonight's draw room.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.channelLabel}>SELECT PAYMENT CHANNEL (SIMULATED):</Text>
              <View style={styles.channelList}>
                {channels.map((ch) => {
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <TouchableOpacity
                      key={ch.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${ch.label} payment channel`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedChannel(ch.id)}
                      style={[
                        styles.channelItem,
                        isSelected && { borderColor: ch.color, backgroundColor: '#0B1E2B' },
                      ]}>
                      <View style={[styles.channelDot, { backgroundColor: ch.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.channelName}>{ch.label}</Text>
                        <Text style={styles.channelDesc}>{ch.desc}</Text>
                      </View>
                      {isSelected && (
                        <Text style={[styles.channelCheck, { color: ch.color }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppButton
                title={isLoading ? 'Processing Simulation...' : `Pay 50 ETB via ${selectedChannel.toUpperCase()}`}
                variant="primary"
                loading={isLoading}
                onPress={handlePayContribution}
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
        </Card>

        {/* Synthetic Ledger / History */}
        <Card style={styles.historyCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contribution History Ledger</Text>
            <Text style={styles.historyCount}>{contributions.length} Records</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Deterministic synthetic transaction records for {currentUser.fullName}.
          </Text>

          <View style={styles.historyList}>
            {contributions.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyRef}>{item.transactionReference}</Text>
                  <Text style={styles.historyChannel}>Channel: {item.channel.toUpperCase()}</Text>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={styles.historyAmount}>{formatETB(item.amountETB)}</Text>
                  <StatusPill status="healthy" label="COMPLETED" size="small" />
                </View>
              </View>
            ))}
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  successBanner: {
    backgroundColor: '#064E3B',
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successBannerText: {
    ...typography.bodySmall,
    color: '#E6FFFA',
    fontWeight: '600',
    lineHeight: 18,
  },
  actionCard: {
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
  },
  completedNotice: {
    backgroundColor: '#0A261D',
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  completedTitle: {
    ...typography.h3,
    color: colors.primaryLight,
    fontSize: 15,
    marginBottom: 4,
  },
  completedDesc: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
  channelLabel: {
    ...typography.label,
    color: colors.dark.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginVertical: spacing.xs,
  },
  channelList: {
    gap: spacing.xs,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
  },
  channelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  channelName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  channelDesc: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  channelCheck: {
    fontSize: 16,
    fontWeight: '900',
    marginLeft: spacing.sm,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  historyCount: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontWeight: '700',
  },
  historyList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.surfaceBorder,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDate: {
    ...typography.body,
    color: colors.dark.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  historyRef: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 1,
  },
  historyChannel: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryLight,
    fontSize: 14,
  },
});
