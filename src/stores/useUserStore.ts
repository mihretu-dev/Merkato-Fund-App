/**
 * Merkato Fund — User & Persona Zustand Store
 *
 * Manages active demo persona, profiles, and instant persona switching.
 */

import { create } from 'zustand';
import { User, DemoPersonaId } from '@/src/domain/types';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { MOCK_PERSONAS } from '@/src/services/mock/mockData';

const getInitialOnboardingStatus = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('merkato_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  }
  return false;
};

interface UserState {
  currentPersonaId: DemoPersonaId;
  currentUser: User;
  availablePersonas: Record<DemoPersonaId, User>;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;

  // Actions
  switchPersona: (personaId: DemoPersonaId) => Promise<User>;
  updateCurrentUser: (partial: Partial<User>) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  resetOnboarding: () => void;
  resetUserStore: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentPersonaId: 'dawit',
  currentUser: { ...MOCK_PERSONAS.dawit },
  availablePersonas: { ...MOCK_PERSONAS },
  isLoading: false,
  error: null,
  hasCompletedOnboarding: getInitialOnboardingStatus(),

  setHasCompletedOnboarding: (completed: boolean) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('merkato_onboarding_completed', completed ? 'true' : 'false');
      } catch {
        // ignore
      }
    }
    set({ hasCompletedOnboarding: completed });
  },

  resetOnboarding: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('merkato_onboarding_completed');
      } catch {
        // ignore
      }
    }
    set({ hasCompletedOnboarding: false });
  },

  switchPersona: async (personaId: DemoPersonaId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await mockMerkatoService.getUserByPersona(personaId);
      set({
        currentPersonaId: personaId,
        currentUser: user,
        isLoading: false,
      });

      // Synchronously re-hydrate dependent stores for the new persona
      try {
        const { useContributionStore } = await import('./useContributionStore');
        const { useDrawStore } = await import('./useDrawStore');
        const { useWinnerStore } = await import('./useWinnerStore');

        await Promise.all([
          useContributionStore.getState().loadUserContributions(user.id),
          useDrawStore.getState().loadDrawData(user.id),
          useWinnerStore.getState().loadWinnerData(user.id),
        ]);
      } catch {
        // Safe fallback for isolated unit tests
      }

      return user;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch persona';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  updateCurrentUser: (partial: Partial<User>) => {
    set((state) => {
      const updated = { ...state.currentUser, ...partial };
      return {
        currentUser: updated,
        availablePersonas: {
          ...state.availablePersonas,
          [updated.personaId]: updated,
        },
      };
    });
  },

  resetUserStore: () => {
    set({
      currentPersonaId: 'dawit',
      currentUser: { ...MOCK_PERSONAS.dawit },
      availablePersonas: { ...MOCK_PERSONAS },
      isLoading: false,
      error: null,
    });
  },
}));
