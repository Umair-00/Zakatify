# Zakatify - Claude Context

## Project Overview
Zakatify is a full-stack web application for calculating and managing Zakat (Islamic almsgiving). It provides a TurboTax-style guided flow for zakat calculations, backed by Joe Bradford's methodology.

### Problem It Solves
- Muslims often guess their zakat or rebuild messy spreadsheets annually
- Complex rules: cash, investments, retirement accounts, jewelry, gold/silver prices, nisab thresholds
- No central history of past calculations
- Fear/uncertainty about accuracy leads to procrastination or over/underpayment

### Target Audience
- Young professionals & families with bank accounts, 401(k)/RRSP, brokerage accounts, RSUs
- Tech-comfortable users who appreciate guided digital experiences

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 9.0
- **Language**: C#
- **Database/Auth**: Supabase (PostgreSQL-backed BaaS)
- **Port**: http://localhost:5102

### Frontend
- **Framework**: Angular 21 (standalone components)
- **Language**: TypeScript (strict mode)
- **State**: RxJS BehaviorSubject + localStorage
- **Port**: http://localhost:4200
- **Conventions**: See `frontend/.claude/CLAUDE.md` for Angular-specific guidelines

## Project Structure
```
Zakatify/
├── backend/                    # ASP.NET Core API
│   ├── Controllers/
│   │   └── AuthController.cs   # Auth endpoints (login, signup)
│   ├── Models/
│   ├── Program.cs              # App config, CORS, Supabase setup
│   └── appsettings.json        # Supabase credentials
├── frontend/                   # Angular SPA
│   └── src/app/
│       ├── components/
│       │   ├── login/
│       │   ├── signup/
│       │   └── landing/        # Dashboard (protected)
│       ├── services/
│       │   └── auth.ts
│       └── guards/
│           └── auth-guard.ts
└── Zakatify.sln
```

## Commands

### Backend
```bash
cd backend
dotnet run                      # Start API server
dotnet build                    # Build project
```

### Frontend
```bash
cd frontend
npm start                       # Start dev server (ng serve)
npm run build                   # Production build
npm test                        # Run tests (Vitest)
```

## Domain Concepts (Zakat Terminology)

| Term | Definition |
|------|------------|
| **Zakat** | Obligatory Islamic almsgiving (2.5% of eligible wealth) |
| **Nisab** | Minimum wealth threshold before zakat is due |
| **Nisab basis** | Gold or silver - user chooses which to calculate threshold |
| **Zakatable** | Assets subject to zakat (cash, gold, investments, etc.) |
| **Hawl** | One lunar year of possession before zakat is due |

## MVP Features (Version 1)

### 1. Authentication & Profile
- Email/password signup/login (implemented)
- Profile: name, country, currency, zakat anniversary date

### 2. Guided Zakat Flow (TurboTax-style)
Step-by-step wizard with sections:
- Cash & cash equivalents
- Gold, silver, and jewelry
- Investments (stocks, funds)
- Business assets (simple inventory)
- Receivables (money owed to user)
- Short-term debts owed

UI elements:
- Progress bar ("Step 3 of 7")
- Yes/No/Not sure prompts with tooltips
- Jump back to previous steps

### 3. Jewelry Management
- Add/store jewelry items: name, type (gold/silver), weight, karat, photo
- Apply current gold/silver price (manual input for MVP, API later)
- Mark as zakatable or non-zakatable

### 4. Zakat Calculation Engine
- Configurable nisab basis (gold/silver)
- Clear breakdown: total zakatable assets, nisab threshold, net zakat due
- Export/summary view (PDF or text)

### 5. Zakat History
- Store completed calculations: date, total, zakat owed, notes
- History list by year (Islamic or Gregorian)

### 6. Settings
- Nisab base (gold vs silver)
- Currency preference

## Out of Scope (Future Roadmap)
- Multi-household/spouse accounts
- Detailed business zakat with accounting integration
- Bank/brokerage API integrations (Plaid)
- Donation/payment gateway integration
- Native mobile apps (iOS/Android)
- Multi-madhhab scholarly panel

## API Endpoints
Base URL: `http://localhost:5102/api`

| Method | Endpoint      | Description          |
|--------|---------------|----------------------|
| POST   | /auth/login   | User login           |
| POST   | /auth/signup  | User registration    |

*More endpoints TBD for assets, calculations, history*

## Data & Privacy
- Store minimal personal data (email, name, country, currency)
- Encrypt sensitive financial/jewelry data at rest
- No third-party sharing without consent
- **Disclaimer**: App is a calculation assistant, not a replacement for a qualified scholar

## Development Notes
- CORS configured for localhost:4200
- Supabase credentials in appsettings.json (move to secrets for production)
- All API responses return 200 with success boolean
- Current status: Authentication complete, main features TBD

## Coding Conventions
- **Angular**: Standalone components, signals for state, OnPush change detection
- **C#**: Nullable reference types enabled
- **TypeScript**: Strict mode, single quotes (Prettier)
- **Forms**: Prefer Reactive forms over template-driven
- **Accessibility**: Must pass AXE checks, WCAG AA compliance
