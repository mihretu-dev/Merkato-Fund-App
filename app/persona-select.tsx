/**
 * Merkato Fund — Demo Persona Selection Screen
 *
 * Dedicated entry point allowing reviewers to choose between 3 synthetic personas:
 * 1. Dawit Haile (Member / Contributor)
 * 2. Bethlehem Tadesse (Winner / 6-Month Blocked Escrow)
 * 3. Abebe Kebede (Admin / Pool Auditor)
 *
 * Each card explains what portion of the prototype it opens.
 * Selecting a persona re-hydrates all Zustand stores and routes to the Member Dashboard.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import { Card, AppButton, DemoBadge, DisclaimerNotice, StatusPill } from '@/src/components/ui';
import { useUserStore } from '@/src/stores/useUserStore';
import { DemoPersonaId } from '@/src/domain/types';

interface PersonaOption {
  id: DemoPersonaId;
  name: string;
  amharicName: string;
  role: 'member' | 'winner' | 'admin';
  roleLabel: string;
  occupation: string;
  location: string;
  phone: string;
  highlightTag: string;
  summary: string;
  keyFeatures: string[];
  initialRouteTitle: string;
  themeColor: string;
  bgTint: string;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'dawit',
    name: 'Dawit Haile',
    amharicName: 'ዳዊት ኃይሌ',
    role: 'member',
    roleLabel: 'PRE-WIN MEMBER',
    occupation: 'Electronics Importer & Retailer',
    location: 'Merkato, Addis Ababa',
    phone: '+251 91 123 4567',
    highlightTag: 'PRIMARY DEMO FLOW',
    summary: 'Experience the daily micro-contribution journey from a standard active participant perspective.',
    keyFeatures: [
      'Daily 50 ETB contribution checkout (Telebirr & CBE)',
      '14-day continuous streak tracking',
      'Tonight’s algorithmic draw ticket issuance',
      'Draw countdown & simulated participant pool',
    ],
    initialRouteTitle: 'Launch Member Dashboard →',
    themeColor: colors.primaryLight,
    bgTint: '#0B201A',
  },
  {
    id: 'bethlehem',
    name: 'Bethlehem Tadesse',
    amharicName: 'ቤተልሔም ታደሰ',
    role: 'winner',
    roleLabel: 'ESCROW WINNER (DAY 45)',
    occupation: 'Specialty Coffee Exporter',
    location: 'Bole Sub-City, Addis Ababa',
    phone: '+251 92 345 6789',
    highlightTag: 'WINNER EXPERIENCE',
    summary: 'Evaluate the financial mechanics of the 1,000,000 ETB payout held in a 6-month blocked escrow account.',
    keyFeatures: [
      '1,000,000 ETB CBE escrow blocked account view',
      'Daily 602.74 ETB interest accrual counter (22% p.a.)',
      '500 ETB principal + 50 ETB fee daily repayment schedule',
      '7,500 ETB winner buffer with 15-day replenishment',
    ],
    initialRouteTitle: 'Inspect Winner Escrow Hub →',
    themeColor: colors.accentGold,
    bgTint: '#1E170A',
  },
  {
    id: 'admin',
    name: 'Abebe Kebede',
    amharicName: 'አበበ ከበደ',
    role: 'admin',
    roleLabel: 'COMPLIANCE AUDITOR',
    occupation: 'Risk Analyst & Regulatory Auditor',
    location: 'Addis Ababa Financial Center',
    phone: '+251 93 456 7890',
    highlightTag: 'SYSTEM & POOL AUDIT',
    summary: 'Audit pool feasibility assumptions, the 20,000-member scale floor, and algorithmic draw verification logs.',
    keyFeatures: [
      'Synthetic pool feasibility model (24,850 participants)',
      '1,242,500 ETB gross daily inflow vs 1M prize allocation',
      '20,000-member floor scale sensitivity stress-testing',
      'Demonstration draw hash logs & seed verification',
    ],
    initialRouteTitle: 'Open Compliance & Pool Audit →',
    themeColor: colors.telebirr,
    bgTint: '#0F172A',
  },
];

export default function PersonaSelectScreen() {
  const router = useRouter();
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

  const handleReplayOnboarding = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.screenAmharic}>የግምገማ መገለጫ ይምረጡ</Text>
              <Text style={styles.screenTitle}>Select Demo Persona</Text>
            </View>
            <DemoBadge label="EVALUATION SELECTOR" />
          </View>

          <Text style={styles.screenSubtitle}>
            Merkato Fund is a multi-sided ecosystem prototype. Choose a synthetic persona below to test its corresponding role and financial view.
          </Text>

          {/* Persona Cards List */}
          <View style={styles.cardsList}>
            {PERSONA_OPTIONS.map((persona) => {
              const isSelected = selectedId === persona.id;
              const isCurrentlyLoaded = currentPersonaId === persona.id;

              return (
                <TouchableOpacity
                  key={persona.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${persona.name}, role ${persona.roleLabel}`}
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(persona.id)}
                  style={[
                    styles.personaCard,
                    { backgroundColor: persona.bgTint },
                    isSelected && { borderColor: persona.themeColor, borderWidth: 2 },
                  ]}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                      <Text style={[styles.avatarText, { color: persona.themeColor }]}>
                        {persona.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Text>
                    </View>

                    <View style={styles.headerMeta}>
                      <View style={styles.titleRow}>
                        <Text style={styles.personaName}>{persona.name}</Text>
                        <StatusPill
                          status={
                            persona.role === 'winner'
                              ? 'caution'
                              : persona.role === 'admin'
                              ? 'info'
                              : 'healthy'
                          }
                          label={persona.roleLabel}
                          size="small"
                        />
                      </View>
                      <Text style={styles.personaOccupation}>{persona.occupation}</Text>
                      <Text style={styles.personaLocation}>📍 {persona.location}</Text>
                    </View>
                  </View>

                  {/* Summary */}
                  <Text style={styles.personaSummary}>{persona.summary}</Text>

                  {/* Features Bullet List */}
                  <View style={styles.featureBox}>
                    <Text style={styles.featureTitle}>DEMONSTRATION SCOPE:</Text>
                    {persona.keyFeatures.map((feat, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <Text style={[styles.featureBullet, { color: persona.themeColor }]}>•</Text>
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Selection Indicator Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.selectionStateRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && { borderColor: persona.themeColor },
                        ]}>
                        {isSelected && (
                          <View
                            style={[
                              styles.radioDot,
                              { backgroundColor: persona.themeColor },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.selectionLabel,
                          isSelected && { color: persona.themeColor, fontWeight: '700' },
                        ]}>
                        {isSelected ? 'SELECTED FOR EVALUATION' : 'Tap to Select Persona'}
                      </Text>
                    </View>

                    {isCurrentlyLoaded && (
                      <StatusPill status="info" label="STATE HYDRATED" size="small" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Footer */}
          <View style={styles.actionContainer}>
            <AppButton
              title={
                isLoading
                  ? 'Hydrating Persona State...'
                  : PERSONA_OPTIONS.find((p) => p.id === selectedId)?.initialRouteTitle || 'Launch Dashboard →'
              }
              variant="primary"
              disabled={isLoading}
              onPress={handleProceed}
              fullWidth
            />

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Replay onboarding walkthrough"
                onPress={handleReplayOnboarding}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>📖 Replay Onboarding Walkthrough</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open Developer Verification Harness"
                onPress={() => router.push('/(tabs)/verify')}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>🛠️ State Verification</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mandatory Disclaimer */}
          <DisclaimerNotice />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 620,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  screenAmharic: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  screenTitle: {
    ...typography.h1,
    fontSize: 24,
    color: colors.dark.textPrimary,
  },
  screenSubtitle: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  cardsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  personaCard: {
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.dark.surfaceBorder,
  },
  avatarText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  headerMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  personaName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.dark.textPrimary,
  },
  personaOccupation: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  personaLocation: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  personaSummary: {
    ...typography.bodySmall,
    fontSize: 13,
    lineHeight: 18,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  featureBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    ...typography.label,
    fontSize: 10,
    color: colors.dark.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featureBullet: {
    fontSize: 14,
    lineHeight: 16,
    marginRight: 6,
  },
  featureText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: colors.dark.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectionStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectionLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  actionContainer: {
    marginBottom: spacing.md,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.dark.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
