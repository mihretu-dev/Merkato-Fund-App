/**
 * Merkato Fund — Automated Tests for Zustand Stores
 *
 * Verifies reactive state management across:
 * - useUserStore (persona switching)
 * - useContributionStore (daily micro-contributions)
 * - useDrawStore (tickets and draw simulation)
 * - useWinnerStore (escrow, repayments, buffer)
 * - useDemoConfigStore (configurable rate & repayment assumptions)
 * - resetAllDemoStores (unified demo reset)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  useUserStore,
  useContributionStore,
  useDrawStore,
  useWinnerStore,
  useDemoConfigStore,
  resetAllDemoStores,
} from '../index';

describe('Zustand Stores Test Suite', () => {
  beforeEach(async () => {
    await resetAllDemoStores();
  });

  describe('1. useUserStore', () => {
    it('initializes with Dawit Haile as default persona', () => {
      const user = useUserStore.getState().currentUser;
      assert.equal(user.personaId, 'dawit');
      assert.equal(user.fullName, 'Dawit Haile');
      assert.equal(user.role, 'member');
    });

    it('switches persona cleanly to Bethlehem (winner)', async () => {
      await useUserStore.getState().switchPersona('bethlehem');

      const user = useUserStore.getState().currentUser;
      const personaId = useUserStore.getState().currentPersonaId;

      assert.equal(personaId, 'bethlehem');
      assert.equal(user.fullName, 'Bethlehem Tadesse');
      assert.equal(user.role, 'winner');
    });

    it('switches persona cleanly to Admin', async () => {
      await useUserStore.getState().switchPersona('admin');

      const user = useUserStore.getState().currentUser;
      assert.equal(user.role, 'admin');
      assert.equal(user.fullName, 'Abebe Kebede');
    });

    it('tracks and toggles onboarding completion status', () => {
      // Set completed
      useUserStore.getState().setHasCompletedOnboarding(true);
      assert.equal(useUserStore.getState().hasCompletedOnboarding, true);

      // Reset onboarding
      useUserStore.getState().resetOnboarding();
      assert.equal(useUserStore.getState().hasCompletedOnboarding, false);
    });
  });

  describe('2. useContributionStore', () => {
    it('submits daily contribution and updates paidToday state', async () => {
      const user = useUserStore.getState().currentUser;

      const result = await useContributionStore
        .getState()
        .submitDailyContribution(user.id, 'telebirr', 50);

      assert.equal(result.contribution.amountETB, 50);
      assert.equal(useContributionStore.getState().paidToday, true);
      assert.equal(useContributionStore.getState().contributions.length, 15);
    });

    it('records contribution exactly once and updates all stores consistently', async () => {
      const initialUser = useUserStore.getState().currentUser;
      const initialStreak = initialUser.activeStreakDays;
      const initialBalance = initialUser.simulatedWalletBalanceETB;

      const result = await useContributionStore
        .getState()
        .submitDailyContribution(initialUser.id, 'cbe_birr', 50);

      // Ledger updated
      assert.equal(useContributionStore.getState().contributions.length, 15);
      assert.equal(useContributionStore.getState().contributions[0].channel, 'cbe_birr');
      assert.equal(useContributionStore.getState().paidToday, true);

      // User store updated
      const updatedUser = useUserStore.getState().currentUser;
      assert.equal(updatedUser.activeStreakDays, initialStreak + 1);
      assert.equal(updatedUser.simulatedWalletBalanceETB, initialBalance - 50);
      assert.equal(updatedUser.totalContributedETB, initialUser.totalContributedETB + 50);

      // Draw ticket issued in useDrawStore
      const tickets = useDrawStore.getState().userTickets;
      const hasTicket = tickets.some((t) => t.ticketNumber === result.ticket.ticketNumber);
      assert.ok(hasTicket, 'Draw ticket should be registered in useDrawStore');
    });

    it('prevents duplicate contribution on the same calendar day', async () => {
      const user = useUserStore.getState().currentUser;

      // First contribution succeeds
      await useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50);
      assert.equal(useContributionStore.getState().paidToday, true);

      // Second contribution rejected
      await assert.rejects(
        () => useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50),
        /User has already contributed for today/
      );

      // Ensure ledger count did not increment twice
      assert.equal(useContributionStore.getState().contributions.length, 15);
    });

    it('handles failed contribution without corrupting state', async () => {
      const initialCount = useContributionStore.getState().contributions.length;

      await assert.rejects(
        () => useContributionStore.getState().submitDailyContribution('nonexistent-user', 'telebirr', 50),
        /User not found/
      );

      assert.equal(useContributionStore.getState().contributions.length, initialCount);
      assert.equal(useContributionStore.getState().paidToday, false);
      assert.equal(useContributionStore.getState().isLoading, false);
    });

    it('supports all valid simulated payment channels (telebirr, cbe_birr, awash_birr)', async () => {
      const user = useUserStore.getState().currentUser;

      // awash_birr channel test
      const res = await useContributionStore
        .getState()
        .submitDailyContribution(user.id, 'awash_birr', 50);

      assert.equal(res.contribution.channel, 'awash_birr');
      assert.equal(res.contribution.status, 'completed');
      assert.equal(res.contribution.isSimulated, true);
    });
  });

  describe('3. useDrawStore', () => {
    it('loads draw and tickets for user', async () => {
      const user = useUserStore.getState().currentUser;
      await useDrawStore.getState().loadDrawData(user.id);

      const active = useDrawStore.getState().activeDraw;
      assert.ok(active);
      assert.equal(active.prizeAmountETB, 1_000_000);
    });

    it('executes demonstration draw and records result', async () => {
      const res = await useDrawStore.getState().executeDemoDraw();

      assert.ok(res.winningTicket.ticketNumber);
      assert.equal(res.isDemonstrationOnly, true);
      assert.equal(useDrawStore.getState().lastDrawResult?.draw.status, 'completed');
    });
  });

  describe('4. useWinnerStore', () => {
    it('loads winner escrow and buffer data for Bethlehem', async () => {
      await useWinnerStore.getState().loadWinnerData('user-bethlehem-002');

      const escrow = useWinnerStore.getState().escrowAccount;
      const buffer = useWinnerStore.getState().winnerBuffer;

      assert.ok(escrow);
      assert.equal(escrow.principalAmountETB, 1_000_000);
      assert.ok(buffer);
      assert.equal(buffer.targetBufferAmountETB, 7500);
    });

    it('records repayment installment and depletes buffer', async () => {
      await useWinnerStore.getState().loadWinnerData('user-bethlehem-002');
      const prevBuffer = useWinnerStore.getState().winnerBuffer?.currentBufferBalanceETB || 0;

      await useWinnerStore.getState().recordRepayment('user-bethlehem-002', 'telebirr');

      const updatedBuffer = useWinnerStore.getState().winnerBuffer?.currentBufferBalanceETB;
      assert.equal(updatedBuffer, prevBuffer - 500);
    });
  });

  describe('5. useDemoConfigStore', () => {
    it('allows toggling between 500+50 and 550 flat repayment models', () => {
      useDemoConfigStore.getState().setRepaymentDailyModel('550_bundle');

      let config = useDemoConfigStore.getState().config;
      assert.equal(config.dailyPrincipalRepaymentETB, 550);
      assert.equal(config.dailyAdminFeeETB, 0);

      useDemoConfigStore.getState().setRepaymentDailyModel('500_plus_50');
      config = useDemoConfigStore.getState().config;
      assert.equal(config.dailyPrincipalRepaymentETB, 500);
      assert.equal(config.dailyAdminFeeETB, 50);
    });
  });

  describe('6. Unified Demo Reset (resetAllDemoStores)', () => {
    it('resets all stores and service data consistently', async () => {
      // Mutate
      await useUserStore.getState().switchPersona('admin');
      assert.equal(useUserStore.getState().currentPersonaId, 'admin');

      // Reset
      await resetAllDemoStores();

      // Verify
      assert.equal(useUserStore.getState().currentPersonaId, 'dawit');
      assert.equal(useContributionStore.getState().paidToday, false);
    });
  });
});
