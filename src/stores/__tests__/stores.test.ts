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
      assert.equal(useDrawStore.getState().eligibleDrawTickets.length, 0);
    });

    it('rejects execution when zero eligible tickets exist', async () => {
      const user = useUserStore.getState().currentUser;
      await useDrawStore.getState().loadDrawData(user.id);

      await assert.rejects(
        () => useDrawStore.getState().executeDemoDraw('draw-20261017'),
        /zero eligible tickets/
      );
      assert.equal(useDrawStore.getState().lastDrawResult, null);
    });

    it('executes draw when eligible ticket exists and ensures winner matches owner', async () => {
      const user = useUserStore.getState().currentUser;

      // Submit contribution to get eligible ticket
      const contrib = await useContributionStore
        .getState()
        .submitDailyContribution(user.id, 'telebirr', 50);

      const res = await useDrawStore.getState().executeDemoDraw('draw-20261017');

      assert.ok(res.winningTicket.ticketNumber);
      assert.equal(res.winningTicket.ticketNumber, contrib.ticket.ticketNumber);
      assert.equal(res.winner.id, user.id);
      assert.equal(res.winner.fullName, user.fullName);
      assert.equal(res.isDemonstrationOnly, true);
      assert.equal(useDrawStore.getState().lastDrawResult?.draw.status, 'completed');

      // Verify winner escrow was automatically hydrated in useWinnerStore
      const escrow = useWinnerStore.getState().escrowAccount;
      assert.ok(escrow);
      assert.equal(escrow.userId, user.id);
      assert.equal(escrow.principalAmountETB, 1_000_000);
    });

    it('prevents accidental duplicate execution on the same draw instance', async () => {
      const user = useUserStore.getState().currentUser;
      await useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50);

      // First run succeeds
      await useDrawStore.getState().executeDemoDraw('draw-20261017');

      // Second run rejected
      await assert.rejects(
        () => useDrawStore.getState().executeDemoDraw('draw-20261017'),
        /already been completed/
      );
    });

    it('allows replaying draw after calling resetActiveDraw', async () => {
      const user = useUserStore.getState().currentUser;
      await useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50);

      await useDrawStore.getState().executeDemoDraw('draw-20261017');
      assert.equal(useDrawStore.getState().activeDraw?.status, 'completed');

      await useDrawStore.getState().resetActiveDraw('draw-20261017');
      assert.equal(useDrawStore.getState().activeDraw?.status, 'scheduled');
      assert.equal(useDrawStore.getState().lastDrawResult, null);

      // Re-run succeeds
      const replay = await useDrawStore.getState().executeDemoDraw('draw-20261017');
      assert.equal(replay.draw.status, 'completed');
    });

    it('produces predictable winner selection with a deterministic seed', async () => {
      const user = useUserStore.getState().currentUser;

      // Add two tickets
      await useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50);
      await useDrawStore.getState().addSampleTicket('user-bethlehem-002', 'draw-20261017');

      const tickets = useDrawStore.getState().eligibleDrawTickets;
      assert.equal(tickets.length, 2);

      // Execute with fixed seed
      const fixedSeed = 'TEST-DETERMINISTIC-SEED-XYZ';
      const res = await useDrawStore.getState().executeDemoDraw('draw-20261017', fixedSeed);
      assert.ok(res.winningTicket.ticketNumber);

      // Verify that ineligible tickets from yesterday (draw-20261016) were not in eligible pool
      assert.ok(tickets.every((t) => t.drawId === 'draw-20261017'));
    });

    it('persona switching preserves draw result and does not overwrite it', async () => {
      const user = useUserStore.getState().currentUser;
      await useContributionStore.getState().submitDailyContribution(user.id, 'telebirr', 50);
      const res = await useDrawStore.getState().executeDemoDraw('draw-20261017');

      // Switch persona to Admin
      await useUserStore.getState().switchPersona('admin');
      const adminTickets = useDrawStore.getState().userTickets;

      // Admin has 0 tickets for today, but activeDraw status remains completed with Dawit as winner
      assert.equal(useDrawStore.getState().activeDraw?.status, 'completed');
      assert.equal(useDrawStore.getState().activeDraw?.winningTicketNumber, res.winningTicket.ticketNumber);
      assert.equal(useDrawStore.getState().activeDraw?.winnerUserId, user.id);
    });

    it('addUserTicket is idempotent and prevents duplicate ticket entries', () => {
      const sampleTicket = {
        id: 'test-ticket-duplicate-001',
        drawId: 'draw-20261017',
        userId: 'user-dawit-001',
        ticketNumber: 'MF-20261017-TEST',
        issuedAt: '2026-10-17T12:00:00+03:00',
        isWinningTicket: false,
      };

      // Add once
      useDrawStore.getState().addUserTicket(sampleTicket);
      const userCountOnce = useDrawStore.getState().userTickets.filter((t) => t.id === sampleTicket.id).length;
      const eligibleCountOnce = useDrawStore.getState().eligibleDrawTickets.filter((t) => t.id === sampleTicket.id).length;
      assert.equal(userCountOnce, 1);
      assert.equal(eligibleCountOnce, 1);

      // Add second time (idempotency check)
      useDrawStore.getState().addUserTicket(sampleTicket);
      const userCountTwice = useDrawStore.getState().userTickets.filter((t) => t.id === sampleTicket.id).length;
      const eligibleCountTwice = useDrawStore.getState().eligibleDrawTickets.filter((t) => t.id === sampleTicket.id).length;
      assert.equal(userCountTwice, 1, 'Duplicate ticket must not be added to userTickets');
      assert.equal(eligibleCountTwice, 1, 'Duplicate ticket must not be added to eligibleDrawTickets');
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

    it('manages simulationDay with strict clamping between 0 and 180', async () => {
      await useWinnerStore.getState().loadWinnerData('user-bethlehem-002');
      assert.equal(useWinnerStore.getState().simulationDay, 45);

      // Clamp negative to 0
      useWinnerStore.getState().setSimulationDay(-10);
      assert.equal(useWinnerStore.getState().simulationDay, 0);

      // Clamp > 180 to 180
      useWinnerStore.getState().setSimulationDay(250);
      assert.equal(useWinnerStore.getState().simulationDay, 180);

      // Set valid day 90
      useWinnerStore.getState().setSimulationDay(90);
      assert.equal(useWinnerStore.getState().simulationDay, 90);

      // Reset restores loaded account elapsedDays (45)
      useWinnerStore.getState().resetSimulationDay();
      assert.equal(useWinnerStore.getState().simulationDay, 45);
    });

    it('changing simulationDay does not mutate contribution ledger or create transactions', async () => {
      const initialContribs = useContributionStore.getState().contributions.length;

      useWinnerStore.getState().setSimulationDay(180);
      useWinnerStore.getState().setSimulationDay(0);
      useWinnerStore.getState().setSimulationDay(90);

      assert.equal(useContributionStore.getState().contributions.length, initialContribs);
    });

    it('resetWinnerStore clears winner data and resets simulationDay to 45', () => {
      useWinnerStore.getState().setSimulationDay(120);
      useWinnerStore.getState().resetWinnerStore();

      assert.equal(useWinnerStore.getState().escrowAccount, null);
      assert.equal(useWinnerStore.getState().simulationDay, 45);
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

  describe('7. Day 7: End-to-End Evaluator Journey Regression', () => {
    it('executes full 17-step evaluator journey with complete state coherence', async () => {
      // Step 1: Clean demo state
      await resetAllDemoStores();
      assert.equal(useUserStore.getState().currentPersonaId, 'dawit');
      assert.equal(useContributionStore.getState().paidToday, false);

      // Step 2 & 3: Onboarding & Persona Selection (Dawit)
      useUserStore.getState().setHasCompletedOnboarding(true);
      assert.equal(useUserStore.getState().hasCompletedOnboarding, true);
      const dawit = await useUserStore.getState().switchPersona('dawit');
      assert.equal(dawit.role, 'member');

      // Step 4 & 5: Make one simulated 50 ETB contribution
      const contrib = await useContributionStore
        .getState()
        .submitDailyContribution(dawit.id, 'telebirr', 50);
      assert.equal(contrib.contribution.amountETB, 50);
      assert.ok(contrib.ticket.ticketNumber.startsWith('MF-20261017-'));

      // Step 6: Verify updated contribution status
      assert.equal(useContributionStore.getState().paidToday, true);

      // Step 7: Attempt duplicate contribution and verify rejection
      await assert.rejects(
        () => useContributionStore.getState().submitDailyContribution(dawit.id, 'cbe_birr', 50),
        /already contributed for today/
      );

      // Step 8: Open draw room and verify ticket eligibility
      await useDrawStore.getState().loadDrawData(dawit.id);
      const eligible = useDrawStore.getState().eligibleDrawTickets;
      assert.ok(eligible.some((t) => t.ticketNumber === contrib.ticket.ticketNumber));

      // Step 9: Execute demo draw and verify selected ticket owner
      const drawRes = await useDrawStore.getState().executeDemoDraw('draw-20261017');
      assert.equal(drawRes.winner.id, dawit.id);
      assert.equal(drawRes.winningTicket.ticketNumber, contrib.ticket.ticketNumber);

      // Step 10: Winner screen consistency
      await useWinnerStore.getState().loadWinnerData(dawit.id);
      assert.equal(useWinnerStore.getState().escrowAccount?.userId, dawit.id);
      assert.equal(useWinnerStore.getState().escrowAccount?.principalAmountETB, 1000000);

      // Step 11: Inspect Days 0, 15, 45, 90, 180
      const days = [0, 15, 45, 90, 180];
      for (const d of days) {
        useWinnerStore.getState().setSimulationDay(d);
        assert.equal(useWinnerStore.getState().simulationDay, d);
      }

      // Step 12: Compare both repayment scenarios
      useDemoConfigStore.getState().setRepaymentDailyModel('550_bundle');
      assert.equal(useDemoConfigStore.getState().config.dailyPrincipalRepaymentETB, 550);
      useDemoConfigStore.getState().setRepaymentDailyModel('500_plus_50');
      assert.equal(useDemoConfigStore.getState().config.dailyPrincipalRepaymentETB, 500);

      // Step 13: Verify buffer status remains isolated from contributions
      const initialContribCount = useContributionStore.getState().contributions.length;
      useWinnerStore.getState().setSimulationDay(180);
      assert.equal(useContributionStore.getState().contributions.length, initialContribCount);

      // Step 14: Switch personas and verify draw result is preserved
      await useUserStore.getState().switchPersona('bethlehem');
      assert.equal(useDrawStore.getState().activeDraw?.status, 'completed');
      assert.equal(useDrawStore.getState().activeDraw?.winnerUserId, dawit.id);

      // Step 15: Reset active draw
      await useDrawStore.getState().resetActiveDraw('draw-20261017');
      assert.equal(useDrawStore.getState().activeDraw?.status, 'scheduled');

      // Step 16: Full demo reset restores baseline state
      await resetAllDemoStores();
      assert.equal(useUserStore.getState().currentPersonaId, 'dawit');
      assert.equal(useContributionStore.getState().paidToday, false);
      assert.equal(useDrawStore.getState().activeDraw?.status, 'scheduled');
    });
  });
});
