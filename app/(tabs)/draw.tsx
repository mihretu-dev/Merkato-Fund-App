/**
 * Merkato Fund — Algorithmic Draw Room & Simulator Screen
 *
 * Implements the Day 5 draw simulation & winner announcement:
 * 1. Explicit notice: "DEMO DRAW — NOT A REAL LOTTERY" (No NLA certification claim).
 * 2. Scheduled draw countdown & parameters (20:00:00 EAT model assumption).
 * 3. Shows eligible tickets currently loaded for today's draw with owner names.
 * 4. Safe empty state when 0 eligible tickets exist with CTAs to contribute or seed sample tickets.
 * 5. Deliberate confirmation modal before running the demo draw.
 * 6. Prevents duplicate execution of completed draws with replay/reset option.
 * 7. Celebration winner announcement modal linking directly to the Winner Hub.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, typography, radii, fontFamilies } from '@/src/theme/tokens';
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
import { DrawTicket } from '@/src/domain/types';
import { ExecuteDrawResult } from '@/src/services/interfaces/IMerkatoService';

export default function DrawRoomScreen() {
  const router = useRouter();

  const currentUser = useUserStore((s) => s.currentUser);
  const availablePersonas = useUserStore((s) => s.availablePersonas);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const drawHistory = useDrawStore((s) => s.drawHistory);
  const eligibleDrawTickets = useDrawStore((s) => s.eligibleDrawTickets);
  const isDrawing = useDrawStore((s) => s.isDrawing);
  const lastDrawResult = useDrawStore((s) => s.lastDrawResult);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);
  const executeDemoDraw = useDrawStore((s) => s.executeDemoDraw);
  const addSampleTicket = useDrawStore((s) => s.addSampleTicket);
  const resetActiveDraw = useDrawStore((s) => s.resetActiveDraw);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [activeWinnerData, setActiveWinnerData] = useState<ExecuteDrawResult | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadDrawData(currentUser.id);
    }
  }, [currentUser?.id]);

  // Determine eligible tickets specifically for the active scheduled draw
  const activeDrawId = activeDraw?.id || 'draw-20261017';
  const eligibleTickets = eligibleDrawTickets.filter((t) => t.drawId === activeDrawId);
  const isDrawCompleted = activeDraw?.status === 'completed';

  // Helper to resolve ticket owner persona name
  const getTicketOwnerName = (ticket: DrawTicket): string => {
    const owner = Object.values(availablePersonas).find((u) => u.id === ticket.userId);
    if (owner) return `${owner.fullName} (${owner.role})`;
    return `User ${ticket.userId}`;
  };

  // Trigger confirmation modal
  const handleOpenConfirm = () => {
    if (isDrawCompleted) {
      Alert.alert(
        'Draw Already Completed',
        'Tonight’s draw has already been executed. Use the Replay / Reset action below to run another simulation.'
      );
      return;
    }
    if (eligibleTickets.length === 0) {
      Alert.alert(
        'Zero Eligible Tickets',
        'No eligible tickets are registered for tonight’s draw. Complete a 50 ETB contribution or seed a sample ticket.'
      );
      return;
    }
    setShowConfirmModal(true);
  };

  // Execute demo draw
  const handleExecuteDraw = async () => {
    setShowConfirmModal(false);
    try {
      const res = await executeDemoDraw(activeDrawId);
      setActiveWinnerData(res as unknown as ExecuteDrawResult);
      setShowWinnerModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Draw simulation failed';
      Alert.alert('Draw Engine Notice', msg);
    }
  };

  // Add sample ticket for testing
  const handleSeedSample = async () => {
    try {
      // Alternate between Dawit and Bethlehem as sample ticket holder
      const targetUserId = eligibleTickets.length % 2 === 0 ? 'user-dawit-001' : 'user-bethlehem-002';
      await addSampleTicket(targetUserId, activeDrawId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to seed sample ticket';
      Alert.alert('Error', msg);
    }
  };

  // Replay / reset draw
  const handleReplayDraw = async () => {
    try {
      await resetActiveDraw(activeDrawId);
      setActiveWinnerData(null);
      Alert.alert('Draw Reset', 'Today’s draw instance has been reset to SCHEDULED state. You can now replay the draw simulation.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset draw';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.amharicHeader}>የቀን 1,000,000 ብር የዕጣ ክፍል</Text>
            <Text style={styles.screenTitle}>Algorithmic Draw Room</Text>
            <Text style={styles.screenSubtitle}>
              Daily Algorithmic Selection • Client-Side Prototype
            </Text>
          </View>
          <DemoBadge label="SIMULATION ONLY" />
        </View>

        {/* Mandatory Prominent Notice */}
        <Card style={styles.regulatoryCallout} variant="elevated">
          <View style={styles.regulatoryHeader}>
            <Text style={styles.regulatoryIcon}>⚖️</Text>
            <Text style={styles.regulatoryTitle}>DEMO DRAW — NOT A REAL LOTTERY</Text>
          </View>
          <Text style={styles.regulatoryText}>
            This screen simulates client-side deterministic draw selection for architectural evaluation. It is NOT a production-grade lottery, is NOT certified by the Ethiopian National Lottery Administration (NLA), and awards NO real money.
          </Text>
        </Card>

        {/* Active Draw Overview Card */}
        <Card style={styles.drawCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Today's Scheduled Draw</Text>
              <Text style={styles.cardDate}>Model Cycle: 2026-10-17 • 20:00:00 EAT (Assumption)</Text>
            </View>
            <StatusPill
              status={isDrawCompleted ? 'completed' : 'info'}
              label={isDrawCompleted ? 'DRAW COMPLETED' : 'SCHEDULED • 20:00 EAT'}
            />
          </View>

          {/* Stated Prize */}
          <View style={styles.prizeContainer}>
            <CurrencyDisplay
              amountETB={activeDraw?.prizeAmountETB || 1_000_000}
              label="Stated Capital Prize (Held in 6-Mo Blocked Escrow)"
              size="lg"
              color={colors.accentGold}
            />
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricTile
              label="Assumed Pool Base"
              value={(activeDraw?.participantCount || 24850).toLocaleString()}
              subtitle="Synthetic contributors"
            />
            <MetricTile
              label="Model Daily Inflow"
              value={formatETB(activeDraw?.poolTotalCollectedETB || 1242500)}
              subtitle="50 ETB × 24,850 members"
            />
          </View>

          {/* Demonstration Seed Card */}
          <View style={styles.seedBox}>
            <View style={styles.seedHeader}>
              <Text style={styles.seedLabel}>DEMONSTRATION SEED (EXPLANATION OF PROTOTYPE LOGIC)</Text>
              <StatusPill status="info" label="FNV-1a HASH" size="small" />
            </View>
            <Text style={styles.seedHash} numberOfLines={1} ellipsizeMode="middle">
              {activeDraw?.hashSeed || '0x7f4b82d399c26a5e1104e6c382b9e4a1932e65d836bc49e17b8f95c249a8e210'}
            </Text>
            <Text style={styles.seedNote}>
              This seed illustrates deterministic selection mechanics. True production lotteries require certified Hardware Security Modules (HSM) and NLA-audited randomness.
            </Text>
          </View>

          {/* Draw Trigger Actions */}
          {isDrawCompleted ? (
            <View style={styles.completedActionsBox}>
              <View style={styles.completedBanner}>
                <Text style={styles.completedBannerIcon}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedBannerTitle}>Today’s Draw Already Completed</Text>
                  <Text style={styles.completedBannerDesc}>
                    Winning Ticket: <Text style={styles.boldGold}>{activeDraw?.winningTicketNumber}</Text> • Winner: <Text style={styles.boldText}>{activeDraw?.winnerName}</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.completedButtonsRow}>
                <AppButton
                  title="Inspect Winner Escrow & Yield Hub →"
                  variant="gold"
                  onPress={() => router.push('/(tabs)/winner')}
                  style={{ flex: 2 }}
                />
                <AppButton
                  title="Replay / Reset Draw"
                  variant="outline"
                  onPress={handleReplayDraw}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.actionButtonsContainer}>
              <AppButton
                title={
                  isDrawing
                    ? 'Simulating Algorithmic Selection...'
                    : eligibleTickets.length === 0
                    ? 'No Eligible Tickets to Draw'
                    : `Run Demo Draw (${eligibleTickets.length} Eligible Tickets) →`
                }
                variant="gold"
                loading={isDrawing}
                disabled={isDrawing || eligibleTickets.length === 0}
                onPress={handleOpenConfirm}
                style={{ marginTop: spacing.md }}
              />

              {eligibleTickets.length === 0 && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Seed synthetic sample ticket for testing"
                  onPress={handleSeedSample}
                  style={styles.seedSampleButton}>
                  <Text style={styles.seedSampleText}>
                    + Seed Synthetic Sample Ticket (For Evaluator Testing)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Eligible Tickets for Active Draw Card */}
        <Card style={styles.sectionCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Eligible Tickets in Tonight's Pool</Text>
              <Text style={styles.cardSubtitle}>
                Eligibility Rule: Verified 50 ETB daily payment for cycle 2026-10-17.
              </Text>
            </View>
            <View style={styles.ticketCountBadge}>
              <Text style={styles.ticketCountBadgeText}>
                {eligibleTickets.length} Eligible
              </Text>
            </View>
          </View>

          {eligibleTickets.length > 0 ? (
            <View style={styles.ticketList}>
              {eligibleTickets.map((t, idx) => (
                <View
                  key={t.id}
                  style={[
                    styles.ticketRow,
                    t.isWinningTicket && styles.winningTicketRow,
                  ]}>
                  <View style={styles.ticketLeft}>
                    <Text style={styles.ticketIndexText}>#{idx + 1}</Text>
                    <View>
                      <Text style={styles.ticketItemNumber}>{t.ticketNumber}</Text>
                      <Text style={styles.ticketOwnerText}>
                        Owner: {getTicketOwnerName(t)}
                      </Text>
                      <Text style={styles.ticketItemSub}>
                        Issued {t.issuedAt.replace('T', ' ').slice(0, 16)} EAT
                      </Text>
                    </View>
                  </View>
                  <StatusPill
                    status={t.isWinningTicket ? 'healthy' : 'info'}
                    label={t.isWinningTicket ? 'SELECTED WINNER' : 'ELIGIBLE'}
                    size="small"
                  />
                </View>
              ))}

              {!isDrawCompleted && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Add another sample ticket"
                  onPress={handleSeedSample}
                  style={styles.addAnotherSampleLink}>
                  <Text style={styles.addAnotherSampleText}>
                    + Add Another Synthetic Participant Ticket
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyTicketsBox}>
              <Text style={styles.emptyTicketsIcon}>🎟️</Text>
              <Text style={styles.emptyTicketsTitle}>No Eligible Tickets Loaded</Text>
              <Text style={styles.emptyTicketsText}>
                No participant has completed today’s 50 ETB contribution yet. A draw cannot run without at least one eligible ticket.
              </Text>
              <View style={styles.emptyActionsRow}>
                <AppButton
                  title="Contribute 50 ETB Now →"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/contribute')}
                  style={{ flex: 1 }}
                />
                <AppButton
                  title="Seed Sample Ticket"
                  variant="outline"
                  onPress={handleSeedSample}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}
        </Card>

        {/* Historical Draws Ledger */}
        <Card style={styles.sectionCard} variant="surface">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Historical Draw Log</Text>
              <Text style={styles.cardSubtitle}>
                Deterministic demonstration records of previous draws.
              </Text>
            </View>
            <Text style={styles.historyCountText}>{drawHistory.length} Completed</Text>
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
                    Winning Ticket: {d.winningTicketNumber || 'Awaiting draw'}
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

        {/* Mandatory Safety Notice */}
        <DisclaimerNotice />
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* 1. Deliberate Confirmation Modal                              */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalAmharic}>የዕጣ ማረጋገጫ</Text>
                <Text style={styles.modalTitle}>Confirm Draw Simulation</Text>
              </View>
              <DemoBadge label="SIMULATION" />
            </View>

            <View style={styles.confirmDetailsBox}>
              <Text style={styles.confirmDetailsTitle}>SELECTION PARAMETERS</Text>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Draw Instance:</Text>
                <Text style={styles.confirmValue}>{activeDrawId}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Eligible Tickets:</Text>
                <Text style={[styles.confirmValue, { color: colors.primaryLight, fontWeight: '700' }]}>
                  {eligibleTickets.length} Tickets
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Stated Capital Prize:</Text>
                <Text style={[styles.confirmValue, { color: colors.accentGold, fontWeight: '700' }]}>
                  1,000,000 ETB (Held in Escrow)
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Selection Algorithm:</Text>
                <Text style={styles.confirmValue}>FNV-1a Hash Modulo</Text>
              </View>
            </View>

            <View style={styles.confirmDisclaimerBox}>
              <Text style={styles.confirmDisclaimerText}>
                ⚠️ This action executes an offline client-side demonstration selection. No real lottery prize or financial entitlement will be created.
              </Text>
            </View>

            <View style={styles.modalActionsRow}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowConfirmModal(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Execute Draw Now →"
                variant="gold"
                onPress={handleExecuteDraw}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 2. Winner Announcement Modal                                  */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showWinnerModal && activeWinnerData !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWinnerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.winnerHeader}>
              <Text style={styles.winnerCelebrationIcon}>🏆</Text>
              <Text style={styles.winnerAmharicTitle}>የዕጣው አሸናፊ ተመርጧል!</Text>
              <Text style={styles.winnerMainTitle}>Demonstration Winner Selected</Text>
              <StatusPill status="healthy" label="SIMULATED WINNER — NO MONEY AWARDED" size="small" />
            </View>

            <View style={styles.winnerCardBox}>
              <Text style={styles.winnerTicketHeading}>WINNING TICKET NUMBER</Text>
              <Text style={styles.winnerTicketBig}>
                {activeWinnerData?.winningTicket.ticketNumber}
              </Text>

              <View style={styles.winnerProfileRow}>
                <View style={styles.winnerAvatar}>
                  <Text style={styles.winnerAvatarText}>
                    {activeWinnerData?.winner.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.winnerFullName}>
                    {activeWinnerData?.winner.fullName}
                  </Text>
                  <Text style={styles.winnerRoleSub}>
                    Role: {activeWinnerData?.winner.role.toUpperCase()} • 📍 {activeWinnerData?.winner.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Escrow Terms Summary */}
            <View style={styles.escrowTermsBox}>
              <Text style={styles.escrowTermsTitle}>PROPOSED 6-MONTH ESCROW MODEL</Text>
              <Text style={styles.escrowTermsBullet}>
                • <Text style={styles.boldText}>1,000,000 ETB</Text> placed in CBE custody for 180 days.
              </Text>
              <Text style={styles.escrowTermsBullet}>
                • Accrues claimed <Text style={styles.boldText}>22% annual interest</Text> (~602.74 ETB/day).
              </Text>
              <Text style={styles.escrowTermsBullet}>
                • Daily post-win repayment escalates to <Text style={styles.boldText}>500 ETB + 50 ETB fee</Text>.
              </Text>
              <Text style={styles.escrowTermsDisclaimer}>
                * Illustrative demonstration arithmetic only. Not a binding financial commitment.
              </Text>
            </View>

            <View style={styles.winnerActionsContainer}>
              <AppButton
                title="Inspect Winner Escrow & Repayments →"
                variant="gold"
                onPress={() => {
                  setShowWinnerModal(false);
                  router.push('/(tabs)/winner');
                }}
                fullWidth
                style={{ marginBottom: spacing.xs }}
              />

              <AppButton
                title="Dismiss & Stay in Draw Room"
                variant="outline"
                onPress={() => setShowWinnerModal(false)}
                fullWidth
              />
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
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  screenTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  regulatoryCallout: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  regulatoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  regulatoryIcon: {
    fontSize: 20,
  },
  regulatoryTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.accentGold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  regulatoryText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    lineHeight: 18,
    fontSize: 13,
  },
  drawCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  cardDate: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardSubtitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    marginTop: 2,
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
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  seedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seedLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  seedHash: {
    color: colors.accentGold,
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    marginVertical: 4,
  },
  seedNote: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  actionButtonsContainer: {
    gap: spacing.xs,
  },
  seedSampleButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: 4,
  },
  seedSampleText: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 13,
    fontWeight: '600',
  },
  completedActionsBox: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  completedBannerIcon: {
    fontSize: 26,
  },
  completedBannerTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 15,
    fontWeight: '700',
  },
  completedBannerDesc: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  boldGold: {
    fontFamily: fontFamilies.mono,
    color: colors.accentGold,
    fontWeight: '700',
  },
  boldText: {
    color: colors.dark.textPrimary,
    fontWeight: '700',
  },
  completedButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  ticketCountBadge: {
    backgroundColor: colors.dark.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  ticketCountBadgeText: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  ticketList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  ticketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  ticketIndexText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  ticketItemNumber: {
    fontFamily: fontFamilies.mono,
    fontWeight: '700',
    color: colors.accentGold,
    fontSize: 15,
    letterSpacing: 0.8,
  },
  ticketOwnerText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 13,
    marginTop: 2,
  },
  ticketItemSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  addAnotherSampleLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: 4,
  },
  addAnotherSampleText: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyTicketsBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  emptyTicketsIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  emptyTicketsTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyTicketsText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    marginBottom: spacing.md,
    maxWidth: 400,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  historyCountText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  historyList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.divider,
  },
  historyDate: {
    fontFamily: fontFamilies.sans,
    fontWeight: '600',
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  historyWinner: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  historyTicket: {
    fontFamily: fontFamilies.mono,
    color: colors.accentGold,
    fontSize: 12,
    marginTop: 2,
  },
  historyPrize: {
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.primaryLight,
    fontSize: 15,
    marginBottom: 2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.dark.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
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
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 21,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  confirmDetailsBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  confirmDetailsTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  confirmLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 13,
  },
  confirmValue: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textPrimary,
    fontSize: 13,
  },
  confirmDisclaimerBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: spacing.md,
  },
  confirmDisclaimerText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Winner Modal Specifics
  winnerHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  winnerCelebrationIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  winnerAmharicTitle: {
    fontFamily: fontFamilies.sans,
    color: colors.accentGold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  winnerMainTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginBottom: 8,
  },
  winnerCardBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.accentGold,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  winnerTicketHeading: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  winnerTicketBig: {
    fontFamily: fontFamilies.mono,
    fontSize: 26,
    color: colors.accentGold,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  winnerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  winnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentGoldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerAvatarText: {
    fontFamily: fontFamilies.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  winnerFullName: {
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    fontSize: 15,
  },
  winnerRoleSub: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
  },
  escrowTermsBox: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 6,
  },
  escrowTermsTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  escrowTermsBullet: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  escrowTermsDisclaimer: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  winnerActionsContainer: {
    gap: spacing.xs,
  },
});

