# Merkato Fund — Agent Guidelines & Project Conventions

**Project**: Merkato Fund Mobile Application  
**Target Platforms**: Android, iOS, Web (React Native + Expo Router + TypeScript)  
**SDK**: Expo SDK 58 (React 19, React Native 0.88)  
**Status**: Day 2 Complete (Stores, Mock Services, Full Tabs Navigation, 54 Tests Passing)  

---

## 1. Safety Boundaries & Demo Data Integrity (CRITICAL)

This application is a **demonstration prototype** evaluating an Ethiopian fintech model combining Equb dynamics, algorithmic draws, bank escrow, and capital markets. All agents and developers working on this codebase MUST strictly adhere to the following safety boundaries:

1. **Synthetic Data Only**:
   - Never display invented pool balances, user counts, bank deposits, or returns as real operating statistics.
   - All visual screens showing financial figures, draw tickets, or accounts must display a prominent `DemoBadge` or `DisclaimerNotice`.
   - Never implement live payment gateways, real telebirr/CBE API calls, or real money transfers.

2. **No Contractual Payoff Dates or Authoritative Amortization**:
   - The source marketing PDF lacks essential legal and contractual terms (amortization formula, compound frequency, default terms).
   - Never generate or present an authoritative amortization schedule as legally binding.
   - All payoff projections must be explicitly qualified as simple estimates.

3. **Administration Fee Separation**:
   - The stated 50 ETB administrative fee MUST be kept distinct from the 500 ETB daily principal repayment.
   - Administrative fees do NOT reduce principal debt.

4. **Escrow Yield & Rate Convention**:
   - The claimed 22% annual yield on the 1,000,000 ETB escrow must be computed using documented simple interest arithmetic with an explicit **ACT/365** day-count convention.
   - Six months must not automatically be treated as exactly 180 days unless the scenario explicitly specifies that convention.

5. **Draw Simulation Isolation**:
   - Any draw simulation must be kept completely separate from financial calculation engines.
   - Draws must be explicitly labeled as client-side demonstration simulations (`isDemonstrationOnly: true`).
   - Never imply that a demo draw is certified by the National Lottery Administration (NLA).

---

## 2. Technology Stack & Architecture

- **Framework**: Expo SDK 58 with Expo Router (file-based navigation in `app/`).
- **Language**: TypeScript (`strict: true`).
- **State Management**: Zustand for lightweight domain state stores (`src/stores/`).
- **Styling**: Vanilla React Native `StyleSheet` backed by structured design tokens in `src/theme/tokens.ts`.
- **Domain Logic**: Pure TypeScript functions in `src/domain/calculations/`, free of React or UI dependencies.
- **Testing**: Native Node.js test runner (`node:test`, `node:assert/strict`) executed via `npm test` (using `tsx`). Total 54 unit tests across 19 suites.

---

## 3. Directory Layout

```
merkato-fund-app/
├── app/                        # Expo Router navigation routes
│   ├── (tabs)/                 # Tab navigator routes
│   │   ├── _layout.tsx         # Bottom tab configuration (6 active tabs)
│   │   ├── index.tsx           # Member Dashboard (Streak, Contributions, Tickets)
│   │   ├── contribute.tsx      # Daily 50 ETB Contribution Flow & Ledger
│   │   ├── draw.tsx            # Algorithmic Draw Room & Demo Draw Simulator
│   │   ├── winner.tsx          # 6-Month Blocked Escrow (1M ETB @ 22%), Repayments, Buffer
│   │   ├── admin.tsx           # Auditor Preview & Pool Solvency (Guarded for Admin role)
│   │   ├── verify.tsx          # Day 2 Developer State & Transitions Verification
│   │   ├── engine.tsx          # Day 1 Math & Engine Playground
│   │   └── two.tsx             # Day 1 Rules & Ambiguities Verification
│   ├── _layout.tsx             # Root stack navigator & theme provider
│   └── modal.tsx               # About & Safety Boundaries modal
├── components/                 # Themed base components from Expo
├── docs/                       # Project planning & architectural documents
│   ├── requirements.md         # Full requirements specification
│   ├── architecture.md         # Architecture decision records
│   ├── data-model.md           # Domain data models & synthetic data
│   ├── implementation-plan.md  # 7-day sprint roadmap (Day 1 & Day 2 Verified)
│   └── open-questions.md       # Financial contradictions & risk register
├── src/
│   ├── components/ui/          # Accessible UI primitives (AppButton, Card, DemoBadge, MetricTile, PersonaSelector, etc.)
│   ├── domain/
│   │   ├── types.ts            # Domain entity types, DemoConfiguration & PoolStatistics
│   │   └── calculations/       # Pure financial arithmetic modules
│   │       ├── currency.ts     # ETB formatting utilities
│   │       ├── interest.ts     # Escrow yield calculations (ACT/365)
│   │       ├── repayment.ts    # Repayment scenarios & buffer status
│   │       ├── drawSimulation.ts # Client-side demonstration draw
│   │       └── __tests__/      # Automated calculations test suite
│   ├── services/               # Ports & Adapters mock service layer
│   │   ├── interfaces/         # IMerkatoService contracts
│   │   ├── mock/               # MockData.ts (3 Ethiopian personas) & MockMerkatoService.ts
│   │   └── __tests__/          # Mock service automated tests
│   ├── stores/                 # Zustand reactive state stores
│   │   ├── useUserStore.ts     # Active persona & persona switching
│   │   ├── useContributionStore.ts # Daily contribution & ledger
│   │   ├── useDrawStore.ts     # Active draw, tickets & simulation
│   │   ├── useWinnerStore.ts   # 1M ETB escrow, repayments & buffer
│   │   ├── useDemoConfigStore.ts # Configurable rate & repayment models
│   │   ├── index.ts            # resetAllDemoStores unified reset helper
│   │   └── __tests__/          # Store automated tests
│   └── theme/
│       └── tokens.ts           # Design tokens (colors, spacing, typography, radii)
├── package.json
└── tsconfig.json
```

---

## 4. Verification & Testing Commands

To verify the codebase before committing any changes:

```bash
# Run the automated domain test suite
npm test

# Run TypeScript static type-checking
npm run typecheck

# Start Expo dev server
npm start

# Run web build locally for rapid visual verification
npm run web
```
