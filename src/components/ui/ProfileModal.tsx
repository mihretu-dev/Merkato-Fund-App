/**
 * Merkato Fund — Profile Menu Modal Component
 *
 * Appears when clicking the user avatar in the Home dashboard header.
 * Provides:
 * - User persona summary (name, role badge, simulated account ID)
 * - Financial summary metrics (simulated wallet balance, streak, active tickets)
 * - Navigation to Demo Persona Switcher
 * - Direct navigation to Onboarding Tour ("View Onboarding Tour")
 * - Navigation to Settings & Dev Tools
 * - Explicit "Log Out" action that routes to persona selection
 *
 * Full Dark & Light theme compliance & complete Amharic localization.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { useTranslation } from '@/src/i18n/useTranslation';
import { User } from '@/src/domain/types';
import { formatETB } from '@/src/domain/calculations/currency';
import { MerkatoLogo } from './MerkatoLogo';
import { BrandInfographicModal, InfographicModalType } from './BrandInfographicModal';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSwitchPersona: () => void;
  onViewOnboarding: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  currentUser,
  onSwitchPersona,
  onViewOnboarding,
  onOpenSettings,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, isAmharic } = useTranslation();

  const [activeInfographic, setActiveInfographic] = useState<InfographicModalType | null>(null);

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'DH';

  const roleLabel =
    currentUser?.role === 'winner'
      ? t.persona.winnerTitle
      : currentUser?.role === 'admin'
      ? t.persona.adminTitle
      : t.persona.memberTitle;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Backdrop tap overlay to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}>
              {/* Sheet Drag Handle */}
              <View style={styles.handleBarRow}>
                <View
                  style={[
                    styles.handleBar,
                    { backgroundColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                />
              </View>

              {/* Header Row: Title & Close Button */}
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MerkatoLogo size={32} />
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {t.profileMenu.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close profile menu">
                  <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}>
                {/* 1. User Identity Card */}
                <View
                  style={[
                    styles.identityCard,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: theme.surfaceBorder,
                    },
                  ]}>
                  <View style={styles.avatarWrapper}>
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: isDark ? '#064E3B' : '#E2E8F0',
                          borderColor: theme.primary,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.avatarText,
                          { color: isDark ? '#34D399' : theme.primary },
                        ]}>
                        {initials}
                      </Text>
                    </View>
                    <View style={styles.onlineBadge} />
                  </View>

                  <View style={styles.identityMeta}>
                    <Text style={[styles.userName, { color: theme.textPrimary }]}>
                      {currentUser?.fullName || (isAmharic ? 'ዳዊት ኃይሌ' : 'Dawit Haile')}
                    </Text>
                    <View style={styles.roleRow}>
                      <View
                        style={[
                          styles.roleBadge,
                          {
                            backgroundColor: isDark
                              ? 'rgba(16, 185, 129, 0.18)'
                              : 'rgba(16, 185, 129, 0.12)',
                          },
                        ]}>
                        <Text style={[styles.roleBadgeText, { color: theme.primary }]}>
                          {roleLabel}
                        </Text>
                      </View>
                      <Text style={[styles.simulatedId, { color: theme.textMuted }]}>
                        {t.profileMenu.simulatedId}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. Key Stats Summary */}
                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.statBox,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}>
                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                      {formatETB(currentUser?.simulatedWalletBalanceETB || 2450)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      {t.profileMenu.walletBalance}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statBox,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                      14 {isAmharic ? 'ቀናት' : 'Days'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      {t.profileMenu.streak}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statBox,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}>
                    <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                      1 {isAmharic ? 'ትኬት' : 'Ticket'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      {t.profileMenu.tickets}
                    </Text>
                  </View>
                </View>

                {/* 3. Actions List */}
                <View style={styles.menuGroup}>
                  {/* Switch Persona */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                    onPress={onSwitchPersona}
                    accessibilityRole="button"
                    accessibilityLabel="Switch persona">
                    <View style={styles.menuIconCircle}>
                      <Text style={styles.menuIconEmoji}>👥</Text>
                    </View>
                    <View style={styles.menuItemBody}>
                      <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                        {t.profileMenu.switchPersona}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                        {t.profileMenu.switchPersonaSub}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                  </TouchableOpacity>

                  {/* View Onboarding Tour */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                    onPress={onViewOnboarding}
                    accessibilityRole="button"
                    accessibilityLabel="View onboarding tour">
                    <View style={styles.menuIconCircle}>
                      <Text style={styles.menuIconEmoji}>📖</Text>
                    </View>
                    <View style={styles.menuItemBody}>
                      <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                        {t.profileMenu.viewOnboarding}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                        {t.profileMenu.viewOnboardingSub}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                  </TouchableOpacity>

                  {/* The Merkato Manifesto */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                    onPress={() => setActiveInfographic('manifesto')}
                    accessibilityRole="button"
                    accessibilityLabel="Open Merkato Manifesto">
                    <View style={styles.menuIconCircle}>
                      <Text style={styles.menuIconEmoji}>📜</Text>
                    </View>
                    <View style={styles.menuItemBody}>
                      <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                        {t.profileMenu.manifesto}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                        {t.profileMenu.manifestoSub}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                  </TouchableOpacity>

                  {/* The Paradigm Shift (Old vs New) */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                    onPress={() => setActiveInfographic('oldVsNew')}
                    accessibilityRole="button"
                    accessibilityLabel="Open Paradigm Shift Comparison">
                    <View style={styles.menuIconCircle}>
                      <Text style={styles.menuIconEmoji}>⚖️</Text>
                    </View>
                    <View style={styles.menuItemBody}>
                      <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                        {t.profileMenu.oldVsNew}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                        {t.profileMenu.oldVsNewSub}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                  </TouchableOpacity>

                  {/* Settings & Admin */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                    onPress={onOpenSettings}
                    accessibilityRole="button"
                    accessibilityLabel="Open settings">
                    <View style={styles.menuIconCircle}>
                      <Text style={styles.menuIconEmoji}>⚙️</Text>
                    </View>
                    <View style={styles.menuItemBody}>
                      <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                        {t.profileMenu.settings}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                        {t.profileMenu.settingsSub}
                      </Text>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* 4. Log Out Button */}
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    },
                  ]}
                  onPress={onLogout}
                  accessibilityRole="button"
                  accessibilityLabel="Log out of current persona">
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>{t.profileMenu.logout}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
      </View>

      {/* 5. Brand Infographic Modal */}
      {activeInfographic && (
        <BrandInfographicModal
          visible={!!activeInfographic}
          onClose={() => setActiveInfographic(null)}
          type={activeInfographic}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBarRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollList: {
    maxHeight: 520,
  },
  listContent: {
    gap: 14,
    paddingBottom: 16,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  identityMeta: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  simulatedId: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuGroup: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconEmoji: {
    fontSize: 16,
  },
  menuItemBody: {
    flex: 1,
    gap: 2,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemSub: {
    fontSize: 11,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
});
