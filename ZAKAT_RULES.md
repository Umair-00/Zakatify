# Zakat Rules Reference (Joe Bradford's Simple Zakat Guide, 3rd Ed. 2022)

> This file distills the zakat calculation methodology from Joe Bradford's
> "Simple Zakat Guide" for use in Zakatify development. Every rule below
> is sourced directly from the book. Do NOT add rules from other sources.

---

## 1. Core Concepts

1. **Zakat is not progressive.** It is a flat 2.5% on total eligible surplus wealth (not just the amount above nisab).
2. **Zakat is purification.** The word comes from the Arabic root Z-K-Y meaning growth and purity.
3. **You only pay on what you own and control.** Personal assets (home, car, furniture) are exempt. Only wealth you own, have full control of, and is surplus of your needs.
4. **You only pay on liquid wealth you can expect to benefit from.** If invested, it would grow. This is important for illiquid assets.
5. **You only pay on surplus wealth held for more than one year (hawl).** An entire lunar year must pass. Exception: payouts from investments are added to your running tally (e.g., dividends added to principal).

---

## 2. Key Terms

| Term | Definition |
|------|-----------|
| **Zakat** | Obligatory pillar of Islam; from root meaning growth & purity |
| **Sadaqa** | General term for all charitable giving, including zakat |
| **Nisab** | Minimum Liable Amount (MLA) — floor to determine if you owe zakat |
| **Fitr** | Zakat al-Fitr — specific food given to poor at end of Ramadan (separate from wealth zakat) |
| **Dinar** | Gold coin ~4.245 grams |
| **Dirham** | Silver coin ~2.65 grams (most prevalent currency in Prophetic era) |
| **Mithqal** | Weight measure synonymous with Dinar |
| **Hawl** | Zakat year (lunar year = ~354 days, 11 days shorter than Gregorian) |

---

## 3. Nisab (Minimum Liable Amount)

### Silver basis (recommended by AAOIFI)
- Nisab = 200 Dirhams = **595 grams of silver**
- Calculate: `price_per_gram_silver * 595 = nisab in local currency`

### Gold basis
- Nisab = 20 Dinar = **85 grams of gold**
- Calculate: `price_per_gram_gold * 85 = nisab in local currency`

### How nisab works
- If total eligible wealth >= nisab for a full year -> pay 2.5% on the **entire** amount (not just the excess above nisab)
- If total eligible wealth < nisab -> no zakat is due
- You start counting hawl from the day your wealth first exceeds nisab
- If wealth drops below nisab during the year, the count resets

### Gregorian calendar adjustment
- If using Gregorian calendar instead of lunar, multiply by **2.578%** instead of 2.5% to compensate for the extra 11 days.

---

## 4. Zakat Rate

- **2.5%** of total eligible wealth (lunar year)
- **2.578%** if calculating on the Gregorian calendar

---

## 5. Asset Categories & Worksheet Line Items

### A. Cash & Cash Equivalents
| Line | Item | Rule |
|------|------|------|
| 2a | Cash on Hand | Zakatable — all cash under mattress, in safe, etc. |
| 2b | Checking Account | Zakatable — immediate access |
| 2c | Savings Account | Zakatable — immediate access |
| 2d | Silver (in grams) | Zakatable if >= 595g. Pay on price of total weight. Includes bullion, coins, rounds, bars, jewelry, silverware. |
| 2e | Gold (in grams) | Zakatable if >= 85g. Pay on price of total weight. Includes bullion, coins, rounds, bars, jewelry. |

**Notes on gold/silver:**
- Only gold and silver are zakatable precious metals (not platinum, gems, etc.)
- Precious stones in jewelry are NOT zakatable
- Get pure gold/silver weight from jeweler (US gold/silver often contains other metals)
- All forms count: bullion, coins, rounds, bars, jewelry, silverware, dishes

### B. Investments — Active
| Line | Item | Rule |
|------|------|------|
| 2f | Actively traded shares | Pay on full aggregate market value. Treated same as cash. Includes day trading, swing trading positions. |

### C. Investments — Passive (held > 366 days)
| Line | Item | Rule |
|------|------|------|
| 2g | CRI Zakat Liable Amount | Use CRI formula (see below) |
| 2h | Zakat Liable Dividend Amount | Dividend per share * shares owned |
| 2i | Aggregate Cash out Price | Only when selling; replaces 2g + 2h for that year |

**CRI Formula (for passive investments held > 1 year):**
```
CRI = ((Cash + Receivables + Inventories) / Outstanding Shares) * Shares Owned
```
- Applies to individual stocks, mutual funds, ETFs, index funds held long-term
- **Shortcut (30% rule):** Use 30% of market value as CRI estimate. Based on survey showing average CRI is 25-30% of market value.

**Selling logic:**
- If selling mid-year (not near zakat date): add sale proceeds to cash assets
- If selling near zakat date: pay on aggregate sale price (2i) — do NOT also pay on CRI + dividends (avoids double-counting)

### D. Retirement Accounts (401k, IRA, Roth IRA, etc.)
| Line | Item | Rule |
|------|------|------|
| 2j | Post-tax 401k distributions | See approaches below |
| 2k | Post-tax IRA distributions | See approaches below |

**Two approaches:**
- **Approach #1:** Treat as cash minus early withdrawal penalties and taxes. Pay yearly.
- **Approach #2 (Bradford's recommendation):** Treat as illiquid/inaccessible. Only pay zakat when you actually withdraw OR when you reach retirement age with unpenalized access. Pay on net amount after taxes/penalties.

**Why Bradford prefers Approach #2:**
- You don't have unfettered control without penalty (similar to debt not in your possession)
- Gains are recognized but not realized
- Paying from inaccessible funds would constitute hardship
- Prerequisites of zakat include ability to spend/invest the wealth

**Pre-retirement strategy:** Pre-pay zakat on retirement account to take advantage of tax credits for charitable contributions.

### E. Education Accounts
| Line | Item | Rule |
|------|------|------|
| 2l | Post-tax ESA withdrawals | Pay on withdrawals for personal use only |
| 2m | Post-tax 529 withdrawals | Pay on withdrawals for personal use only |

- **Pre-paid 529:** NOT zakatable (it's a product/service purchase, not an investment)
- **Coverdell ESA / 529 Savings:** Treated like 401k — no zakat if used for Qualified Higher Education Expenses
- If withdrawn for personal use or rolled into IRA: pay on post-tax distribution
- If 529 pays interest: must purify that interest (see Haram Earnings)

### F. Health Accounts
| Line | Item | Rule |
|------|------|------|
| 2n | HSA aggregate balance | Zakatable — you have constant access and funds roll over |
| — | FSA | NOT zakatable — use-it-or-lose-it, never truly owned for a full year |

### G. Illiquid Assets
| Line | Item | Rule |
|------|------|------|
| 2o | Artwork sold this year | Pay on sale price. Personal art = exempt. Art held to evade zakat = pay on full value yearly. |
| 2p | Real estate (active on market) | Pay on current market value |
| 2q | Real estate (inactive, sold) | Pay once on sale proceeds |
| 2r | Rental income | Pay on rental income only (not property value). Exclude if already counted in bank accounts. |
| 2s | Collectibles & antiques | Short-term hold: pay on total value. Long-term/illiquid: pay on sale price when sold. |
| 2t | Privately held company investment | Pay on distributions/sale proceeds only. No zakat until liquidity or dissolution event. |

**Real estate rules:**
- Primary residence: EXEMPT
- Rental property: pay on rental INCOME only (property is "tool of trade")
- Property actively listed for sale: pay on market value
- Property held with no plans: pay once when sold

**Artwork rules (3 scenarios):**
1. Personal aesthetic use -> no zakat
2. Investment/collector -> pay on sale price when sold
3. Purchased to evade zakat -> pay on full value every year

### H. Crypto & Digital Assets
| Line | Item | Rule |
|------|------|------|
| 2u | Aggregate value of crypto | Zakatable — treated same as currency/gold/silver |
| 2v | LP token dividends | Pay on dividends received. When selling LP token, pay on sale price. |
| 2w | NFTs | Depends on underlying asset (art rules for art NFTs, real estate rules for RE NFTs, etc.) |
| 2x | Sales price of LP tokens/NFTs held for trade | Pay on aggregate sale price |

**Crypto valuation methods:**
1. Convert to local currency -> add to total assets
2. Convert to gold-tethered token (PAXG): 1 token = 1 troy oz = 31.10g. Nisab = 2.73 PAXG tokens.
3. Convert to silver-tethered token (SLVT): 1 token = 1.035692 oz = 29.36g. Nisab = 20.26 SLVT tokens.

**Important:** Pay on full converted value, not just gains. Do NOT deduct conversion/transfer fees. Zakat is paid from gross amount.

### I. Business Assets
| Line | Item | Rule |
|------|------|------|
| 2y | Inventory (not under contract) | Pay on cash value of unsold inventory. Under-contract inventory = accounts receivable. |
| 2z | Accounts receivable | Treated same as cash (good debt). |
| 2aa | Livestock for sale | Treated as business inventory (cash value). Penned personal-use livestock = exempt. |
| 2bb | Good debt (collectible) | Money owed to you that you CAN collect = same as cash. Bad debt (unable to collect) = pay when received. |

**Inventory notes:**
- Use retail price if retail seller, wholesale price if wholesaler
- Dead/obsolete inventory = illiquid asset (pay on sale price when sold)
- You may pay zakat in-kind with business products if beneficial to recipient

---

## 6. Haram Earnings (must be purified, not counted as zakat)

### On equity investments
| Line | Item |
|------|------|
| 3a | Haram earnings on equities |
| 3b | Haram earnings on dividends |

**Permissible investment rule:** Primary activity must be halal. Secondary impermissible earnings allowed if < 5% of total revenues, BUT those earnings must be purified.

**Formula for equities without dividends:**
```
((Total Prohibited Income + Interest) / Outstanding Shares) * Shares Owned
```

**Formula for dividend purification:**
```
(Prohibited Income / Total Income) * Dividend Received
```
Then multiply by payment intervals per year and number of shares.

### On fixed income (bonds)
| Line | Item |
|------|------|
| 3c | Value of bond earnings |

**Three situations:**
1. **Purchased willfully (didn't know it was haram):** Keep principal (add to assets as 2w), give away all earnings to charity
2. **Received as gift:** Keep both principal and earnings (you didn't make the purchase)
3. **Required by employer/law:** Keep principal (add to assets as 2w), give away earnings to charity

**Impermissible sectors to avoid:**
1. Alcohol, Tobacco, & Drugs
2. Gambling & Betting
3. Cinema, Adult Entertainment, Advertising, & Media
4. Conventional Financial Services
5. Defense & Weapons Manufacturing
6. Food & Beverage involved in prohibited items (pork, alcohol)

### What to do with haram earnings
- Give to charities serving the poor, homeless, and hungry (Bradford's recommendation)
- Three scholarly approaches: (1) public welfare projects, (2) poor & indigent only, (3) any of 8 zakat categories

---

## 7. Expenses & Liabilities (deducted before zakat)

| Line | Item | Rule |
|------|------|------|
| 4a | Monthly living expenses | Mortgage/rent, medical, groceries, energy, telecom, transport, misc — only amounts **immediately due** |
| 4b | Insurance payments | Home, auto, medical — for the period they are due (monthly = 1 month, yearly = 1 year) |
| 4c | Property tax payments | Deduct what is currently due |
| 4d | Delinquent tax payments | Include any owed to government |
| 4e | Miscellaneous fines | Currently due amounts |
| 4g | Debts owed to others | Any immediately due debts. Pay debts before paying zakat. |

**Key rule:** Only deduct expenses that are **immediately due** at time of zakat payment. If mortgage is monthly, deduct 1 month. If insurance is quarterly, deduct 1 quarter.

---

## 8. Final Calculation (Worksheet #4)

```
A = Total Earnings & Income (sum of all asset line items)
B = Total Haram Earnings (3a + 3b + 3c)
C = Permissible Wealth = A - B
D = Total Expenses & Liabilities (4a + 4b + 4c + 4d + 4e + 4g)
E = Total Wealth Liable for Zakat = C - D
F = Nisab (current MLA based on silver or gold price)

IF E >= F AND E has been >= F for one full year:
    Zakat Due = E * 2.5%  (lunar calendar)
    Zakat Due = E * 2.578% (Gregorian calendar)
ELSE:
    No zakat is due
```

---

## 9. Who to Give Zakat To

### NOT eligible (5 categories)
1. **The rich** — anyone who already has sufficient wealth
2. **The able-bodied worker** — conditions: employment available, permissible work, capable without hardship, pays enough for basic needs
3. **Immediate family you support** — parents, spouse, children you are financially responsible for. Exception: wife CAN give to needy husband (she's not responsible for his maintenance). Married daughter whose husband can't provide may receive from parents/siblings.
4. **Family of the Prophet** — Banu Hashim and Banu Muttalib
5. **Non-Muslims** — majority opinion: only eligible under "softening hearts" category. Never eligible if fighting against Islam.

### Eligible (8 categories from Quran 9:60)
1. **The destitute (al-Fuqara'a)** — has absolutely nothing
2. **The poor (al-Masakin)** — working poor; has some means but not enough. If you saw them, you wouldn't expect them to be needy.
3. **Those collecting it (al-'amilina 'alaiha)** — zakat administrators. Max 1/8 of gross collected. Prefer hiring from poor. No personal gifts while employed.
4. **To soften hearts (al-mu'allafat qulubuhum)** — new converts, those whose faith needs support, combating anti-Muslim sentiment. Must be vetted by qualified scholar.
5. **In manumission (fi 'l-riqab)** — freeing people from bondage, human trafficking, child labor, peonage
6. **Those in debt (al-Gharimin)** — personal debts (paycheck-to-paycheck, medical bills, utilities) with conditions: insufficient funds, permissible ends, currently due, civil offense if unpaid. Also debts for collective good (disaster relief).
7. **In God's path (fi sabilillah)** — traditionally: non-conscripted soldiers under legitimate Muslim ruler. Expanded view: any legitimate act promoting Islam (da'wah, education, media). Consult scholar.
8. **The wayfarer (Ibn 'l-sabil)** — stranded traveler without accessible money. Conditions: in state of need/transience, travel not for sin, no other means available.

### Distribution guidelines
- Poor and destitute have priority over other categories
- More dire needs get precedence
- Better to empower with training/tools than just cash
- Categories 4-8: pay on their behalf to creditors/services, not direct cash; require documentation of need
- Zakat collectors: fair wage, max 1/8 of total

---

## 10. Best Practices

- **Tax deductions:** Get receipts from organizations; use donation receipts when filing taxes
- **Corporate matching:** Check if employer has matching program for non-profit donations (1:1, 2:1, or 3:1)
- **Community:** Develop relationships to identify needy individuals personally
- **Early payment:** Allowed only if you've already reached nisab. Cannot claw back early payments if final amount is less, but extra is counted as sadaqa.
- **Paying in kind:** Allowed if beneficial to recipient (e.g., tires, groceries from business inventory)
