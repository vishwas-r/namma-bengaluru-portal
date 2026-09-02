# Namma Bengaluru — World-Class Citizen Services Platform
### `nammabengaluru.online` · Open Source · AI-Powered · Built for Real Citizens

> **Mission**: Every citizen of Bengaluru deserves to understand their rights, their bills, their services — without needing to visit 10 different websites, make 5 phone calls, or hire a consultant. This platform is their single source of truth.

---

## 🧠 Think Like a Citizen First

Before architecture, think of real-life scenarios citizens face every day:

| 😤 Citizen Situation | 🌐 What the Portal Delivers |
|---|---|
| "My water bill doubled. Why?" | Bill Calculator with slab-by-slab visual breakdown + historical comparison |
| "No water since 3 days in my area" | Live maintenance schedule by ward/area + auto-refresh |
| "Where do I complain about a leaking pipe?" | Guided Complaint Flow with exact links to BWSSB CRM, escalation contacts, SLA timelines |
| "They didn't fix my complaint in 15 days. What now?" | Escalation Ladder: Grievance Officer → Commissioner → Consumer Forum with copy-paste letter templates |
| "I want to know if my area's water quality is safe" | Water Quality Reports from official BWSSB testing PDFs, archived locally |
| "What is this Sewerage/RWH charge on my bill?" | Plain-English / Kannada explanations of every charge, with official circular reference |
| "I need a new water connection. Steps?" | Step-by-step guided application wizard with documents checklist |
| "Is this a genuine BWSSB notice or fake?" | All official circulars linked to archived authentic PDFs with SHA checksum verification |
| "How do I file an RTI?" | Pre-filled RTI templates specific to each department with submission guide |
| "I'm a senior citizen, can I get help?" | Large-text mode, voice-friendly navigation, Kannada language default |
| "Can I compare my consumption with neighbors?" | Anonymous community comparison charts for same locality/ward |
| "What will my bill be next year with tariff hike?" | Historical tariff trend chart with projected future rates |

---

## 🏗️ Platform Architecture

### 1. Technical Stack (100% Free Hosting)
```
Frontend          →  Vite + Vanilla JS (ultra-fast, no framework bloat)
Hosting           →  GitHub Pages (nammabengaluru.online via CNAME)
CDN / SSL         →  Cloudflare (Free tier: DDoS protection, HTTPS, caching, analytics)
Automation        →  GitHub Actions (2,000 free minutes/month on public repos)
AI Features       →  Google Gemini API (free tier for PDF analysis + chatbot)
PDF Storage       →  Git LFS or repo-hosted at public/docs/<dept>/<circular>.pdf
Analytics         →  GoatCounter (privacy-friendly, open source, free)
Comments/Discuss  →  GitHub Discussions (open source community)
```

### 2. Repository Structure
```
nammabengaluru/
├── .github/
│   ├── workflows/
│   │   ├── daily-sync.yml          # 3 AM IST cron sync
│   │   ├── deploy.yml              # GitHub Pages auto-deploy
│   │   └── validate-data.yml       # JSON schema validation on PRs
│   └── ISSUE_TEMPLATE/
│       ├── tariff_update.md        # Template: report new tariff
│       └── circular_report.md     # Template: flag new circular
│
├── public/
│   ├── CNAME                       # → nammabengaluru.online
│   └── docs/
│       ├── bwssb/                  # Archived official PDFs (BWSSB)
│       ├── bescom/                 # Archived official PDFs (BESCOM)
│       └── bbmp/                   # Archived official PDFs (BBMP)
│
├── scripts/
│   ├── dailySync.js                # Core crawler & scheduler
│   ├── pdfDownloader.js            # Downloads & archives official PDFs
│   ├── aiTariffParser.js           # Gemini API: reads tariff PDFs
│   ├── aiNoticeSummarizer.js       # Summarizes long circular PDFs in plain English
│   └── openPR.js                   # GitHub API: creates moderated PR for price changes
│
├── src/
│   ├── data/
│   │   ├── departments.json        # Registry of all Bengaluru departments
│   │   ├── bwssb/
│   │   │   ├── tariffs.json        # Live tariff slabs (updated via moderated PR)
│   │   │   ├── notices.json        # Auto-updated daily: title, date, official URL, local PDF path, AI summary
│   │   │   ├── complaints.json     # Complaint channels, SLAs, escalation ladder, contact matrix
│   │   │   ├── services.json       # New connection, meter change, name transfer — steps & documents
│   │   │   └── faq.json            # Citizen questions with official reference answers
│   │   ├── bescom/ (…same pattern)
│   │   └── bbmp/  (…same pattern)
│   │
│   ├── components/
│   │   ├── GlobalSearch.js         # Instant search across all departments
│   │   ├── AIAssistant.js          # AI chatbot powered by Gemini
│   │   ├── LanguageSwitcher.js     # EN / ಕನ್ನಡ / हिन्दी toggle
│   │   ├── Header.js               # Emergency SOS bar + navigation
│   │   ├── DeptCard.js             # Department portal cards
│   │   └── bwssb/
│   │       ├── BillCalculator.js   # Full interactive calculator
│   │       ├── TariffTable.js      # Visual slab table + official PDF links (dual)
│   │       ├── NoticeBoard.js      # Searchable circular board with AI summaries
│   │       ├── ComplaintGuide.js   # Step-by-step complaint & escalation wizard
│   │       ├── ServicesWizard.js   # New connection / meter change guide
│   │       ├── RTIHelper.js        # Pre-filled RTI template generator
│   │       └── WaterQuality.js     # Area-wise water quality reports
│   │
│   ├── style.css                   # Comprehensive design system
│   └── main.js                     # Router, state, lifecycle
│
├── tests/
│   └── calculator.test.js          # Unit tests for all bill computation
│
├── README.md                       # Setup + contribution guide
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE (MIT)
```

---

## ✅ Phase 1: BWSSB (Completed)
The BWSSB module is live with the Calculator, Tariff Board, Notices with AI summaries, Complaint Guide, and Ask Namma AI.

---

## 🎯 Phase 2: BESCOM (Electricity) Module Specification

### 1. Technical Approach
We will replicate the robust, zero-dependency vanilla JS architecture from the BWSSB module to ensure consistent UI, fast load times, and exact alignment with the platform's design language.

### 2. Proposed Changes

#### [MODIFY] `src/data/departments.json`
- Update the BESCOM entry's `status` from `coming-soon` to `live`.

#### [NEW] `src/data/bescom/tariffs.json`
- JSON structure defining domestic (LT-2a) and commercial tariffs.
- Include Fixed Charges (per kW), Slab-based Energy Charges (per kWh/unit), Fuel Adjustment Charges (FAC), and Electricity Duty (9%).

#### [NEW] `src/data/bescom/notices.json` & `complaints.json`
- Initial seed data for BESCOM official circulars and grievance escalation matrices (Power Outage, Billing Issue, Transformer sparks, etc.).
- Steps for the 1912 Helpline, BESCOM Mithra App, and KERC escalation.

#### [NEW] `src/services/bescomCalculator.js`
- Core math engine for electricity bills.
- Inputs: Sanctioned Load (kW), Monthly Consumption (Units/kWh), Gruha Jyothi eligibility toggle.
- Outputs: Itemized breakdown (Fixed Charge + Energy Charge + FAC + Tax).

#### [NEW] `src/pages/bescomPage.js`
- Exact structural clone of `bwssbPage.js` but tailored for electricity.
- **Calculator Tab**: Form inputs for Load (kW) and Units (kWh), slider for units.
- **Tariff Tab**: Visual slabs and rate comparison chart.
- **Notices Tab**: Circular intelligence board.
- **Complaint Guide Tab**: Escalation wizard specifically for BESCOM.
- **Ask Namma AI Tab**: Shared chatbot interface.

#### [MODIFY] `src/main.js`
- Import `bescomPage.js` and `bescomCalculator.js`.
- Update `renderDeptPage()` to route to `renderBESCOMPage()` when `state.deptId === 'bescom'`.
- Update global event bindings (`__calc`, `recalcBill`) to route to the correct calculator based on the active department.
- Update the Gemini AI `SYSTEM` prompt to include basic BESCOM knowledge so the bot can answer electricity questions.

## User Review Required

> [!IMPORTANT]
> **Gruha Jyothi Scheme:** The calculator will include a toggle for the "Gruha Jyothi" scheme (free electricity up to 200 units for eligible households). If toggled on and consumption is <= 200, the energy fixed charges will be set to ₹0. Does this align with how you want the calculator to function?

> [!TIP]
> **AI System Prompt:** I will update the global AI system prompt in `main.js` so "Ask NammaBengaluru AI" understands BESCOM slabs. It will still understand BWSSB perfectly.

## Verification Plan
### Automated Tests
- N/A for frontend UI.

### Manual Verification
- Navigate to `/dept/bescom`.
- Verify the Calculator produces expected totals matching manual BESCOM math (Fixed + Slabs + FAC + 9% Duty).
- Verify the AI chat can answer basic questions about BESCOM.
