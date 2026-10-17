/**
 * Merkato Fund — Winner Zustand Store
 *
 * Manages winner escrow custody (1,000,000 ETB at 22% yield),
 * escalated daily repayment schedule (500 ETB + 50 ETB),
 * and the 15-day / 7,500 ETB rolling buffer.
 */

import { create } from 'zustand';
import { EscrowAccount, RepaymentSchedule, WinnerBuffer, PaymentChannel } from '@/src/domain/types';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';

interface WinnerState {
  escrowAccount: EscrowAccount | null;
  repaymentSchedule: RepaymentSchedule | null;
  winnerBuffer: WinnerBuffer | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadWinnerData: (userId: string) => Promise<void>;
  recordRepayment: (userId: string, channel?: PaymentChannel) => Promise<void>;
  replenishBuffer: (userId: string, amountETB?: number) => Promise<void>;
  resetWinnerStore: () => void;
}

export const useWinnerStore = create<WinnerState>((set, get) => ({
  escrowAccount: null,
  repaymentSchedule: null,
  winnerBuffer: null,
  isLoading: false,
  error: null,

  loadWinnerData: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const escrow = await mockMerkatoService.getEscrowAccount(userId);
      const repayment = await mockMerkatoService.getRepaymentSchedule(userId);
      const buffer = await mockMerkatoService.getWinnerBuffer(userId);

      set({
        escrowAccount: escrow,
        repaymentSchedule: repayment,
        winnerBuffer: buffer,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load winner data';
      set({ error: msg, isLoading: false });
    }
  },

  recordRepayment: async (userId: string, channel: PaymentChannel = 'telebirr') => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockMerkatoService.recordRepaymentInstallment(userId, channel);
      set({
        repaymentSchedule: result.schedule,
        winnerBuffer: result.buffer,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Repayment recording failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  replenishBuffer: async (userId: string, amountETB: number = 2500) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBuffer = await mockMerkatoService.replenishWinnerBuffer(userId, amountETB);
      set({
        winnerBuffer: updatedBuffer,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Buffer replenishment failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  resetWinnerStore: () => {
    set({
      escrowAccount: null,
      repaymentSchedule: null,
      winnerBuffer: null,
      isLoading: false,
      error: null,
    });
  },
}));
