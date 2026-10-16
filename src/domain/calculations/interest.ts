/**
 * Merkato Fund — Interest Calculations
 *
 * Pure functions for computing interest on the blocked escrow deposit.
 *
 * IMPORTANT ASSUMPTIONS (documented, not verified):
 * - The source material claims a 22% annual interest rate on a 1,000,000 ETB
 *   blocked bank deposit.
 * - The rate convention (simple vs compound) is not specified in the source.
 * - The day-count convention is not specified. We default to ACT/365
 *   (actual days / 365) which is common for Ethiopian banking calculations.
 * - These calculations are for demonstration purposes only and do not
 *   represent actual bank deposit terms.
 *
 * See docs/open-questions.md § 2.2 for the full analysis.
 */

import { DemoConfiguration, DEFAULT_DEMO_CONFIG } from '../types';

/**
 * Calculate simple daily interest yield on a deposit.
 *
 * Formula: principal × annualRate / daysInYear
 *
 * Day-count convention: ACT/365 (actual days, 365-day year).
 * This is a common convention but NOT confirmed for this product.
 *
 * @param principal - Deposit amount in ETB
 * @param annualRate - Annual interest rate as a decimal (e.g. 0.22 for 22%)
 * @param daysInYear - Day-count denominator (default: 365 for ACT/365)
 * @returns Daily interest yield in ETB
 *
 * @example
 * calculateDailyInterest(1_000_000, 0.22)  // ≈ 602.7397 ETB
 */
export function calculateDailyInterest(
  principal: number,
  annualRate: number,
  daysInYear: number = 365
): number {
  if (principal < 0 || annualRate < 0 || daysInYear <= 0) {
    throw new RangeError(
      `Invalid inputs: principal=${principal}, annualRate=${annualRate}, daysInYear=${daysInYear}. ` +
        'All must be non-negative, daysInYear must be positive.'
    );
  }
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate)) {
    throw new RangeError('principal and annualRate must be finite numbers.');
  }

  return (principal * annualRate) / daysInYear;
}

/**
 * Calculate total simple interest accrued over a period.
 *
 * Formula: principal × annualRate × (days / daysInYear)
 *
 * @param principal - Deposit amount in ETB
 * @param annualRate - Annual interest rate as a decimal
 * @param days - Number of days the deposit has been held
 * @param daysInYear - Day-count denominator (default: 365)
 * @returns Total accrued interest in ETB
 *
 * @example
 * calculateAccruedInterest(1_000_000, 0.22, 180)  // ≈ 108,493.15 ETB
 */
export function calculateAccruedInterest(
  principal: number,
  annualRate: number,
  days: number,
  daysInYear: number = 365
): number {
  if (days < 0) {
    throw new RangeError(`days must be non-negative, got ${days}`);
  }
  return calculateDailyInterest(principal, annualRate, daysInYear) * days;
}

/**
 * Calculate the projected total interest over the full lock period.
 *
 * @param config - Demo configuration with principal, rate, and lock period
 * @returns Projected total interest in ETB over the full lock period
 *
 * @example
 * calculateProjectedInterest()  // ≈ 108,493.15 ETB (with defaults)
 */
export function calculateProjectedInterest(
  config: Pick<
    DemoConfiguration,
    'prizeAmountETB' | 'annualInterestRate' | 'lockPeriodDays'
  > = DEFAULT_DEMO_CONFIG
): number {
  return calculateAccruedInterest(
    config.prizeAmountETB,
    config.annualInterestRate,
    config.lockPeriodDays
  );
}

/**
 * Calculate the net daily cash flow during the lock period.
 *
 * During the 6-month block, the winner simultaneously:
 * - Receives daily interest from the blocked deposit
 * - Pays the daily repayment amount (principal + admin fee)
 *
 * The source claims that "the interest covers the repayment," implying
 * a positive or zero net daily flow. This function computes the actual
 * difference so the demo can display reality.
 *
 * @param config - Demo configuration
 * @returns Object with daily interest, daily payment, and net flow
 */
export function calculateNetDailyFlow(
  config: Pick<
    DemoConfiguration,
    | 'prizeAmountETB'
    | 'annualInterestRate'
    | 'dailyPrincipalRepaymentETB'
    | 'dailyAdminFeeETB'
  > = DEFAULT_DEMO_CONFIG
): {
  dailyInterestETB: number;
  dailyRepaymentETB: number;
  netDailyFlowETB: number;
} {
  const dailyInterestETB = calculateDailyInterest(
    config.prizeAmountETB,
    config.annualInterestRate
  );
  const dailyRepaymentETB =
    config.dailyPrincipalRepaymentETB + config.dailyAdminFeeETB;
  const netDailyFlowETB = dailyInterestETB - dailyRepaymentETB;

  return {
    dailyInterestETB,
    dailyRepaymentETB,
    netDailyFlowETB,
  };
}
