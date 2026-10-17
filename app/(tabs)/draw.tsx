/**
 * Merkato Fund — Algorithmic Draw Room & Tickets Screen
 *
 * Displays live draw parameters (1M ETB prize, participants, SHA-256 transparency seed),
 * active user entry tickets, recent draw history, and an interactive demonstration draw simulator.
 */

import React, { useState } from 'react';
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
import { useDrawStore } from '@/src/stores/useDrawStore';
import { formatETB } from '@/src/domain/calculations/currency';

export default function DrawRoomScreen() {
  const currentUser = useUserStore((s) => s.currentUser);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const drawHistory = useDrawStore((s) => s.drawHistory);
  const userTickets = useDrawStore((s) => s.userTickets);
  const isDrawing = useDrawStore((s) => s.isDrawing);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);
  const executeDemoDraw = useDrawStore((s) => s.executeDemoDraw);

  const handleSimulateDraw = async () => {
    try {
      const res = await executeDemoDraw();
      Alert.alert(
        '🎉 Demonstration Draw Executed!',
        `Winning Ticket: ${res.winningTicket.ticketNumber}\nWinner: ${res.winner.fullName}\n\nNotice: This is a client-side demonstration simulation for review purposes only.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Draw simulation failed';
      Alert.alert('Simulation Error', msg);
    }
  };

  const currentDrawTickets = userTickets.filter(
    (t) => t.drawId === activeDraw?.id || t.drawId === lastDrawResult?.draw.id
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Algorithmic Draw Room</Text>
            <Text style={styles.screenSubtitle}>
              Daily 1,000,000 ETB Algorithmic Selection
            </Text>
          </View>
          <DemoBadge label="DEMO SIMULATION" />
        </View>

        {/* Live Draw Overview Card */}
        <Card style={styles.drawCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Scheduled Draw</Text>
            <StatusPill
              status={activeDraw?.status === 'completed' ? 'completed' : 'info'}
              label={activeDraw?.status === 'completed' ? 'DRAW COMPLETED' : 'SCHEDULED • 20:00 EAT'}
            />
          </View>

          <View style={styles.prizeContainer}>
            <CurrencyDisplay
              amountETB={activeDraw?.prizeAmountETB || 1_000_000}
              label="Stated Capital Prize"
              size="lg"
              color={colors.accentGold}
            />
          </View>

          <View style={styles.metricsGrid}>
            <MetricTile
              label="Participants"
              value={(activeDraw?.participantCount || 24850).toLocaleString()}
              subtitle="Daily contributors"
            />
            <MetricTile
              label="Pool Collected"
              value={formatETB(activeDraw?.poolTotalCollectedETB || 1242500)}
              subtitle="50 ETB / member"
            />
          </View>

          {/* Transparency Seed */}
          <View style={styles.seedBox}>
            <Text style={styles.seedLabel}>SHA-256 TRANSPARENCY HASH SEED</Text>
            <Text style={styles.seedHash} numberOfLines={1} ellipsizeMode="middle">
              {activeDraw?.hashSeed || '0x7f4b82d399c26a5e1104e6c382b9e4a1932e65d836bc49e17b8f95c249a8e210'}
            </Text>
            <Text style={styles.seedNote}>
              Provably fair demonstration seed generated prior to ticket submission window.
            </Text>
          </View>

          {/* Draw Action Button */}
          <AppButton
            title={isDrawing ? 'Simulating Algorithmic Draw...' : 'Simulate Live Demonstration Draw'}
            variant="gold"
            loading={isDrawing}
            onPress={handleSimulateDraw}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Latest Draw Result Box if simulated */}
        {lastDrawResult && (
          <Card style={styles.winnerCard} variant="elevated">
            <View style={styles.cardHeader}>
              <Text style={styles.winnerTitle}>🎉 Latest Demonstration Result</Text>
              <StatusPill status="completed" label="SIMULATED" size="small" />
            </View>

            <View style={styles.winnerDetails}>
              <Text style={styles.winnerTicketNumber}>
                {lastDrawResult.winningTicket.ticketNumber}
              </Text>
              <Text style={styles.winnerNameText}>
                Winner: {lastDrawResult.winner.fullName} ({lastDrawResult.winner.role})
              </Text>
              <Text style={styles.winnerMetaText}>
                Timestamp: {lastDrawResult.draw.completedAt?.replace('T', ' ').slice(0, 19)} EAT
              </Text>
              <Text style={styles.winnerDisclaimer}>
                ⚠️ This draw was executed client-side for demonstration and architectural evaluation. Not certified by the National Lottery Administration.
              </Text>
            </View>
          </Card>
        )}

        {/* User's Entry Tickets */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Entry Tickets</Text>
            <Text style={styles.ticketCountText}>
              {currentDrawTickets.length} Active for {currentUser.fullName.split(' ')[0]}
            </Text>
          </View>

          {currentDrawTickets.length > 0 ? (
            <View style={styles.ticketList}>
              {currentDrawTickets.map((t) => (
                <View
                  key={t.id}
                  style={[
                    styles.ticketRow,
                    t.isWinningTicket && styles.winningTicketRow,
                  ]}>
                  <View>
                    <Text style={styles.ticketItemNumber}>{t.ticketNumber}</Text>
                    <Text style={styles.ticketItemSub}>
                      Issued: {t.issuedAt.replace('T', ' ').slice(0, 16)} EAT
                    </Text>
                  </View>
                  <StatusPill
                    status={t.isWinningTicket ? 'healthy' : 'info'}
                    label={t.isWinningTicket ? 'WINNING TICKET' : 'ENTERED'}
                    size="small"
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTicketsBox}>
              <Text style={styles.emptyTicketsText}>
                No tickets issued yet for today’s draw. Go to the Contribute tab and make your 50 ETB daily contribution to receive your ticket.
              </Text>
            </View>
          )}
        </Card>

        {/* Historical Draws Ledger */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Previous Draw Results</Text>
            <Text style={styles.ticketCountText}>{drawHistory.length} Recorded</Text>
          </View>

          <View style={styles.historyList}>
            {drawHistory.map((d) => (
              <View key={d.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDate}>{d.drawDate}</Text>
                  <Text style={styles.historyWinner}>
                    Winner: {d.winnerName || 'In progress'}
                  </Text>
                  <Text style={styles.historyTicket}>
                    Ticket: {d.winningTicketNumber || 'Awaiting draw'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyPrize}>{formatETB(d.prizeAmountETB)}</Text>
                  <StatusPill
                    status={d.status === 'completed' ? 'completed' : 'info'}
                    label={d.status.toUpperCase()}
                    size="small"
                  />
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
  drawCard: {
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
  prizeContainer: {
    marginVertical: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  seedBox: {
    backgroundColor: '#0F172A',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
  },
  seedLabel: {
    ...typography.label,
    color: colors.dark.textMuted,
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  seedHash: {
    ...typography.bodySmall,
    color: colors.accentGold,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  seedNote: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  winnerCard: {
    marginBottom: spacing.md,
    backgroundColor: '#1E170A',
    borderColor: colors.accentGoldDark,
    borderWidth: 1.5,
  },
  winnerTitle: {
    ...typography.h3,
    color: colors.accentGold,
    fontSize: 15,
  },
  winnerDetails: {
    marginTop: spacing.xs,
  },
  winnerTicketNumber: {
    ...typography.h2,
    color: colors.accentGold,
    fontSize: 22,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  winnerNameText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  winnerMetaText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  winnerDisclaimer: {
    fontSize: 10,
    color: colors.accentGoldLight,
    marginTop: spacing.sm,
    lineHeight: 14,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  ticketCountText: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontWeight: '700',
  },
  ticketList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
  },
  winningTicketRow: {
    borderColor: colors.accentGold,
    backgroundColor: '#1A180E',
  },
  ticketItemNumber: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accentGold,
    fontSize: 15,
    letterSpacing: 1,
  },
  ticketItemSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  emptyTicketsBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  emptyTicketsText: {
    ...typography.bodySmall,
    color: colors.dark.textMuted,
    lineHeight: 18,
  },
  historyList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.surfaceBorder,
  },
  historyDate: {
    ...typography.body,
    fontWeight: '600',
    color: colors.dark.textPrimary,
    fontSize: 13,
  },
  historyWinner: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
  historyTicket: {
    ...typography.caption,
    color: colors.accentGold,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  historyPrize: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryLight,
    fontSize: 13,
    marginBottom: 2,
  },
});
