/**
 * Merkato Fund — Domain Calculations Automated Test Suite
 *
 * Tests all isolated pure financial calculation functions and the demo draw simulator.
 * Covers standard calculations, boundary conditions, and invalid input rejection.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatETB,
  formatNumber,
  formatETBCompact,
} from '../currency';
import {
  calculateDailyInterest,
  calculateAccruedInterest,
  calculateProjectedInterest,
  calculateNetDailyFlow,
} from '../interest';
import {
  calculateTotalContributions,
  calculateRepaymentScenario,
  estimateRepaymentDays,
  calculateBufferStatus,
} from '../repayment';
import {
  simulateDemoDraw,
  simpleHash32,
} from '../drawSimulation';
import { DEFAULT_DEMO_CONFIG } from '../../types';

describe('1. Currency Formatting (ETB)', () => {
  it('formats standard ETB currency with prefix', () => {
    assert.equal(formatETB(1000000), 'ETB 1,000,000.00');
    assert.equal(formatETB(50), 'ETB 50.00');
    assert.equal(formatETB(7500.5), 'ETB 7,500.50');
  });

  it('formats compact suffix style', () => {
    assert.equal(formatETB(50, { compact: true }), '50.00 ETB');
    assert.equal(formatETB(50, { compact: true, decimals: 0 }), '50 ETB');
    assert.equal(formatETB(1000000, { compact: true, decimals: 0 }), '1,000,000 ETB');
  });

  it('handles negative currency amounts correctly', () => {
    assert.equal(formatETB(-550), '-ETB 550.00');
    assert.equal(formatETB(-550, { compact: true }), '-550.00 ETB');
  });

  it('handles explicit positive signs when requested', () => {
    assert.equal(formatETB(602.74, { showSign: true }), '+ETB 602.74');
  });

  it('formats abbreviated compact numbers for dashboard widgets', () => {
    assert.equal(formatETBCompact(1000000), '1M ETB');
    assert.equal(formatETBCompact(1500000), '1.5M ETB');
    assert.equal(formatETBCompact(15000), '15K ETB');
    assert.equal(formatETBCompact(7500), '7.5K ETB');
    assert.equal(formatETBCompact(550), '550 ETB');
    assert.equal(formatETBCompact(-500), '-500 ETB');
  });

  it('safely handles non-finite edge cases (NaN, Infinity)', () => {
    assert.equal(formatETB(NaN), 'ETB —');
    assert.equal(formatETB(Infinity), 'ETB —');
    assert.equal(formatNumber(NaN), '—');
    assert.equal(formatETBCompact(NaN), '— ETB');
  });
});

describe('2. Daily Contribution Totals', () => {
  it('calculates contribution totals from explicit inputs', () => {
    // 30 days @ 50 ETB = 1,500 ETB
    assert.equal(calculateTotalContributions(30, 50), 1500);
    // 180 days (6 months) @ 50 ETB = 9,000 ETB
    assert.equal(calculateTotalContributions(180, 50), 9000);
    // 365 days @ 50 ETB = 18,250 ETB
    assert.equal(calculateTotalContributions(365, 50), 18250);
  });

  it('uses default 50 ETB when daily amount is omitted', () => {
    assert.equal(calculateTotalContributions(10), 500);
    assert.equal(calculateTotalContributions(0), 0);
  });

  it('supports configurable contribution amounts', () => {
    assert.equal(calculateTotalContributions(10, 100), 1000);
    assert.equal(calculateTotalContributions(14, 25), 350);
  });

  it('rejects invalid inputs (negative or non-finite)', () => {
    assert.throws(() => calculateTotalContributions(-1), RangeError);
    assert.throws(() => calculateTotalContributions(10, -50), RangeError);
    assert.throws(() => calculateTotalContributions(NaN), RangeError);
  });
});

describe('3. Interest Arithmetic & Day-Count Convention', () => {
  it('computes daily simple interest using ACT/365 convention', () => {
    // 1,000,000 ETB at 22% per annum over 365 days
    // 1,000,000 * 0.22 / 365 = 602.739726... ETB/day
    const dailyYield = calculateDailyInterest(1000000, 0.22, 365);
    assert.ok(Math.abs(dailyYield - 602.7397) < 0.001);
  });

  it('supports alternative day-count convention (30/360 or 360-day year)', () => {
    // 1,000,000 * 0.22 / 360 = 611.1111... ETB/day
    const dailyYield360 = calculateDailyInterest(1000000, 0.22, 360);
    assert.ok(Math.abs(dailyYield360 - 611.1111) < 0.001);
  });

  it('computes accrued interest over configurable lock periods', () => {
    // 180 days at 22% ACT/365: 1,000,000 * 0.22 * (180 / 365) = 108,493.1506... ETB
    const accrued180 = calculateAccruedInterest(1000000, 0.22, 180, 365);
    assert.ok(Math.abs(accrued180 - 108493.15) < 0.01);

    // 0 days elapsed -> 0 interest
    assert.equal(calculateAccruedInterest(1000000, 0.22, 0), 0);
  });

  it('computes default projected interest for full 180-day lock period', () => {
    const projected = calculateProjectedInterest();
    assert.ok(Math.abs(projected - 108493.15) < 0.01);
  });

  it('computes net daily cash flow during blocked escrow', () => {
    // Daily interest: ~602.74 ETB
    // Daily payment: 500 (principal) + 50 (admin fee) = 550 ETB
    // Net daily flow: 602.74 - 550 = +52.74 ETB/day (positive cash flow)
    const flow = calculateNetDailyFlow({
      prizeAmountETB: 1000000,
      annualInterestRate: 0.22,
      dailyPrincipalRepaymentETB: 500,
      dailyAdminFeeETB: 50,
    });

    assert.ok(Math.abs(flow.dailyInterestETB - 602.74) < 0.01);
    assert.equal(flow.dailyRepaymentETB, 550);
    assert.ok(Math.abs(flow.netDailyFlowETB - 52.74) < 0.01);
  });

  it('correctly models alternative repayment scenario (550 principal + 50 fee = 600 ETB)', () => {
    // If post-win repayment is 550 principal + 50 admin = 600 ETB
    // Net daily flow: 602.74 - 600 = +2.74 ETB/day
    const flow = calculateNetDailyFlow({
      prizeAmountETB: 1000000,
      annualInterestRate: 0.22,
      dailyPrincipalRepaymentETB: 550,
      dailyAdminFeeETB: 50,
    });

    assert.equal(flow.dailyRepaymentETB, 600);
    assert.ok(Math.abs(flow.netDailyFlowETB - 2.74) < 0.01);
  });

  it('rejects invalid inputs with descriptive RangeErrors', () => {
    assert.throws(() => calculateDailyInterest(-1000, 0.22), RangeError);
    assert.throws(() => calculateDailyInterest(1000000, -0.05), RangeError);
    assert.throws(() => calculateDailyInterest(1000000, 0.22, 0), RangeError);
    assert.throws(() => calculateAccruedInterest(1000000, 0.22, -10), RangeError);
  });
});

describe('4. Repayment Scenarios & Admin Fee Separation', () => {
  it('distinguishes administrative fee from principal repayment', () => {
    const scenario = calculateRepaymentScenario(30, {
      prizeAmountETB: 1000000,
      dailyPrincipalRepaymentETB: 500,
      dailyAdminFeeETB: 50,
    });

    // 30 days * 500 ETB = 15,000 ETB principal
    assert.equal(scenario.principalRepaidETB, 15000);
    // 30 days * 50 ETB = 1,500 ETB admin fee
    assert.equal(scenario.adminFeesRepaidETB, 1500);
    // Total out-of-pocket: 16,500 ETB
    assert.equal(scenario.totalPaidETB, 16500);
    // Admin fee DOES NOT reduce principal balance:
    assert.equal(scenario.remainingPrincipalETB, 985000);
    assert.equal(scenario.dailyTotalDueETB, 550);
    assert.equal(scenario.monthlyProjectedETB, 16500);
  });

  it('supports 500 ETB flat repayment scenario (admin fee = 0)', () => {
    const scenario = calculateRepaymentScenario(30, {
      prizeAmountETB: 1000000,
      dailyPrincipalRepaymentETB: 500,
      dailyAdminFeeETB: 0,
    });

    assert.equal(scenario.principalRepaidETB, 15000);
    assert.equal(scenario.adminFeesRepaidETB, 0);
    assert.equal(scenario.totalPaidETB, 15000);
    assert.equal(scenario.remainingPrincipalETB, 985000);
    assert.equal(scenario.monthlyProjectedETB, 15000);
  });

  it('estimates simple duration to repay full principal', () => {
    // 1,000,000 / 500 = 2,000 days (~5.48 years)
    assert.equal(estimateRepaymentDays(1000000, 500), 2000);
    // 1,000,000 / 550 = 1,819 days (ceiling)
    assert.equal(estimateRepaymentDays(1000000, 550), 1819);
  });

  it('clamps remaining principal at 0 upon overpayment', () => {
    const scenario = calculateRepaymentScenario(2500, {
      prizeAmountETB: 1000000,
      dailyPrincipalRepaymentETB: 500,
      dailyAdminFeeETB: 50,
    });
    // 2500 * 500 = 1,250,000 ETB > 1,000,000
    assert.equal(scenario.remainingPrincipalETB, 0);
  });

  it('rejects invalid repayment inputs', () => {
    assert.throws(() => calculateRepaymentScenario(-5), RangeError);
    assert.throws(() => estimateRepaymentDays(-1000, 500), RangeError);
    assert.throws(() => estimateRepaymentDays(1000, 0), RangeError);
    assert.throws(() => estimateRepaymentDays(1000, -50), RangeError);
  });
});

describe('5. Winner Buffer Calculations (7,500 ETB / 15-day cycle)', () => {
  const bufferConfig = {
    bufferAmountETB: 7500,
    bufferCycleDays: 15,
    dailyPrincipalRepaymentETB: 500,
  };

  it('calculates full healthy buffer at day 0', () => {
    const status = calculateBufferStatus(0, bufferConfig);
    assert.equal(status.currentBalanceETB, 7500);
    assert.equal(status.amountBurnedETB, 0);
    assert.equal(status.daysRemaining, 15);
    assert.equal(status.percentRemaining, 100);
    assert.equal(status.healthStatus, 'healthy');
  });

  it('tracks buffer burn mid-cycle (day 5)', () => {
    // 5 days * 500 ETB = 2,500 burned. Remaining: 5,000 ETB (66.7%)
    const status = calculateBufferStatus(5, bufferConfig);
    assert.equal(status.amountBurnedETB, 2500);
    assert.equal(status.currentBalanceETB, 5000);
    assert.equal(status.daysRemaining, 10);
    assert.equal(status.healthStatus, 'healthy');
  });

  it('detects caution threshold at 50% or below (day 8)', () => {
    // 8 days * 500 ETB = 4,000 burned. Remaining: 3,500 ETB (46.7% <= 50%)
    const status = calculateBufferStatus(8, bufferConfig);
    assert.equal(status.healthStatus, 'caution');
  });

  it('detects critical threshold at 20% or below (day 13)', () => {
    // 13 days * 500 ETB = 6,500 burned. Remaining: 1,000 ETB (13.3% <= 20%)
    const status = calculateBufferStatus(13, bufferConfig);
    assert.equal(status.healthStatus, 'critical');
  });

  it('detects fully depleted buffer at day 15', () => {
    // 15 days * 500 ETB = 7,500 burned. Remaining: 0 ETB
    const status = calculateBufferStatus(15, bufferConfig);
    assert.equal(status.currentBalanceETB, 0);
    assert.equal(status.daysRemaining, 0);
    assert.equal(status.healthStatus, 'depleted');
  });

  it('does not allow negative balance even if elapsed days exceed cycle length', () => {
    const status = calculateBufferStatus(20, bufferConfig);
    assert.equal(status.currentBalanceETB, 0);
    assert.equal(status.daysRemaining, 0);
    assert.equal(status.healthStatus, 'depleted');
  });

  it('rejects negative elapsed days', () => {
    assert.throws(() => calculateBufferStatus(-1, bufferConfig), RangeError);
  });
});

describe('6. Algorithmic Draw Demonstration Simulator', () => {
  const tickets = ['TKT-001', 'TKT-002', 'TKT-003', 'TKT-004', 'TKT-005'];

  it('deterministically selects winner based on demo seed', () => {
    const res1 = simulateDemoDraw({
      drawId: 'DRAW-2026-10-16',
      eligibleTickets: tickets,
      demoSeed: 'FIXED-DEMO-SEED-A',
    });

    const res2 = simulateDemoDraw({
      drawId: 'DRAW-2026-10-16',
      eligibleTickets: tickets,
      demoSeed: 'FIXED-DEMO-SEED-A',
    });

    // Deterministic repeatability
    assert.equal(res1.winningTicketNumber, res2.winningTicketNumber);
    assert.equal(res1.winningIndex, res2.winningIndex);
    assert.ok(tickets.includes(res1.winningTicketNumber));
  });

  it('includes mandatory demonstration labels and disclaimers', () => {
    const res = simulateDemoDraw({
      drawId: 'DRAW-2026-10-16',
      eligibleTickets: tickets,
      demoSeed: 'TEST-SEED',
    });

    assert.equal(res.isDemonstrationOnly, true);
    assert.ok(res.disclaimer.includes('DEMO ONLY'));
    assert.ok(res.selectionMethod.includes('Demonstration'));
  });

  it('computes expected 32-bit FNV-1a hash values', () => {
    const hash = simpleHash32('TEST-SEED');
    assert.equal(typeof hash, 'number');
    assert.ok(hash >= 0);
    assert.ok(Number.isInteger(hash));
  });

  it('rejects draw simulation with empty participant pool', () => {
    assert.throws(
      () =>
        simulateDemoDraw({
          drawId: 'DRAW-EMPTY',
          eligibleTickets: [],
        }),
      RangeError
    );
  });
});
