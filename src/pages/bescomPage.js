import { renderBreadcrumb } from './comingSoonPage.js';
import tariffData from '../data/bescom/tariffs.json';
import noticesData from '../data/bescom/notices.json';
import complaintsData from '../data/bescom/complaints.json';
import servicesData from '../data/bescom/services.json';
import { calcDomesticElectricityBill, calcCommercialElectricityBill } from '../services/bescomCalculator.js';
import { queryGemini, getKeyPool } from '../services/keyPool.js';
import { renderOutageWidget } from '../components/outageWidget.js';
import CanvasJSModule from '@canvasjs/charts';
const CanvasJS = CanvasJSModule.CanvasJS || CanvasJSModule.default || CanvasJSModule;

export function renderBESCOMPage(dept, state, lang) {
  const tabs = lang.tabs;
  return `
  <!-- Department Hero -->
  <div class="nb-dept-hero" style="--dept-hero-glow:${dept.color}20;">
    <div class="container nb-dept-hero-content text-start">
      ${renderBreadcrumb(dept)}
      <div class="d-flex align-items-center gap-3 flex-wrap mb-3">
        <div class="nb-dept-hero-icon mb-0" style="background:${dept.color}18; color:${dept.color};">
          <i class="bi ${dept.icon}"></i>
        </div>
        <div>
          <h1 class="fw-bold mb-0" style="font-size:1.85rem; letter-spacing:-0.02em;">${dept.fullName}</h1>
          <p class="text-secondary mb-0 mt-1" style="font-size:0.9rem;">${dept.description}</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 flex-wrap mt-3">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold" style="font-size:0.78rem;">
          <i class="bi bi-robot text-success"></i>
          <span class="nb-pulse bg-success"></span>
          <span>${lang.sync}</span>
        </div>
        <a href="tel:${dept.helpline}" class="nb-btn-official"><i class="bi bi-telephone"></i> Helpline: ${dept.helpline}</a>
        <a href="https://bescom.co.in" target="_blank" rel="noopener" class="nb-btn-official"><i class="bi bi-globe"></i> bescom.co.in Portal</a>
        <a href="https://bescom.karnataka.gov.in/319/planned-outages/en" target="_blank" rel="noopener" class="nb-btn-official"><i class="bi bi-calendar-event text-warning me-1"></i>Planned Outages Schedule</a>
        <a href="https://bescom.co.in" target="_blank" rel="noopener" class="nb-btn-official"><i class="bi bi-file-earmark-check"></i> e-Katha Name Change</a>
      </div>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="container py-4">
    <!-- Tab Navigation -->
    <div class="nb-tab-nav rounded-pill p-2 gap-2 mb-4" role="tablist">
      ${Object.entries(tabs).map(([id, t]) => `
        <button class="nb-tab-btn rounded-pill ${state.activeTab === id ? 'is-active' : ''}"
          onclick="window.__tab('${id}')" role="tab" aria-selected="${state.activeTab === id}">
          <i class="bi ${t.icon}"></i>${t.label}
        </button>`).join('')}
    </div>
    <div id="tabContent">${renderTab(state, lang)}</div>
  </div>`;
}

export function renderTab(state, lang) {
  switch (state.activeTab) {
    case 'calculator': return renderCalc(state);
    case 'tariff': return renderTariff();
    case 'services': return renderServices(state);
    case 'outages': return renderOutagesTab('bescom');
    case 'notices': return renderNotices(state);
    case 'complaint': return renderComplaint(state);
    case 'ai': return renderAI(state);
    default: return renderCalc(state);
  }
}

export function renderOutagesTab(dept = 'bescom') {
  return `
  <div class="d-flex flex-column gap-4">
    ${renderOutageWidget(dept)}
  </div>`;
}

// ── CALCULATOR ─────────────────────────────────────────────
export function renderCalc(state) {
  const f = state.calcForm;
  return `
  <div class="row g-4 align-items-start nb-printable-calc" id="printableCalc">
    <div class="col-lg-5">
      <div class="nb-card h-100 text-start">
        <div class="nb-card-header"><i class="bi bi-sliders text-primary me-2"></i> Connection Details</div>
        <div class="nb-card-body p-4">

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="connType">Connection Type</label>
            <select class="form-select py-2.5 px-3" id="connType" onchange="window.__calc('type', this.value)" style="border-radius:12px;">
              <option value="domestic"   ${f.type === 'domestic' ? 'selected' : ''}>Domestic (LT-2(a))</option>
              <option value="commercial" ${f.type === 'commercial' ? 'selected' : ''}>Commercial (LT-3)</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="loadInput">Sanctioned Load (kW)</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control py-2.5 px-3" id="loadInput"
                min="1" max="100" step="1" value="${f.sanctionedLoad || 1}" style="border-top-left-radius:12px; border-bottom-left-radius:12px;"
                oninput="window.__calc('sanctionedLoad', parseFloat(this.value)||1)" />
              <span class="input-group-text fw-bold px-3 bg-body-tertiary" style="font-size:0.85rem; border-top-right-radius:12px; border-bottom-right-radius:12px;">kW</span>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="consumptionInput">Monthly Consumption</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control py-2.5 px-3" id="consumptionInput"
                min="0" max="2000" step="1" value="${f.consumption}" style="border-top-left-radius:12px; border-bottom-left-radius:12px;"
                oninput="window.__calc('consumption', parseFloat(this.value)||0)" />
              <span class="input-group-text fw-bold px-3 bg-body-tertiary" style="font-size:0.85rem; border-top-right-radius:12px; border-bottom-right-radius:12px;">Units (kWh)</span>
            </div>

            <div class="p-3 bg-body-tertiary border rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2" style="font-size:0.8rem;">
                <span class="text-secondary">Quick Slider</span>
                <span class="fw-bold text-primary">${f.consumption} Units</span>
              </div>
              <input type="range" class="form-range mb-0" id="consumptionRange"
                min="0" max="500" step="1" value="${Math.min(f.consumption, 500)}"
                oninput="window.__calcSlider(this.value)" />
            </div>
          </div>

          <div class="d-flex flex-column gap-2 mb-4">
            ${f.type === 'domestic' ? `
            <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-center justify-content-between">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" id="gruhaJyothiChk"
                  ${f.gruhaJyothi ? 'checked' : ''} onchange="window.__calc('gruhaJyothi', this.checked)" />
                <label class="form-check-label ms-2 fw-medium" for="gruhaJyothiChk" style="font-size:0.86rem;">
                  Gruha Jyothi Eligible
                </label>
              </div>
              <span class="badge bg-success-subtle text-success">Free up to 200 units</span>
            </div>` : ''}
          </div>

          <button class="btn btn-primary w-100 py-2.5 mb-4 fw-semibold" onclick="window.__downloadPDF()" style="font-size:0.88rem;">
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Save Estimate as PDF
          </button>
        </div>
      </div>
    </div>

    <div class="col-lg-7 d-flex flex-column gap-4">
      <div class="nb-bill-total-card">
        <div class="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-subtle text-primary border border-primary-subtle mb-3 fw-bold" style="font-size:0.72rem; letter-spacing:0.08em;">
          <i class="bi bi-currency-rupee me-1"></i>ESTIMATED MONTHLY BILL
        </div>
        <div class="nb-bill-amount" id="billAmt">₹0</div>
        <div id="billMeta" class="mt-2" style="font-size:0.84rem; color:var(--bs-secondary-color);"></div>
      </div>

      <div class="nb-card flex-grow-1 text-start" id="billBreakdown">
        <div class="d-flex align-items-center justify-content-center text-secondary py-5" style="font-size:0.88rem; min-height:220px;">
          <div class="text-center">
            <i class="bi bi-calculator mb-2 d-block" style="font-size:2.2rem; opacity:0.3;"></i>
            Enter your consumption details to see the itemized breakdown.
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function recalcBill(state) {
  const amtEl = document.getElementById('billAmt');
  const metaEl = document.getElementById('billMeta');
  const bdEl = document.getElementById('billBreakdown');
  if (!amtEl) return;

  const f = state.calcForm;
  const emptyMsg = `<div class="d-flex align-items-center justify-content-center text-secondary py-5" style="font-size:0.88rem; min-height:220px;"><div class="text-center"><i class="bi bi-calculator mb-2 d-block" style="font-size:2.2rem; opacity:0.3;"></i>Enter your consumption details to see the itemized breakdown.</div></div>`;

  if (!f.consumption || f.consumption <= 0) {
    amtEl.textContent = '₹0';
    if (metaEl) metaEl.textContent = '';
    if (bdEl) bdEl.innerHTML = emptyMsg;
    return;
  }
  
  try {
    let r;
    if (f.type === 'commercial') {
      r = calcCommercialElectricityBill({ consumption: f.consumption, sanctionedLoad: f.sanctionedLoad || 1 });
    } else {
      r = calcDomesticElectricityBill({ consumption: f.consumption, sanctionedLoad: f.sanctionedLoad || 1, gruhaJyothi: f.gruhaJyothi });
    }

    amtEl.textContent = `₹${r.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const effRate = r.effectiveRate || 0;
    if (metaEl) metaEl.textContent = `Effective rate: ₹${effRate.toFixed(2)} / Unit (kWh)`;

    const slabs = r.slabBreakdown || [];
    const totalUnits = f.consumption;
    
    let bar = '';
    if (r.isGruhaJyothiApplied) {
      bar = `<div class="nb-slab-segment" style="width:100%; background:#10b981;" title="Gruha Jyothi: ${totalUnits} Units"></div>`;
    } else {
      bar = slabs.filter(s => s.usage > 0).map(s => {
        const pct = Math.min(100, Math.max(0, (s.usage / totalUnits) * 100));
        return `<div class="nb-slab-segment" style="width:${pct}%; background:${s.color};" title="${s.label}: ${s.usage.toFixed(2)} Units"></div>`;
      }).join('');
    }

    const items = [
      { label: 'Fixed Charges', amount: r.fixedCharge, note: `${f.sanctionedLoad || 1} kW Sanctioned Load` },
      ...(slabs.filter(s => s.usage > 0).map(s => ({
        label: `Energy Charge (${s.label})`,
        amount: s.charge,
        note: `${s.usage.toFixed(2)} Units × ₹${s.rate}/Unit`,
        color: s.color,
        isZeroed: r.isGruhaJyothiApplied
      }))),
      r.facCharge > 0 && { label: 'Fuel Adjustment Charge (FAC)', amount: r.facCharge, note: 'Variable based on KERC' },
      r.electricityDuty > 0 && { label: 'Electricity Duty (Tax)', amount: r.electricityDuty, note: '9% Tax' }
    ].filter(Boolean);

    if (bdEl) bdEl.innerHTML = `
      <div class="nb-card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-list-check text-primary me-2"></i>Itemized Breakdown</span>
      </div>
      <div class="nb-card-body p-4">
        <div class="p-3 bg-body-tertiary border rounded-3 mb-4">
          <div class="d-flex justify-content-between mb-2" style="font-size:0.78rem; font-weight:600; color:var(--bs-secondary-color);">
            <span>0 Units</span>
            <span class="text-primary">${totalUnits?.toFixed(1)} Units consumed</span>
          </div>
          <div class="nb-slab-bar" style="height:12px;">${bar || '<div style="width:100%; background:var(--bs-secondary-bg);"></div>'}</div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0" style="font-size:0.86rem;">
            <thead><tr style="border-bottom:2px solid var(--bs-border-color);">
              <th class="py-2.5" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Charge Item</th>
              <th class="py-2.5" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Details</th>
              <th class="py-2.5 text-end" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Amount</th>
            </tr></thead>
            <tbody>
              ${r.isGruhaJyothiApplied ? `
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td colspan="3" class="py-3 fw-medium text-success text-center">
                  <i class="bi bi-check-circle-fill me-2"></i>Gruha Jyothi Subsidy Applied (Free up to 200 units)
                </td>
              </tr>` : ''}
              ${items.map(item => `
              <tr style="border-bottom:1px solid var(--bs-border-color); ${item.warn ? 'color:#d97706;' : ''}">
                <td class="py-3 fw-medium">${item.color ? `<span class="nb-slab-dot me-2" style="background:${item.color}; width:10px; height:10px; display:inline-block; border-radius:50%;"></span>` : ''}${item.label}</td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">${item.note || '—'}</td>
                <td class="py-3 text-end fw-bold ${item.isZeroed ? 'text-decoration-line-through text-secondary' : ''}">₹${item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="fw-bold pt-3.5 pb-2 fs-6">Total Monthly Bill</td>
                <td class="text-end fw-bold pt-3.5 pb-2 text-primary fs-5">₹${r.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  } catch (e) { console.error('Calc error:', e); }
}

// ── TARIFF TABLE & COMPARISON CHART ─────────────────────────
export function renderTariff() {
  const types = [
    { data: tariffData.domestic },
    { data: tariffData.commercial }
  ].filter(t => t.data && t.data.slabs);

  return `<div class="d-flex flex-column gap-4 text-start">
    ${types.map(({ data }) => `
    <div class="nb-card">
      <div class="nb-card-header justify-content-between flex-wrap gap-2">
        <div>
          <div style="font-weight:800; font-size:1rem;">${data.label}</div>
          <div class="text-secondary" style="font-size:0.76rem; font-weight:normal;">${data.description || data.notes || ''}</div>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Current Tariff</span>
      </div>
      <div class="nb-card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle mb-0" style="font-size:0.85rem;">
            <thead class="table-light">
              <tr style="border-bottom:2px solid var(--bs-border-color);">
                <th class="ps-4 py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Consumption Slab</th>
                <th class="py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Units Range (kWh)</th>
                <th class="pe-4 text-end py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Rate per Unit</th>
              </tr>
            </thead>
            <tbody>
              ${data.slabs.map(s => {
                const rangeStr = s.from !== undefined
                  ? (s.to !== null && s.to !== undefined ? `${s.from} – ${s.to} Units` : `Above ${s.from} Units`)
                  : (s.label || '—');
                return `
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-semibold"><span class="nb-slab-dot me-2" style="background:${s.color || '#f59e0b'}; width:10px; height:10px; display:inline-block; border-radius:50%;"></span>${s.label}</td>
                <td class="py-3 text-secondary font-mono">${rangeStr}</td>
                <td class="pe-4 text-end py-3 font-mono fw-bold text-primary">₹${s.rate?.toFixed(2)} / Unit</td>
              </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`).join('')}

    <!-- Tariff Comparison Chart Card -->
    <div class="nb-card">
      <div class="nb-card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-bar-chart-line text-primary me-2"></i>Rate Comparison Visualizer</span>
        <span class="text-secondary" style="font-size:0.78rem;">Domestic vs Commercial</span>
      </div>
      <div class="nb-card-body p-4">
        <div id="tariffChartContainer" style="height:360px; width:100%;"></div>
      </div>
    </div>
  </div>`;
}

export function renderTariffChart() {
  const container = document.getElementById('tariffChartContainer');
  if (!container) return;

  const d = tariffData.domestic?.slabs || [];
  const c = tariffData.commercial?.slabs || [];
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  try {
    const chart = new CanvasJS.Chart('tariffChartContainer', {
      animationEnabled: true,
      theme: isDark ? 'dark2' : 'light2',
      backgroundColor: 'transparent',
      title: { text: '', fontStyle: 'normal' },
      toolTip: {
        shared: true
      },
      axisX: {
        title: 'Consumption Slabs',
        labelFontSize: 11,
        labelFontColor: isDark ? '#94a3b8' : '#64748b',
        titleFontColor: isDark ? '#cbd5e1' : '#475569'
      },
      axisY: {
        title: 'Rate per Unit (₹)',
        prefix: '₹',
        labelFontSize: 11,
        labelFontColor: isDark ? '#94a3b8' : '#64748b',
        titleFontColor: isDark ? '#cbd5e1' : '#475569',
        gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
      },
      legend: {
        fontSize: 12,
        cursor: 'pointer',
        fontColor: isDark ? '#f1f5f9' : '#1e293b'
      },
      data: [
        {
          type: 'column',
          name: 'Domestic (LT-2a)',
          showInLegend: true,
          color: '#f59e0b',
          dataPoints: d.map((s, i) => ({ label: `Slab ${i+1}`, y: s.rate }))
        },
        {
          type: 'column',
          name: 'Commercial (LT-3)',
          showInLegend: true,
          color: '#3b82f6',
          dataPoints: c.map((s, i) => ({ label: `Slab ${i+1}`, y: s.rate }))
        }
      ]
    });
    chart.render();
  } catch (err) {
    console.error('CanvasJS chart render error:', err);
  }
}

// ── NOTICES ────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function renderNotices(state) {
  setTimeout(() => {
    if (window.twttr?.widgets) window.twttr.widgets.load();
  }, 120);

  const f = state.noticeFilter;
  const list = noticesData
    .filter(n => f === 'all' || n.category === f)
    .sort((a, b) => new Date(b.date || b.syncedAt || 0) - new Date(a.date || a.syncedAt || 0));
  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'tariff', label: 'Tariff Revisions' },
    { id: 'maintenance', label: 'Power Outages' },
    { id: 'policy', label: 'Policy Directives' },
  ];
  return `
  <div class="row g-4 text-start">
    <!-- Left Column: Category Filter & Official Notices (col-lg-7) -->
    <div class="col-lg-7">
      <!-- Category Filter Bar -->
      <div class="d-flex gap-2 mb-3 overflow-x-auto pb-1" style="scrollbar-width:none;">
        ${categories.map(c => `
          <button class="btn btn-sm ${f === c.id ? 'nb-filter-btn is-active' : 'nb-filter-btn'} flex-shrink-0"
            onclick="window.__filter('${c.id}')" style="font-size:0.8rem; padding:0.4rem 0.9rem;">
            ${c.label}
          </button>`).join('')}
      </div>

      <!-- Notice Cards Container -->
      <div id="noticeList" class="d-flex flex-column gap-3 text-start">
        ${list.length === 0
        ? '<div class="text-center text-secondary py-5">No notices found for this category.</div>'
        : list.map(n => renderNoticeCard(n)).join('')}
      </div>
    </div>

    <!-- Right Column: Outage Schedule & Live Tweets (col-lg-5) -->
    <div class="col-lg-5 d-flex flex-column gap-4">
      <!-- Official Outage Page Card -->
      <div class="nb-card border-warning" style="background:linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,179,8,0.04) 100%);">
        <div class="nb-card-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-calendar-event text-warning me-2"></i>Planned Power Outages</span>
          <a href="https://bescom.karnataka.gov.in/319/planned-outages/en" target="_blank" rel="noopener" class="btn btn-sm btn-warning text-dark fw-semibold" style="font-size:0.76rem;">
            <i class="bi bi-box-arrow-up-right me-1"></i>View Schedule
          </a>
        </div>
        <div class="nb-card-body p-3">
          <div class="text-secondary" style="font-size:0.84rem; line-height:1.5;">
            BESCOM regularly publishes weekly ward-wise planned power outage schedules on their official portal.
          </div>
        </div>
      </div>

      <!-- Live Twitter Feed Card -->
      <div class="nb-card flex-grow-1">
        <div class="nb-card-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-twitter-x me-2 text-primary"></i>Live Tweets (@NammaBESCOM)</span>
          <a href="https://x.com/NammaBESCOM" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary py-1 px-2.5" style="font-size:0.76rem;">
            <i class="bi bi-box-arrow-up-right me-1"></i>Open X
          </a>
        </div>
        <div class="nb-card-body p-3 overflow-y-auto" style="max-height:480px;">
          <a class="twitter-timeline" data-height="450" data-theme="auto" href="https://twitter.com/NammaBESCOM?ref_src=twsrc%5Etfw">Loading official tweets by @NammaBESCOM...</a>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderNoticeCard(notice) {
  const catMap = {
    tariff: 'Tariff Revision',
    maintenance: 'Power Outage',
    policy: 'Policy Directive'
  };
  const categoryLabel = notice.categoryLabel || catMap[notice.category] || notice.category || 'Official Notice';
  const refNo = notice.referenceNo || notice.id || (notice.checksum ? notice.checksum.slice(0, 12) : 'BESCOM-2026');
  const officialPdf = notice.officialPdfUrl || notice.officialLink;
  let localPdf = (notice.hasLocalBackup !== false) ? (notice.pdfUrl || notice.localBackup) : null;
  if (localPdf && localPdf.startsWith('/docs/')) {
    localPdf = '.' + localPdf;
  }

  return `
  <div class="nb-notice-card">
    <div class="nb-notice-accent cat-${notice.category}-accent"></div>
    <div class="nb-notice-body">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <span class="nb-category-pill cat-${notice.category}-pill">${categoryLabel}</span>
        <span class="text-secondary" style="font-size:0.76rem;"><i class="bi bi-calendar3 me-1"></i>${fmtDate(notice.date || notice.syncedAt)}</span>
      </div>
      <h3 class="fw-bold mb-2" style="font-size:1.02rem; letter-spacing:-0.01em;">${notice.title}</h3>
      <p class="text-secondary mb-2" style="font-size:0.86rem; line-height:1.6;">${notice.summary || notice.fullContent || ''}</p>
      <div class="nb-ai-summary-box">
        <div class="fw-semibold mb-1 text-primary" style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.04em;">
          <i class="bi bi-robot me-1"></i>AI Summary & Citizen Action
        </div>
        <div>${notice.aiSummary || notice.citizenImpact || 'Review official document for details.'}</div>
      </div>
      <div class="d-flex align-items-center justify-content-between pt-2 flex-wrap gap-2" style="font-size:0.78rem;">
        <span class="text-secondary font-mono">Ref: ${refNo}</span>
        <div class="d-flex align-items-center gap-2">
          ${officialPdf ? `
          <a href="${officialPdf}" target="_blank" rel="noopener" class="nb-btn-official">
            <i class="bi bi-globe me-1"></i>Official Link
          </a>` : ''}
          ${localPdf ? `
          <a href="${localPdf}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary py-1 px-2 d-inline-flex align-items-center gap-1" title="Archived Local PDF Backup" style="font-size:0.76rem;">
            <i class="bi bi-file-earmark-arrow-down-fill text-primary"></i> Local PDF
          </a>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

// ── SERVICES & APPLICATIONS ────────────────────────────────
export function renderServices(state) {
  const list = servicesData.services || [];
  const selectedId = state.selectedServiceId || list[0]?.id || 'name-change';
  const selected = list.find(s => s.id === selectedId) || list[0];

  return `
  <div class="row g-4 text-start">
    <div class="col-lg-4">
      <div class="nb-card h-100">
        <div class="nb-card-header"><i class="bi bi-file-earmark-check text-primary me-2"></i>Select Service / Application</div>
        <div class="nb-card-body p-3 d-flex flex-column gap-2">
          ${list.map(s => `
          <button class="btn btn-outline-primary text-start p-3 ${s.id === selectedId ? 'is-selected' : ''} nb-complaint-btn"
            onclick="window.__service('${s.id}')" style="font-size:0.86rem;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-bold text-body">${s.title}</span>
              ${s.badge ? `<span class="badge bg-success-subtle text-success border border-success-subtle ms-2 flex-shrink-0" style="font-size:0.68rem;">${s.badge}</span>` : ''}
            </div>
            <div class="text-secondary" style="font-size:0.76rem;">SLA: <strong>${s.sla}</strong></div>
          </button>`).join('')}
        </div>
      </div>
    </div>

    <div class="col-lg-8 d-flex flex-column gap-4">
      <!-- Service Detail Card -->
      <div class="nb-card">
        <div class="nb-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="fw-bold" style="font-size:1.05rem;"><i class="bi bi-shield-check text-primary me-2"></i>${selected.title}</div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-clock me-1"></i>SLA: ${selected.sla}</span>
            ${selected.onlineLink ? `
            <a href="${selected.onlineLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary fw-semibold px-3 py-1.5" style="font-size:0.8rem;">
              <i class="bi bi-box-arrow-up-right me-1.5"></i>Apply Online (${selected.officialPortalName || 'Seva Sindhu'})
            </a>` : ''}
          </div>
        </div>
        <div class="nb-card-body p-4">
          <p class="text-secondary mb-4" style="font-size:0.9rem; line-height:1.6;">${selected.description}</p>

          <!-- Interactive Document Checklist -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-card-checklist text-primary me-1.5"></i>Required Documents Checklist (Check items you have ready)
            </h6>
            <div class="d-flex flex-column gap-2">
              ${(selected.documents || []).map((doc, idx) => `
              <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-start justify-content-between gap-2">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="doc_bescom_${idx}" onchange="window.__toggleDoc(this)" />
                  <label class="form-check-label ms-2 fw-medium" for="doc_bescom_${idx}" style="font-size:0.86rem; cursor:pointer;">
                    ${doc.name} ${doc.required ? '<span class="text-danger">*</span>' : ''}
                  </label>
                  ${doc.note ? `<div class="text-secondary ms-2 mt-0.5" style="font-size:0.76rem;">${doc.note}</div>` : ''}
                </div>
                ${doc.required ? '<span class="badge bg-danger-subtle text-danger flex-shrink-0" style="font-size:0.68rem;">Mandatory</span>' : '<span class="badge bg-secondary-subtle text-secondary flex-shrink-0" style="font-size:0.68rem;">Optional</span>'}
              </div>`).join('')}
            </div>
          </div>

          <!-- Step-by-Step Procedure Timeline -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-diagram-3 text-primary me-1.5"></i>Step-by-Step Application Process
            </h6>
            <div class="nb-timeline pt-1">
              ${(selected.steps || []).map((st, idx) => `
              <div class="nb-timeline-item ${idx === selected.steps.length - 1 ? 'is-last' : ''}">
                <div class="nb-timeline-badge">${st.step}</div>
                <div class="nb-timeline-content text-start">
                  <div class="fw-bold" style="font-size:0.92rem;">${st.title}</div>
                  <div class="text-secondary mt-1" style="font-size:0.84rem; line-height:1.6;">${st.details}</div>
                  ${st.link ? `<a href="${st.link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary mt-2 py-1 px-3" style="font-size:0.76rem;"><i class="bi bi-box-arrow-up-right me-1"></i>Open Direct Portal</a>` : ''}
                </div>
              </div>`).join('')}
            </div>
          </div>

          <!-- Fee Structure Table -->
          ${selected.fees && selected.fees.length > 0 ? `
          <div>
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-receipt text-primary me-1.5"></i>Official Fee Breakdown
            </h6>
            <div class="table-responsive border rounded-3">
              <table class="table align-middle mb-0" style="font-size:0.85rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-2.5 ps-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Fee Head</th>
                    <th class="py-2.5 pe-3 text-end" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Amount / Tariff Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${selected.fees.map(f => `
                  <tr style="border-bottom:1px solid var(--bs-border-color);">
                    <td class="py-2.5 ps-3 fw-medium">${f.item}</td>
                    <td class="py-2.5 pe-3 text-end font-mono fw-bold text-primary">${f.amount}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}

        </div>
      </div>
    </div>
  </div>`;
}

// ── COMPLAINT GUIDE ────────────────────────────────────────
export function renderComplaint(state) {
  const defaultId = complaintsData.complaintTypes[0]?.id || 'power-outage';
  const selectedId = state.selectedComplaintType || defaultId;
  const selectedType = complaintsData.complaintTypes.find(c => c.id === selectedId) || complaintsData.complaintTypes[0];
  return `
  <div class="row g-4 text-start">
    <div class="col-lg-4">
      <div class="nb-card h-100">
        <div class="nb-card-header"><i class="bi bi-shield-exclamation text-primary me-2"></i>Select Issue Type</div>
        <div class="nb-card-body p-3 d-flex flex-column gap-2">
          ${complaintsData.complaintTypes.map(c => `
          <button class="btn btn-outline-primary text-start p-3 ${c.id === selectedId ? 'is-selected' : ''} nb-complaint-btn"
            onclick="window.__complaint('${c.id}')" style="font-size:0.86rem;">
            <div class="fw-bold d-flex align-items-center gap-2">
              <i class="bi ${c.icon || 'bi-exclamation-circle'} text-primary"></i>
              ${c.label}
            </div>
            ${c.description ? `<div class="text-secondary mt-1" style="font-size:0.76rem;">${c.description}</div>` : ''}
          </button>`).join('')}
        </div>
      </div>
    </div>

    <div class="col-lg-8 d-flex flex-column gap-4">
      <div class="nb-card">
        <div class="nb-card-header" id="stepsHeading">
          <i class="bi bi-list-ol text-primary me-2"></i> Steps: ${selectedType?.label || ''}
        </div>
        <div class="nb-card-body p-4" id="stepsBox">
          ${renderSteps(selectedType)}
        </div>
      </div>

      <!-- RTI Generator -->
      <div class="nb-card">
        <div class="nb-card-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-file-earmark-text text-primary me-2"></i>Karnataka RTI Generator (Section 6(1))</span>
          <button class="btn btn-sm btn-primary" onclick="window.__copyRti()"><i class="bi bi-clipboard me-1"></i>Copy Template</button>
        </div>
        <div class="nb-card-body p-4">
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold" style="font-size:0.8rem;">Your Name</label>
              <input type="text" class="form-control py-2" id="rtiName" placeholder="Rahul Sharma" oninput="window.__rti()" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold" style="font-size:0.8rem;">Complaint Ref ID</label>
              <input type="text" class="form-control py-2" id="rtiCid" placeholder="BESCOM-89412" oninput="window.__rti()" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold" style="font-size:0.8rem;">Issue Description</label>
              <input type="text" class="form-control py-2" id="rtiIssue" placeholder="Frequent power cuts in HSR Layout" oninput="window.__rti()" />
            </div>
          </div>
          <pre class="nb-rti-box mb-0" id="rtiOut">${complaintsData.rtiTemplate.template}</pre>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderSteps(typeObj) {
  const steps = typeObj?.steps || [];
  return `
  <div class="nb-timeline pt-1">
    ${steps.map((s, idx) => `
    <div class="nb-timeline-item ${idx === steps.length - 1 ? 'is-last' : ''}">
      <div class="nb-timeline-badge">${s.step}</div>
      <div class="nb-timeline-content text-start">
        <div class="fw-bold" style="font-size:0.95rem;">${s.title || ''}</div>
        ${s.sla ? `<div class="text-secondary mt-1" style="font-size:0.82rem;"><i class="bi bi-clock me-1 text-primary"></i>SLA: <strong>${s.sla}</strong></div>` : ''}
        ${s.details ? `<div class="text-secondary mt-1" style="font-size:0.84rem; line-height:1.6;">${s.details}</div>` : ''}
        ${s.link ? `<a href="${s.link}" target="_blank" rel="noopener" class="btn btn-sm mt-2 py-1 px-3 btn-outline-primary" style="font-size:0.78rem;"><i class="bi bi-box-arrow-up-right me-1.5"></i>Take Action</a>` : ''}
      </div>
    </div>`).join('')}
  </div>`;
}

// ── ASK NAMMA AI ───────────────────────────────────────────
export function renderAI(state) {
  const pool = getKeyPool();
  const activeCount = pool.filter(k => k.status !== 'exhausted' && k.status !== 'invalid').length;
  return `
  <div class="nb-chat-container text-start">
    <div class="nb-chat-header">
      <div class="nb-chat-avatar"><i class="bi bi-robot"></i></div>
      <div class="flex-fill">
        <div class="fw-bold" style="font-size:0.9rem;">Ask NammaBengaluru AI</div>
        <div style="font-size:0.72rem; color:var(--nb-dept-primary);">Online — ${activeCount} active keys in crowd pool</div>
      </div>
      <button class="btn btn-sm btn-outline-secondary" onclick="window.__modal()"><i class="bi bi-key-fill me-1"></i>Manage Keys</button>
    </div>

    <div class="nb-chat-messages" id="chatMsgs">
      ${state.chatHistory.map(m => `
        <div class="d-flex gap-2 ${m.role === 'user' ? 'justify-content-end' : ''}">
          ${m.role === 'bot' ? '<div class="nb-chat-avatar flex-shrink-0" style="width:32px;height:32px;font-size:0.9rem;"><i class="bi bi-robot"></i></div>' : ''}
          <div class="nb-chat-bubble ${m.role}">${m.content}</div>
        </div>`).join('')}
    </div>

    <div class="nb-chat-footer">
      <div class="d-flex gap-2">
        <input type="text" class="nb-chat-input" id="chatIn" placeholder="Ask about BESCOM electricity bills, outages, tariffs..." onkeydown="if(event.key==='Enter')window.__send()" />
        <button class="nb-chat-send" id="chatSendBtn" onclick="window.__send()"><i class="bi bi-send-fill"></i></button>
      </div>
    </div>
  </div>`;
}
