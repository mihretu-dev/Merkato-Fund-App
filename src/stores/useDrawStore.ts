/**
 * Merkato Fund — Algorithmic Draw Zustand Store
 *
 * Manages demonstration draw state, countdowns, participant tickets,
 * and isolated demo draw execution with mandatory disclaimer labels.
 */

import { create } from 'zustand';
import { DailyDraw, DrawTicket } from '@/src/domain/types';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';
import { ExecuteDrawResult } from '@/src/services/interfaces/IMerkatoService';

interface DrawState {
  activeDraw: DailyDraw | null;
  drawHistory: DailyDraw[];
  userTickets: DrawTicket[];
  eligibleDrawTickets: DrawTicket[];
  lastDrawResult: ExecuteDrawResult | null;
  isLoading: boolean;
  isDrawing: boolean;
  error: string | null;

  // Actions
  loadDrawData: (userId: string) => Promise<void>;
  executeDemoDraw: (drawId?: string, seed?: string) => Promise<ExecuteDrawResult>;
  addSampleTicket: (userId: string, drawId?: string) => Promise<DrawTicket>;
  resetActiveDraw: (drawId?: string) => Promise<void>;
  addUserTicket: (ticket: DrawTicket) => void;
  resetDrawStore: () => void;
}

export const useDrawStore = create<DrawState>((set, get) => ({
  activeDraw: null,
  drawHistory: [],
  userTickets: [],
  eligibleDrawTickets: [],
  lastDrawResult: null,
  isLoading: false,
  isDrawing: false,
  error: null,

  loadDrawData: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const active = await mockMerkatoService.getActiveDraw();
      const history = await mockMerkatoService.getDrawHistory();
      const tickets = await mockMerkatoService.getUserTickets(userId);
      const drawTickets = await mockMerkatoService.getDrawTickets(active.id);

      set({
        activeDraw: active,
        drawHistory: history,
        userTickets: tickets,
        eligibleDrawTickets: drawTickets,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load draw data';
      set({ error: msg, isLoading: false });
    }
  },

  executeDemoDraw: async (drawId?: string, seed?: string) => {
    set({ isDrawing: true, error: null });
    try {
      const result = await mockMerkatoService.simulateDailyDraw(drawId, seed);
      const history = await mockMerkatoService.getDrawHistory();
      const active = await mockMerkatoService.getActiveDraw();
      const drawTickets = await mockMerkatoService.getDrawTickets(result.draw.id);

      set((state) => ({
        lastDrawResult: result,
        drawHistory: history,
        activeDraw: active,
        eligibleDrawTickets: drawTickets,
        isDrawing: false,
      }));

      // Synchronously notify user and winner stores
      try {
        const { useUserStore } = await import('./useUserStore');
        const { useWinnerStore } = await import('./useWinnerStore');

        useUserStore.getState().updateCurrentUser(result.winner);
        await useWinnerStore.getState().loadWinnerData(result.winner.id);
      } catch {
        // Safe fallback in tests
      }

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Draw simulation failed';
      set({ error: msg, isDrawing: false });
      throw err;
    }
  },

  addSampleTicket: async (userId: string, drawId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const ticket = await mockMerkatoService.addSampleTicket(userId, drawId);
      const active = await mockMerkatoService.getActiveDraw();
      const drawTickets = await mockMerkatoService.getDrawTickets(active.id);

      set((state) => ({
        userTickets: [ticket, ...state.userTickets],
        eligibleDrawTickets: drawTickets,
        activeDraw: active,
        isLoading: false,
      }));

      return ticket;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add sample ticket';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  resetActiveDraw: async (drawId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const resetDraw = await mockMerkatoService.resetActiveDraw(drawId);
      const history = await mockMerkatoService.getDrawHistory();
      const drawTickets = await mockMerkatoService.getDrawTickets(resetDraw.id);

      set({
        activeDraw: resetDraw,
        drawHistory: history,
        eligibleDrawTickets: drawTickets,
        lastDrawResult: null,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset active draw';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  addUserTicket: (ticket: DrawTicket) => {
    set((state) => {
      const alreadyHasUserTicket = state.userTickets.some((t) => t.id === ticket.id);
      const alreadyHasEligibleTicket = state.eligibleDrawTickets.some((t) => t.id === ticket.id);
      return {
        userTickets: alreadyHasUserTicket ? state.userTickets : [ticket, ...state.userTickets],
        eligibleDrawTickets: alreadyHasEligibleTicket
          ? state.eligibleDrawTickets
          : [ticket, ...state.eligibleDrawTickets],
      };
    });
  },

  resetDrawStore: () => {
    set({
      activeDraw: null,
      drawHistory: [],
      userTickets: [],
      eligibleDrawTickets: [],
      lastDrawResult: null,
      isLoading: false,
      isDrawing: false,
      error: null,
    });
  },
}));
