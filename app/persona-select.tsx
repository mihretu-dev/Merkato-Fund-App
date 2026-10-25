/**
 * Merkato Fund — Demo Persona Selection Screen
 * Redesigned for Phase 10: Clean, focused card selector matching Screen 2 in design reference.
 *
 * Allows reviewers to choose between 3 synthetic personas:
 * 1. Member (Dawit Haile) — Save, contribute, win
 * 2. Winner (Bethlehem Tadesse) — View your winnings
 * 3. Administrator (Abebe Kebede) — Manage and analyze
 *
 * Supports complete English and Amharic localization.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/useTheme';
import { AppButton, DisclaimerNotice, MerkatoLogo } from '@/src/components/ui';
import { useUserStore } from '@/src/stores/useUserStore';
import { DemoPersonaId } from '@/src/domain/types';
import { useTranslation } from '@/src/i18n/useTranslation';

interface PersonaCardItem {
  id: DemoPersonaId;
  titleKey: 'memberTitle' | 'winnerTitle' | 'adminTitle';
  subtitleKey: 'memberSubtitle' | 'winnerSubtitle' | 'adminSubtitle';
  personName: string;
  icon: string;
  iconBgColorDark: string;
  iconBgColorLight: string;
  iconColor: string;
}

const PERSONA_ITEMS: PersonaCardItem[] = [
  {
    id: 'dawit',
    titleKey: 'memberTitle',
    subtitleKey: 'memberSubtitle',
    personName: 'Dawit Haile',
    icon: '👤',
    iconBgColorDark: 'rgba(16, 185, 129, 0.15)',
    iconBgColorLight: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#10B981',
  },
  {
    id: 'bethlehem',
    titleKey: 'winnerTitle',
    subtitleKey: 'winnerSubtitle',
    personName: 'Bethlehem Tadesse',
    icon: '🏆',
    iconBgColorDark: 'rgba(245, 158, 11, 0.15)',
    iconBgColorLight: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#F59E0B',
  },
  {
    id: 'admin',
    titleKey: 'adminTitle',
    subtitleKey: 'adminSubtitle',
    personName: 'Abebe Kebede',
    icon: '🛡️',
    iconBgColorDark: 'rgba(59, 130, 246, 0.15)',
    iconBgColorLight: 'rgba(59, 130, 246, 0.12)',
    iconColor: '#3B82F6',
  },
];

export default function PersonaSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, format, language, setLanguage } = useTranslation();

  const currentPersonaId = useUserStore((s) => s.currentPersonaId);
  const switchPersona = useUserStore((s) => s.switchPersona);
  const isLoading = useUserStore((s) => s.isLoading);
  const setHasCompletedOnboarding = useUserStore((s) => s.setHasCompletedOnboarding);

  const [selectedId, setSelectedId] = useState<DemoPersonaId>(currentPersonaId);

  const handleSelect = async (personaId: DemoPersonaId) => {
    setSelectedId(personaId);
    try {
      await switchPersona(personaId);
    } catch (e) {
      console.error('Failed to switch persona:', e);
    }
  };

  const handleProceed = async () => {
    setHasCompletedOnboarding(true);
    if (selectedId !== currentPersonaId) {
      await switchPersona(selectedId);
    }

    if (selectedId === 'bethlehem') {
      router.replace('/(tabs)/winner');
    } else if (selectedId === 'admin') {
      router.replace('/(tabs)/admin');
    } else {
      router.replace('/(tabs)');
    }
  };

  const selectedPersonaItem = PERSONA_ITEMS.find((p) => p.id === selectedId) || PERSONA_ITEMS[0];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) }]}>
      {/* 1. Header with Back Arrow, Brand Logo, and Quick Language Switcher */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/onboarding')}
          accessibilityRole="button"
          accessibilityLabel="Back to onboarding">
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>‹</Text>
        </TouchableOpacity>

        <MerkatoLogo size={34} />

        <TouchableOpacity
          style={[styles.langPill, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', borderColor: theme.surfaceBorder }]}
          onPress={() => setLanguage(language === 'en' ? 'am' : 'en')}
          accessibilityRole="button"
          accessibilityLabel="Switch language">
          <Text style={[styles.langPillText, { color: theme.textPrimary }]}>
            {language === 'en' ? 'አማርኛ 🇪🇹' : 'English 🇬🇧'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t.persona.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t.persona.subtitle}
        </Text>
      </View>

      {/* 3. Persona Cards List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {PERSONA_ITEMS.map((item) => {
            const isSelected = selectedId === item.id;
            const title = t.persona[item.titleKey];
            const subtitle = t.persona[item.subtitleKey];

            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${title} persona, ${subtitle}`}
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.85}
                onPress={() => handleSelect(item.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? theme.primary : theme.surfaceBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}>
                {/* Left: Avatar Circle */}
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isDark ? item.iconBgColorDark : item.iconBgColorLight,
                    },
                  ]}>
                  <Text style={styles.avatarEmoji}>{item.icon}</Text>
                </View>

                {/* Center: Title, Person Name & Subtitle */}
                <View style={styles.cardContent}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                      {title}
                    </Text>
                    <Text style={[styles.cardPersonName, { color: theme.textMuted }]}>
                      • {item.personName}
                    </Text>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                    {subtitle}
                  </Text>
                </View>

                {/* Right: Radio Selection Indicator */}
                <View
                  style={[
                    styles.radioRing,
                    {
                      borderColor: isSelected ? theme.primary : (isDark ? '#334155' : '#CBD5E1'),
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                    },
                  ]}>
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <DisclaimerNotice compact message={t.persona.noticeText} />
      </ScrollView>

      {/* 4. Action Button */}
      <View style={styles.bottomActionContainer}>
        <AppButton
          title={isLoading ? t.common.loading : format(t.persona.continueAs, { name: t.persona[selectedPersonaItem.titleKey] })}
          variant="primary"
          disabled={isLoading}
          onPress={handleProceed}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  titleSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardPersonName: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  bottomActionContainer: {
    paddingTop: 8,
  },
  continueButton: {
    width: '100%',
    minHeight: 52,
  },
});
