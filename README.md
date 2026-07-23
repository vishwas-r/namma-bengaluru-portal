# Namma Bengaluru 🌆
### Open-Source Citizen Services Portal for Bengaluru
**`nammabengaluru.online`** · Free · Community-Powered · AI-Synced Daily

[![Deploy to GitHub Pages](https://github.com/vishwas-r/namma-bengaluru-portal/actions/workflows/daily-sync.yml/badge.svg)](https://github.com/vishwas-r/namma-bengaluru-portal/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)](https://github.com/vishwas-r/namma-bengaluru-portal)

---

## 🎯 Mission

Every citizen of Bengaluru deserves to understand their rights, their bills, their services — without needing to visit 10 different websites, make 5 phone calls, or hire a consultant.

Namma Bengaluru is your single source of truth for civic services in Bengaluru.

---

## ✨ Features

### 💧 BWSSB (Live)
| Feature | Description |
|---|---|
| **Smart Bill Calculator** | Precise telescopic slab calculation — Domestic, Apartments, Commercial |
| **Tariff Transparency Board** | All slab rates with dual PDF links (Official + Local Backup) |
| **Official Notice Board** | AI-generated plain-English summaries of all BWSSB circulars |
| **Complaint & Escalation Wizard** | Step-by-step guide from complaint to consumer forum |
| **RTI Helper** | Pre-filled RTI templates specific to BWSSB |
| **Ask Namma AI** | Gemini-powered chatbot that answers all BWSSB questions |

### 🏛️ Coming Soon
- BESCOM (Electricity) — unit calculator, outage alerts
- BBMP/GBA — property tax, pothole complaints
- BMTC — route guide, pass renewal
- BDA — OC/CC checker, layout guide

---

## 🤖 How the Daily AI Sync Works

```
Every night at 3 AM IST (GitHub Actions cron):
  ├── Scrapes BWSSB official portal for new notices
  ├── Downloads PDFs → public/docs/bwssb/ (permanent archive)
  ├── Generates SHA-256 checksums for authenticity
  ├── Auto-updates notices.json (auto-deploys live site)
  └── Tariff revision detected?
        ├── YES → Opens a GitHub Pull Request for maintainer approval
        └── NO  → Done ✅
```

**You (maintainer) just click "Merge" or "Close" on the PR!**

---

## 🔑 Crowd-Sourced Gemini API Key Pool

### For Browser AI (Ask Namma chatbot):
Citizens can donate their free Gemini API keys via the in-app settings panel. Keys are stored **only in your own browser** (localStorage) and never transmitted anywhere.

### For GitHub Actions (daily sync AI):
Contributors can donate Gemini keys for server-side PDF analysis. Contact the maintainers to add your key as a GitHub Repository Secret (`GEMINI_KEY_1` through `GEMINI_KEY_5`).

**Get a free key:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — No credit card needed.

---

## 🚀 Getting Started (Local Development)

```bash
# Clone the repository
git clone https://github.com/vishwas-r/namma-bengaluru-portal.git
cd namma-bengaluru-portal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deployment

This project deploys automatically to **GitHub Pages** on every push to `main`.

### Custom Domain Setup:
1. Purchase `nammabengaluru.online` from any domain registrar
2. Add CNAME records pointing to `vishwas-r.github.io`
3. The `public/CNAME` file is already configured

### GitHub Pages Configuration:
1. Go to **Settings → Pages**
2. Source: **GitHub Actions**
3. Done! Auto-deploys via `.github/workflows/daily-sync.yml`

---

## 🤝 Contributing

### Update Tariff Rates or Notices:
You don't need to know how to code! Just edit these JSON files via GitHub:
- `src/data/bwssb/tariffs.json` — Tariff slabs and rates
- `src/data/bwssb/notices.json` — Official notices and circulars

### Add a New Department Module:
1. Create `src/data/<dept>/tariffs.json` and `notices.json`
2. Add department to `src/data/departments.json`
3. Create `src/components/<dept>/` with Hub, Calculator, TariffTable
4. Open a Pull Request!

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 📊 Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | Vite + Vanilla JS | Free |
| Hosting | GitHub Pages | **Free** |
| CDN / SSL | Cloudflare | **Free** |
| Automation | GitHub Actions | **Free** |
| AI (Sync) | Gemini API (community keys) | **Free** |
| AI (Browser) | Gemini API (BYOK) | **Free** |
| Analytics | GoatCounter | **Free** |

**Total infrastructure cost: ₹0/month** (domain only: ~₹900/year)

---

## 🚨 Emergency Contacts

| Department | Helpline |
|---|---|
| BWSSB (Water) | **1916** |
| BESCOM (Electricity) | **1912** |
| BBMP / GBA | **1533** |
| Police | **112** |
| Ambulance | **108** |

---

## ⚖️ Disclaimer

This is an **unofficial open-source project**. We are not affiliated with BWSSB, BESCOM, BBMP, or any government department. Information is sourced from official portals and verified by community contributors. Always verify critical information at the official department websites.

---

## 📄 License

MIT License — See [LICENSE](LICENSE)

Built with ❤️ for Bengaluru citizens by the open-source community.
