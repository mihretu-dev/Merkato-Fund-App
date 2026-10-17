/**
 * Merkato Fund — Automated Tests for MockMerkatoService
 *
 * Validates service behavior for persona switching, contribution submission,
 * ticket auto-issuance, draw simulation, repayments, buffer management, and demo resets.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MockMerkatoService } from '../mock/MockMerkatoService';

describe('MockMerkatoService Test Suite', () => {
  let service: MockMerkatoService;

  beforeEach(() => {
    service = new MockMerkatoService();
  });

  describe('1. Personas & Profiles', () => {
    it('returns all 3 predefined Ethiopian synthetic personas', async () => {
      const personas = await service.getAvailablePersonas();
      assert.equal(personas.length, 3);

      const roles = personas.map((p) => p.role).sort();
      assert.deepEqual(roles, ['admin', 'member', 'winner']);
    });

    it('correctly retrieves each persona by DemoPersonaId', async () => {
      const dawit = await service.getUserByPersona('dawit');
      assert.equal(dawit.fullName, 'Dawit Haile');
      assert.equal(dawit.role, 'member');
      assert.equal(dawit.activeStreakDays, 14);

      const bethlehem = await service.getUserByPersona('bethlehem');
      assert.equal(bethlehem.fullName, 'Bethlehem Tadesse');
      assert.equal(bethlehem.role, 'winner');

      const admin = await service.getUserByPersona('admin');
      assert.equal(admin.fullName, 'Abebe Kebede');
      assert.equal(admin.role, 'admin');
    });

    it('throws when requesting an unknown persona', async () => {
      await assert.rejects(
        // @ts-expect-error testing invalid ID
        () => service.getUserByPersona('unknown_id'),
        /Demo persona not found/
      );
    });
  });

  describe('2. Contributions & Ticket Consistency', () => {
    it('retrieves synthetic past contributions for Dawit', async () => {
      const records = await service.getContributions('user-dawit-001');
      assert.equal(records.length, 14);
      assert.equal(records[0].amountETB, 50);
      assert.equal(records[0].isSimulated, true);
    });

    it('submits a simulated contribution and auto-issues an algorithmic ticket', async () => {
      const initialPool = await service.getPoolStatistics();

      const result = await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });

      // Validates contribution record
      assert.equal(result.contribution.amountETB, 50);
      assert.equal(result.contribution.channel, 'telebirr');
      assert.equal(result.contribution.status, 'completed');
      assert.equal(result.contribution.streakDay, 15);

      // Validates updated user streak & total
      assert.equal(result.updatedUser.activeStreakDays, 15);
      assert.equal(result.updatedUser.totalContributedETB, 750);

      // Validates auto-issued ticket
      assert.ok(result.ticket.ticketNumber.startsWith('MF-20261017-'));
      assert.equal(result.ticket.userId, 'user-dawit-001');
      assert.equal(result.ticket.isWinningTicket, false);

      // Validates pool increment
      const updatedPool = await service.getPoolStatistics();
      assert.equal(updatedPool.totalPoolBalanceETB, initialPool.totalPoolBalanceETB + 50);
      assert.equal(updatedPool.activeContributorsCount, initialPool.activeContributorsCount + 1);
    });

    it('rejects duplicate contributions on the same calendar day', async () => {
      await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });

      await assert.rejects(
        () =>
          service.submitContribution({
            userId: 'user-dawit-001',
            amountETB: 50,
            channel: 'cbe_birr',
          }),
        /already contributed for today/
      );
    });
  });

  describe('3. Demonstration Draw Simulation', () => {
    it('prevents draw execution when zero eligible tickets exist', async () => {
      await assert.rejects(
        () => service.simulateDailyDraw('draw-20261017'),
        /zero eligible tickets/
      );
    });

    it('executes a demonstration draw with eligible ticket and required labels', async () => {
      // First issue an eligible ticket via contribution
      await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });

      const result = await service.simulateDailyDraw('draw-20261017');

      assert.equal(result.isDemonstrationOnly, true);
      assert.equal(result.draw.status, 'completed');
      assert.ok(result.draw.winningTicketNumber);
      assert.ok(result.winningTicket.isWinningTicket);
      assert.equal(result.winner.fullName, 'Dawit Haile');
      assert.equal(result.winner.id, 'user-dawit-001');

      const poolStats = await service.getPoolStatistics();
      assert.ok(poolStats.totalDrawsCompleted >= 77);
    });

    it('prevents accidental duplicate execution on the same draw instance', async () => {
      await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });

      // First run succeeds
      await service.simulateDailyDraw('draw-20261017');

      // Second run rejected
      await assert.rejects(
        () => service.simulateDailyDraw('draw-20261017'),
        /already been completed/
      );
    });

    it('allows replaying draw after explicit resetActiveDraw', async () => {
      await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });

      await service.simulateDailyDraw('draw-20261017');
      const resetDraw = await service.resetActiveDraw('draw-20261017');
      assert.equal(resetDraw.status, 'scheduled');
      assert.equal(resetDraw.winningTicketNumber, undefined);

      // Re-run succeeds after reset
      const replay = await service.simulateDailyDraw('draw-20261017');
      assert.equal(replay.draw.status, 'completed');
    });
  });

  describe('4. Winner Escrow, Repayment & Buffer', () => {
    it('retrieves Bethlehem’s 1,000,000 ETB escrow account', async () => {
      const escrow = await service.getEscrowAccount('user-bethlehem-002');
      assert.ok(escrow);
      assert.equal(escrow.principalAmountETB, 1_000_000);
      assert.equal(escrow.annualInterestRate, 0.22);
      assert.equal(escrow.elapsedDays, 45);
      assert.equal(escrow.dailyInterestYieldETB, 602.74);
    });

    it('records a daily repayment installment and depletes buffer balance', async () => {
      const initialSched = await service.getRepaymentSchedule('user-bethlehem-002');
      const initialBuf = await service.getWinnerBuffer('user-bethlehem-002');
      assert.ok(initialSched);
      assert.ok(initialBuf);

      const result = await service.recordRepaymentInstallment('user-bethlehem-002', 'telebirr');

      assert.equal(result.schedule.installmentsCompleted, initialSched.installmentsCompleted + 1);
      assert.equal(result.schedule.remainingPrincipalETB, initialSched.remainingPrincipalETB - 500);
      assert.equal(result.buffer.currentBufferBalanceETB, initialBuf.currentBufferBalanceETB - 500);
    });

    it('replenishes buffer back toward target amount', async () => {
      const replenished = await service.replenishWinnerBuffer('user-bethlehem-002', 2500);
      assert.equal(replenished.currentBufferBalanceETB, 7500);
      assert.equal(replenished.healthStatus, 'healthy');
    });
  });

  describe('5. Demo State Reset', () => {
    it('restores all data structures to initial seed state upon resetDemo()', async () => {
      // Mutate state
      await service.submitContribution({
        userId: 'user-dawit-001',
        amountETB: 50,
        channel: 'telebirr',
      });
      assert.equal(await service.checkContributedToday('user-dawit-001'), true);

      // Reset
      await service.resetDemo();

      // Verify restored
      assert.equal(await service.checkContributedToday('user-dawit-001'), false);
      const dawit = await service.getUserByPersona('dawit');
      assert.equal(dawit.activeStreakDays, 14);
      assert.equal(dawit.totalContributedETB, 700);
    });
  });
});
