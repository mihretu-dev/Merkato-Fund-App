/**
 * Merkato Fund — Stores Barrel Export & Unified Demo Reset
 */

import { useUserStore } from './useUserStore';
import { useContributionStore } from './useContributionStore';
import { useDrawStore } from './useDrawStore';
import { useWinnerStore } from './useWinnerStore';
import { useDemoConfigStore } from './useDemoConfigStore';
import { mockMerkatoService } from '@/src/services/mock/MockMerkatoService';

import { useLanguageStore } from './useLanguageStore';

export {
  useUserStore,
  useContributionStore,
  useDrawStore,
  useWinnerStore,
  useDemoConfigStore,
  useLanguageStore,
};

/**
 * Unified demo reset function:
 * Resets the underlying mock service repository AND all Zustand stores
 * back to their initial seeded demonstration states.
 */
export async function resetAllDemoStores(): Promise<void> {
  // 1. Reset mock service memory
  await mockMerkatoService.resetDemo();

  // 2. Reset individual Zustand stores
  useUserStore.getState().resetUserStore();
  useContributionStore.getState().resetContributionStore();
  useDrawStore.getState().resetDrawStore();
  useWinnerStore.getState().resetWinnerStore();
  useDemoConfigStore.getState().resetConfig();

  // 3. Re-hydrate default persona (Dawit Haile)
  const defaultUser = useUserStore.getState().currentUser;
  await Promise.all([
    useContributionStore.getState().loadUserContributions(defaultUser.id),
    useDrawStore.getState().loadDrawData(defaultUser.id),
    useWinnerStore.getState().loadWinnerData(defaultUser.id),
  ]);
}
