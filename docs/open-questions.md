# Merkato Fund — Open Questions, Financial Ambiguities & Employer Clarifications

**Project**: Merkato Fund Mobile Application  
**Document**: Open Questions, Risk Register, and Unresolved Business Rules  
**Author**: Senior Mobile Architect & Product Engineer  
**Date**: October 2026  

---

## 1. Purpose of This Document

The marketing materials for Merkato Fund (derived from the Telegram channel PDF) present a compelling vision: combining the social trust of an Ethiopian Equb, the excitement of a lottery, the security of a bank escrow, and the power of capital markets.

However, a rigorous financial, mathematical, and architectural analysis reveals multiple **critical contradictions, structural ambiguities, and regulatory risks**. 

As senior architects, we must **not silently resolve these inconsistencies** in code. Instead, this document outlines every unresolved rule, specifies our **proposed demo assumptions**, and presents the **exact questions requiring formal employer clarification**.

---

## 2. Critical Mathematical & Financial Contradictions

### 2.1 The Repayment Rate Conflict (500 ETB vs 550 ETB vs 15,000 ETB/Month)

```
       +------------------------------------------------------------+
       | Source Statement 1 (Page 3):  500 ETB / day               |
       | Source Statement 2 (Page 4):  550 ETB / day               |
       | Source Statement 3 (Page 6):  500 ETB + 50 ETB admin fee  |
       | Source Statement 4 (Page 6):  15,000 ETB / month          |
       +------------------------------------------------------------+
                                     |
                                     v
                       [ Mathematical Conflict ]
          500 ETB x 30 days = 15,000 ETB  (Matches Statement 4)
          550 ETB x 30 days = 16,500 ETB  (Discrepancy: +1,500 ETB/mo)
```

- **Analysis**:
  - If the winner pays 500 ETB/day, the monthly obligation is 15,000 ETB.
  - If the winner pays 550 ETB/day (including the 50 ETB admin fee), the monthly obligation is **16,500 ETB** (or 16,775 ETB for 30.5-day average months).
- **Proposed Demo Assumption**:
  - The demo provides an **interactive fee transparency modal**:
    - **Base Principal Repayment**: `500 ETB / day` (`15,000 ETB / 30-day month`)
    - **Platform Administration Fee**: `50 ETB / day` (`1,500 ETB / 30-day month`)
    - **Total Daily Cash Outflow**: `550 ETB / day` (`16,500 ETB / month`)
  - A settings toggle allows the employer/reviewer to test both interpretations.
- **Question for Employer**:
  > *Is the 50 ETB administrative fee charged on top of the 15,000 ETB monthly obligation (making the total 16,500 ETB), or is the 50 ETB admin fee deducted from the 500 ETB daily payment (meaning 450 ETB principal + 50 ETB fee = 500 ETB total)?*

---

### 2.2 The "Interest-Free" Paradox vs. 22% Bank Yield Offset

- **The Source Claim**:
  - Page 3: *"Pay the capital back over time with absolutely no interest and no debt."*
  - Page 4: *"During this 6-month block, your deposit generates a powerful 22% interest. This interest mathematically covers your new 550 Birr daily repayment burden, ensuring the prize completely pays for itself."*
- **Mathematical Reality Check**:
  $$\text{Daily Interest} = \frac{1,000,000 \text{ ETB} \times 0.22}{365} = 602.74 \text{ ETB / day}$$
  $$\text{Daily Repayment Burden} = 550 \text{ ETB / day}$$
  $$\text{Net Daily Cash Flow during 6-Month Block} = 602.74 - 550.00 = +52.74 \text{ ETB / day (Surplus)}$$
  - Over the 180-day block, total interest accrued $= \mathbf{108,493.15 \text{ ETB}}$.
  - Over the 180-day block, total repayment at 550 ETB/day $= \mathbf{99,000 \text{ ETB}}$ ($90,000 \text{ ETB}$ principal $+ 9,000 \text{ ETB}$ fee).
  - At the end of Month 6, **only 90,000 ETB of the 1,000,000 ETB principal has been repaid** ($9\%$).
  - **Remaining Unpaid Principal**: $\mathbf{910,000 \text{ ETB}}$.
  - If the winner withdraws the 1,000,000 ETB capital at Month 6, **the account balance drops to zero and stops generating the 22% interest**!
  - Therefore, the remaining 910,000 ETB cannot "pay for itself" via interest; it requires another **1,820 days (5.0 years)** of out-of-pocket daily repayments at 500 ETB/day.
- **Proposed Demo Assumption**:
  - The demo explicitly labels the 6-month block as the **"Interest-Subsidized Grace Period"**, showing how the 22% interest generates a $+52.74$ ETB/day surplus during the lock.
  - The demo displays a clear amortization milestone schedule showing the remaining 910,000 ETB post-release obligation.
- **Questions for Employer**:
  1. *Does the 22% interest earned during the 6-month block get applied directly to the principal, or is it paid out to the winner as cash income?*
  2. *Once the 1,000,000 ETB principal is unlocked and withdrawn at Month 6, how is the remaining 910,000 ETB repaid? Does the member continue paying 500 ETB/day for the next 5 years?*

---

### 2.3 Pool Solvency & Scale Requirements (The 20,000 Member Floor)

- **The Scale Math**:
  $$\frac{1,000,000 \text{ ETB Payout}}{50 \text{ ETB Daily Contribution / Member}} = 20,000 \text{ Active Paying Members Daily}$$
- **The Operational Challenge**:
  - To award 1,000,000 ETB every single day, the platform must have **at least 20,000 unique active contributors paying 50 ETB each day** (plus additional contributions to cover operational overhead).
  - If the platform launches with 1,000 or 5,000 users, a daily 1M ETB draw is insolvent without an external revolving credit facility or capital partner.
- **Proposed Demo Assumption**:
  - The demo displays simulated community pool statistics showing **24,850 active members** generating **1,242,500 ETB daily**, with 1M ETB allocated to the draw and 242,500 ETB held in reserve.
- **Question for Employer**:
  > *During initial launch when active members are below 20,000, does the draw frequency adjust (e.g. weekly/monthly), or does an institutional liquidity provider underwrite the deficit?*

---

### 2.4 The 7,500 ETB Winner's Buffer Funding Mechanism

- **The Source Claim**:
  - Page 6: *"the winner must immediately maintain a 7,500 Birr buffer that is reliably replenished every 15 days."*
- **Mathematical Meaning**:
  $$15 \text{ days} \times 500 \text{ ETB/day} = 7,500 \text{ ETB}$$
  - The 7,500 ETB buffer serves as a rolling 15-day escrow security deposit to guarantee the winner will not default on their daily repayments.
- **The Unresolved Ambiguity**:
  - Who funds the initial 7,500 ETB on Day 1 of winning?
  - If a low-income merchant or street vendor wins, requiring them to immediately deposit 7,500 ETB out-of-pocket creates an exclusionary barrier.
  - If it is deducted from the 1,000,000 ETB prize, the blocked deposit becomes 992,500 ETB, altering the 22% yield math.
- **Proposed Demo Assumption**:
  - The demo provides two selectable buffer options in the Winner Buffer screen:
    - *Mode A (Holdback)*: 7,500 ETB is held from the first interest payout or initial escrow allocation.
    - *Mode B (Bank Link)*: Winner connects a Telebirr/CBE account with an auto-replenish mandate every 15 days.
- **Question for Employer**:
  > *Is the initial 7,500 ETB buffer deducted directly from the prize pool, or must the winner deposit 7,500 ETB cash before the 1M ETB blocked account is activated?*

---

## 3. Regulatory, Legal & Banking Considerations in Ethiopia

| Domain | Reality in Ethiopia | Implication for Merkato Fund |
|---|---|---|
| **National Bank of Ethiopia (NBE) Deposit Rates** | NBE sets minimum savings rate (~7%). Standard commercial fixed-term deposits range between 12% and 16%. A fixed **22% p.a. bank deposit** is highly extraordinary and exceeds conventional commercial deposit offerings. | Which licensed Ethiopian commercial bank (e.g. CBE, Awash, Dashen, Hibret) has formally agreed to a 22% fixed escrow deposit yield? |
| **National Lottery Administration (NLA) Licensing** | In Ethiopia, any daily draw involving random selection and monetary prizes falls under the regulatory jurisdiction of the National Lottery Administration (NLA). Lottery licenses require heavy capital bonds. | Is Merkato Fund operating under an official NLA Lottery License, or is it structured under an MFI / cooperative Equb framework? |
| **Capital Default & Collateralization** | In an Equb, social pressure and guarantors enforce repayment. In a lottery, winnings have no repayment. In Merkato Fund, the winner receives 1,000,000 ETB and must repay over 5.5 years. | If a winner withdraws the 1,000,000 ETB after Month 6 and ceases daily payments, what legal recourse or collateral protects the fund from default? |

---

## 4. Technical & Demo Scope Decisions

1. **Simulated vs. Live Gateways**:
   - For the 7-day demo, no live Telebirr or CBE Merchant API keys will be used; all payment interactions will be simulated with authentic UI feedback, transaction receipts, and realistic loading delays.
2. **Deterministic PRNG Draw Engine**:
   - The draw simulator uses a seeded client-side pseudo-random algorithm displaying an SHA-256 hash to demonstrate transparency without requiring an external blockchain or backend oracle.
3. **Language Support**:
   - The demo will be built **English-first**, but all UI strings and labels will be organized in a centralized localization structure (`src/theme/strings.ts`) to enable rapid translation into **Amharic (አማርኛ)** and **Afaan Oromoo** upon employer request.
4. **Persona Switcher**:
   - A floating switcher button will allow reviewers to instantly evaluate the app as:
     - **Dawit** (Member contributing 50 ETB/day)
     - **Bethlehem** (Winner in Month 2 with active 1M ETB escrow and buffer)
     - **Auditor / Admin** (Platform overview and draw trigger)
