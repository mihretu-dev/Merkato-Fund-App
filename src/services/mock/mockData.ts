/**
 * Merkato Fund — Synthetic Seed Data
 *
 * CRITICAL SAFETY NOTICE:
 * All figures, personas, phone numbers, tickets, accounts, and pool metrics
 * contained in this file are STRICTLY SYNTHETIC DEMONSTRATION ARTIFACTS.
 * None of this data reflects live operational accounts, real bank escrows,
 * or lottery activities certified by the National Lottery Administration.
 */

import {
  User,
  ContributionRecord,
  DailyDraw,
  DrawTicket,
  EscrowAccount,
  RepaymentSchedule,
  WinnerBuffer,
  PoolStatistics,
  DemoPersonaId,
} from '@/src/domain/types';

// ---------------------------------------------------------------------------
// 1. Synthetic Personas
// ---------------------------------------------------------------------------

export const MOCK_PERSONAS: Record<DemoPersonaId, User> = {
  dawit: {
    id: 'user-dawit-001',
    personaId: 'dawit',
    phoneNumber: '+251 91 123 4567',
    fullName: 'Dawit Haile',
    role: 'member',
    occupation: 'Textile Merchant',
    location: 'Mercato (Military Tera), Addis Ababa',
    avatarUrl: undefined,
    joinedDate: '2026-10-03',
    isVerified: true,
    activeStreakDays: 14,
    totalContributedETB: 700,
    simulatedWalletBalanceETB: 2450,
  },
  bethlehem: {
    id: 'user-bethlehem-002',
    personaId: 'bethlehem',
    phoneNumber: '+251 92 888 9900',
    fullName: 'Bethlehem Tadesse',
    role: 'winner',
    occupation: 'Coffee & Spice Exporter',
    location: 'Bole Medhanialem, Addis Ababa',
    avatarUrl: undefined,
    joinedDate: '2026-08-01',
    isVerified: true,
    activeStreakDays: 76,
    totalContributedETB: 3800,
    simulatedWalletBalanceETB: 45000,
  },
  admin: {
    id: 'user-admin-003',
    personaId: 'admin',
    phoneNumber: '+251 90 000 1122',
    fullName: 'Abebe Kebede',
    role: 'admin',
    occupation: 'Senior Compliance Auditor',
    location: 'NBE Financial District, Addis Ababa',
    avatarUrl: undefined,
    joinedDate: '2026-01-01',
    isVerified: true,
    activeStreakDays: 289,
    totalContributedETB: 14450,
    simulatedWalletBalanceETB: 150000,
  },
};

// ---------------------------------------------------------------------------
// 2. Synthetic Contributions
// ---------------------------------------------------------------------------

export const INITIAL_MOCK_CONTRIBUTIONS: ContributionRecord[] = [
  // Dawit's recent streak (14 days, today unpaid so user can simulate payment)
  ...Array.from({ length: 14 }, (_, i) => {
    const day = 16 - i;
    const dateStr = `2026-10-${day.toString().padStart(2, '0')}`;
    const channels: ContributionRecord['channel'][] = ['telebirr', 'cbe_birr', 'telebirr', 'awash_birr'];
    return {
      id: `contrib-dawit-${day}`,
      userId: 'user-dawit-001',
      amountETB: 50,
      date: dateStr,
      timestamp: `${dateStr}T09:${(15 + i).toString().padStart(2, '0')}:00+03:00`,
      channel: channels[i % channels.length],
      transactionReference: `TX-ETB-${dateStr.replace(/-/g, '')}-D${8100 + i}`,
      status: 'completed' as const,
      streakDay: 14 - i,
      isSimulated: true as const,
    };
  }),

  // Bethlehem's contributions before winning
  {
    id: 'contrib-bethlehem-001',
    userId: 'user-bethlehem-002',
    amountETB: 50,
    date: '2026-09-01',
    timestamp: '2026-09-01T08:30:00+03:00',
    channel: 'cbe_birr',
    transactionReference: 'TX-ETB-20260901-B4402',
    status: 'completed',
    streakDay: 31,
    isSimulated: true,
  },
];

// ---------------------------------------------------------------------------
// 3. Synthetic Daily Draws
// ---------------------------------------------------------------------------

export const INITIAL_MOCK_DRAWS: DailyDraw[] = [
  {
    id: 'draw-20261017',
    drawDate: '2026-10-17',
    scheduledTime: '2026-10-17T20:00:00+03:00',
    prizeAmountETB: 1_000_000,
    status: 'scheduled',
    participantCount: 24850,
    poolTotalCollectedETB: 1_242_500,
    hashSeed: '0x7f4b82d399c26a5e1104e6c382b9e4a1932e65d836bc49e17b8f95c249a8e210',
  },
  {
    id: 'draw-20261016',
    drawDate: '2026-10-16',
    scheduledTime: '2026-10-16T20:00:00+03:00',
    prizeAmountETB: 1_000_000,
    status: 'completed',
    participantCount: 24620,
    poolTotalCollectedETB: 1_231_000,
    hashSeed: '0x3e18a90184b9c1d098ef732b11568c09a842f77e231bcde45a0198f3128bca31',
    winningTicketNumber: 'MF-20261016-9182',
    winnerUserId: 'user-anon-9182',
    winnerName: 'Mulugeta Zewde (Mercato)',
    completedAt: '2026-10-16T20:00:04+03:00',
  },
  {
    id: 'draw-20260901',
    drawDate: '2026-09-01',
    scheduledTime: '2026-09-01T20:00:00+03:00',
    prizeAmountETB: 1_000_000,
    status: 'completed',
    participantCount: 22400,
    poolTotalCollectedETB: 1_120_000,
    hashSeed: '0x99a4c8103d441f92e851a70cbb419e072f9a721c08b5e67041a923ec581a0b32',
    winningTicketNumber: 'MF-20260901-4402',
    winnerUserId: 'user-bethlehem-002',
    winnerName: 'Bethlehem Tadesse',
    completedAt: '2026-09-01T20:00:06+03:00',
  },
];

// ---------------------------------------------------------------------------
// 4. Synthetic Draw Tickets
// ---------------------------------------------------------------------------

export const INITIAL_MOCK_TICKETS: DrawTicket[] = [
  // Dawit's previous ticket from yesterday
  {
    id: 'ticket-dawit-20261016',
    drawId: 'draw-20261016',
    userId: 'user-dawit-001',
    ticketNumber: 'MF-20261016-1049',
    issuedAt: '2026-10-16T09:15:00+03:00',
    isWinningTicket: false,
  },
  // Bethlehem's historical winning ticket
  {
    id: 'ticket-bethlehem-20260901',
    drawId: 'draw-20260901',
    userId: 'user-bethlehem-002',
    ticketNumber: 'MF-20260901-4402',
    issuedAt: '2026-09-01T08:30:00+03:00',
    isWinningTicket: true,
  },
];

// ---------------------------------------------------------------------------
// 5. Bethlehem's 6-Month Blocked Escrow (Day 45 / 180)
// ---------------------------------------------------------------------------

export const INITIAL_BETHLEHEM_ESCROW: EscrowAccount = {
  id: 'escrow-bethlehem-001',
  winnerId: 'winner-bethlehem',
  userId: 'user-bethlehem-002',
  principalAmountETB: 1_000_000,
  annualInterestRate: 0.22,
  lockedDate: '2026-09-01',
  unlockDate: '2027-02-28',
  status: 'locked',
  bankPartner: 'Commercial Bank of Ethiopia (CBE)',
  escrowAccountNumber: 'DEMO-1000-ESC-8392-ETB',
  totalDaysLocked: 180,
  elapsedDays: 45,
  dailyInterestYieldETB: 602.74, // 1M * 0.22 / 365
  accruedInterestETB: 27123.3, // 45 * 602.74
  projectedTotalInterestETB: 108493.15, // 180 * 602.74
};

// ---------------------------------------------------------------------------
// 6. Bethlehem's Repayment Schedule
// ---------------------------------------------------------------------------

export const INITIAL_BETHLEHEM_REPAYMENT: RepaymentSchedule = {
  id: 'repay-bethlehem-001',
  winnerId: 'winner-bethlehem',
  userId: 'user-bethlehem-002',
  totalPrizeETB: 1_000_000,
  dailyPrincipalETB: 500,
  dailyAdminFeeETB: 50,
  dailyTotalDueETB: 550,
  monthlyProjectedETB: 16_500,
  totalRepaidETB: 24_750, // 45 installments of 550 ETB
  remainingPrincipalETB: 977_500, // 1,000,000 - (45 * 500)
  installmentsCompleted: 45,
  nextPaymentDueDate: '2026-10-18',
};

// ---------------------------------------------------------------------------
// 7. Bethlehem's 7,500 ETB Winner Buffer
// ---------------------------------------------------------------------------

export const INITIAL_BETHLEHEM_BUFFER: WinnerBuffer = {
  id: 'buf-bethlehem-001',
  winnerId: 'winner-bethlehem',
  cycleLengthDays: 15,
  targetBufferAmountETB: 7_500,
  currentBufferBalanceETB: 5_000, // Day 5 of 15: 2500 ETB drawn, 5000 remaining
  dailyBurnRateETB: 500,
  cycleStartDate: '2026-10-12',
  cycleRenewalDate: '2026-10-27',
  daysRemainingInCycle: 10,
  healthStatus: 'healthy',
};

// ---------------------------------------------------------------------------
// 8. Admin Pool Statistics
// ---------------------------------------------------------------------------

export const INITIAL_MOCK_POOL_STATISTICS: PoolStatistics = {
  totalPoolBalanceETB: 1_242_500,
  activeContributorsCount: 24850,
  dailyExpectedPoolETB: 1_242_500,
  drawPrizeAllocatedETB: 1_000_000,
  reserveFundETB: 242_500,
  totalDrawsCompleted: 76,
  lastAuditedDate: '2026-10-17',
};
