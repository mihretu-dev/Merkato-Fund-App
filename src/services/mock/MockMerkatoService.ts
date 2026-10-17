/**
 * Merkato Fund — Offline Mock Service Implementation
 *
 * Implements IMerkatoService with deterministic, realistic synthetic seed data.
 * Purely local and offline; no live APIs, banks, or payment gateways.
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
import {
  IMerkatoService,
  SubmitContributionParams,
  SubmitContributionResult,
  ExecuteDrawResult,
} from '../interfaces/IMerkatoService';
import {
  MOCK_PERSONAS,
  INITIAL_MOCK_CONTRIBUTIONS,
  INITIAL_MOCK_DRAWS,
  INITIAL_MOCK_TICKETS,
  INITIAL_BETHLEHEM_ESCROW,
  INITIAL_BETHLEHEM_REPAYMENT,
  INITIAL_BETHLEHEM_BUFFER,
  INITIAL_MOCK_POOL_STATISTICS,
} from './mockData';
import { simulateDemonstrationDraw } from '@/src/domain/calculations/drawSimulation';
import { calculateBufferHealth } from '@/src/domain/calculations/repayment';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class MockMerkatoService implements IMerkatoService {
  private users: Record<DemoPersonaId, User>;
  private contributions: ContributionRecord[];
  private draws: DailyDraw[];
  private tickets: DrawTicket[];
  private escrowAccounts: Record<string, EscrowAccount>;
  private repayments: Record<string, RepaymentSchedule>;
  private buffers: Record<string, WinnerBuffer>;
  private poolStats: PoolStatistics;

  constructor() {
    this.users = deepClone(MOCK_PERSONAS);
    this.contributions = deepClone(INITIAL_MOCK_CONTRIBUTIONS);
    this.draws = deepClone(INITIAL_MOCK_DRAWS);
    this.tickets = deepClone(INITIAL_MOCK_TICKETS);
    this.escrowAccounts = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_ESCROW),
    };
    this.repayments = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_REPAYMENT),
    };
    this.buffers = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_BUFFER),
    };
    this.poolStats = deepClone(INITIAL_MOCK_POOL_STATISTICS);
  }

  async getAvailablePersonas(): Promise<User[]> {
    return Object.values(this.users);
  }

  async getUserByPersona(personaId: DemoPersonaId): Promise<User> {
    const user = this.users[personaId];
    if (!user) {
      throw new Error(`Demo persona not found: ${personaId}`);
    }
    return deepClone(user);
  }

  async getContributions(userId: string): Promise<ContributionRecord[]> {
    return deepClone(
      this.contributions
        .filter((c) => c.userId === userId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    );
  }

  async checkContributedToday(userId: string, dateStr: string = '2026-10-17'): Promise<boolean> {
    return this.contributions.some((c) => c.userId === userId && c.date === dateStr);
  }

  async submitContribution(params: SubmitContributionParams): Promise<SubmitContributionResult> {
    const { userId, amountETB, channel } = params;
    const personaEntry = Object.entries(this.users).find(([, u]) => u.id === userId);
    if (!personaEntry) {
      throw new Error(`User not found: ${userId}`);
    }
    const [personaKey, user] = personaEntry;
    const today = '2026-10-17';

    // Verify not already paid today
    const alreadyPaid = await this.checkContributedToday(userId, today);
    if (alreadyPaid) {
      throw new Error('User has already contributed for today.');
    }

    // Update user stats
    user.activeStreakDays += 1;
    user.totalContributedETB += amountETB;
    if (user.simulatedWalletBalanceETB >= amountETB) {
      user.simulatedWalletBalanceETB -= amountETB;
    }

    // Create contribution record
    const refSuffix = Math.floor(1000 + Math.random() * 9000);
    const contribution: ContributionRecord = {
      id: `contrib-${userId}-${Date.now()}`,
      userId,
      amountETB,
      date: today,
      timestamp: `${today}T12:00:00+03:00`,
      channel,
      transactionReference: `TX-ETB-${today.replace(/-/g, '')}-${refSuffix}`,
      status: 'completed',
      streakDay: user.activeStreakDays,
      isSimulated: true,
    };
    this.contributions.unshift(contribution);

    // Issue draw ticket for today's active draw
    const activeDraw = await this.getActiveDraw();
    const ticketSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticket: DrawTicket = {
      id: `ticket-${userId}-${today}`,
      drawId: activeDraw.id,
      userId,
      ticketNumber: `MF-${today.replace(/-/g, '')}-${ticketSuffix}`,
      issuedAt: `${today}T12:00:00+03:00`,
      isWinningTicket: false,
    };
    this.tickets.unshift(ticket);

    // Update active draw pool
    activeDraw.participantCount += 1;
    activeDraw.poolTotalCollectedETB += amountETB;
    this.poolStats.totalPoolBalanceETB += amountETB;
    this.poolStats.activeContributorsCount += 1;

    return {
      contribution: deepClone(contribution),
      ticket: deepClone(ticket),
      updatedUser: deepClone(user),
    };
  }

  async getActiveDraw(): Promise<DailyDraw> {
    const scheduled = this.draws.find((d) => d.status === 'scheduled');
    if (scheduled) return scheduled;
    return this.draws[0];
  }

  async getDrawHistory(): Promise<DailyDraw[]> {
    return deepClone(this.draws);
  }

  async getUserTickets(userId: string, drawId?: string): Promise<DrawTicket[]> {
    return deepClone(
      this.tickets.filter((t) => {
        if (t.userId !== userId) return false;
        if (drawId && t.drawId !== drawId) return false;
        return true;
      })
    );
  }

  async getDrawTickets(drawId: string): Promise<DrawTicket[]> {
    return deepClone(this.tickets.filter((t) => t.drawId === drawId));
  }

  async addSampleTicket(userId: string, drawId?: string): Promise<DrawTicket> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const draw = drawId ? this.draws.find((d) => d.id === drawId) : await this.getActiveDraw();
    if (!draw) {
      throw new Error('Target draw not found');
    }

    const suffix = Math.floor(1000 + Math.random() * 9000);
    const sampleTicket: DrawTicket = {
      id: `ticket-sample-${userId}-${Date.now()}`,
      drawId: draw.id,
      userId: user.id,
      ticketNumber: `MF-${draw.drawDate.replace(/-/g, '')}-S${suffix}`,
      issuedAt: new Date().toISOString(),
      isWinningTicket: false,
    };

    this.tickets.unshift(sampleTicket);
    draw.participantCount += 1;

    return deepClone(sampleTicket);
  }

  async resetActiveDraw(drawId?: string): Promise<DailyDraw> {
    const draw = drawId ? this.draws.find((d) => d.id === drawId) : this.draws.find((d) => d.id === 'draw-20261017');
    if (!draw) {
      throw new Error('Target draw not found');
    }

    draw.status = 'scheduled';
    delete draw.winningTicketNumber;
    delete draw.winnerUserId;
    delete draw.winnerName;
    delete draw.completedAt;

    // Reset winning status for tickets of this draw
    this.tickets.forEach((t) => {
      if (t.drawId === draw.id) {
        t.isWinningTicket = false;
      }
    });

    return deepClone(draw);
  }

  async simulateDailyDraw(drawId?: string, seed?: string): Promise<ExecuteDrawResult> {
    const draw = drawId ? this.draws.find((d) => d.id === drawId) : await this.getActiveDraw();
    if (!draw) {
      throw new Error('Target draw not found');
    }

    // Guard: Prevent double-execution of the same draw instance
    if (draw.status === 'completed') {
      throw new Error('This draw instance has already been completed. Reset or replay the draw first.');
    }

    // Get strictly eligible tickets for this specific draw
    const eligibleTickets = this.tickets.filter((t) => t.drawId === draw.id);
    if (eligibleTickets.length === 0) {
      throw new Error('Cannot run draw simulation: zero eligible tickets found for this draw.');
    }

    // Execute deterministic demonstration selection
    const outcome = simulateDemonstrationDraw(
      eligibleTickets.map((t) => t.ticketNumber),
      seed || `DEMO-SEED-${draw.id}-${Date.now()}`
    );

    const winningTicket = eligibleTickets.find((t) => t.ticketNumber === outcome.winningTicketNumber);
    if (!winningTicket) {
      throw new Error('Winning ticket resolution failed.');
    }

    const winnerUser = Object.values(this.users).find((u) => u.id === winningTicket.userId);
    if (!winnerUser) {
      throw new Error(`Winner user profile not found for ticket ${winningTicket.ticketNumber}`);
    }

    // Update draw & ticket state
    winningTicket.isWinningTicket = true;
    draw.status = 'completed';
    draw.winningTicketNumber = winningTicket.ticketNumber;
    draw.winnerUserId = winnerUser.id;
    draw.winnerName = winnerUser.fullName;
    draw.completedAt = `${draw.drawDate}T20:00:05+03:00`;
    this.poolStats.totalDrawsCompleted += 1;

    // Setup or update winner escrow and repayment models so winner screen agrees
    this.escrowAccounts[winnerUser.id] = {
      id: `escrow-${winnerUser.id}`,
      winnerId: `winner-${winnerUser.id}`,
      userId: winnerUser.id,
      escrowAccountNumber: `DEMO-CBE-ESC-${winnerUser.id.slice(-4).toUpperCase()}`,
      bankPartner: 'Commercial Bank of Ethiopia (CBE)',
      principalAmountETB: 1_000_000,
      lockedDate: draw.drawDate,
      unlockDate: '2027-04-15',
      totalDaysLocked: 180,
      elapsedDays: 0,
      annualInterestRate: 0.22,
      dailyInterestYieldETB: 602.74,
      accruedInterestETB: 0,
      projectedTotalInterestETB: 108493.15,
      status: 'locked',
    };

    this.repayments[winnerUser.id] = {
      id: `repay-${winnerUser.id}`,
      winnerId: `winner-${winnerUser.id}`,
      userId: winnerUser.id,
      totalPrizeETB: 1_000_000,
      dailyPrincipalETB: 500,
      dailyAdminFeeETB: 50,
      dailyTotalDueETB: 550,
      monthlyProjectedETB: 16_500,
      remainingPrincipalETB: 1_000_000,
      totalRepaidETB: 0,
      installmentsCompleted: 0,
      nextPaymentDueDate: draw.drawDate,
    };

    this.buffers[winnerUser.id] = {
      id: `buffer-${winnerUser.id}`,
      winnerId: `winner-${winnerUser.id}`,
      cycleLengthDays: 15,
      targetBufferAmountETB: 7500,
      currentBufferBalanceETB: 7500,
      dailyBurnRateETB: 500,
      cycleStartDate: draw.drawDate,
      cycleRenewalDate: '2026-11-01',
      daysRemainingInCycle: 15,
      healthStatus: 'healthy',
    };

    winnerUser.role = 'winner';

    return {
      draw: deepClone(draw),
      winningTicket: deepClone(winningTicket),
      winner: deepClone(winnerUser),
      isDemonstrationOnly: true,
    };
  }

  async getEscrowAccount(userId: string): Promise<EscrowAccount | null> {
    const escrow = this.escrowAccounts[userId];
    return escrow ? deepClone(escrow) : null;
  }

  async getRepaymentSchedule(userId: string): Promise<RepaymentSchedule | null> {
    const sched = this.repayments[userId];
    return sched ? deepClone(sched) : null;
  }

  async getWinnerBuffer(userId: string): Promise<WinnerBuffer | null> {
    const buf = this.buffers[userId];
    return buf ? deepClone(buf) : null;
  }

  async recordRepaymentInstallment(
    userId: string,
    channel: PaymentChannel = 'telebirr'
  ): Promise<{ schedule: RepaymentSchedule; buffer: WinnerBuffer }> {
    const sched = this.repayments[userId];
    const buf = this.buffers[userId];
    if (!sched || !buf) {
      throw new Error(`Winner profile not found for user ${userId}`);
    }

    // Apply 500 ETB principal + 50 ETB admin fee = 550 ETB total
    sched.installmentsCompleted += 1;
    sched.totalRepaidETB += sched.dailyTotalDueETB;
    sched.remainingPrincipalETB = Math.max(0, sched.remainingPrincipalETB - sched.dailyPrincipalETB);

    // Buffer depletion simulation (500 ETB daily burn)
    buf.currentBufferBalanceETB = Math.max(0, buf.currentBufferBalanceETB - sched.dailyPrincipalETB);
    buf.healthStatus = calculateBufferHealth(buf.currentBufferBalanceETB, buf.targetBufferAmountETB);

    return {
      schedule: deepClone(sched),
      buffer: deepClone(buf),
    };
  }

  async replenishWinnerBuffer(userId: string, amountETB: number = 2500): Promise<WinnerBuffer> {
    const buf = this.buffers[userId];
    if (!buf) {
      throw new Error(`Winner buffer not found for user ${userId}`);
    }
    buf.currentBufferBalanceETB = Math.min(
      buf.targetBufferAmountETB,
      buf.currentBufferBalanceETB + amountETB
    );
    buf.healthStatus = calculateBufferHealth(buf.currentBufferBalanceETB, buf.targetBufferAmountETB);
    return deepClone(buf);
  }

  async getPoolStatistics(): Promise<PoolStatistics> {
    return deepClone(this.poolStats);
  }

  async resetDemo(): Promise<void> {
    this.users = deepClone(MOCK_PERSONAS);
    this.contributions = deepClone(INITIAL_MOCK_CONTRIBUTIONS);
    this.draws = deepClone(INITIAL_MOCK_DRAWS);
    this.tickets = deepClone(INITIAL_MOCK_TICKETS);
    this.escrowAccounts = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_ESCROW),
    };
    this.repayments = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_REPAYMENT),
    };
    this.buffers = {
      'user-bethlehem-002': deepClone(INITIAL_BETHLEHEM_BUFFER),
    };
    this.poolStats = deepClone(INITIAL_MOCK_POOL_STATISTICS);
  }
}

// Default singleton instance for the app
export const mockMerkatoService = new MockMerkatoService();
