/**
 * Merkato Fund — Domain Types
 *
 * These types model the entities described in the Merkato Fund marketing
 * materials. All financial parameters are configurable because the source
 * material contains unresolved contradictions (see docs/open-questions.md).
 *
 * IMPORTANT: This is a demonstration application. No type here represents
 * a real financial instrument, bank account, or legally binding contract.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** ISO-8601 date string, e.g. "2026-10-16" */
export type ISODateString = string;

/** ISO-8601 datetime string, e.g. "2026-10-16T20:00:00+03:00" */
export type ISODateTimeString = string;

/** Ethiopian payment channels used in demo simulations */
export type PaymentChannel =
  | 'telebirr'
  | 'cbe_birr'
  | 'awash_birr'
  | 'amole'
  | 'bank_transfer';

// ---------------------------------------------------------------------------
// User / Profile
// ---------------------------------------------------------------------------

export type UserRole = 'member' | 'winner' | 'admin';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  joinedDate: ISODateString;
  isVerified: boolean;
  activeStreakDays: number;
  totalContributedETB: number;
}

// ---------------------------------------------------------------------------
// Contribution (daily 50 ETB micro-payment)
// ---------------------------------------------------------------------------

export type ContributionStatus = 'completed' | 'pending' | 'failed';

export interface ContributionRecord {
  id: string;
  userId: string;
  amountETB: number;
  date: ISODateString;
  timestamp: ISODateTimeString;
  channel: PaymentChannel;
  transactionReference: string;
  status: ContributionStatus;
  streakDay: number;
  /** Always true in the demo build */
  isSimulated: true;
}

// ---------------------------------------------------------------------------
// Daily Draw
// ---------------------------------------------------------------------------

export type DrawStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface DailyDraw {
  id: string;
  drawDate: ISODateString;
  scheduledTime: ISODateTimeString;
  prizeAmountETB: number;
  status: DrawStatus;
  participantCount: number;
  poolTotalCollectedETB: number;
  /** SHA-256 hash seed displayed for demonstration transparency */
  hashSeed: string;
  winningTicketNumber?: string;
  winnerUserId?: string;
  winnerName?: string;
  completedAt?: ISODateTimeString;
}

export interface DrawTicket {
  id: string;
  drawId: string;
  userId: string;
  ticketNumber: string;
  issuedAt: ISODateTimeString;
  isWinningTicket: boolean;
}

// ---------------------------------------------------------------------------
// Winner Escrow (6-month blocked bank account)
// ---------------------------------------------------------------------------

export type EscrowStatus = 'locked' | 'maturing' | 'unlocked' | 'disbursed';

export interface EscrowAccount {
  id: string;
  winnerId: string;
  userId: string;
  principalAmountETB: number;
  annualInterestRate: number;
  lockedDate: ISODateString;
  unlockDate: ISODateString;
  status: EscrowStatus;
  bankPartner: string;
  escrowAccountNumber: string;
  totalDaysLocked: number;
  elapsedDays: number;
  dailyInterestYieldETB: number;
  accruedInterestETB: number;
  projectedTotalInterestETB: number;
}

// ---------------------------------------------------------------------------
// Repayment Schedule
// ---------------------------------------------------------------------------

export interface RepaymentSchedule {
  id: string;
  winnerId: string;
  userId: string;
  totalPrizeETB: number;
  dailyPrincipalETB: number;
  dailyAdminFeeETB: number;
  dailyTotalDueETB: number;
  monthlyProjectedETB: number;
  totalRepaidETB: number;
  remainingPrincipalETB: number;
  installmentsCompleted: number;
  nextPaymentDueDate: ISODateString;
}

// ---------------------------------------------------------------------------
// Winner Buffer (7,500 ETB / 15-day cycle)
// ---------------------------------------------------------------------------

export type BufferHealthStatus = 'healthy' | 'caution' | 'critical' | 'depleted';

export interface WinnerBuffer {
  id: string;
  winnerId: string;
  cycleLengthDays: number;
  targetBufferAmountETB: number;
  currentBufferBalanceETB: number;
  dailyBurnRateETB: number;
  cycleStartDate: ISODateString;
  cycleRenewalDate: ISODateString;
  daysRemainingInCycle: number;
  healthStatus: BufferHealthStatus;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'draw_result'
  | 'contribution_reminder'
  | 'buffer_warning'
  | 'interest_accrual'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: ISODateTimeString;
  isRead: boolean;
  actionRoute?: string;
}

// ---------------------------------------------------------------------------
// Demo Configuration — Configurable financial assumptions
// ---------------------------------------------------------------------------

/**
 * All financial parameters that are disputed, unconfirmed, or subject to
 * employer clarification are gathered here so they can be toggled in the
 * demo UI. See docs/open-questions.md for the full list of ambiguities.
 */
export interface DemoConfiguration {
  /** Daily contribution amount in ETB (source: 50) */
  dailyContributionETB: number;

  /** Prize amount in ETB (source: 1,000,000) */
  prizeAmountETB: number;

  /**
   * Daily principal repayment in ETB (source conflict: 500 vs 550).
   * This is the base repayment amount EXCLUDING the admin fee.
   */
  dailyPrincipalRepaymentETB: number;

  /**
   * Daily administrative fee in ETB (source: 50).
   * Kept separate from principal to maintain distinguishability.
   */
  dailyAdminFeeETB: number;

  /**
   * Stated annual interest rate as a decimal (source: 0.22 for 22%).
   * The rate convention (simple vs compound, ACT/365 vs 30/360) is
   * unconfirmed. We default to simple interest with ACT/365 and
   * document the assumption.
   */
  annualInterestRate: number;

  /**
   * Number of days the prize is locked in escrow.
   * The source says "exactly 6 months" which is ambiguous
   * (180 days? calendar months?). We default to 180 days
   * but allow configuration.
   */
  lockPeriodDays: number;

  /** Winner's buffer amount in ETB (source: 7,500) */
  bufferAmountETB: number;

  /** Buffer replenishment cycle in days (source: 15) */
  bufferCycleDays: number;
}

/**
 * Default demo configuration based on the most common interpretation
 * of the source material. Every default is documented with its source.
 */
export const DEFAULT_DEMO_CONFIG: DemoConfiguration = {
  dailyContributionETB: 50, // Source: Page 3, 4, 5
  prizeAmountETB: 1_000_000, // Source: Page 3, 4
  dailyPrincipalRepaymentETB: 500, // Source: Page 3, 6 (base amount)
  dailyAdminFeeETB: 50, // Source: Page 6 ("nominal 50-Birr admin fee")
  annualInterestRate: 0.22, // Source: Page 4 (22%)
  lockPeriodDays: 180, // Source: Page 4 ("exactly 6 months")
  bufferAmountETB: 7_500, // Source: Page 6
  bufferCycleDays: 15, // Source: Page 6
};
