/**
 * Merkato Fund — Contribution Zustand Store
 *
 * Manages daily micro-contributions, streak status, and transaction history.
 */

import { create } from 'zustand';
import { ContributionRecord, PaymentChannel } from '@/src/domain/types';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { SubmitContributionResult } from '@/src/services/interfaces/IMerkatoService';

interface ContributionState {
  contributions: ContributionRecord[];
  paidToday: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserContributions: (userId: string) => Promise<void>;
  submitDailyContribution: (
    userId: string,
    channel: PaymentChannel,
    amountETB?: number
  ) => Promise<SubmitContributionResult>;
  resetContributionStore: () => void;
}

export const useContributionStore = create<ContributionState>((set, get) => ({
  contributions: [],
  paidToday: false,
  isLoading: false,
  error: null,

  loadUserContributions: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const records = await mockMerkatoService.getContributions(userId);
      const isPaid = await mockMerkatoService.checkContributedToday(userId);
      set({
        contributions: records,
        paidToday: isPaid,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load contributions';
      set({ error: msg, isLoading: false });
    }
  },

  submitDailyContribution: async (
    userId: string,
    channel: PaymentChannel,
    amountETB: number = 50
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockMerkatoService.submitContribution({
        userId,
        amountETB,
        channel,
      });

      set((state) => ({
        contributions: [result.contribution, ...state.contributions],
        paidToday: true,
        isLoading: false,
      }));

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit contribution';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  resetContributionStore: () => {
    set({
      contributions: [],
      paidToday: false,
      isLoading: false,
      error: null,
    });
  },
}));
