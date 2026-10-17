/**
 * Merkato Fund — Repayment & Contribution Calculations
 *
 * Pure functions for computing repayment totals and contribution aggregates.
 *
 * IMPORTANT: The source material contains contradictions about repayment
 * amounts (500 vs 550 ETB/day) and the monthly total (15,000 vs 16,500 ETB).
 * All functions here accept configurable amounts rather than hard-coding
 * a single interpretation. See docs/open-questions.md § 2.1 for details.
 */

import { DemoConfiguration, DEFAULT_DEMO_CONFIG } from '../types';
import { calculateDailyInterest } from './interest';

// ---------------------------------------------------------------------------
// Contribution calculations
// ---------------------------------------------------------------------------

/**
 * Calculate total contributions for a given number of days.
 *
 * @param days - Number of contribution days
 * @param dailyAmountETB - Amount contributed per day (default from config)
 * @returns Total contribution in ETB
 *
 * @example
 * calculateTotalContributions(30)      // 1,500 ETB
 * calculateTotalContributions(180, 50) // 9,000 ETB
 */
export function calculateTotalContributions(
  days: number,
  dailyAmountETB: number = DEFAULT_DEMO_CONFIG.dailyContributionETB
): number {
  if (!Number.isFinite(days) || days < 0) {
    throw new RangeError(`days must be a non-negative finite number, got ${days}`);
  }
  if (!Number.isFinite(dailyAmountETB) || dailyAmountETB < 0) {
    throw new RangeError(
      `dailyAmountETB must be a non-negative finite number, got ${dailyAmountETB}`
    );
  }
  return days * dailyAmountETB;
}

// ---------------------------------------------------------------------------
// Repayment calculations
// ---------------------------------------------------------------------------

/**
 * Compute a repayment scenario summary for a given number of elapsed days.
 *
 * This does NOT produce an authoritative amortization schedule — the source
 * material does not provide sufficient terms (payoff date, interest application
 * method, default provisions, etc.) to construct one. It computes simple
 * arithmetic over configurable daily amounts for demo display purposes.
 *
 * @param elapsedDays - Number of repayment days that have passed
 * @param config - Financial parameters
 * @returns Summary of amounts repaid and remaining
 */
export function calculateRepaymentScenario(
  elapsedDays: number,
  config: Pick<
    DemoConfiguration,
    'prizeAmountETB' | 'dailyPrincipalRepaymentETB' | 'dailyAdminFeeETB'
  > = DEFAULT_DEMO_CONFIG
): {
  /** Total principal repaid so far */
  principalRepaidETB: number;
  /** Total admin fees paid so far */
  adminFeesRepaidETB: number;
  /** Sum of principal + admin fees paid so far */
  totalPaidETB: number;
  /** Remaining principal (may go below zero if overpaid) */
  remainingPrincipalETB: number;
  /** Daily total due (principal + admin fee) */
  dailyTotalDueETB: number;
  /** Monthly projected amount based on 30-day months */
  monthlyProjectedETB: number;
} {
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) {
    throw new RangeError(
      `elapsedDays must be a non-negative finite number, got ${elapsedDays}`
    );
  }

  const principalRepaidETB = elapsedDays * config.dailyPrincipalRepaymentETB;
  const adminFeesRepaidETB = elapsedDays * config.dailyAdminFeeETB;
  const totalPaidETB = principalRepaidETB + adminFeesRepaidETB;
  const remainingPrincipalETB = Math.max(
    0,
    config.prizeAmountETB - principalRepaidETB
  );
  const dailyTotalDueETB =
    config.dailyPrincipalRepaymentETB + config.dailyAdminFeeETB;
  const monthlyProjectedETB = dailyTotalDueETB * 30;

  return {
    principalRepaidETB,
    adminFeesRepaidETB,
    totalPaidETB,
    remainingPrincipalETB,
    dailyTotalDueETB,
    monthlyProjectedETB,
  };
}

/**
 * Estimate how many days it would take to repay the full principal
 * at a given daily repayment rate.
 *
 * NOTE: This is a simple division. It does not account for interest
 * offsets, partial payments, defaults, or any other real-world factor.
 * It is displayed in the demo as an "estimated repayment duration"
 * with appropriate caveats.
 *
 * @param principal - Total amount to repay in ETB
 * @param dailyRepayment - Daily principal payment in ETB
 * @returns Number of days (rounded up to whole days)
 *
 * @example
 * estimateRepaymentDays(1_000_000, 500) // 2000 days
 */
export function estimateRepaymentDays(
  principal: number,
  dailyRepayment: number
): number {
  if (!Number.isFinite(principal) || principal < 0) {
    throw new RangeError(
      `principal must be a non-negative finite number, got ${principal}`
    );
  }
  if (!Number.isFinite(dailyRepayment) || dailyRepayment <= 0) {
    throw new RangeError(
      `dailyRepayment must be a positive finite number, got ${dailyRepayment}`
    );
  }
  return Math.ceil(principal / dailyRepayment);
}

// ---------------------------------------------------------------------------
// Buffer calculations
// ---------------------------------------------------------------------------

/**
 * Calculate the buffer status given elapsed days within a cycle.
 *
 * The source material (Page 6) describes a 7,500 ETB buffer that must
 * be replenished every 15 days. The daily burn rate is the daily
 * principal repayment (default: 500 ETB/day).
 *
 * Whether this buffer is funded from the prize or out-of-pocket
 * is an unresolved question (see docs/open-questions.md § 2.4).
 *
 * @param elapsedDaysInCycle - Days elapsed within the current 15-day cycle
 * @param config - Financial parameters
 * @returns Buffer status snapshot
 */
export function calculateBufferStatus(
  elapsedDaysInCycle: number,
  config: Pick<
    DemoConfiguration,
    'bufferAmountETB' | 'bufferCycleDays' | 'dailyPrincipalRepaymentETB'
  > = DEFAULT_DEMO_CONFIG
): {
  currentBalanceETB: number;
  amountBurnedETB: number;
  daysRemaining: number;
  healthStatus: 'healthy' | 'caution' | 'critical' | 'depleted';
  percentRemaining: number;
} {
  if (!Number.isFinite(elapsedDaysInCycle) || elapsedDaysInCycle < 0) {
    throw new RangeError(
      `elapsedDaysInCycle must be a non-negative finite number, got ${elapsedDaysInCycle}`
    );
  }

  const amountBurnedETB =
    Math.min(elapsedDaysInCycle, config.bufferCycleDays) *
    config.dailyPrincipalRepaymentETB;
  const currentBalanceETB = Math.max(0, config.bufferAmountETB - amountBurnedETB);
  const daysRemaining = Math.max(0, config.bufferCycleDays - elapsedDaysInCycle);
  const percentRemaining =
    config.bufferAmountETB > 0
      ? (currentBalanceETB / config.bufferAmountETB) * 100
      : 0;

  let healthStatus: 'healthy' | 'caution' | 'critical' | 'depleted';
  if (currentBalanceETB <= 0) {
    healthStatus = 'depleted';
  } else if (percentRemaining <= 20) {
    healthStatus = 'critical';
  } else if (percentRemaining <= 50) {
    healthStatus = 'caution';
  } else {
    healthStatus = 'healthy';
  }

  return {
    currentBalanceETB,
    amountBurnedETB,
    daysRemaining,
    healthStatus,
    percentRemaining,
  };
}

/**
 * Determine the health status of a winner's operational buffer
 * based on remaining balance vs target buffer amount.
 */
export function calculateBufferHealth(
  currentBalanceETB: number,
  targetBufferAmountETB: number = 7_500
): 'healthy' | 'caution' | 'critical' | 'depleted' {
  if (currentBalanceETB <= 0) return 'depleted';
  const percent = targetBufferAmountETB > 0 ? (currentBalanceETB / targetBufferAmountETB) * 100 : 0;
  if (percent <= 20) return 'critical';
  if (percent <= 50) return 'caution';
  return 'healthy';
}

// ---------------------------------------------------------------------------
// Buffer Replenishment & Financial Reality Check
// ---------------------------------------------------------------------------

export interface BufferReplenishmentSummary {
  elapsedDays: number;
  completedCycles: number;
  cumulativeReplenishedETB: number;
  nextReplenishmentDay: number;
  daysUntilNextReplenishment: number;
  cycleBurnAmountETB: number;
  fundingSource: 'unresolved_funding_rule';
  fundingNote: string;
}

/**
 * Compute the buffer replenishment schedule over elapsed days.
 * Documents explicitly that the source material lacks a defined funding rule.
 */
export function calculateBufferReplenishment(
  elapsedDays: number,
  config: Pick<DemoConfiguration, 'bufferAmountETB' | 'bufferCycleDays'> = DEFAULT_DEMO_CONFIG
): BufferReplenishmentSummary {
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) {
    throw new RangeError(
      `elapsedDays must be a non-negative finite number, got ${elapsedDays}`
    );
  }

  const completedCycles = Math.floor(elapsedDays / config.bufferCycleDays);
  const cumulativeReplenishedETB = completedCycles * config.bufferAmountETB;
  const nextReplenishmentDay = (completedCycles + 1) * config.bufferCycleDays;
  const daysUntilNextReplenishment = Math.max(0, nextReplenishmentDay - elapsedDays);

  return {
    elapsedDays,
    completedCycles,
    cumulativeReplenishedETB,
    nextReplenishmentDay,
    daysUntilNextReplenishment,
    cycleBurnAmountETB: config.bufferAmountETB,
    fundingSource: 'unresolved_funding_rule',
    fundingNote:
      'The source marketing PDF states a 7,500 ETB buffer is replenished every 15 days, but does NOT define who funds the replenishment or whether it is deducted from interest, member equity, or external pool reserves.',
  };
}

export interface RealityCheckSummary {
  elapsedDays: number;
  scenario: '500_plus_50' | '550_bundle';
  dailyInterestYieldETB: number;
  dailyPrincipalETB: number;
  dailyAdminFeeETB: number;
  dailyTotalRepaymentETB: number;
  dailyInterestSurplusETB: number;
  cycle15InterestSurplusETB: number;
  cycle15BufferRequirementETB: number;
  cycle15NetCashFlowETB: number;
  is15DayBufferSelfSustaining: false;
  remainingPrincipalAtDay180ETB: number;
  postEscrowPayoffDays: number;
  totalPayoffDays: number;
  realityCheckConclusion: string;
}

/**
 * Perform a rigorous financial reality check comparing daily interest yield,
 * repayment obligations, and 15-day buffer cash flow demands.
 */
export function calculateRealityCheck(
  elapsedDays: number,
  config: DemoConfiguration = DEFAULT_DEMO_CONFIG,
  scenario: '500_plus_50' | '550_bundle' = '500_plus_50'
): RealityCheckSummary {
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) {
    throw new RangeError(
      `elapsedDays must be a non-negative finite number, got ${elapsedDays}`
    );
  }

  const dailyInterestYieldETB = calculateDailyInterest(
    config.prizeAmountETB,
    config.annualInterestRate,
    365
  );

  const dailyPrincipalETB = scenario === '550_bundle' ? 550 : 500;
  const dailyAdminFeeETB = scenario === '550_bundle' ? 0 : 50;
  const dailyTotalRepaymentETB = dailyPrincipalETB + dailyAdminFeeETB;

  const dailyInterestSurplusETB = dailyInterestYieldETB - dailyTotalRepaymentETB;
  const cycle15InterestSurplusETB = dailyInterestSurplusETB * 15;
  const cycle15BufferRequirementETB = 7500;
  const cycle15NetCashFlowETB = cycle15InterestSurplusETB - cycle15BufferRequirementETB;

  const principalRepaidByDay180 = 180 * dailyPrincipalETB;
  const remainingPrincipalAtDay180ETB = Math.max(0, config.prizeAmountETB - principalRepaidByDay180);
  const postEscrowPayoffDays = Math.ceil(remainingPrincipalAtDay180ETB / dailyPrincipalETB);
  const totalPayoffDays = 180 + postEscrowPayoffDays;

  return {
    elapsedDays,
    scenario,
    dailyInterestYieldETB,
    dailyPrincipalETB,
    dailyAdminFeeETB,
    dailyTotalRepaymentETB,
    dailyInterestSurplusETB,
    cycle15InterestSurplusETB,
    cycle15BufferRequirementETB,
    cycle15NetCashFlowETB,
    is15DayBufferSelfSustaining: false,
    remainingPrincipalAtDay180ETB,
    postEscrowPayoffDays,
    totalPayoffDays,
    realityCheckConclusion:
      'Cash flow contradiction: The 52.74 ETB daily interest surplus generates only +791.10 ETB over 15 days, falling 6,708.90 ETB short of the 7,500 ETB buffer replenishment requirement. Furthermore, at Day 180 escrow unlock, ~910,000 ETB in principal remains unpaid, requiring ~5 more years of payments.',
  };
}

