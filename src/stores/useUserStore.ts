/**
 * Merkato Fund — User & Persona Zustand Store
 *
 * Manages active demo persona, profiles, and instant persona switching.
 */

import { create } from 'zustand';
import { User, DemoPersonaId } from '@/src/domain/types';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { MOCK_PERSONAS } from '@/src/services/mock/mockData';

interface UserState {
  currentPersonaId: DemoPersonaId;
  currentUser: User;
  availablePersonas: Record<DemoPersonaId, User>;
  isLoading: boolean;
  error: string | null;

  // Actions
  switchPersona: (personaId: DemoPersonaId) => Promise<User>;
  updateCurrentUser: (partial: Partial<User>) => void;
  resetUserStore: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentPersonaId: 'dawit',
  currentUser: { ...MOCK_PERSONAS.dawit },
  availablePersonas: { ...MOCK_PERSONAS },
  isLoading: false,
  error: null,

  switchPersona: async (personaId: DemoPersonaId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await mockMerkatoService.getUserByPersona(personaId);
      set({
        currentPersonaId: personaId,
        currentUser: user,
        isLoading: false,
      });
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
