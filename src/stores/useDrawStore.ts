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
  lastDrawResult: ExecuteDrawResult | null;
  isLoading: boolean;
  isDrawing: boolean;
  error: string | null;

  // Actions
  loadDrawData: (userId: string) => Promise<void>;
  executeDemoDraw: (drawId?: string) => Promise<ExecuteDrawResult>;
  addUserTicket: (ticket: DrawTicket) => void;
  resetDrawStore: () => void;
}

export const useDrawStore = create<DrawState>((set, get) => ({
  activeDraw: null,
  drawHistory: [],
  userTickets: [],
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

      set({
        activeDraw: active,
        drawHistory: history,
        userTickets: tickets,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load draw data';
      set({ error: msg, isLoading: false });
    }
  },

  executeDemoDraw: async (drawId?: string) => {
    set({ isDrawing: true, error: null });
    try {
      const result = await mockMerkatoService.simulateDailyDraw(drawId);
      const history = await mockMerkatoService.getDrawHistory();
      const active = await mockMerkatoService.getActiveDraw();

      set((state) => ({
        lastDrawResult: result,
        drawHistory: history,
        activeDraw: active,
        isDrawing: false,
      }));

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Draw simulation failed';
      set({ error: msg, isDrawing: false });
      throw err;
    }
  },

  addUserTicket: (ticket: DrawTicket) => {
    set((state) => ({
      userTickets: [ticket, ...state.userTickets],
    }));
  },

  resetDrawStore: () => {
    set({
      activeDraw: null,
      drawHistory: [],
      userTickets: [],
      lastDrawResult: null,
      isLoading: false,
      isDrawing: false,
      error: null,
    });
  },
}));
