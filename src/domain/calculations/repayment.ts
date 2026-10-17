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

