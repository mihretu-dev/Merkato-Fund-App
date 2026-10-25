/**
 * Merkato Fund — Algorithmic Draw Room Screen
 *
 * Hierarchy:
 * 1. Prize-pool hero card (1,000,000 ETB).
 * 2. Compact supporting row (participants & countdown).
 * 3. User's ticket status card & primary user action.
 * 4. Distinct demo control: "Issue Sample Ticket" (clearly labeled for evaluators).
 * 5. Concise simulation disclosure.
 * 6. Expandable algorithm mechanics accordion for evaluators.
 * 7. Complete English and Amharic localization.
 */

import React, { useState, useEffect } from 'react';
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
import { useDrawStore } from '@/src/stores/useDrawStore';
import { formatETB } from '@/src/domain/calculations/currency';
import { DrawTicket } from '@/src/domain/types';
import { ExecuteDrawResult } from '@/src/services/interfaces/IMerkatoService';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function DrawRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, isDark } = useTheme();
  const { t, format, isAmharic } = useTranslation();

  const currentUser = useUserStore((s) => s.currentUser);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const eligibleDrawTickets = useDrawStore((s) => s.eligibleDrawTickets);
  const isDrawing = useDrawStore((s) => s.isDrawing);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);
  const executeDemoDraw = useDrawStore((s) => s.executeDemoDraw);
  const addSampleTicket = useDrawStore((s) => s.addSampleTicket);
  const resetActiveDraw = useDrawStore((s) => s.resetActiveDraw);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [activeWinnerData, setActiveWinnerData] = useState<ExecuteDrawResult | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadDrawData(currentUser.id);
    }
  }, [currentUser?.id]);

  const activeDrawId = activeDraw?.id || 'draw-20261017';
  const eligibleTickets = eligibleDrawTickets.filter((t) => t.drawId === activeDrawId);
  const isDrawCompleted = activeDraw?.status === 'completed';

  const userTicket = eligibleTickets.find((t) => t.userId === currentUser.id);

  const handleOpenConfirm = () => {
    if (isDrawCompleted) {
      Alert.alert(
        isAmharic ? 'ዕጣው ተጠናቋል' : 'Draw Completed',
        isAmharic
          ? 'የዛሬ ማታው ዕጣ አስቀድሞ ተካሂዷል። በድጋሚ ለመሞከር Replay/እንደገና ጀምር የሚለውን ይጠቀሙ።'
          : 'Tonight’s draw has already been executed. Use Replay / Reset to run another simulation.'
      );
      return;
    }
    if (eligibleTickets.length === 0) {
      Alert.alert(
        isAmharic ? 'ምንም ትኬት አልተገኘም' : 'No Registered Tickets',
        isAmharic
          ? 'አልጎሪዝማዊ ዕጣ ቢያንስ 1 የተመዘገበ ትኬት ይፈልጋል። ከታች ያለውን የሙከራ ትኬት ማዘጋጃ ይጠቀሙ።'
          : 'An algorithmic draw requires at least one registered ticket. Use the Demo Sample Ticket button below to add one.'
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmExecute = async () => {
    setShowConfirmModal(false);
    try {
      const result = await executeDemoDraw(activeDrawId);
      setActiveWinnerData(result);
      setShowWinnerModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isAmharic ? 'ዕጣው አልተሳካም' : 'Draw simulation failed');
      Alert.alert(isAmharic ? 'የዕጣ ማሳሰቢያ' : 'Draw Notice', msg);
    }
  };

  const handleIssueSampleTicket = async () => {
    try {
      await addSampleTicket(currentUser.id, activeDrawId);
      Alert.alert(
        isAmharic ? 'የሙከራ ትኬት ተዘጋጅቷል' : 'Demo Ticket Issued',
        isAmharic ? 'ለዛሬ ማታ ዕጣ የሙከራ ትኬት በተሳካ ሁኔታ ተመዝግቧል።' : 'A simulated ticket was added for tonight\'s draw.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isAmharic ? 'ትኬት ማዘጋጀት አልተቻለም' : 'Failed to issue sample ticket');
      Alert.alert(isAmharic ? 'ማሳሰቢያ' : 'Notice', msg);
    }
  };

  const handleReplayDraw = async () => {
    try {
      await resetActiveDraw(activeDrawId);
      setShowWinnerModal(false);
      setActiveWinnerData(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isAmharic ? 'ዕጣውን መመለስ አልተቻለም' : 'Failed to reset draw');
      Alert.alert(isAmharic ? 'ስህተት' : 'Error', msg);
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
            {t.draw.title}
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* 2. Hero Card: 1,000,000 ETB Prize Pool */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#064E3B' : '#065F46' }]}>
          <View style={styles.heroContent}>
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.prizeLabel}>{t.draw.prizePoolTitle}</Text>
            <Text style={styles.prizeAmount}>
              1,000,000 {t.common.currencyETB}
            </Text>
            <Text style={styles.prizeSubText}>
              {t.draw.disclaimerBadge}
            </Text>
          </View>
        </View>

        {/* 3. Compact Supporting Metrics Row */}
        <View style={styles.metricsRow}>
          <Card style={styles.halfCard} variant="surface">
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              {isAmharic ? 'ንቁ ተሳታፊዎች' : 'Active Participants'}
            </Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {(activeDraw?.participantCount || 24851).toLocaleString()}
            </Text>
            <Text style={[styles.metricTag, { color: theme.textMuted }]}>
              ({t.common.demoBadge})
            </Text>
          </Card>

          <Card style={styles.halfCard} variant="surface">
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
              {t.draw.nextScheduledDraw}
            </Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {isAmharic ? 'ዛሬ ማታ' : 'Tonight'}
            </Text>
            <Text style={[styles.metricTag, { color: theme.textMuted }]}>
              20:00:00 EAT ({t.common.demoBadge})
            </Text>
          </Card>
        </View>

        {/* 4. Ticket Status & Primary Action */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.draw.yourTicketsTitle}
          </Text>
        </View>

        <Card style={styles.ticketCard} variant="surface">
          <View style={styles.ticketContent}>
            <View style={[styles.ticketBadgeCircle, { backgroundColor: userTicket ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)') : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)') }]}>
              <Text style={[styles.ticketBadgeIcon, { color: userTicket ? colors.primary : theme.textMuted }]}>
                {userTicket ? '✓' : '🎟️'}
              </Text>
            </View>
            <View style={styles.ticketTextCol}>
              <Text style={[styles.ticketTitle, { color: theme.textPrimary }]}>
                {userTicket ? (isAmharic ? 'ለዛሬ ማታው ዕጣ ብቁ ነዎት!' : "You're in tonight's draw!") : (isAmharic ? 'ምንም ትኬት አልተመዘገበም' : 'No Ticket Registered')}
              </Text>
              <Text style={[styles.ticketSubtitle, { color: theme.textSecondary }]}>
                {userTicket
                  ? (isAmharic ? `ትኬት ቁጥር #${userTicket.ticketNumber}` : `Ticket #${userTicket.ticketNumber}`)
                  : (isAmharic ? 'ዕለታዊ የዕጣ ትኬት ለማግኘት 50 ብር ያዋጡ።' : 'Contribute 50 ETB to receive your daily draw entry ticket.')}
              </Text>
            </View>
          </View>

          {/* Action according to state */}
          {isDrawCompleted ? (
            <View style={styles.completedActionsRow}>
              <AppButton
                title={isAmharic ? 'የአሸናፊውን ኤስክሮው ይመልከቱ →' : 'Inspect Winner Escrow →'}
                variant="primary"
                onPress={() => router.push('/(tabs)/winner')}
                style={{ flex: 1.3 }}
              />
              <AppButton
                title={t.draw.rerunDrawCTA}
                variant="secondary"
                onPress={handleReplayDraw}
                style={{ flex: 0.7 }}
              />
            </View>
          ) : userTicket ? (
            <AppButton
              title={isDrawing ? t.draw.simulating : t.draw.simulateDrawCTA}
              variant="primary"
              loading={isDrawing}
              onPress={handleOpenConfirm}
              style={styles.drawActionButton}
            />
          ) : (
            <AppButton
              title={isAmharic ? 'ለመሳተፍ 50 ብር ያዋጡ →' : 'Contribute 50 ETB to Enter →'}
              variant="primary"
              onPress={() => router.push('/(tabs)/contribute')}
              style={styles.drawActionButton}
            />
          )}
        </Card>

        {/* 5. Separate Demonstration Control for Evaluators */}
        {!isDrawCompleted && !userTicket && (
          <View style={styles.evaluatorControlContainer}>
            <TouchableOpacity
              onPress={handleIssueSampleTicket}
              style={[styles.sampleTicketButton, { borderColor: theme.surfaceBorder, backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}
              accessibilityRole="button"
              accessibilityLabel="Issue sample demo ticket">
              <Text style={[styles.sampleTicketText, { color: theme.textSecondary }]}>
                ⚙️ {isAmharic ? 'የሙከራ ትኬት አዘጋጅ' : 'Issue Demo Sample Ticket'} <Text style={{ color: colors.primary, fontWeight: '700' }}>({isAmharic ? 'የገምጋሚ መሣሪያ' : 'Evaluator Tool'})</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. Low-profile simulation disclosure */}
        <DisclaimerNotice
          icon="🔒"
          message={t.draw.auditNotice}
          style={styles.disclosure}
        />

        {/* 7. Secondary Technical Accordion for Evaluators */}
        <TouchableOpacity
          onPress={() => setShowTechnicalDetails(!showTechnicalDetails)}
          style={styles.accordionHeader}>
          <Text style={[styles.accordionTitle, { color: theme.textMuted }]}>
            {showTechnicalDetails
              ? (isAmharic ? '▾ የአልጎሪዝም ዝርዝሮችን ደብቅ' : '▾ Hide Algorithmic Draw Mechanics')
              : (isAmharic ? '▸ የአልጎሪዝም ቴክኒካዊ ዝርዝሮችን አሳይ (ኦዲት)' : '▸ Show Algorithmic Draw Mechanics (Audit Details)')}
          </Text>
        </TouchableOpacity>

        {showTechnicalDetails && (
          <Card style={styles.technicalCard} variant="surface">
            <Text style={[styles.techHeading, { color: theme.textPrimary }]}>
              {isAmharic ? 'የተረጋገጠ የሃሽ ማረጋገጫ' : 'Deterministic Hash Verification'}
            </Text>
            <Text style={[styles.techBody, { color: theme.textSecondary }]}>
              Algorithm: 32-bit Fowler-Noll-Vo (FNV-1a) hash function.{'\n'}
              Seed: {activeDrawId}-entropy-ethiopia-nla-demo{'\n'}
              Eligible Demo Pool: {eligibleTickets.length} ticket(s) loaded
            </Text>
            <Text style={[styles.techFootnote, { color: theme.textMuted }]}>
              * {t.draw.auditNotice}
            </Text>
          </Card>
        )}

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'የዛሬ ማታውን ዕጣ ማካሄድ ይፈልጋሉ?' : "Execute Tonight's Draw?"}
              </Text>
              <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
                {isAmharic
                  ? `ይህ በ${eligibleTickets.length} ትኬቶች መካከል ፍትሃዊ አልጎሪዝምን ተጠቅሞ የ1,000,000 ብር አሸናፊውን ይመርጣል።`
                  : `This runs the deterministic client-side algorithm to select tonight's simulated 1,000,000 ETB winner across ${eligibleTickets.length} registered ticket(s).`}
              </Text>
              <View style={styles.modalActions}>
                <AppButton
                  title={t.common.cancel}
                  variant="outline"
                  onPress={() => setShowConfirmModal(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <AppButton
                  title={isAmharic ? 'ዕጣውን አከናውን' : 'Run Draw'}
                  variant="primary"
                  onPress={handleConfirmExecute}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Winner Reveal Modal */}
        <Modal
          visible={showWinnerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWinnerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <Text style={styles.winnerTrophy}>🎉</Text>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, textAlign: 'center' }]}>
                {t.draw.winnerAnnounced}
              </Text>
              <Text style={[styles.winnerName, { color: colors.primary }]}>
                {activeWinnerData?.winner.fullName}
              </Text>
              <Text style={[styles.winnerTicket, { color: theme.textSecondary }]}>
                {t.draw.winningTicketLabel}: #{activeWinnerData?.winningTicket.ticketNumber}
              </Text>
              <Text style={[styles.winnerSub, { color: theme.textMuted }]}>
                {isAmharic
                  ? `${formatETB(1000000)} በ6 ወር የባንክ ኤስክሮው ውስጥ ዝግጁ ሆኗል።`
                  : `${formatETB(1000000)} is now available to simulate in the 6-Month Blocked Escrow & Repayment Hub.`}
              </Text>

              <AppButton
                title={isAmharic ? 'የኤስክሮው እና ክፍያ ማዕከልን ይመልከቱ →' : 'Inspect 6-Month Escrow & Repayments →'}
                variant="primary"
                onPress={() => {
                  setShowWinnerModal(false);
                  router.push('/(tabs)/winner');
                }}
                style={{ width: '100%', marginTop: 14 }}
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
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContent: {
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  prizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1FAE5',
    marginBottom: 4,
  },
  prizeAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  prizeSubText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  metricTag: {
    fontSize: 10,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  ticketCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  ticketContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  ticketBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBadgeIcon: {
    fontSize: 20,
    fontWeight: '800',
  },
  ticketTextCol: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  ticketSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  completedActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  drawActionButton: {
    width: '100%',
  },
  evaluatorControlContainer: {
    marginBottom: 14,
  },
  sampleTicketButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleTicketText: {
    fontSize: 12,
    fontWeight: '500',
  },
  disclosure: {
    marginBottom: 14,
  },
  accordionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  technicalCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  techHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  techBody: {
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  techFootnote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
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
    borderRadius: 22,
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
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerTrophy: {
    fontSize: 48,
    alignSelf: 'center',
    marginBottom: 8,
  },
  winnerName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  winnerTicket: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  winnerSub: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
