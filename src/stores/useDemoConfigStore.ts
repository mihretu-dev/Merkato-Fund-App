/**
 * Merkato Fund — Demo Configuration Zustand Store
 *
 * Provides reactive controls to toggle contested financial parameters
 * (e.g., 500 ETB vs 550 ETB repayment, 22% annual interest assumption).
 */

import { create } from 'zustand';
import { DemoConfiguration, DEFAULT_DEMO_CONFIG } from '@/src/domain/types';

interface DemoConfigState {
  config: DemoConfiguration;
  repaymentDailyModel: '500_plus_50' | '550_bundle' | '500_only';

  // Actions
  updateConfig: (partial: Partial<DemoConfiguration>) => void;
  setRepaymentDailyModel: (model: '500_plus_50' | '550_bundle' | '500_only') => void;
  resetConfig: () => void;
}

export const useDemoConfigStore = create<DemoConfigState>((set) => ({
  config: { ...DEFAULT_DEMO_CONFIG },
  repaymentDailyModel: '500_plus_50',

  updateConfig: (partial: Partial<DemoConfiguration>) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }));
  },

  setRepaymentDailyModel: (model: '500_plus_50' | '550_bundle' | '500_only') => {
    set((state) => {
      let principal = 500;
      let adminFee = 50;

      if (model === '550_bundle') {
        principal = 550;
        adminFee = 0;
      } else if (model === '500_only') {
        principal = 500;
        adminFee = 0;
      }

      return {
        repaymentDailyModel: model,
        config: {
          ...state.config,
          dailyPrincipalRepaymentETB: principal,
          dailyAdminFeeETB: adminFee,
        },
      };
    });
  },

  resetConfig: () => {
    set({
      config: { ...DEFAULT_DEMO_CONFIG },
      repaymentDailyModel: '500_plus_50',
    });
  },
}));
