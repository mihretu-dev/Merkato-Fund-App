/**
 * Merkato Fund — More & Admin Settings Screen
 * Redesigned for Phase 10: Advanced UI/UX matching Screen 7 in design reference.
 *
 * Groups:
 * 1. Appearance: Light, Dark, System
 * 2. Language: English, አማርኛ
 * 3. Profile / Demo Persona: current user card with chevron to Persona Selector & quick pills
 * 4. Evaluation & Pool Solvency: break-even floor calculation & "View Analysis"
 * 5. Simulation Tools: "Run Scenarios" & "Pool Simulator" links
 * 6. Destructive Demo Reset: clearly styled reset action with confirmation modal
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { Card, AppButton, DisclaimerNotice, BrandInfographicModal } from '@/src/components/ui';

import { useUserStore } from '@/src/stores/useUserStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { resetAllDemoStores } from '@/src/stores';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { PoolStatistics, User } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';
import { useTranslation } from '@/src/i18n/useTranslation';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, themePreference, setThemePreference } = useTheme();
  const { t, language, setLanguage, isAmharic } = useTranslation();

  const currentUser = useUserStore((s) => s.currentUser);
  const switchPersona = useUserStore((s) => s.switchPersona);
  const availablePersonas = useUserStore((s) => s.availablePersonas);

  const activeDraw = useDrawStore((s) => s.activeDraw);
  const loadDrawData = useDrawStore((s) => s.loadDrawData);

  const [poolStats, setPoolStats] = useState<PoolStatistics | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [activeInfographic, setActiveInfographic] = useState<'manifesto' | 'oldVsNew' | null>(null);

  useEffect(() => {
    mockMerkatoService.getPoolStatistics().then(setPoolStats);
    loadDrawData(currentUser.id);
  }, [currentUser.id]);

  const handleRunSolvencyAudit = () => {
    const requiredMembers = 20000;
    const currentMembers = poolStats?.activeContributorsCount || 24850;
    const surplusMembers = currentMembers - requiredMembers;

    if (isAmharic) {
      setAuditMessage(
        `የአቅም እና ዘላቂነት ሞዴል፡ ${currentMembers.toLocaleString()} ዕለታዊ አባላት በ50 ብር/ቀን ${formatETB(currentMembers * 50)}/ቀን ያመነጫሉ፤ ይህም የ1,000,000 ብር ዕለታዊ ሽልማት ሸፍኖ +${formatETB(surplusMembers * 50)} ትርፍ ያስገኛል። አባላት ከ20,000 በታች ከወረዱ ግን ዕለታዊ ጉድለት ይፈጠራል።`
      );
    } else {
      setAuditMessage(
        `Scale Sensitivity Model: ${currentMembers.toLocaleString()} daily contributors at 50 ETB/day yields ${formatETB(currentMembers * 50)}/day, covering the 1,000,000 ETB daily prize with a +${formatETB(surplusMembers * 50)} surplus. A drop below 20,000 members creates an immediate daily deficit.`
      );
    }
  };

  const handleConfirmFullReset = async () => {
    setIsResetting(true);
    try {
      await resetAllDemoStores();
      const freshStats = await mockMerkatoService.getPoolStatistics();
      setPoolStats(freshStats);
      setShowResetModal(false);
      Alert.alert(
        isAmharic ? 'የሙከራ መረጃዎች ተመልሰዋል' : 'Demo Reset Complete',
        isAmharic
          ? 'ሁሉም የሙከራ ሒሳቦች፣ መዋጮዎች፣ ትኬቶች እና የፋይናንስ ሁኔታዎች ወደ መጀመሪያው ሁኔታ ተመልሰዋል።'
          : 'All demonstration stores, contributions, tickets, and financial states have been restored to initial baseline.'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      Alert.alert(isAmharic ? 'ስህተት' : 'Reset Error', msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.admin.title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
        showsVerticalScrollIndicator={false}>

        {/* 2. Group 1: Appearance */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.appearanceTitle}
          </Text>
        </View>

        <Card style={styles.card} variant="surface">
          <View style={[styles.themePillsRow, { backgroundColor: isDark ? '#0B1220' : '#F1F5F9' }]}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const isSelected = themePreference === mode;
              const icon = mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '📱';
              const label =
                mode === 'light'
                  ? t.admin.themeLight
                  : mode === 'dark'
                  ? t.admin.themeDark
                  : t.admin.themeSystem;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themePill,
                    isSelected && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setThemePreference(mode)}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${mode} theme`}>
                  <Text
                    style={[
                      styles.themePillText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                    ]}>
                    {icon} {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* 3. Group 2: Language Selector */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.languageTitle}
          </Text>
        </View>

        <Card style={styles.card} variant="surface">
          <View style={[styles.themePillsRow, { backgroundColor: isDark ? '#0B1220' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.languagePill,
                language === 'en' && { backgroundColor: theme.primary },
              ]}
              onPress={() => setLanguage('en')}
              accessibilityRole="button"
              accessibilityLabel="Switch to English">
              <Text
                style={[
                  styles.themePillText,
                  { color: language === 'en' ? '#FFFFFF' : theme.textSecondary, fontWeight: language === 'en' ? '700' : '500' },
                ]}>
                English 🇬🇧
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languagePill,
                language === 'am' && { backgroundColor: theme.primary },
              ]}
              onPress={() => setLanguage('am')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Amharic">
              <Text
                style={[
                  styles.themePillText,
                  { color: language === 'am' ? '#FFFFFF' : theme.textSecondary, fontWeight: language === 'am' ? '700' : '500' },
                ]}>
                አማርኛ 🇪🇹
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 4. Group 3: Profile / Demo Persona */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.profileTitle}
          </Text>
        </View>

        <Card style={styles.profileCard} variant="surface">
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => router.push('/persona-select')}>
            <View style={[styles.profileAvatar, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)' }]}>
              <Text style={[styles.profileAvatarText, { color: theme.primary }]}>
                {currentUser?.fullName?.split(' ').map((n) => n[0]).join('') || 'DH'}
              </Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                {currentUser?.fullName}
              </Text>
              <Text style={[styles.profileRole, { color: theme.textSecondary }]}>
                {currentUser?.role === 'winner'
                  ? t.persona.winnerTitle
                  : currentUser?.role === 'admin'
                  ? t.persona.adminTitle
                  : t.persona.memberTitle}
              </Text>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          {/* Quick persona switcher pills */}
          <View style={[styles.personaPillsRow, { backgroundColor: isDark ? '#0B1220' : '#F1F5F9' }]}>
            {Object.values(availablePersonas).map((p: User) => {
              const isSelected = p.id === currentUser.id;
              const shortName = p.fullName.split(' ')[0];
              const roleLabel =
                p.role === 'winner'
                  ? (isAmharic ? 'አሸናፊ' : 'Winner')
                  : p.role === 'admin'
                  ? (isAmharic ? 'አስተዳዳሪ' : 'Admin')
                  : (isAmharic ? 'አባል' : 'Member');
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personaPill,
                    isSelected && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => switchPersona(p.id === 'user-dawit-001' ? 'dawit' : p.id === 'user-bethlehem-002' ? 'bethlehem' : 'admin')}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${p.fullName}`}>
                  <Text
                    style={[
                      styles.personaPillText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                    ]}>
                    {shortName} ({roleLabel})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* 5. Group 4: Evaluation & Pool Solvency */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.solvencyTitle}
          </Text>
        </View>

        <Card style={styles.card} variant="surface">
          <Text style={[styles.mathFormula, { color: theme.textPrimary }]}>
            {isAmharic
              ? `20,000 አባላት × 50 ብር/ቀን\n= 1,000,000 ብር/ቀን (የመነሻ ሚዛን)`
              : `20,000 members × 50 ETB/day\n= 1,000,000 ETB/day (Break-even floor)`}
          </Text>

          <Text style={[styles.mathFootnote, { color: theme.textSecondary }]}>
            {isAmharic
              ? 'የሂሳብ ስሌት መነሻ፡ የ1,000,000 ብር ዕለታዊ ሽልማቱን ለመሸፈን በትክክል 20,000 ንቁ ዕለታዊ አባላት ያስፈልጋሉ።'
              : 'Arithmetic threshold: exactly 20,000 active daily contributors are required to fund the 1,000,000 ETB daily prize.'}
          </Text>

          {/* Solvency sensitivity button */}
          <AppButton
            title={t.admin.runAuditCTA}
            variant="outline"
            onPress={handleRunSolvencyAudit}
            style={{ marginTop: 12 }}
          />

          {auditMessage && (
            <View style={[styles.auditNoticeBox, { backgroundColor: isDark ? '#0B1220' : '#F1F5F9' }]}>
              <Text style={[styles.auditNoticeText, { color: theme.primary }]}>{auditMessage}</Text>
            </View>
          )}
        </Card>

        {/* 6. Group 5: Simulation Tools */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.devToolsTitle}
          </Text>
        </View>

        <Card style={styles.menuCard} variant="surface">
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: theme.surfaceBorder, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => router.push('/onboarding')}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📖</Text>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                {t.admin.viewOnboardingCTA}
              </Text>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: theme.surfaceBorder, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => router.push('/(tabs)/winner')}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                {t.winner.title}
              </Text>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/(tabs)/draw')}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🎲</Text>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                {t.draw.title}
              </Text>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Brand Charter & Philosophy */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {isAmharic ? 'የመርካቶ ፈንድ ፍልስፍና' : 'Brand Charter & Philosophy'}
          </Text>
        </View>

        <Card style={styles.menuCard} variant="surface">
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: theme.surfaceBorder, borderBottomWidth: StyleSheet.hairlineWidth }]}
            onPress={() => setActiveInfographic('manifesto')}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📜</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {t.profileMenu.manifesto}
                </Text>
                <Text style={[styles.menuSubTitle, { color: theme.textMuted }]}>
                  {t.profileMenu.manifestoSub}
                </Text>
              </View>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setActiveInfographic('oldVsNew')}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>⚖️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
                  {t.profileMenu.oldVsNew}
                </Text>
                <Text style={[styles.menuSubTitle, { color: theme.textMuted }]}>
                  {t.profileMenu.oldVsNewSub}
                </Text>
              </View>
            </View>
            <Text style={[styles.chevronIcon, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* 7. Group 6: Destructive Demonstration Reset */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t.admin.resetTitle}
          </Text>
        </View>

        <Card style={styles.card} variant="surface">
          <Text style={[styles.resetDesc, { color: theme.textSecondary }]}>
            {t.admin.resetDesc}
          </Text>

          <AppButton
            title={`⚠️ ${t.admin.resetCTA}`}
            variant="danger"
            onPress={() => setShowResetModal(true)}
            style={styles.resetButton}
          />
        </Card>

        {/* Subtle Model Notice */}
        <DisclaimerNotice compact />

        {/* Reset Confirmation Modal */}
        <Modal
          visible={showResetModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResetModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {t.admin.resetModalTitle}
              </Text>
              <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
                {t.admin.resetModalDesc}
              </Text>
              <View style={styles.modalActions}>
                <AppButton
                  title={t.admin.resetModalCancel}
                  variant="secondary"
                  onPress={() => setShowResetModal(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <AppButton
                  title={isResetting ? t.common.loading : t.admin.resetModalConfirm}
                  variant="danger"
                  loading={isResetting}
                  onPress={handleConfirmFullReset}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Brand Infographics Modal */}
        {activeInfographic && (
          <BrandInfographicModal
            visible={!!activeInfographic}
            onClose={() => setActiveInfographic(null)}
            type={activeInfographic}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 18,
    padding: 16,
  },
  themePillsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  themePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themePillText: {
    fontSize: 13,
  },
  profileCard: {
    borderRadius: 18,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  profileRole: {
    fontSize: 12,
    marginTop: 2,
  },
  chevronIcon: {
    fontSize: 22,
    fontWeight: '300',
  },
  personaPillsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  personaPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaPillText: {
    fontSize: 11,
  },
  mathFormula: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  mathFootnote: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  auditNoticeBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  auditNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  menuCard: {
    borderRadius: 18,
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuSubTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  resetDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  resetButton: {
    width: '100%',
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
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
