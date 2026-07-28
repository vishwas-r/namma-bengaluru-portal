// Universal In-Memory Search Engine for Namma Bengaluru Portal

const SEARCH_INDEX = [
  // ── BWSSB SECTION ──────────────────────────────────────────────
  {
    title: 'BWSSB Water Bill Calculator',
    category: 'Calculators',
    dept: 'BWSSB',
    desc: 'Calculate domestic, commercial, and bulk apartment water bills using official 2026-27 telescopic slabs.',
    url: '#/dept/bwssb/calculator',
    icon: 'bi-calculator',
    badge: 'Calculator'
  },
  {
    title: 'BWSSB Water Slabs & Tariffs',
    category: 'Tariffs',
    dept: 'BWSSB',
    desc: 'Official 2026-27 Gazette rates for domestic (0-8 KL @ ₹9.53), non-domestic, borewell surcharges (+₹100), and RWH non-compliance (+50%).',
    url: '#/dept/bwssb/tariff',
    icon: 'bi-table',
    badge: 'Tariff'
  },
  {
    title: 'BWSSB Services & Online Applications',
    category: 'Services',
    dept: 'BWSSB',
    desc: 'Apply online for new water connection, meter replacement, rainwater harvesting clearance, and owner name change.',
    url: '#/dept/bwssb/services',
    icon: 'bi-file-earmark-check',
    badge: 'Service'
  },
  {
    title: 'BWSSB Outage & Disruption Tracker',
    category: 'Outages',
    dept: 'BWSSB',
    desc: 'Track planned water shutdowns, maintenance work on Kaveri Stages IV/V, and emergency repairs.',
    url: '#/dept/bwssb/planned-outages',
    icon: 'bi-broadcast-pin',
    badge: 'Outages'
  },
  {
    title: 'BWSSB Complaint Resolution Workflow',
    category: 'Grievance',
    dept: 'BWSSB',
    desc: 'Step-by-step procedure to report water supply disruption, leakage, contamination, or meter fault.',
    url: '#/dept/bwssb/complaint',
    icon: 'bi-life-preserver',
    badge: 'Complaint'
  },
  {
    title: 'Karnataka RTI Application Generator (BWSSB)',
    category: 'Grievance',
    dept: 'BWSSB',
    desc: 'Generate instant Section 6(1) RTI application template for pending BWSSB water issues.',
    url: '#/dept/bwssb/complaint',
    icon: 'bi-file-earmark-text',
    badge: 'RTI'
  },
  {
    title: 'BWSSB 4-Level Escalation Matrix & Official Directory',
    category: 'Directory',
    dept: 'BWSSB',
    desc: 'Search direct contacts for 16 Zonal Executive Engineers (EE), Sub-Division AEEs, and local Service Stations (1916).',
    url: '#/dept/bwssb/escalation',
    icon: 'bi-shield-exclamation',
    badge: 'Directory'
  },
  {
    title: 'BWSSB SafaiMitra Emergency Helpline (14420)',
    category: 'Helpline',
    dept: 'BWSSB',
    desc: 'National 24x7 SafaiMitra helpline for prohibition of manual scavenging & emergency sewer cleaning.',
    url: '#/dept/bwssb/escalation',
    icon: 'bi-telephone-fill',
    badge: 'Helpline'
  },

  // ── BESCOM SECTION ─────────────────────────────────────────────
  {
    title: 'BESCOM Electricity Bill Calculator',
    category: 'Calculators',
    dept: 'BESCOM',
    desc: 'Calculate monthly electricity bill with LT-2a domestic slabs and Gruha Jyothi zero-bill eligibility checker.',
    url: '#/dept/bescom/calculator',
    icon: 'bi-calculator',
    badge: 'Calculator'
  },
  {
    title: 'Gruha Jyothi Scheme Subsidy Checker',
    category: 'Calculators',
    dept: 'BESCOM',
    desc: 'Check zero-bill eligibility under Karnataka Gruha Jyothi 200 units free power scheme.',
    url: '#/dept/bescom/calculator',
    icon: 'bi-lightning-charge',
    badge: 'Scheme'
  },
  {
    title: 'BESCOM Tariff & Power Slabs',
    category: 'Tariffs',
    dept: 'BESCOM',
    desc: 'Latest LT-2a domestic rates (0-50 units @ ₹4.75/unit, 51-100 units @ ₹6.25, >100 units @ ₹7.80) and fixed charges.',
    url: '#/dept/bescom/tariff',
    icon: 'bi-table',
    badge: 'Tariff'
  },
  {
    title: 'BESCOM Owner Name Transfer (e-Katha Online)',
    category: 'Services',
    dept: 'BESCOM',
    desc: 'Step-by-step guide to change owner name in BESCOM electricity bill online via Seva Sindhu.',
    url: '#/dept/bescom/services',
    icon: 'bi-pencil-square',
    badge: 'Service'
  },
  {
    title: 'BESCOM New LT Connection Application',
    category: 'Services',
    dept: 'BESCOM',
    desc: 'Apply for a new domestic or commercial electricity connection online.',
    url: '#/dept/bescom/services',
    icon: 'bi-lightning',
    badge: 'Service'
  },
  {
    title: 'BESCOM Load Enhancement / Reduction',
    category: 'Services',
    dept: 'BESCOM',
    desc: 'Request increase or decrease in sanctioned load (kW) for your installation.',
    url: '#/dept/bescom/services',
    icon: 'bi-speedometer2',
    badge: 'Service'
  },
  {
    title: 'BESCOM Planned Power Outages Map',
    category: 'Outages',
    dept: 'BESCOM',
    desc: 'Interactive feeder maintenance map for scheduled power shutdowns in Bengaluru.',
    url: '#/dept/bescom/planned-outages',
    icon: 'bi-broadcast-pin',
    badge: 'Outages'
  },
  {
    title: 'BESCOM 24/7 Helpline 1912 & WhatsApp',
    category: 'Grievance',
    dept: 'BESCOM',
    desc: 'Lodge power failure, line breakdown, or transformer complaints via 1912 or WhatsApp support.',
    url: '#/dept/bescom/complaint',
    icon: 'bi-telephone-fill',
    badge: 'Helpline'
  },

  // ── PORTAL & OTHER DEPARTMENTS ────────────────────────────────
  {
    title: 'About Namma Bengaluru Project',
    category: 'Portal',
    dept: 'General',
    desc: 'Open-source citizen help platform details, mission, tech stack, and GitHub contribution guidelines.',
    url: '#/about',
    icon: 'bi-info-circle',
    badge: 'About'
  },
  {
    title: 'BBMP Property Tax & Trade License',
    category: 'Civic',
    dept: 'BBMP',
    desc: 'Information regarding Bruhat Bengaluru Mahanagara Palike property tax, trade license, and birth/death certificates.',
    url: '#/dept/bbmp/overview',
    icon: 'bi-building',
    badge: 'BBMP'
  },
  {
    title: 'BMTC Bus Pass & Route Directory',
    category: 'Transit',
    dept: 'BMTC',
    desc: 'Bus pass application procedures, student concessions, and BMTC city transit guides.',
    url: '#/dept/bmtc/overview',
    icon: 'bi-bus-front',
    badge: 'BMTC'
  },
  {
    title: 'Namma Metro Smart Card & Fares',
    category: 'Transit',
    dept: 'Metro',
    desc: 'Bengaluru Metro Rail Corporation (BMRCL) smart card recharge, fare chart, and route map.',
    url: '#/dept/bmtc/overview',
    icon: 'bi-train-front',
    badge: 'Metro'
  }
];

export function searchPortal(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const terms = q.split(/\s+/);
  return SEARCH_INDEX.filter(item => {
    const text = `${item.title} ${item.category} ${item.dept} ${item.desc} ${item.badge}`.toLowerCase();
    return terms.every(term => text.includes(term));
  }).slice(0, 10);
}
