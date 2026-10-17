/**
 * Merkato Fund — Algorithmic Draw Demonstration Simulator
 *
 * CRITICAL NOTICE & INTEGRITY BOUNDARY:
 * - This module is strictly for DEMONSTRATION purposes in a prototype mobile app.
 * - This is NOT a verified live draw system, NOT a cryptographic lottery engine,
 *   and NOT connected to any real lottery or financial regulatory body.
 * - Do NOT present results from this module as authentic or binding.
 * - In production, any algorithmic draw would require certified Hardware Security
 *   Modules (HSM), National Lottery Administration (NLA) certification, and
 *   third-party cryptographic audit trails.
 */

export interface DrawSimulationInput {
  /** Draw identifier, e.g. "DRAW-2026-10-16-001" */
  drawId: string;
  /** Array of participant ticket numbers or user IDs */
  eligibleTickets: string[];
  /** Demonstration seed string, e.g. timestamp or hash */
  demoSeed?: string;
}

export interface DrawSimulationResult {
  drawId: string;
  winningTicketNumber: string;
  winningIndex: number;
  totalParticipants: number;
  selectionMethod: string;
  demoSeed: string;
  timestamp: string;
  /** Explicit demo badge indicating synthetic execution */
  isDemonstrationOnly: true;
  disclaimer: string;
}

/**
 * Simple 32-bit FNV-1a hash algorithm for deterministic, pseudo-random
 * demonstration draw selection from a seed string.
 *
 * @param str - Input seed string
 * @returns 32-bit unsigned integer
 */
export function simpleHash32(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Simulate an algorithmic draw for demonstration purposes.
 *
 * Selection Method:
 * 1. Takes the eligible participant ticket array and a demo seed.
 * 2. If no seed is provided, a synthetic demo seed is generated from drawId + timestamp.
 * 3. A 32-bit hash is computed across the seed.
 * 4. Winner index is chosen as `hash % eligibleTickets.length`.
 *
 * @param input - The draw simulation parameters
 * @returns Simulation result with explicit demonstration labeling
 */
export function simulateDemoDraw(input: DrawSimulationInput): DrawSimulationResult {
  const { drawId, eligibleTickets, demoSeed } = input;

  if (!eligibleTickets || eligibleTickets.length === 0) {
    throw new RangeError('Cannot run draw simulation with zero eligible tickets.');
  }

  const effectiveSeed =
    demoSeed || `DEMO-SEED-${drawId}-${new Date().toISOString()}`;
  const hashValue = simpleHash32(effectiveSeed);
  const winningIndex = hashValue % eligibleTickets.length;
  const winningTicketNumber = eligibleTickets[winningIndex];

  return {
    drawId,
    winningTicketNumber,
    winningIndex,
    totalParticipants: eligibleTickets.length,
    selectionMethod:
      'Demonstration Seeded FNV-1a Hash Modulo (Simulated Client-Side Selection)',
    demoSeed: effectiveSeed,
    timestamp: new Date().toISOString(),
    isDemonstrationOnly: true,
    disclaimer:
      'DEMO ONLY: This draw was executed client-side using synthetic sample data. It does not represent a real financial draw or lottery.',
  };
}

/**
 * Convenient wrapper to simulate a demonstration draw given tickets and seed
 */
export function simulateDemonstrationDraw(
  eligibleTickets: string[],
  demoSeed?: string,
  drawId?: string
): DrawSimulationResult {
  return simulateDemoDraw({
    drawId: drawId || `DRAW-SIM-${Date.now()}`,
    eligibleTickets,
    demoSeed,
  });
}

