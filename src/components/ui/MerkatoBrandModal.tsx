/**
 * Merkato Fund — Brand & Organization Profile Pop-out Modal
 *
 * Triggered by tapping the Merkato Logo on Onboarding or Home screens.
 * Displays:
 * - Wide high-fidelity logo preview banner
 * - Official company name (Merkato Financial Solutions PLC) & tagline
 * - Mission, founding inspiration, core pillars
 * - Demonstration safety boundaries & disclaimers
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { useTranslation } from '@/src/i18n/useTranslation';
import { fontFamilies, typography, spacing, radii, colors } from '@/src/theme/tokens';
import { AppButton } from './AppButton';
import { Card } from './Card';

interface MerkatoBrandModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MerkatoBrandModal: React.FC<MerkatoBrandModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, isAmharic } = useTranslation();

  const windowWidth = Dimensions.get('window').width;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Tap outside sheet to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}>
          {/* Top Grab Handle */}
          <View style={styles.handleBarRow}>
            <View style={[styles.handleBar, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'የመርካቶ ፈንድ መገለጫ' : 'Merkato Fund Profile'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                {isAmharic ? 'መርካቶ ፋይናንሺያል ሶሉሽንስ ኃ/የተ/የግ/ማ' : 'Merkato Financial Solutions PLC'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
              accessibilityRole="button"
              accessibilityLabel="Close brand profile">
              <Text style={[styles.closeText, { color: theme.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Wide Logo Banner Preview */}
            <View
              style={[
                styles.wideLogoCard,
                {
                  backgroundColor: isDark ? '#1C1917' : '#FDFBF7',
                  borderColor: isDark ? '#44403C' : '#E2D9C5',
                },
              ]}>
              <Image
                source={require('@/assets/images/merkato_logo.png')}
                style={styles.wideLogoImage}
                resizeMode="contain"
              />
              <View style={styles.mottoPill}>
                <Text style={styles.mottoText}>
                  {isAmharic ? 'መጀመሪያ ተቀበል፤ ከዚያ ክፈል!' : 'No more pay-to-get. Just get-to-pay.'}
                </Text>
              </View>
            </View>

            {/* About & Mission Section */}
            <Card style={styles.card} variant="surface">
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'ስለ መርካቶ ፈንድ' : 'About Merkato Fund'}
              </Text>
              <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
                {isAmharic
                  ? 'መርካቶ ፈንድ በታሪካዊው የአዲስ አበባ መርካቶ የንግድ መንፈስ እና የዕቁብ የትብብር ባህል ተነሳስቶ የተቋቋመ ዘመናዊ የፊንቴክ ሞዴል ነው። ተራ ዜጎችን እና ነጋዴዎችን ከአድካሚ የብድር ወለድ እና ከባድ ዋስትና ነፃ በማድረግ የፋይናንስ አቅም በእጃቸው እንዲገባ ያደርጋል።'
                  : 'Inspired by the vibrant, collaborative spirit of Addis Ababa’s historic Merkato marketplace, Merkato Fund bridges traditional Ethiopian Equb solidarity with institutional security, automated algorithmic draws, and commercial bank escrow.'}
              </Text>
            </Card>

            {/* Core Pillars */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {isAmharic ? 'ዋና ዋና መርሆዎች' : 'Core Architectural Pillars'}
              </Text>
            </View>

            <View style={styles.pillarsGrid}>
              <View style={[styles.pillarTile, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                <Text style={styles.pillarIcon}>🤝</Text>
                <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                  {isAmharic ? 'የማህበረሰብ አቅም (ዕቁብ)' : 'Community Power (Equb)'}
                </Text>
                <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                  {isAmharic
                    ? 'በቀን 50 ብር አነስተኛ ቁጠባ በመጀመር የ20,000 አባላትን የጋራ ካፒታል ማሰባሰብ።'
                    : '20,000 members contributing 50 ETB/day forming a self-sustaining 1,000,000 ETB daily pool.'}
                </Text>
              </View>

              <View style={[styles.pillarTile, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                <Text style={styles.pillarIcon}>🔒</Text>
                <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                  {isAmharic ? 'የባንክ ዕገዳ ሂሳብ (22% ወለድ)' : 'Bank Escrow (22% Yield)'}
                </Text>
                <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                  {isAmharic
                    ? 'የ1,000,000 ብር ሽልማቱ ለ6 ወራት በባንክ ታግዶ 22% ዓመታዊ ወለድ በማመንጨት ብድርን ያቃልላል።'
                    : '1,000,000 ETB blocked for 6 months at 22% simple interest (ACT/365) to protect repayment.'}
                </Text>
              </View>

              <View style={[styles.pillarTile, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                <Text style={styles.pillarIcon}>⚡</Text>
                <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                  {isAmharic ? 'አልጎሪዝማዊ ፍትሃዊነት' : 'Algorithmic Fairness'}
                </Text>
                <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                  {isAmharic
                    ? 'ግልጽ እና የተረጋገጠ የኮምፒውተር ዕጣ አወጣጥ ያለ ምንም የሰዎች ጣልቃ ገብነት።'
                    : 'Deterministic seed-based algorithmic draws with verifiable hash proofs and zero human bias.'}
                </Text>
              </View>
            </View>

            {/* Prototype Regulatory Note */}
            <View style={[styles.disclaimerBox, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7', borderColor: isDark ? '#374151' : '#F59E0B' }]}>
              <Text style={styles.disclaimerIcon}>ℹ️</Text>
              <Text style={[styles.disclaimerText, { color: isDark ? '#D1D5DB' : '#92400E' }]}>
                {isAmharic
                  ? 'ይህ መተግበሪያ የምርምር እና የማሳያ ፕሮቶታይፕ (Demonstration Prototype) ነው። በእውነተኛ ባንኮች፣ በኢትዮጵያ ንግድ ባንክ ወይም በብሔራዊ ሎተሪ አስተዳደር ላይ የቀጥታ ክፍያ አይፈጽምም።'
                  : 'This application is a demonstration prototype for conceptual evaluation. It is not connected to real banking systems, CBE, Telebirr APIs, or certified by the National Lottery Administration.'}
              </Text>
            </View>

            {/* Bottom Dismiss Button */}
            <AppButton
              title={isAmharic ? 'ተመለስ' : 'Close Profile'}
              variant="primary"
              onPress={onClose}
              style={styles.doneButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '92%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingTop: spacing.sm,
  },
  handleBarRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitleGroup: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  modalSub: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  wideLogoCard: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  wideLogoImage: {
    width: 140,
    height: 140,
    marginBottom: spacing.md,
  },
  mottoPill: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.full,
  },
  mottoText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillarsGrid: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pillarTile: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  pillarIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  pillarTitle: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  pillarDesc: {
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.xs,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  disclaimerIcon: {
    fontSize: 18,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: fontFamilies.sans,
    fontSize: typography.fontSizes.xs,
    lineHeight: 18,
  },
  doneButton: {
    marginTop: spacing.xs,
  },
});
