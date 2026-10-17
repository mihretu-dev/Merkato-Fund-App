/**
 * Merkato Fund — Core Service Interface
 *
 * Defines the contract for all domain interactions (auth/personas,
 * contributions, draws, escrow, repayments, and pool metrics).
 *
 * Adheres to Ports & Adapters architecture:
 * In the prototype build, MockMerkatoService fulfills this interface offline.
 * In a future production build, Supabase/API adapters can replace the mock.
 */

import {
  User,
  DemoPersonaId,
  ContributionRecord,
  DailyDraw,
  DrawTicket,
  EscrowAccount,
  RepaymentSchedule,
  WinnerBuffer,
  PoolStatistics,
  PaymentChannel,
} from '@/src/domain/types';

export interface SubmitContributionParams {
  userId: string;
  amountETB: number;
  channel: PaymentChannel;
}

export interface SubmitContributionResult {
  contribution: ContributionRecord;
  ticket: DrawTicket;
  updatedUser: User;
}

export interface ExecuteDrawResult {
  draw: DailyDraw;
  winningTicket: DrawTicket;
  winner: User;
  isDemonstrationOnly: true;
}

export interface IMerkatoService {
  /** Personas / Profiles */
  getAvailablePersonas(): Promise<User[]>;
  getUserByPersona(personaId: DemoPersonaId): Promise<User>;

  /** Contributions */
  getContributions(userId: string): Promise<ContributionRecord[]>;
  checkContributedToday(userId: string, dateStr?: string): Promise<boolean>;
  submitContribution(params: SubmitContributionParams): Promise<SubmitContributionResult>;

  /** Draws & Tickets */
  getActiveDraw(): Promise<DailyDraw>;
  getDrawHistory(): Promise<DailyDraw[]>;
  getUserTickets(userId: string, drawId?: string): Promise<DrawTicket[]>;
  simulateDailyDraw(drawId?: string): Promise<ExecuteDrawResult>;

  /** Winner Escrow, Repayment & Buffer */
  getEscrowAccount(userId: string): Promise<EscrowAccount | null>;
  getRepaymentSchedule(userId: string): Promise<RepaymentSchedule | null>;
  getWinnerBuffer(userId: string): Promise<WinnerBuffer | null>;
  recordRepaymentInstallment(userId: string, channel?: PaymentChannel): Promise<{
    schedule: RepaymentSchedule;
    buffer: WinnerBuffer;
  }>;
  replenishWinnerBuffer(userId: string, amountETB?: number): Promise<WinnerBuffer>;

  /** Pool Analytics / Auditor */
  getPoolStatistics(): Promise<PoolStatistics>;

  /** Reset all synthetic data to initial seed state */
  resetDemo(): Promise<void>;
}
