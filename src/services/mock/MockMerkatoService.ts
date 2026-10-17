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

  async simulateDailyDraw(drawId?: string): Promise<ExecuteDrawResult> {
    const draw = drawId ? this.draws.find((d) => d.id === drawId) : await this.getActiveDraw();
    if (!draw) {
      throw new Error('Target draw not found');
    }

    // Get current tickets for this draw
    const drawTickets = this.tickets.filter((t) => t.drawId === draw.id);
    let winningTicket: DrawTicket;
    let winnerUser: User;

    if (drawTickets.length > 0) {
      // Pick among actual ticket holders
      const outcome = simulateDemonstrationDraw(
        drawTickets.map((t) => t.ticketNumber),
        `seed-${draw.id}-${Date.now()}`
      );
      winningTicket = drawTickets.find((t) => t.ticketNumber === outcome.winningTicketNumber)!;
      winnerUser = Object.values(this.users).find((u) => u.id === winningTicket.userId) || this.users.dawit;
    } else {
      // Synthesize winner if no user holds ticket
      const ticketNum = `MF-${draw.drawDate.replace(/-/g, '')}-9912`;
      winningTicket = {
        id: `ticket-win-${draw.id}`,
        drawId: draw.id,
        userId: this.users.dawit.id,
        ticketNumber: ticketNum,
        issuedAt: `${draw.drawDate}T10:00:00+03:00`,
        isWinningTicket: true,
      };
      this.tickets.push(winningTicket);
      winnerUser = this.users.dawit;
    }

    winningTicket.isWinningTicket = true;
    draw.status = 'completed';
    draw.winningTicketNumber = winningTicket.ticketNumber;
    draw.winnerUserId = winnerUser.id;
    draw.winnerName = winnerUser.fullName;
    draw.completedAt = `${draw.drawDate}T20:00:05+03:00`;
    this.poolStats.totalDrawsCompleted += 1;

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
