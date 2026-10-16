# Merkato Fund — Requirements Register & Analysis

**Project**: Merkato Fund Mobile Application Demo  
**Role**: Senior Mobile Architect & Product Engineer  
**Date**: October 2026  
**Status**: Draft for Employer Review  

---

## 1. Executive Summary

Merkato Fund is described in marketing materials as a "hybrid financial ecosystem" combining elements of traditional Ethiopian **Equb** (social rotating savings), **Lottery** (daily algorithmic chance), **Banking** (restricted escrow accounts and institutional guarantees), and **Capital Markets** (tradable liquidity).

The core marketing hook is a **"Get First, Then Pay"** model:
- A user contributes **50 ETB / day**.
- A daily algorithmic draw selects a winner for a **1,000,000 ETB payout**.
- The payout is held in a **blocked bank account for 6 months**, purportedly generating **22% annual interest**.
- The winner's daily repayment escalates to **500–550 ETB / day** (plus a 50 ETB admin fee), theoretically offset by the accrued deposit interest.
- The winner maintains a **7,500 ETB buffer** replenished every 15 days.

As senior mobile architect, our analysis reveals critical mathematical, operational, and regulatory ambiguities in the marketing materials. For the 7-day demo deliverable, this document establishes a **Requirements Register** categorizing claims into confirmed statements, proposed demo behavior, unresolved business rules, and employer confirmation items.

---

## 2. Source Document Evidence Matrix

Extracted directly from the supplied Telegram reference PDF (`pdf-text.txt`):

| Page | Extracted Claim / Statement | Category in Register |
|---|---|---|
| **Page 2–3** | "Reversing the flow of capital: No more pay-to-get—just get-to-pay." | Confirmed Marketing Claim |
| **Page 3** | "Pay the capital back over time with absolutely no interest and no debt." | Inconsistent Statement (Conflicts with 22% bank interest & fee structure) |
| **Page 3** | "For just 50 Birr a day, you secure a daily chance to access 1 Million Birr in interest-free, productive capital." | Confirmed Marketing Claim |
| **Page 3** | "Once you receive your capital, your structured, interest-free repayment shifts to 500 Birr a day." | Confirmed Marketing Claim (Conflicts with Page 4 & 6) |
| **Page 3** | "Winners are selected every single day through a live algorithmic draw." | Confirmed Marketing Claim |
| **Page 3** | "Your money is 100% protected by restricted bank escrow accounts and institutional guarantees." | Unresolved Business Rule / Financial Structure |
| **Page 4** | "Step 3: The Block: Upon winning, your 1 Million Birr prize is safely deposited into a blocked bank account for exactly 6 months." | Confirmed Marketing Claim |
| **Page 4** | "Step 4: The Self-Paying Debt: During this 6-month block, your deposit generates a powerful 22% interest. This interest mathematically covers your new 550 Birr daily repayment burden, ensuring the prize completely pays for itself." | Confirmed Marketing Claim & Critical Math Inconsistency |
| **Page 6** | "The 10x Escalation: Upon winning your payout, your daily obligation takes a focused jump from the initial 50 Birr up to 500 Birr, alongside a nominal 50-Birr admin fee." | Confirmed Marketing Claim (Total = 550 ETB/day) |
| **Page 6** | "The Monthly Reality: This escalation equates to a staggering 15,000 Birr monthly obligation." | Inconsistent Statement ($500 \times 30 = 15,000$, but $550 \times 30 = 16,500$) |
| **Page 6** | "The Winner's Buffer: To guarantee smooth operations and financial security, the winner must immediately maintain a 7,500 Birr buffer that is reliably replenished every 15 days." | Confirmed Marketing Claim & Unresolved Rule |
| **Page 8** | "Four legendary economic models: Equb, Lottery, Bank, Capital Market." | Value Proposition / Brand Framing |

---

## 3. Four-Tier Requirements Register

### Tier 1: Confirmed Statements in the Source Material

These are explicit specifications stated in the Telegram channel marketing collateral:
1. **Daily Micro-Contribution**: Every active participant contributes **50 ETB per calendar day**.
2. **Daily Algorithmic Draw**: A draw occurs every single day for an advertised **1,000,000 ETB payout**.
3. **Six-Month Blocked Period**: Following a win, the 1,000,000 ETB is locked in a bank account for **exactly 6 months (180 days)** before full principal release.
4. **Advertised 22% Interest Rate**: The blocked deposit earns a claimed **22% annual interest rate**.
5. **Post-Win Repayment Escalation**: The winner's daily payment burden increases tenfold from 50 ETB to a higher tier (500 ETB principal + 50 ETB administrative fee).
6. **Winner's Operational Buffer**: The winner must maintain an active **7,500 ETB buffer** replenished on a **15-day cycle**.
7. **Equb + Lottery + Banking Narrative**: The user interface must reflect the cultural familiarity of an Ethiopian Equb while conveying modern digital fintech security (Telebirr/CBE integration feel).

---

### Tier 2: Proposed Demo Behavior (7-Day Scope)

Because the deliverable is a functional mobile app demo rather than a live banking backend, the following behaviors are proposed for the mobile client:

1. **Configurable Financial Parameters (Demo Sandbox)**:
   - Provide a Demo Settings Drawer or Developer Toggle allowing the reviewer to test either:
     - **Option A (Net Principal)**: 500 ETB/day ($15,000 \text{ ETB/month}$) + separate 50 ETB admin fee.
     - **Option B (Gross Bundle)**: 550 ETB/day inclusive ($16,500 \text{ ETB/month}$).
   - Allow toggling the interest offset calculation to demonstrate how 22% p.a. impacts net repayment.
2. **Prominent "SIMULATED ENVIRONMENT" Badging**:
   - Every financial screen (Draw, Escrow, Repayment, Telebirr checkout) displays an unambiguous banner: `Demo Simulation — Not Real Currency or Bank Escrow`.
3. **Simulated Payment Gateways**:
   - Provide mock checkout modals mimicking prominent Ethiopian payment providers:
     - **Telebirr** (USSD/in-app flow simulation)
     - **CBE Birr / Commercial Bank of Ethiopia**
     - **Awash / Dashen Bank / Amole**
   - Simulated instant success, network timeout, and insufficient balance edge cases.
4. **Algorithmic Draw Simulator**:
   - An interactive "Daily Draw" screen with:
     - Countdown timer to next scheduled draw.
     - Provably-fair simulation display (hash seed, participant pool size, winning ticket number).
     - Manual "Simulate Draw Now" button for demo testing.
     - Winner announcement celebration modal with Ethiopian confetti animations.
5. **Interactive Winner Experience Journey**:
   - Seamless role-switching between:
     - **Pre-Win Member**: Contributes 50 ETB/day, views draw countdown, checks tickets and streak.
     - **Active Winner (Month 1 to 6)**: Views the 1,000,000 ETB locked escrow, daily accrued interest counter, 550 ETB daily schedule, and 7,500 ETB buffer countdown.
     - **Post-Release Winner (Month 7+)**: Escrow unlocked, capital accessible, remaining amortization schedule.
6. **Offline-First Mock State**:
   - All state persisted locally via `AsyncStorage` or `Zustand` with zero backend setup required, but structured via repository interfaces so Supabase can be swapped in seamlessly.

---

### Tier 3: Unresolved Business Rules & Mathematical Inconsistencies

These items represent mathematical impossibilities or conflicting statements in the source that **must not be silently resolved**:

#### Inconsistency 1: 500 ETB vs. 550 ETB Daily Repayment & the 15,000 ETB Monthly Figure
- **Page 3** states: *"your structured, interest-free repayment shifts to 500 Birr a day."*
- **Page 4** states: *"covers your new 550 Birr daily repayment burden."*
- **Page 6** states: *"jump from 50 Birr up to 500 Birr, alongside a nominal 50-Birr admin fee... equates to a staggering 15,000 Birr monthly obligation."*
- **Mathematical Reality**:
  - $500 \times 30 \text{ days} = 15,000 \text{ ETB}$.
  - $550 \times 30 \text{ days} = 16,500 \text{ ETB}$.
  - If the monthly burden is 15,000 ETB, the daily payment is 500 ETB. If the daily payment is $500 + 50 = 550 \text{ ETB}$, the monthly burden is 16,500 ETB (or 16,775 ETB for 30.5-day months).
- **Demo Resolution**: The demo will display a transparent fee breakdown card showing:
  - Base Capital Repayment: `500 ETB / day` (`15,000 ETB / 30 days`)
  - Platform Administration Fee: `50 ETB / day` (`1,500 ETB / 30 days`)
  - Total Daily Debit: `550 ETB / day` (`16,500 ETB / 30 days`)

#### Inconsistency 2: "Interest-Free" Model vs. Claimed 22% Bank Interest
- **Page 3** claims: *"pay the capital back over time with absolutely no interest and no debt."*
- **Page 4** claims: *"During this 6-month block, your deposit generates a powerful 22% interest. This interest mathematically covers your new 550 Birr daily repayment burden, ensuring the prize completely pays for itself."*
- **Mathematical Analysis of the 22% Interest Offset**:
  - Deposit: $1,000,000 \text{ ETB}$.
  - Annual Rate: $22\% = 220,000 \text{ ETB / year}$.
  - Daily Simple Interest: $\frac{220,000}{365} \approx 602.74 \text{ ETB / day}$.
  - 6-Month (180 days) Accrued Interest: $180 \times 602.74 \approx 108,493.15 \text{ ETB}$ (or $110,000 \text{ ETB}$ at exact half-year).
  - Winner's 180-Day Payment Burden ($550 \times 180$): $99,000 \text{ ETB}$.
  - **The Source's Math Claim**: The marketing copy assumes the bank pays ~602.74 ETB/day in interest into the winner's account, which exceeds the 550 ETB daily repayment.
  - **The Catch**:
    1. Who receives this 22% interest? If the winner receives it, do they still owe the 1,000,000 ETB principal?
    2. Over 180 days, paying 500 ETB/day repays only $90,000 \text{ ETB}$ of the 1,000,000 ETB principal ($9\%$). At 500 ETB/day, full repayment of 1,000,000 ETB takes **2,000 days (5.48 years)**!
    3. The marketing claim *"ensuring the prize completely pays for itself"* implies the winner pays nothing, or that the interest repays the entire 1M ETB prize, which is mathematically false over 6 months.
- **Demo Resolution**: The app will feature an **Interactive Financial Reality Inspector** showing:
  - Gross Escrow Yield ($22\% \text{ p.a.} \rightarrow \approx 602.74 \text{ ETB/day}$).
  - Daily Repayment Offset ($550 \text{ ETB/day}$).
  - Net Daily Balance ($+52.74 \text{ ETB/day}$ surplus during the 6-month lock).
  - Clarifying footnote that post-month 6, if the 1,000,000 ETB principal is withdrawn, the interest generation ceases and the user must fund the remaining ~910,000 ETB principal repayment out of business cash flow.

#### Inconsistency 3: Pool Solvency & Scale Requirements
- Payout: **1,000,000 ETB daily**.
- Micro-contribution: **50 ETB / user / day**.
- Minimum active paying members required per day to fund one daily payout:
  $$\frac{1,000,000 \text{ ETB}}{50 \text{ ETB/user}} = 20,000 \text{ active daily contributors}$$
- Without 20,000 paying users every single day, a daily 1M ETB payout is mathematically insolvent unless subsidized by institutional lending or a long cycle.
- **Demo Resolution**: Display simulated pool statistics showing:
  - Active Community Members: `24,850`
  - Daily Pool Collected: `1,242,500 ETB`
  - Daily Prize Allocation: `1,000,000 ETB`
  - Reserve & Liquidity Buffer: `242,500 ETB`

#### Inconsistency 4: The 7,500 ETB Winner's Buffer Mechanics
- **Page 6** states: *"the winner must immediately maintain a 7,500 Birr buffer that is reliably replenished every 15 days."*
- $7,500 \text{ ETB} \div 15 \text{ days} = 500 \text{ ETB/day}$.
- This means the 7,500 ETB buffer is essentially an **upfront 15-day escrow deposit** guaranteeing the 500 ETB daily repayments.
- **Unresolved Rule**: Does the winner pay this 7,500 ETB out-of-pocket on Day 1 of winning, or is it deducted from the 1,000,000 ETB prize? If deducted, the deposit is 992,500 ETB. If out-of-pocket, street vendors may face a prohibitive barrier.
- **Demo Resolution**: Provide a toggle in the Winner Buffer screen showing both interpretations:
  - *Option 1*: Deducted from first interest disbursement / escrow holdback.
  - *Option 2*: Funded via linked bank account with auto-replenish schedule.

---

### Tier 4: Requirements Needing Confirmation from Employer

The following regulatory, operational, and financial definitions must be confirmed by project leadership before production deployment:

1. **National Bank of Ethiopia (NBE) Deposit Regulations**:
   - Under NBE directives, commercial deposit rates rarely reach 22% fixed p.a. (standard savings minimum is ~7%, while lending rates range 16–24%). Does a partner bank have a guaranteed commercial fixed-deposit facility yielding 22%?
2. **Lottery vs. Equb Legal Classification**:
   - Ethiopian Law strictly distinguishes between traditional informal Equbs, licensed Microfinance Institutions (MFIs), and the National Lottery Administration (NLA). Under which regulatory umbrella will Merkato Fund operate?
3. **Escrow Custody & Default Enforcement**:
   - If a winner withdraws the 1,000,000 ETB after Month 6 and subsequently defaults on the remaining ~910,000 ETB obligation, what collateral or legal mechanism protects the community pool?
4. **Member Draw Eligibility Criteria**:
   - How many days of 50 ETB contributions are required before a member becomes eligible for the draw? (Day 1 vs 30-day qualification streak).
5. **Multiple Wins & Re-entry**:
   - Can an existing winner win again while actively repaying their first million?

---

## 4. Requirement Verification & Acceptance Criteria for Demo

| Ref ID | Feature Requirement | Acceptance Criteria |
|---|---|---|
| **REQ-01** | Onboarding & Value Proposition | User can swipe through 3 intro cards explaining Equb heritage, daily draw, and 6-month self-paying model with prominent demo badges. |
| **REQ-02** | Quick Profile Switcher | Reviewer can switch between "Regular Contributor", "Active Winner (Month 2)", and "Admin" in 1 tap without registration hurdles. |
| **REQ-03** | Daily 50 ETB Contribution | User can view contribution streak, tap "Pay Today's 50 ETB", select Telebirr/CBE, and receive an instant simulated digital receipt. |
| **REQ-04** | Live Algorithmic Draw | User can view countdown timer, participant count, draw seed, and trigger a live simulated draw with animated winner selection. |
| **REQ-05** | 6-Month Blocked Escrow View | Winner can inspect the 1,000,000 ETB deposit, 22% annualized ticker ($602.74/day), countdown to unlock date, and milestone tracker. |
| **REQ-06** | Repayment & Buffer Monitor | Winner can inspect daily 500+50 ETB schedule, view how interest offsets repayment, and check the 7,500 ETB / 15-day buffer status. |
| **REQ-07** | Transparent Math Breakdown | Dedicated screen or modal explaining the 500 vs 550 ETB nuance and the 22% offset calculation clearly. |
| **REQ-08** | Activity & Notification Center | Displays simulated transaction history (payments, draw tickets, interest credits, buffer debits). |
