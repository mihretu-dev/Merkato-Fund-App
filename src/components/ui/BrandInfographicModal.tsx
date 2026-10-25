/**
 * Merkato Fund — Brand Infographic & Manifesto Modal
 *
 * Provides a high-resolution educational modal for:
 * 1. "The Merkato Manifesto" — Founding philosophy parchment and charter.
 * 2. "The Paradigm Shift (Old vs New)" — Comparative visual analysis of Get-to-Pay vs Pay-to-Get.
 *
 * Features:
 * - High-resolution responsive infographics
 * - Full Dark & Light theme compliance
 * - Complete Amharic & English localization
 * - Interactive transcript and key takeaways
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
  useWindowDimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { useTranslation } from '@/src/i18n/useTranslation';
import { MerkatoLogo } from './MerkatoLogo';

export type InfographicModalType = 'manifesto' | 'oldVsNew';

interface BrandInfographicModalProps {
  visible: boolean;
  onClose: () => void;
  type: InfographicModalType;
}

export function BrandInfographicModal({
  visible,
  onClose,
  type,
}: BrandInfographicModalProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { isAmharic } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();

  const isManifesto = type === 'manifesto';

  const title = isManifesto
    ? isAmharic
      ? 'የመርካቶ ፈንድ ማኒፌስቶ'
      : 'The Merkato Manifesto'
    : isAmharic
    ? 'አዲሱ የፋይናንስ ፍሰት'
    : 'The Paradigm Shift';

  const subtitle = isManifesto
    ? isAmharic
      ? 'ክፈልና አግኝ ቀረ። አግኝና ክፈል!'
      : 'No more pay-to-get. Just get-to-pay.'
    : isAmharic
    ? 'የድሮው እና አዲሱ አሠራር ንጽጽር'
    : 'The Old Way (Pay to Get) vs The New Way (Get to Pay)';

  const imageSource = isManifesto
    ? require('@/assets/images/onboarding/manifesto.png')
    : require('@/assets/images/onboarding/old_vs_new.png');

  // Maintain proper aspect ratio (16:9 for oldVsNew, ~3:4 for manifesto parchment)
  const imageWidth = Math.min(windowWidth - 48, 520);
  const imageHeight = isManifesto ? Math.round(imageWidth * 1.33) : Math.round(imageWidth * 0.5625);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                  paddingBottom: Math.max(insets.bottom, 20),
                  maxHeight: '92%',
                },
              ]}>
              {/* Top Handle Bar */}
              <View style={styles.handleBarRow}>
                <View
                  style={[
                    styles.handleBar,
                    { backgroundColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                />
              </View>

              {/* Header Row */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleGroup}>
                  <MerkatoLogo size={32} />
                  <View style={styles.titleTextCol}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal">
                  <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {/* 1. Infographic Graphic Display */}
                <View
                  style={[
                    styles.imageWrapper,
                    {
                      width: imageWidth,
                      height: imageHeight,
                      backgroundColor: isDark ? '#0B1220' : '#FAF6ED',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}>
                  <Image
                    source={imageSource}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={isManifesto ? 'contain' : 'cover'}
                  />
                </View>

                {/* 2. Structured Narrative Explanations */}
                {isManifesto ? (
                  <View style={styles.detailsBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                      {isAmharic ? 'የተቋሙ ተልዕኮ' : 'The Merkato Advantage'}
                    </Text>
                    <Text style={[styles.bodyParagraph, { color: theme.textSecondary }]}>
                      {isAmharic
                        ? 'መርካቶ ፈንድ በኢትዮጵያ ታሪካዊው የመርካቶ ገበያ የትብብርና የጽናት መንፈስ ተመስርቶ የተፈጠረ አዲስ የፋይናንስ ሥርዓት ነው። አነስተኛ ዕለታዊ መዋጮዎችን (በቀን 50 ብር ብቻ) ወደ ከፍተኛ የካፒታል አቅም ይቀይራል።'
                        : 'We are Merkato Fund, operating as dedicated financial partners focused on sustainable community growth over high-interest debt. Inspired by the vibrant spirit of the historic Merkato market, our brand stands for inclusion, resilience, and limitless growth.'}
                    </Text>

                    <View style={styles.keyPointsRow}>
                      <View style={[styles.keyPointCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                        <Text style={styles.pointEmoji}>🤝</Text>
                        <Text style={[styles.pointTitle, { color: theme.textPrimary }]}>
                          {isAmharic ? 'የእቁብ እምነት' : 'Community Equb'}
                        </Text>
                        <Text style={[styles.pointDesc, { color: theme.textMuted }]}>
                          {isAmharic ? 'የህብረት ቁጠባ ባህልና ዲሲፕሊን' : 'Social trust & collective micro-contributions'}
                        </Text>
                      </View>

                      <View style={[styles.keyPointCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.surfaceBorder }]}>
                        <Text style={styles.pointEmoji}>🏦</Text>
                        <Text style={[styles.pointTitle, { color: theme.textPrimary }]}>
                          {isAmharic ? 'የባንክ ጥበቃ' : 'Bank Custody'}
                        </Text>
                        <Text style={[styles.pointDesc, { color: theme.textMuted }]}>
                          {isAmharic ? 'የ1 ሚሊዮን ብር ኤስክሮው እና 22% ወለድ' : '1M ETB blocked escrow earning 22% yield'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.detailsBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.primary }]}>
                      {isAmharic ? 'የአሠራር ንጽጽር' : 'Comparative Model Breakdown'}
                    </Text>

                    {/* Traditional vs Merkato Cards */}
                    <View style={[styles.comparisonCard, { backgroundColor: isDark ? '#1C1917' : '#FEF2F2', borderColor: '#EF4444' }]}>
                      <View style={styles.compareHeader}>
                        <Text style={styles.compareBadgeNegative}>
                          {isAmharic ? '❌ የድሮው አሠራር (Pay to Get)' : '❌ The Traditional Flaw (Pay to Get)'}
                        </Text>
                      </View>
                      <Text style={[styles.compareText, { color: theme.textSecondary }]}>
                        {isAmharic
                          ? 'ባህላዊ ቁጠባዎች ጠቃሚ ካፒታል ከማስገኘታቸው በፊት ዓመታት የፈጀ መስዋዕትነት ይጠይቃሉ። ተጋላጭ የሆኑ ነጋዴዎች በጊዜ እና በመያዣ እጦት ከፋይናንስ ገበታ ይገለላሉ።'
                          : 'Traditional savings demand years of sacrifice before yielding usable capital. The most vulnerable are locked out by time, strict collateral, and high compounding interest.'}
                      </Text>
                    </View>

                    <View style={[styles.comparisonCard, { backgroundColor: isDark ? '#064E3B20' : '#ECFDF5', borderColor: '#10B981' }]}>
                      <View style={styles.compareHeader}>
                        <Text style={styles.compareBadgePositive}>
                          {isAmharic ? '✅ የመርካቶ አሠራር (Get to Pay)' : '✅ The Merkato Paradigm (Get to Pay)'}
                        </Text>
                      </View>
                      <Text style={[styles.compareText, { color: theme.textSecondary }]}>
                        {isAmharic
                          ? 'የካፒታል ፍሰቱን እንቀለብሰዋለን። 1 ሚሊዮን ብርዎን አስቀድመው ያግኙ፤ በጊዜ ሂደት ያለ ምንም ወለድ ይክፈሉ። የኤስክሮው ወለድ ወጪዎን ይሸፍናል!'
                          : 'We reverse the flow of capital. Receive your 1 Million Birr immediately into blocked escrow. Zero interest. No compound debt. The escrow yield helps pay the debt.'}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleBarRow: {
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 14,
  },
  headerTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  titleTextCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  detailsBlock: {
    width: '100%',
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  bodyParagraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  keyPointsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  keyPointCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  pointEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  pointTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  pointDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  comparisonCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  compareHeader: {
    marginBottom: 6,
  },
  compareBadgeNegative: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  compareBadgePositive: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  compareText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
