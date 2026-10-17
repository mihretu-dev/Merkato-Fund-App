/**
 * Merkato Fund — Fast Persona Selector Primitive
 *
 * Allows reviewers to instantly toggle between the three core synthetic personas:
 * 1. Dawit Haile (Member / Active Daily Contributor)
 * 2. Bethlehem Tadesse (Winner / 6-Month Blocked Escrow)
 * 3. Abebe Kebede (Admin / Pool Auditor)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/src/stores/useUserStore';
import { useContributionStore } from '@/src/stores/useContributionStore';
import { useDrawStore } from '@/src/stores/useDrawStore';
import { useWinnerStore } from '@/src/stores/useWinnerStore';
import { DemoPersonaId } from '@/src/domain/types';
import { colors, radii, spacing, typography, fontFamilies } from '@/src/theme/tokens';
import { StatusPill } from './StatusPill';

interface PersonaSelectorProps {
  onPersonaChanged?: (personaId: DemoPersonaId) => void;
  compact?: boolean;
}

export function PersonaSelector({ onPersonaChanged, compact = false }: PersonaSelectorProps) {
  const currentPersonaId = useUserStore((s) => s.currentPersonaId);
  const availablePersonas = useUserStore((s) => s.availablePersonas);
  const isLoading = useUserStore((s) => s.isLoading);
  const switchPersona = useUserStore((s) => s.switchPersona);

  const handleSelectPersona = async (personaId: DemoPersonaId) => {
    if (personaId === currentPersonaId || isLoading) return;

    try {
      const newUser = await switchPersona(personaId);
      // Synchronously trigger data hydration for the newly active persona
      await Promise.all([
        useContributionStore.getState().loadUserContributions(newUser.id),
        useDrawStore.getState().loadDrawData(newUser.id),
        useWinnerStore.getState().loadWinnerData(newUser.id),
      ]);
      onPersonaChanged?.(personaId);
    } catch (e) {
      console.error('Failed to switch persona:', e);
    }
  };

  const personaList: DemoPersonaId[] = ['dawit', 'bethlehem', 'admin'];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {personaList.map((id) => {
          const persona = availablePersonas[id];
          const isSelected = currentPersonaId === id;
          return (
            <TouchableOpacity
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`Switch to persona ${persona.fullName}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleSelectPersona(id)}
              style={[
                styles.compactButton,
                isSelected && styles.compactButtonActive,
              ]}>
              <Text
                style={[
                  styles.compactButtonText,
                  isSelected && styles.compactButtonTextActive,
                ]}>
                {persona.fullName.split(' ')[0]} ({persona.role === 'admin' ? 'Auditor' : persona.role === 'winner' ? 'Winner' : 'Member'})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>SELECT DEMO PERSONA</Text>
        {isLoading && <ActivityIndicator size="small" color={colors.primaryLight} />}
      </View>

      <View style={styles.cardsRow}>
        {personaList.map((id) => {
          const persona = availablePersonas[id];
          const isSelected = currentPersonaId === id;

          let rolePillStatus: 'healthy' | 'caution' | 'info' = 'healthy';
          if (persona.role === 'winner') rolePillStatus = 'caution';
          if (persona.role === 'admin') rolePillStatus = 'info';

          return (
            <TouchableOpacity
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`Select persona ${persona.fullName}, role ${persona.role}`}
              accessibilityState={{ selected: isSelected }}
              activeOpacity={0.75}
              onPress={() => handleSelectPersona(id)}
              style={[
                styles.card,
                isSelected && styles.cardActive,
              ]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {persona.fullName}
                </Text>
                <StatusPill
                  status={rolePillStatus}
                  label={persona.role.toUpperCase()}
                  size="small"
                />
              </View>

              <Text style={styles.cardOccupation} numberOfLines={1}>
                {persona.occupation || 'Platform User'}
              </Text>

              <Text style={styles.cardPhone}>
                {persona.phoneNumber} • {persona.location}
              </Text>

              {isSelected && (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeLabel}>ACTIVE DEMO VIEW</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.8,
  },
  cardsRow: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
    padding: spacing.md,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontFamily: fontFamilies.sans,
    fontSize: 17,
    fontWeight: typography.fontWeights.bold,
    color: colors.dark.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardOccupation: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 2,
  },
  cardPhone: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.dark.textMuted,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 148, 136, 0.3)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
    marginRight: 6,
  },
  activeLabel: {
    fontFamily: fontFamilies.sans,
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Compact segmented styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surface,
    padding: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.surfaceBorder,
  },
  compactButton: {
    flex: 1,
    minHeight: 38,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  compactButtonText: {
    fontFamily: fontFamilies.sans,
    color: colors.dark.textSecondary,
    fontWeight: typography.fontWeights.medium,
    fontSize: 12,
  },
  compactButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeights.bold,
  },
});

