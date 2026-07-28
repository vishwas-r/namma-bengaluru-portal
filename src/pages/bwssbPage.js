import { renderBreadcrumb } from './comingSoonPage.js';
import tariffData from '../data/bwssb/tariffs.json';
import noticesData from '../data/bwssb/notices.json';
import complaintsData from '../data/bwssb/complaints.json';
import servicesData from '../data/bwssb/services.json';
import directoryData from '../data/bwssb/directory.json';
import bwssbPlannedOutages from '../data/bwssb/planned_outages.json';
import { calcDomesticBill, calcApartmentBill, calcCommercialBill, projectFutureBill } from '../services/bwssbCalculator.js';
import { queryGemini, getKeyPool } from '../services/keyPool.js';
import { renderOutageWidget, renderPlannedOutagesWidget, renderCrowdReportsWidget } from '../components/outageWidget.js';
import { getOutageReports } from '../services/outageStore.js';
import CanvasJSModule from '@canvasjs/charts';
const CanvasJS = CanvasJSModule.CanvasJS || CanvasJSModule.default || CanvasJSModule;

export function renderBWSSBPage(dept, state, lang) {
  const tabs = lang.tabs;
  const tabTitles = {
    overview: 'Overview',
    calculator: 'Bill Calculator',
    tariff: 'Tariff & Rates',
    'planned-outages': 'Planned Outages',
    'crowd-reports': 'Crowd Reports',
    services: 'All Services',
    complaint: 'Complaint Guide',
    escalation: 'Escalation Matrix',
    notices: 'Regulations & Policies'
  };
  const activeTabName = tabTitles[state.activeTab] || 'Overview';

  return `
  <div class="nb-dept-hero nb-dept-hero-bwssb">
    <div class="container nb-dept-hero-content text-start position-relative z-1">
      <div class="mb-2">
        <a href="#/" class="text-white-50 text-decoration-none" style="font-size:0.8rem;"><i class="bi bi-house me-1"></i>Home</a>
        <span class="text-white-50 mx-2">/</span>
        <span class="text-white fw-medium" style="font-size:0.8rem;">${dept.name}</span>
      </div>
      <div class="d-flex align-items-center gap-3 flex-wrap mb-3 mt-1">
        <div class="nb-dept-hero-icon mb-0 d-flex align-items-center justify-content-center bg-white shadow-sm" style="width:64px; height:64px; border-radius:12px; color:var(--nb-dept-primary);">
          <i class="bi ${dept.icon}" style="font-size:2.2rem;"></i>
        </div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <h1 class="fw-bold text-white mb-0" style="font-size:2rem; letter-spacing:-0.02em;">${dept.fullName}</h1>
            <i class="bi bi-patch-check-fill text-primary fs-4" title="Verified Official Source"></i>
          </div>
          <p class="text-white-50 mb-0 mt-1" style="font-size:0.95rem;">Official source for water tariff, supply alerts, and services in Bengaluru.</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap mt-4">
        <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary shadow-sm rounded-pill px-3 py-2 fw-medium d-inline-flex d-lg-none align-items-center gap-2" style="font-size:0.8rem;" title="Toggle Sidebar Navigation">
          <i class="bi bi-list fs-5"></i> <span>${dept.name} Menu</span>
        </button>
        <a href="https://bwssb.karnataka.gov.in" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-globe me-1"></i> Official Website
        </a>
        <a href="tel:1916" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-telephone me-1 text-success"></i> Customer Care (1916)
        </a>
        <a href="https://twitter.com/BWSSB" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-tertiary" style="width:34px; height:34px; backdrop-filter:blur(4px);">
          <i class="bi bi-twitter-x"></i>
        </a>
        <a href="#" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-tertiary" style="width:34px; height:34px; backdrop-filter:blur(4px);">
          <i class="bi bi-facebook" style="color:#1877F2;"></i>
        </a>
        <a href="#" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-tertiary" style="width:34px; height:34px; backdrop-filter:blur(4px);">
          <i class="bi bi-youtube" style="color:#FF0000;"></i>
        </a>
      </div>
    </div>
  </div>

  <!-- Sticky Mobile Department Bar (Visible on Mobile/Tablet only) -->
  <div class="d-lg-none bg-body border-bottom py-2 px-3 shadow-2xs sticky-top" style="top: 56px; z-index: 1010;">
    <div class="d-flex align-items-center justify-content-between gap-2">
      <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary fw-semibold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-2" style="font-size:0.82rem;">
        <i class="bi bi-list fs-5"></i>
        <span>${dept.name} Menu</span>
      </button>
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5" style="font-size:0.75rem;">
        <i class="bi bi-folder2-open me-1"></i>${activeTabName}
      </span>
    </div>
  </div>

  <!-- Department Main Dashboard Layout -->
  <div class="container py-4">
    <div class="row g-4">
      <main class="col-12">
        <div id="tabContent">${renderTab(state, lang, dept)}</div>
      </main>
    </div>
  </div>`;
}

export function renderTab(state, lang, dept) {
  switch (state.activeTab) {
    case 'overview': return renderOverview(state, lang, dept);
    case 'calculator': return renderCalc(state);
    case 'tariff': return renderTariff();
    case 'services': return renderServices(state);
    case 'outages':
    case 'planned-outages':
      return renderPlannedOutagesWidget('bwssb');
    case 'crowd-reports':
      return renderCrowdReportsWidget('bwssb');
    case 'notices': return renderNotices(state);
    case 'social': return renderSocialFeed('bwssb');
    case 'complaint': return renderComplaint(state);
    case 'escalation': return renderEscalation(state);
    case 'ai': return renderAI(state);
    default: return renderOverview(state, lang, dept);
  }
}

export function renderOverview(state, lang, dept) {
  const firstSlab = tariffData?.domestic?.slabs?.[0] || { rate: 9.53, label: '0 – 8 KL' };
  const bwssbReports = getOutageReports('bwssb') || [];
  const plannedCount = Array.isArray(bwssbPlannedOutages) ? bwssbPlannedOutages.length : 0;
  const crowdCount = bwssbReports.length;

  return `
  <div class="d-flex flex-column gap-4">
    <!-- Top Row: Quick Stats Cards (4 Columns) -->
    <div class="row g-3">
      <!-- Calculator Card -->
      <div class="col-lg-3 col-md-6">
        <div class="nb-card h-100 p-3 text-start hover-shadow-sm border border-primary-subtle bg-primary-subtle bg-opacity-10" style="cursor:pointer;" onclick="window.__tab('calculator')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center text-primary" style="width:36px; height:36px;"><i class="bi bi-calculator"></i></div>
            <div class="fw-bold" style="font-size:0.85rem;">Bill Calculator</div>
          </div>
          <p class="text-secondary mb-3 mt-1" style="font-size:0.75rem; line-height:1.4;">Calculate your estimated water bill.</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">Calculate Now &rarr;</div>
        </div>
      </div>
      <!-- Tariff Card -->
      <div class="col-lg-3 col-md-6">
        <div class="nb-card h-100 p-3 text-start hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('tariff')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-currency-rupee"></i></div>
            <div class="fw-bold" style="font-size:0.85rem;">Current Tariff</div>
          </div>
          <div class="fs-5 fw-bold text-body">₹${firstSlab.rate.toFixed(2)} <span class="text-secondary fw-normal fs-6">/KL</span></div>
          <p class="text-secondary mb-2" style="font-size:0.7rem;">${firstSlab.label} (Base)</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">View All Tariffs &rarr;</div>
        </div>
      </div>
      <!-- Outages Card -->
      <div class="col-lg-3 col-md-6">
        <div class="nb-card h-100 p-3 text-start hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('planned-outages')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-droplet-half"></i></div>
            <div class="fw-bold" style="font-size:0.85rem;">Water Supply</div>
          </div>
          <div class="fs-5 fw-bold text-body">${plannedCount}</div>
          <p class="text-secondary mb-2" style="font-size:0.7rem;">Scheduled maintenance alerts</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">Check Schedule &rarr;</div>
        </div>
      </div>
      <!-- Crowd Reports Card -->
      <div class="col-lg-3 col-md-6">
        <div class="nb-card h-100 p-3 text-start hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('crowd-reports')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-people"></i></div>
            <div class="fw-bold" style="font-size:0.85rem;">Crowd Reports</div>
          </div>
          <div class="fs-5 fw-bold text-body">${crowdCount}</div>
          <p class="text-secondary mb-2" style="font-size:0.7rem;">Leakage/Supply issues reported</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">See Crowd Map &rarr;</div>
        </div>
      </div>
    </div>

    <!-- Row 1: Services & Applications (col 4), Complaint Guide (col 4), Documents Required (col 4) -->
    <div class="row g-4 text-start">
      <!-- 1. Services & Applications -->
      <div class="col-lg-4">
        <div class="nb-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div class="fw-bold text-body" style="font-size:0.95rem;">Services & Applications</div>
            <div class="text-primary" style="font-size:0.75rem; cursor:pointer;" onclick="window.__tab('services')">View all &rarr;</div>
          </div>
          <div class="d-flex flex-column gap-2">
            ${servicesData.services.slice(0, 5).map(s => `
              <div class="d-flex justify-content-between align-items-center p-2 rounded-3 hover-bg-tertiary" style="cursor:pointer;" onclick="window.__tab('services'); setTimeout(() => window.__service('${s.id}'), 50);">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-file-earmark-text text-secondary"></i>
                  <span style="font-size:0.85rem;" class="fw-medium text-body">${s.title}</span>
                </div>
                <i class="bi bi-chevron-right text-secondary" style="font-size:0.75rem;"></i>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 2. Complaint Guide -->
      <div class="col-lg-4">
        <div class="nb-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div class="fw-bold text-body" style="font-size:0.95rem;">Complaint Guide</div>
            <div class="text-primary" style="font-size:0.75rem; cursor:pointer;" onclick="window.__tab('complaint')">View all &rarr;</div>
          </div>
          <div class="d-flex flex-column gap-3">
            <div class="d-flex gap-3 align-items-center p-2 rounded-3 hover-bg-tertiary" style="cursor:pointer;" onclick="window.__tab('complaint')">
              <div class="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center" style="width:36px; height:36px; flex-shrink:0;"><i class="bi bi-exclamation-triangle"></i></div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.85rem;">Lodge a Complaint</div>
                <div class="text-secondary" style="font-size:0.75rem;">Report water leakage or sewage blocks</div>
              </div>
            </div>
            <div class="d-flex gap-3 align-items-center p-2 rounded-3 hover-bg-tertiary" style="cursor:pointer;" onclick="window.__tab('complaint')">
              <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width:36px; height:36px; flex-shrink:0;"><i class="bi bi-list-ol"></i></div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.85rem;">Complaint Steps</div>
                <div class="text-secondary" style="font-size:0.75rem;">Step-by-step guide</div>
              </div>
            </div>
            <div class="d-flex gap-3 align-items-center p-2 rounded-3 hover-bg-tertiary" style="cursor:pointer;" onclick="window.__tab('complaint')">
              <div class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style="width:36px; height:36px; flex-shrink:0;"><i class="bi bi-diagram-3"></i></div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.85rem;">Escalation Matrix</div>
                <div class="text-secondary" style="font-size:0.75rem;">Where to escalate if unresolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Documents Required -->
      <div class="col-lg-4">
        <div class="nb-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div class="fw-bold text-body" style="font-size:0.95rem;">Documents Required</div>
            <div class="text-primary" style="font-size:0.75rem; cursor:pointer;" onclick="window.__tab('services')">View all &rarr;</div>
          </div>
          <div class="row g-2 mb-3">
            ${servicesData.services.slice(0, 4).map(s => `
            <div class="col-6">
              <div class="p-2 border rounded-3 bg-body-tertiary h-100 hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('services'); setTimeout(() => window.__service('${s.id}'), 50);">
                <div class="fw-bold text-body mb-1" style="font-size:0.75rem;">${s.title}</div>
                <div class="text-secondary mb-2 text-truncate" style="font-size:0.65rem;">${(s.documents || []).map(d => d.name).join(', ')}</div>
                <div class="text-primary fw-semibold" style="font-size:0.7rem;">View Details &rarr;</div>
              </div>
            </div>
            `).join('')}
          </div>
          <div class="p-3 bg-primary-subtle text-primary border border-primary-subtle rounded-3 d-flex justify-content-between align-items-center hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('services')">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-pdf fs-5"></i>
              <span class="fw-bold" style="font-size:0.8rem;">All Forms & Templates</span>
            </div>
            <div class="btn btn-sm btn-light border-0 fw-semibold text-primary" style="font-size:0.75rem;">Browse Forms &rarr;</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Social Feed (col 6) + News & Announcements (col 6) -->
    <div class="row g-4 text-start mt-1">
      <!-- 1. Social Feed -->
      <div class="col-lg-6">
        <div class="nb-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div class="fw-bold text-body" style="font-size:0.95rem;">Social Feed</div>
            <div class="text-primary" style="font-size:0.75rem; cursor:pointer;" onclick="window.__tab('social')">View all &rarr;</div>
          </div>
          <div class="d-flex flex-column gap-3">
            <a href="https://x.com/chairmanbwssb" target="_blank" rel="noopener" class="d-flex gap-2 text-decoration-none text-body hover-bg-tertiary p-2 rounded-3 transition-all">
              <div class="rounded-circle bg-info text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:28px;height:28px;"><i class="bi bi-twitter-x"></i></div>
              <div>
                <div class="fw-bold text-body mb-1" style="font-size:0.8rem;">BWSSB <i class="bi bi-patch-check-fill text-primary" style="font-size:0.7rem;"></i> <span class="text-secondary fw-normal">@chairmanbwssb</span></div>
                <div class="text-secondary mb-2" style="font-size:0.75rem; line-height:1.4;">24x7 Helpline 1916 operational for water supply disruption, leakage, & tanker booking.</div>
                <div class="d-flex align-items-center justify-content-between text-secondary" style="font-size:0.7rem;">
                  <span><i class="bi bi-arrow-repeat me-1"></i> Live Official Feed</span>
                  <span class="text-primary fw-semibold">View on X &rarr;</span>
                </div>
              </div>
            </a>
            <div class="border-top pt-2">
              <a href="https://www.facebook.com/BWSSB" target="_blank" rel="noopener" class="d-flex gap-2 text-decoration-none text-body hover-bg-tertiary p-2 rounded-3 transition-all">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:28px;height:28px;"><i class="bi bi-facebook"></i></div>
                <div>
                  <div class="fw-bold text-body mb-1" style="font-size:0.8rem;">BWSSB Official Facebook</div>
                  <div class="text-secondary mb-2" style="font-size:0.75rem; line-height:1.4;">Check official updates on Cauvery Stage V commissioning & rainwater harvesting drives.</div>
                  <div class="text-primary fw-semibold" style="font-size:0.7rem;">View Page &rarr;</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. News & Announcements -->
      <div class="col-lg-6">
        <div class="nb-card h-100 p-4">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div class="fw-bold text-body" style="font-size:0.95rem;">News & Announcements</div>
            <div class="text-primary" style="font-size:0.75rem; cursor:pointer;" onclick="window.__tab('notices')">View all &rarr;</div>
          </div>
          <div class="d-flex flex-column gap-3">
            ${noticesData.slice(0, 3).map(n => `
            <div class="d-flex gap-3 align-items-start hover-bg-tertiary p-2 rounded-3" style="cursor:pointer;" onclick="window.__tab('notices')">
              <div class="rounded-3 bg-secondary-subtle d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px; color:var(--bs-secondary-color);">
                <i class="bi bi-megaphone fs-4"></i>
              </div>
              <div>
                <div class="fw-bold text-body mb-1" style="font-size:0.8rem; line-height:1.4;">${n.title}</div>
                <div class="text-secondary" style="font-size:0.7rem;">${new Date(n.date || n.syncedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderOutagesTab(dept = 'bwssb') {
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
            <select class="form-select py-2 px-3" id="connType" onchange="window.__calc('type', this.value)" style="border-radius:12px;">
              <option value="domestic"   ${f.type === 'domestic' ? 'selected' : ''}>Domestic (Individual House)</option>
              <option value="apartment"  ${f.type === 'apartment' ? 'selected' : ''}>Apartment / Bulk Domestic</option>
              <option value="commercial" ${f.type === 'commercial' ? 'selected' : ''}>Non-Domestic / Commercial</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="consumptionInput">Monthly Consumption (1 KL = 1 m³)</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control py-2 px-3" id="consumptionInput"
                min="0" max="500" step="0.5" value="${f.consumption}" style="border-top-left-radius:12px; border-bottom-left-radius:12px;"
                oninput="window.__calc('consumption', parseFloat(this.value)||0)" />
              <span class="input-group-text fw-bold px-3 bg-body-tertiary" style="font-size:0.85rem; border-top-right-radius:12px; border-bottom-right-radius:12px;">KL (m³)</span>
            </div>

            <div class="p-3 bg-body-tertiary border rounded-3">
              <div class="d-flex justify-content-between align-items-center mb-2" style="font-size:0.8rem;">
                <span class="text-secondary">Quick Slider</span>
                <span class="fw-bold text-primary">${f.consumption} KL (${f.consumption} m³)</span>
              </div>
              <input type="range" class="form-range mb-0" id="consumptionRange"
                min="0" max="100" step="1" value="${Math.min(f.consumption, 100)}"
                oninput="window.__calcSlider(this.value)" />
            </div>
          </div>

          ${f.type === 'apartment' ? `
          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="numFlats">Number of Flats / Units</label>
            <input type="number" class="form-control py-2 px-3" id="numFlats" min="1" max="1000" value="${f.numFlats}" style="border-radius:12px;"
              onchange="window.__calc('numFlats', parseInt(this.value)||1)" />
            <div class="form-text mt-1" style="font-size:0.78rem;">Total flats sharing this bulk connection.</div>
          </div>` : ''}

          ${f.type === 'domestic' ? `
          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="meterSize">Water Meter Size</label>
            <select class="form-select py-2 px-3" id="meterSize" onchange="window.__calc('meterSize', this.value)" style="border-radius:12px;">
              ${tariffData.domestic.meterFixedCharges.map(m => `
                <option value="${m.size}" ${f.meterSize === m.size ? 'selected' : ''}>${m.label} — ₹${m.charge}/month</option>`).join('')}
            </select>
          </div>` : ''}

          <div class="d-flex flex-column gap-2 mb-4">
            ${f.type !== 'apartment' ? `
            <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-center justify-content-between">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" id="borewellChk"
                  ${f.hasBorewell ? 'checked' : ''} onchange="window.__calc('hasBorewell', this.checked)" />
                <label class="form-check-label ms-2 fw-medium" for="borewellChk" style="font-size:0.86rem;">
                  Registered borewell
                </label>
              </div>
              <span class="badge bg-secondary-subtle text-secondary">+₹${tariffData.domestic.borewellCharge.fixed}/mo</span>
            </div>` : ''}

            <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-center justify-content-between">
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" id="rwhChk"
                  ${f.rwhNonCompliant ? 'checked' : ''} onchange="window.__calc('rwhNonCompliant', this.checked)" />
                <label class="form-check-label ms-2 fw-medium" for="rwhChk" style="font-size:0.86rem;">
                  Plot > 1,200 sq.m (No RWH)
                </label>
              </div>
              <span class="badge bg-danger-subtle text-danger">+50% penalty</span>
            </div>
          </div>

          <button class="btn btn-primary w-100 py-2 mb-4 fw-semibold" onclick="window.__downloadPDF()" style="font-size:0.88rem;">
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Save Estimate as PDF
          </button>

          <!-- Subtle Footer Tariff Gazette Note -->
          <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2 text-secondary" style="font-size:0.78rem;">
            <span><i class="bi bi-shield-check me-1 text-primary"></i>BWSSB Tariff (1 April 2026)</span>
            <div class="d-flex align-items-center gap-2">
              <a href="https://bwssb.karnataka.gov.in/storage/pdf-files/WaterTariff-2025.pdf" target="_blank" rel="noopener" class="nb-btn-official" style="font-size:0.72rem; padding:0.25rem 0.65rem;">
                <i class="bi bi-globe me-1"></i>Gazette PDF
              </a>
              <a href="/docs/bwssb/WaterTariff-2025.pdf" target="_blank" rel="noopener" class="text-secondary opacity-75" title="Archived Local PDF Backup" style="font-size:1.1rem; text-decoration:none;" onmouseover="this.classList.remove('opacity-75')" onmouseout="this.classList.add('opacity-75')">
                <i class="bi bi-file-earmark-arrow-down-fill"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-7 d-flex flex-column gap-4">
      <div class="nb-bill-total-card">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary-subtle text-primary border border-primary-subtle mb-3 fw-bold" style="font-size:0.72rem; letter-spacing:0.08em;">
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
    if (f.type === 'apartment') r = calcApartmentBill({ totalConsumption: f.consumption, numFlats: f.numFlats || 1, hasBorewell: f.hasBorewell, rwhNonCompliant: f.rwhNonCompliant });
    else if (f.type === 'commercial') r = calcCommercialBill({ consumption: f.consumption, rwhNonCompliant: f.rwhNonCompliant });
    else r = calcDomesticBill({ consumption: f.consumption, meterSize: f.meterSize, hasBorewell: f.hasBorewell, rwhNonCompliant: f.rwhNonCompliant });

    if (f.type === 'apartment') {
      amtEl.innerHTML = `
        <div class="d-flex align-items-baseline justify-content-between flex-wrap gap-2 text-start">
          <div>
            <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; display:block;" class="text-secondary mb-1">Per Flat Price</span>
            <span class="text-primary fw-bold fs-2">₹${r.perFlatTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span class="text-secondary" style="font-size:0.85rem; font-weight:normal;"> / flat</span>
          </div>
          <div class="text-end">
            <span style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.06em; display:block;" class="text-secondary mb-1">Total Building (${r.numFlats} Flats)</span>
            <span class="fw-bold fs-4">₹${r.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>`;
      if (metaEl) metaEl.textContent = `Per-flat usage: ${r.perFlatConsumption?.toFixed(2)} KL (${r.perFlatConsumption?.toFixed(2)} m³)  ·  Total Bulk: ${f.consumption} KL (${f.consumption} m³)`;
    } else {
      amtEl.textContent = `₹${r.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const effRate = r.effectiveRate || (r.total / f.consumption);
      if (metaEl) metaEl.textContent = `Effective rate: ₹${effRate?.toFixed(2)} / KL (m³)  ·  Next year: ₹${projectFutureBill(r.total, 1).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }

    const slabs = r.slabBreakdown || r.perFlatBreakdown?.slabBreakdown || [];
    const totalKL = f.type === 'apartment' ? r.perFlatConsumption : f.consumption;
    const bar = slabs.filter(s => s.usage > 0).map(s => {
      const pct = Math.min(100, Math.max(0, (s.usage / totalKL) * 100));
      return `<div class="nb-slab-segment" style="width:${pct}%; background:${s.color};" title="${s.label}: ${s.usage.toFixed(2)} KL (m³)"></div>`;
    }).join('');

    const items = f.type === 'apartment'
      ? [
        ...(r.perFlatBreakdown?.slabBreakdown?.filter(s => s.usage > 0).map(s => ({
          label: `Water Charge (${s.label})`,
          amount: parseFloat((s.charge * r.numFlats).toFixed(2)),
          note: `${r.numFlats} flats × ${s.usage.toFixed(2)} KL @ ₹${s.rate}/KL (₹${s.charge.toFixed(2)}/flat)`,
          color: s.color
        })) || []),
        r.totalSanitary && { label: `Sanitary Charge (${r.numFlats} flats)`, amount: r.totalSanitary, note: `25% of water charge (₹${r.perFlatBreakdown?.sanitaryCharge?.toFixed(2)}/flat)` },
        r.borewellCharge && { label: 'Borewell Charge', amount: r.borewellCharge },
        r.rwhPenalty && { label: 'RWH Non-Compliance Surcharge', amount: r.rwhPenalty, note: '50% surcharge', warn: true },
      ].filter(Boolean)
      : [
        ...(r.slabBreakdown?.filter(s => s.usage > 0).map(s => ({
          label: `Water Charge (${s.label})`,
          amount: s.charge,
          note: `${s.usage.toFixed(2)} KL (m³) × ₹${s.rate}/KL`,
          color: s.color
        })) || []),
        r.sanitaryCharge && { label: 'Sanitary / Sewerage Charge', amount: r.sanitaryCharge, note: '25% of water charge (min ₹100)' },
        r.meterFixed && { label: 'Meter Fixed Charge', amount: r.meterFixed },
        r.borewellCharge && { label: 'Borewell Charge', amount: r.borewellCharge },
        r.rwhPenalty && { label: 'RWH Non-Compliance Surcharge', amount: r.rwhPenalty, note: '50% surcharge', warn: true },
      ].filter(Boolean);

    if (bdEl) bdEl.innerHTML = `
      <div class="nb-card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-list-check text-primary me-2"></i>Itemized Breakdown</span>
        <div class="d-flex align-items-center gap-2">
          <a href="https://bwssb.karnataka.gov.in/storage/pdf-files/WaterTariff-2025.pdf" target="_blank" rel="noopener" class="nb-btn-official" style="font-size:0.72rem;">
            <i class="bi bi-globe me-1"></i>Gazette PDF
          </a>
          <a href="/docs/bwssb/WaterTariff-2025.pdf" target="_blank" rel="noopener" class="text-secondary opacity-75" title="Archived Local PDF Backup" style="font-size:1.05rem; text-decoration:none;" onmouseover="this.classList.remove('opacity-75')" onmouseout="this.classList.add('opacity-75')">
            <i class="bi bi-file-earmark-arrow-down-fill"></i>
          </a>
        </div>
      </div>
      <div class="nb-card-body p-4">
        <div class="p-3 bg-body-tertiary border rounded-3 mb-4">
          <div class="d-flex justify-content-between mb-2" style="font-size:0.78rem; font-weight:600; color:var(--bs-secondary-color);">
            <span>0 KL (0 m³)</span>
            <span class="text-primary">${totalKL?.toFixed(1)} KL (${totalKL?.toFixed(1)} m³) ${f.type === 'apartment' ? 'per flat' : ''} consumed</span>
          </div>
          <div class="nb-slab-bar" style="height:12px;">${bar || '<div style="width:100%; background:var(--bs-secondary-bg);"></div>'}</div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0" style="font-size:0.86rem;">
            <thead><tr style="border-bottom:2px solid var(--bs-border-color);">
              <th class="py-2" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Charge Item</th>
              <th class="py-2" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Details</th>
              <th class="py-2 text-end" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Amount</th>
            </tr></thead>
            <tbody>
              ${items.map(item => `
              <tr style="border-bottom:1px solid var(--bs-border-color); ${item.warn ? 'color:#d97706;' : ''}">
                <td class="py-3 fw-medium">${item.color ? `<span class="nb-slab-dot me-2" style="background:${item.color}; width:10px; height:10px; display:inline-block; border-radius:50%;"></span>` : ''}${item.label}</td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">${item.note || '—'}</td>
                <td class="py-3 text-end fw-bold">₹${item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="fw-bold pt-4 pb-2 fs-6">Total Monthly Bill</td>
                <td class="text-end fw-bold pt-4 pb-2 text-primary fs-5">₹${r.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
    { data: tariffData.nonDomestic },
    { data: tariffData.industrial }
  ].filter(t => t.data && t.data.slabs);

  return `<div class="d-flex flex-column gap-4 text-start">
    ${types.map(({ data }) => `
    <div class="nb-card">
      <div class="nb-card-header justify-content-between flex-wrap gap-2">
        <div>
          <div style="font-weight:800; font-size:1rem;">${data.label}</div>
          <div class="text-secondary" style="font-size:0.76rem; font-weight:normal;">${data.description || data.notes || ''}</div>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Effective 1 April 2026</span>
      </div>
      <div class="nb-card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle mb-0" style="font-size:0.85rem;">
            <thead class="table-light">
              <tr style="border-bottom:2px solid var(--bs-border-color);">
                <th class="ps-4 py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Consumption Slab</th>
                <th class="py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">KL Range (m³)</th>
                <th class="pe-4 text-end py-3" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em;">Rate per KL</th>
              </tr>
            </thead>
            <tbody>
              ${data.slabs.map(s => {
    const rangeStr = s.from !== undefined
      ? (s.to !== null && s.to !== undefined ? `${s.from} – ${s.to} KL (m³)` : `Above ${s.from} KL (m³)`)
      : (s.label || '—');
    return `
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-semibold"><span class="nb-slab-dot me-2" style="background:${s.color || '#3451b8'}; width:10px; height:10px; display:inline-block; border-radius:50%;"></span>${s.label}</td>
                <td class="py-3 text-secondary font-mono">${rangeStr}</td>
                <td class="pe-4 text-end py-3 font-mono fw-bold text-primary">₹${s.rate?.toFixed(2)} / KL</td>
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
        <span><i class="bi bi-bar-chart-line text-primary me-2"></i>Tariff Rate Comparison Visualizer</span>
        <span class="text-secondary" style="font-size:0.78rem;">Domestic vs Non-Domestic / Commercial</span>
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
  const c = tariffData.nonDomestic?.slabs || [];
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
        title: 'Rate per KL (₹)',
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
          name: 'Domestic (Individual)',
          showInLegend: true,
          color: '#3451b8',
          dataPoints: d.map(s => ({ label: s.label, y: s.rate }))
        },
        {
          type: 'column',
          name: 'Non-Domestic / Commercial',
          showInLegend: true,
          color: '#f59e0b',
          dataPoints: c.map((s, idx) => ({ label: d[idx]?.label || s.label, y: s.rate }))
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
  const f = state.noticeFilter;
  const list = noticesData
    .filter(n => f === 'all' || n.category === f)
    .sort((a, b) => new Date(b.date || b.syncedAt || 0) - new Date(a.date || a.syncedAt || 0));
  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'tariff', label: 'Tariff Revisions' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'policy', label: 'Policy Directives' },
    { id: 'service', label: 'Service Upgrades' },
    { id: 'quality', label: 'Water Quality' },
  ];
  return `
  <div class="row text-start">
    <div class="col-12">
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
  </div>`;
}

export function renderSocialFeed(dept = 'bwssb') {
  setTimeout(() => {
    if (window.twttr?.widgets) window.twttr.widgets.load();
  }, 120);

  const isBescom = dept === 'bescom';
  const handle = isBescom ? 'NammaBESCOM' : 'chairmanbwssb';
  const fbPage = isBescom ? 'bescomblr' : 'BWSSB';
  const instaHandle = isBescom ? 'nammabescom' : 'bwssbofficial';
  const ytHandle = isBescom ? '@NammaBESCOM' : '@BWSSB';
  const deptTitle = isBescom ? 'BESCOM Electricity' : 'BWSSB Water Board';

  return `
  <div class="row g-4 text-start">
    <!-- Left Column: Official Social Channels Hub (col-lg-5) -->
    <div class="col-lg-5">
      <div class="d-flex flex-column gap-3">
        <!-- Main Channel Header Card -->
        <div class="nb-card p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px; height:48px; font-size:1.4rem;">
              <i class="bi bi-share-fill"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0" style="font-size:1.05rem;">${deptTitle}</h5>
              <div class="text-secondary" style="font-size:0.8rem;">Official Public Social Media Suite</div>
            </div>
          </div>
          <p class="text-secondary mb-4" style="font-size:0.85rem; line-height:1.6;">
            Connect directly with verified official social media accounts, emergency broadcasts, and direct helpdesk channels for ${deptTitle}.
          </p>

          <!-- Channel Links Grid -->
          <div class="d-flex flex-column gap-2">
            <!-- X / Twitter -->
            <a href="https://x.com/${handle}" target="_blank" rel="noopener" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-twitter-x fs-4 text-primary"></i>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">Official X (Twitter)</div>
                  <div class="text-secondary" style="font-size:0.75rem;">@${handle}</div>
                </div>
              </div>
              <span class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1" style="font-size:0.75rem;">Follow <i class="bi bi-box-arrow-up-right ms-1"></i></span>
            </a>

            <!-- Facebook -->
            <a href="https://www.facebook.com/${fbPage}" target="_blank" rel="noopener" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-facebook fs-4 text-primary"></i>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">Official Facebook Page</div>
                  <div class="text-secondary" style="font-size:0.75rem;">@${fbPage}</div>
                </div>
              </div>
              <span class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1" style="font-size:0.75rem;">Like Page <i class="bi bi-box-arrow-up-right ms-1"></i></span>
            </a>

            <!-- Instagram -->
            <a href="https://www.instagram.com/${instaHandle}/" target="_blank" rel="noopener" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-instagram fs-4 text-danger"></i>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">Official Instagram</div>
                  <div class="text-secondary" style="font-size:0.75rem;">@${instaHandle}</div>
                </div>
              </div>
              <span class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" style="font-size:0.75rem;">Follow <i class="bi bi-box-arrow-up-right ms-1"></i></span>
            </a>

            <!-- YouTube Search Link -->
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(isBescom ? 'BESCOM Bengaluru' : 'BWSSB Bengaluru')}&sp=CAI%253D" target="_blank" rel="noopener" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-youtube fs-4 text-danger"></i>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">YouTube Video Updates</div>
                  <div class="text-secondary" style="font-size:0.75rem;">Recent news & broadcasts</div>
                </div>
              </div>
              <span class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" style="font-size:0.75rem;">Watch <i class="bi bi-box-arrow-up-right ms-1"></i></span>
            </a>

            <!-- Official WhatsApp / Helpline -->
            <a href="https://wa.me/91${isBescom ? '1912' : '1916'}" target="_blank" rel="noopener" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-whatsapp fs-4 text-success"></i>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">WhatsApp Helpline</div>
                  <div class="text-secondary" style="font-size:0.75rem;">${isBescom ? '1912 (BESCOM Support)' : '1916 (BWSSB Support)'}</div>
                </div>
              </div>
              <span class="btn btn-sm btn-outline-success rounded-pill px-3 py-1" style="font-size:0.75rem;">Chat <i class="bi bi-chat-dots ms-1"></i></span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Interactive Embedded Feed Suite (col-lg-7) -->
    <div class="col-lg-7">
      <div class="nb-card h-100">
        <div class="nb-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-primary nb-social-subtab-btn rounded-pill px-3" id="socialTabBtn_x" onclick="window.__switchSocialFeed('x')">
              <i class="bi bi-twitter-x me-1"></i>X Feed
            </button>
            <button class="btn btn-sm btn-outline-secondary nb-social-subtab-btn rounded-pill px-3" id="socialTabBtn_fb" onclick="window.__switchSocialFeed('fb')">
              <i class="bi bi-facebook me-1 text-primary"></i>Facebook Page
            </button>
            <button class="btn btn-sm btn-outline-secondary nb-social-subtab-btn rounded-pill px-3" id="socialTabBtn_insta" onclick="window.__switchSocialFeed('insta')">
              <i class="bi bi-instagram me-1 text-danger"></i>Instagram
            </button>
          </div>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.72rem;">Live Feeds</span>
        </div>

        <div class="nb-card-body p-3 overflow-y-auto" style="max-height:580px;">
          <!-- X Pane -->
          <div id="socialPane_x" class="nb-social-feed-pane">
            <a class="twitter-timeline" data-height="520" data-theme="auto" href="https://x.com/${handle}">Tweets by @${handle}</a>
          </div>

          <!-- Facebook Pane -->
          <div id="socialPane_fb" class="nb-social-feed-pane d-none text-center py-2">
            <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${fbPage}&tabs=timeline&width=500&height=520&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false"
              width="100%" height="520" style="border:none;overflow:hidden; max-width:500px; border-radius:12px;" scrolling="no" frameborder="0" allowfullscreen="true"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
          </div>

          <!-- Instagram Pane -->
          <div id="socialPane_insta" class="nb-social-feed-pane d-none py-4 text-center">
            <div class="p-4 rounded-4 bg-body-tertiary border d-inline-block text-center" style="max-width:420px;">
              <i class="bi bi-instagram display-4 text-danger mb-3 d-block"></i>
              <h5 class="fw-bold mb-2">@${instaHandle} on Instagram</h5>
              <p class="text-secondary mb-4" style="font-size:0.85rem; line-height:1.6;">
                Follow official photo & video updates, awareness campaigns, and public advisories directly on Instagram.
              </p>
              <a href="https://www.instagram.com/${instaHandle}/" target="_blank" rel="noopener" class="btn btn-danger rounded-pill px-4 py-2 fw-semibold">
                <i class="bi bi-instagram me-2"></i>View Instagram Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderNoticeCard(notice) {
  const catMap = {
    tariff: 'Tariff Revision',
    maintenance: 'Maintenance',
    policy: 'Policy Directive',
    service: 'Service Upgrade',
    quality: 'Water Quality'
  };
  const categoryLabel = notice.categoryLabel || catMap[notice.category] || notice.category || 'Official Notice';
  const refNo = notice.referenceNo || notice.id || (notice.checksum ? notice.checksum.slice(0, 12) : 'BWSSB-2026');
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
            <i class="bi bi-globe me-1"></i>Official Gazette PDF
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
  const selectedId = state.selectedServiceId || list[0]?.id || 'new-water-connection';
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
            <a href="${selected.onlineLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary fw-semibold px-3 py-2" style="font-size:0.8rem;">
              <i class="bi bi-box-arrow-up-right me-2"></i>Apply Online (${selected.officialPortalName || 'BWSSB CMS'})
            </a>` : ''}
          </div>
        </div>
        <div class="nb-card-body p-4">
          <p class="text-secondary mb-4" style="font-size:0.9rem; line-height:1.6;">${selected.description}</p>

          <!-- Interactive Document Checklist -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-card-checklist text-primary me-2"></i>Required Documents Checklist (Check items you have ready)
            </h6>
            <div class="d-flex flex-column gap-2">
              ${(selected.documents || []).map((doc, idx) => `
              <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-start justify-content-between gap-2">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="doc_bwssb_${idx}" onchange="window.__toggleDoc(this)" />
                  <label class="form-check-label ms-2 fw-medium" for="doc_bwssb_${idx}" style="font-size:0.86rem; cursor:pointer;">
                    ${doc.name} ${doc.required ? '<span class="text-danger">*</span>' : ''}
                  </label>
                  ${doc.note ? `<div class="text-secondary ms-2 mt-1" style="font-size:0.76rem;">${doc.note}</div>` : ''}
                </div>
                ${doc.required ? '<span class="badge bg-danger-subtle text-danger flex-shrink-0" style="font-size:0.68rem;">Mandatory</span>' : '<span class="badge bg-secondary-subtle text-secondary flex-shrink-0" style="font-size:0.68rem;">Optional</span>'}
              </div>`).join('')}
            </div>
          </div>

          <!-- Step-by-Step Procedure Timeline -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-diagram-3 text-primary me-2"></i>Step-by-Step Application Process
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
              <i class="bi bi-receipt text-primary me-2"></i>Official Fee Breakdown
            </h6>
            <div class="table-responsive border rounded-3">
              <table class="table align-middle mb-0" style="font-size:0.85rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-2 ps-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Fee Head</th>
                    <th class="py-2 pe-3 text-end" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Amount / Tariff Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${selected.fees.map(f => `
                  <tr style="border-bottom:1px solid var(--bs-border-color);">
                    <td class="py-2 ps-3 fw-medium">${f.item}</td>
                    <td class="py-2 pe-3 text-end font-mono fw-bold text-primary">${f.amount}</td>
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

// ── COMPLAINT STEPS ───────────────────────────────────────────
export function renderComplaint(state) {
  const defaultId = complaintsData.complaintTypes[0]?.id || 'no-water';
  const selectedId = state.selectedComplaintType || defaultId;
  const selectedType = complaintsData.complaintTypes.find(c => c.id === selectedId) || complaintsData.complaintTypes[0];

  return `
  <div class="d-flex flex-column gap-4 text-start">

    <!-- Top Callout Banner -->
    <div class="card border-0 shadow-sm rounded-4 p-4" style="background:var(--bs-tertiary-bg); border:1px solid var(--bs-border-color)!important;">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-journal-check text-primary me-2"></i>BWSSB Citizen Complaint Resolution Steps</h4>
          <p class="text-secondary mb-0" style="font-size:0.88rem;">Follow these step-by-step procedures to log and track your water or sewage issue with BWSSB.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary rounded-pill fw-semibold px-3 py-2" onclick="window.__tab('escalation')" style="font-size:0.85rem;">
            <i class="bi bi-shield-exclamation me-1"></i>View Escalation Matrix & Officers Directory &rarr;
          </button>
          <a href="tel:1916" class="btn btn-primary rounded-pill fw-bold shadow-sm px-3 py-2" style="font-size:0.85rem;">
            <i class="bi bi-telephone-fill me-1"></i>Call 1916
          </a>
        </div>
      </div>
    </div>

    <!-- Issue Selector & Action Steps -->
    <div class="row g-4 text-start">
      <div class="col-lg-4">
        <div class="nb-card h-100">
          <div class="nb-card-header"><i class="bi bi-shield-exclamation text-primary me-2"></i>Select Issue Category</div>
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
            <i class="bi bi-list-ol text-primary me-2"></i> Resolution Steps: ${selectedType?.label || ''}
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
                <input type="text" class="form-control py-2" id="rtiCid" placeholder="BWSSB-2026-89412" oninput="window.__rti()" />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold" style="font-size:0.8rem;">Issue Description</label>
                <input type="text" class="form-control py-2" id="rtiIssue" placeholder="Contaminated water supply in Sector 4" oninput="window.__rti()" />
              </div>
            </div>
            <pre class="nb-rti-box mb-0" id="rtiOut">${complaintsData.rtiTemplate.template}</pre>
          </div>
        </div>
      </div>
    </div>

  </div>`;
}

// ── ESCALATION MATRIX & OFFICIAL DIRECTORY ───────────────────────────
export function renderEscalation(state) {
  const seniorManagement = [
    { name: 'Dr. Manjula N, IAS', desig: 'Chairman', address: '1st Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945100', email: 'chairman@bwssb.gov.in' },
    { name: 'Sri Madan Mohan C, KAS', desig: 'Chief Administrative Officer & Secretary', address: '1st Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945102', email: 'caos@bwssb.gov.in' },
    { name: 'Sri J.S Subbramaiah', desig: 'FA & CAO', address: '1st Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945104', email: 'fa@bwssb.gov.in' },
    { name: 'Sri Dalayath B S', desig: 'Engineer – in – Chief (Addl. Charge)', address: '2nd Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945105', email: 'eic@bwssb.gov.in' },
    { name: 'Sri Madhusudhan T', desig: 'Chief Engineer (East)', address: '6th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945232', email: 'ceeast@bwssb.gov.in' },
    { name: 'Sri Devaraju M', desig: 'Chief Engineer (West)', address: '6th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945244', email: 'cewest@bwssb.gov.in' },
    { name: 'Sri Gangadhara', desig: 'Chief Engineer (North)', address: '2nd Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945244', email: 'cenorth@bwssb.gov.in' },
    { name: 'Sri Mahesh K N', desig: 'Chief Engineer (South)', address: '7th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945587', email: 'cesouth@bwssb.gov.in' },
    { name: 'Sri Rajashekar A', desig: 'Chief Engineer (Kaveri Headworks)', address: '8th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945263', email: 'cekoandm@bwssb.gov.in' },
    { name: 'Sri Venkatesh S V', desig: 'Chief Engineer (Kaveri - Projects)', address: '5th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945103', email: 'cecd@bwssb.gov.in' },
    { name: 'Sri Paramesha K N', desig: 'Chief Engineer (UWP)', address: '6th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945350', email: 'cewwmwest@bwssb.gov.in' },
    { name: 'Sri Sanath Kumar V', desig: 'Chief Engineer (Design & QA)', address: '9th Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945340', email: 'cedesign@bwssb.gov.in' },
    { name: 'Sri Sudheer S', desig: 'Chief Engineer (IP, R&D) I/c', address: '3rd Floor, Cauvery Bhavan, KG Road, Bengaluru-560009', phone: '22945108', email: 'cep@bwssb.gov.in' }
  ];

  const zones = directoryData.zones || [];

  return `
  <div class="d-flex flex-column gap-4 text-start">

    <!-- 4-Level Escalation Matrix Card -->
    <div class="card border-0 shadow-sm rounded-4 p-4" style="background:var(--bs-tertiary-bg); border:1px solid var(--bs-border-color)!important;">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-diagram-3-fill text-primary me-2"></i>BWSSB 4-Level Grievance Escalation Matrix</h4>
          <p class="text-secondary mb-0" style="font-size:0.88rem;">Use this official hierarchy if your water or sewage issue exceeds the resolution SLA timeframe.</p>
        </div>
        <div class="d-flex gap-2">
          <a href="tel:1916" class="btn btn-primary rounded-pill fw-bold shadow-sm px-3 py-2" style="font-size:0.85rem;">
            <i class="bi bi-telephone-fill me-1"></i>Helpline 1916
          </a>
          <a href="https://wa.me/918762228888" target="_blank" rel="noopener" class="btn btn-success rounded-pill fw-bold shadow-sm px-3 py-2" style="font-size:0.85rem;">
            <i class="bi bi-whatsapp me-1"></i>WhatsApp 87622 28888
          </a>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-md-3">
          <div class="p-3 rounded-3 bg-body border h-100">
            <div class="badge bg-primary-subtle text-primary fw-bold mb-2">Level 1</div>
            <div class="fw-bold" style="font-size:0.88rem;">Local Helpdesk / Call Center</div>
            <div class="text-secondary mt-1" style="font-size:0.78rem; line-height:1.5;">
              Call <strong>1916</strong> or WhatsApp <strong>87622 28888</strong>. Email: <a href="mailto:callcenter@bwssb.gov.in" class="text-decoration-none">callcenter@bwssb.gov.in</a>.<br>
              <span class="text-danger fw-semibold">SafaiMitra Helpline: 14420</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded-3 bg-body border h-100">
            <div class="badge bg-warning-subtle text-warning fw-bold mb-2">Level 2</div>
            <div class="fw-bold" style="font-size:0.88rem;">Area Sub-Division (AEE & AE)</div>
            <div class="text-secondary mt-1" style="font-size:0.78rem; line-height:1.5;">
              If SLA breaches, contact your local Service Station AE or Assistant Executive Engineer (AEE) listed in the directory below.
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded-3 bg-body border h-100">
            <div class="badge bg-danger-subtle text-danger fw-bold mb-2">Level 3</div>
            <div class="fw-bold" style="font-size:0.88rem;">Division Office (EE)</div>
            <div class="text-secondary mt-1" style="font-size:0.78rem; line-height:1.5;">
              Escalate your unique complaint reference number to the jurisdictional Executive Engineer (EE) managing your division.
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded-3 bg-body border h-100">
            <div class="badge bg-purple-subtle text-purple fw-bold mb-2" style="background:#f3e8ff; color:#7e22ce;">Level 4</div>
            <div class="fw-bold" style="font-size:0.88rem;">Zonal Office (Chief Engineer)</div>
            <div class="text-secondary mt-1" style="font-size:0.78rem; line-height:1.5;">
              Final operational escalation goes to regional Chief Engineer (CE) at Cauvery Bhavan, KG Road.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Official Service Stations & Officers Directory -->
    <div class="nb-card">
      <div class="nb-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="fw-bold display-font" style="font-size:1.05rem;"><i class="bi bi-geo-alt-fill text-primary me-2"></i>BWSSB Service Stations, Sub-Divisions & Division Directory</div>
        <a href="${directoryData.serviceStationsOfficialUrl || 'https://bwssb.karnataka.gov.in/7/service-station/en'}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary fw-semibold px-3 py-1.5" style="font-size:0.78rem;">
          <i class="bi bi-box-arrow-up-right me-1.5"></i>BWSSB Service Station Directory
        </a>
      </div>
      <div class="nb-card-body p-4">

        <!-- Search Bar -->
        <div class="mb-4">
          <div class="input-group">
            <span class="input-group-text bg-body-tertiary border-end-0 ps-3 text-secondary"><i class="bi bi-search"></i></span>
            <input type="text" id="bwssbDirSearch" class="form-control border-start-0 py-2.5 ps-1" placeholder="Search by area, station name, AEE/EE name or phone number..." oninput="window.__filterBwssbDir()" style="font-size:0.88rem;" />
          </div>
        </div>

        <!-- Zonal Grid Accordions -->
        <div class="row g-4" id="bwssbDirGrid">
          ${zones.map(z => `
          <div class="col-lg-6 bwssb-dir-card" data-search="${(z.name + ' ' + (z.ee?.name || '') + ' ' + z.subDivisions.map(sd => sd.code + ' ' + sd.aee?.name + ' ' + sd.stations.map(s => s.name + ' ' + s.contact).join(' ')).join(' ')).toLowerCase()}">
            <div class="border rounded-3 h-100 bg-body text-start overflow-hidden">
              
              <!-- Zone Header -->
              <div class="p-3 bg-body-tertiary border-bottom d-flex align-items-center justify-content-between">
                <div>
                  <h6 class="fw-bold mb-0 text-primary" style="font-size:0.95rem;">${z.name}</h6>
                  <div class="text-secondary mt-0.5" style="font-size:0.75rem;">${z.subDivisions.length} Sub-Divisions · ${z.subDivisions.reduce((acc, curr) => acc + curr.stations.length, 0)} Service Stations</div>
                </div>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.7rem;">Division EE Office</span>
              </div>

              <div class="p-3">
                <!-- Division EE Info -->
                ${z.ee ? `
                <div class="p-3 mb-3 bg-primary-subtle bg-opacity-10 border border-primary-subtle rounded-3">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-person-badge text-primary me-1.5"></i>EE: ${z.ee.name}</span>
                    <span class="badge bg-primary text-white" style="font-size:0.65rem;">Executive Engineer</span>
                  </div>
                  <div class="text-secondary mb-2" style="font-size:0.78rem;">${z.ee.address}</div>
                  <div class="d-flex gap-3 flex-wrap" style="font-size:0.78rem;">
                    ${z.ee.mobile ? `<span><i class="bi bi-phone text-success me-1"></i><a href="tel:${z.ee.mobile}" class="text-decoration-none text-body fw-semibold">${z.ee.mobile}</a></span>` : ''}
                    ${z.ee.officePhone ? `<span><i class="bi bi-telephone text-secondary me-1"></i>${z.ee.officePhone}</span>` : ''}
                    ${z.ee.email && z.ee.email !== '—' ? `<span><i class="bi bi-envelope text-primary me-1"></i><a href="mailto:${z.ee.email}" class="text-decoration-none text-primary">${z.ee.email}</a></span>` : ''}
                  </div>
                </div>` : ''}

                <!-- Sub-Divisions & Service Stations -->
                <div class="d-flex flex-column gap-3">
                  ${z.subDivisions.map(sd => `
                  <div class="p-3 border rounded-3 bg-body-tertiary">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <span class="fw-bold text-dark" style="font-size:0.85rem;"><i class="bi bi-diagram-2 text-warning me-1.5"></i>Sub-Division: ${sd.code}</span>
                      <span class="badge bg-warning-subtle text-warning border border-warning-subtle" style="font-size:0.68rem;">AEE Office</span>
                    </div>
                    ${sd.aee ? `
                    <div class="mb-2 text-secondary" style="font-size:0.78rem;">
                      <strong>AEE: ${sd.aee.name}</strong> · ${sd.aee.address}<br>
                      ${sd.aee.mobile ? `<i class="bi bi-phone me-1 text-success"></i><a href="tel:${sd.aee.mobile}" class="text-decoration-none text-body fw-semibold me-2">${sd.aee.mobile}</a>` : ''}
                      ${sd.aee.officePhone ? `<i class="bi bi-telephone me-1"></i>${sd.aee.officePhone} ` : ''}
                      ${sd.aee.email && sd.aee.email !== '—' ? `<i class="bi bi-envelope me-1 text-primary"></i><a href="mailto:${sd.aee.email}" class="text-decoration-none text-primary">${sd.aee.email}</a>` : ''}
                    </div>` : ''}

                    <!-- Stations List -->
                    ${sd.stations.length > 0 ? `
                    <div class="table-responsive border rounded-2 bg-body mt-2">
                      <table class="table table-sm align-middle mb-0" style="font-size:0.78rem;">
                        <thead class="table-light">
                          <tr>
                            <th class="py-1.5 ps-2">Service Station</th>
                            <th class="py-1.5">AE / JE Contact</th>
                            <th class="py-1.5 pe-2 text-end">Phone / Mobile</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${sd.stations.map(st => `
                          <tr>
                            <td class="ps-2 py-1.5 fw-semibold text-body">${st.name}</td>
                            <td class="py-1.5 text-secondary">${st.contact || 'On-Duty Engineer'}</td>
                            <td class="pe-2 py-1.5 text-end text-nowrap">
                              ${st.mobile ? `<a href="tel:${st.mobile}" class="text-decoration-none fw-bold text-success me-1"><i class="bi bi-phone me-0.5"></i>${st.mobile}</a>` : ''}
                              ${st.officePhone && st.officePhone !== '—' ? `<span class="text-secondary ms-1" style="font-size:0.72rem;">(${st.officePhone})</span>` : ''}
                            </td>
                          </tr>`).join('')}
                        </tbody>
                      </table>
                    </div>` : '<div class="text-secondary opacity-75" style="font-size:0.75rem;">Service station details mapped under AEE sub-division.</div>'}

                  </div>`).join('')}
                </div>

              </div>
            </div>
          </div>`).join('')}
        </div>

      </div>
    </div>

    <!-- BWSSB Senior Management Contacts Directory Table -->
    <div class="nb-card">
      <div class="nb-card-header d-flex align-items-center justify-content-between">
        <span><i class="bi bi-building-fill text-primary me-2"></i>BWSSB Headquarters & Chief Engineers Directory</span>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.75rem;">Cauvery Bhavan, KG Road</span>
      </div>
      <div class="nb-card-body p-3">
        <div class="table-responsive border rounded-3">
          <table class="table table-hover table-sm mb-0 align-middle" style="font-size:0.84rem;">
            <thead class="table-light">
              <tr>
                <th scope="col" class="py-2 px-3">Name</th>
                <th scope="col" class="py-2 px-3">Designation</th>
                <th scope="col" class="py-2 px-3">Office Address</th>
                <th scope="col" class="py-2 px-3">Phone</th>
                <th scope="col" class="py-2 px-3">Email</th>
              </tr>
            </thead>
            <tbody>
              ${seniorManagement.map(sm => `
              <tr>
                <td class="px-3 fw-bold text-body">${sm.name}</td>
                <td class="px-3 text-primary fw-medium">${sm.desig}</td>
                <td class="px-3 text-secondary" style="font-size:0.78rem;">${sm.address}</td>
                <td class="px-3 text-nowrap"><a href="tel:${sm.phone}" class="text-decoration-none fw-semibold text-body"><i class="bi bi-telephone text-success me-1"></i>080-${sm.phone}</a></td>
                <td class="px-3 text-nowrap"><a href="mailto:${sm.email}" class="text-decoration-none text-primary"><i class="bi bi-envelope me-1"></i>${sm.email}</a></td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BWSSB High-Level Technical Committee -->
    <div class="nb-card">
      <div class="nb-card-header d-flex align-items-center justify-content-between">
        <span><i class="bi bi-award-fill text-warning me-2"></i>BWSSB High-Level Technical Committee</span>
        <span class="badge bg-warning-subtle text-warning border border-warning-subtle" style="font-size:0.75rem;">Advisory Board</span>
      </div>
      <div class="nb-card-body p-3">
        <div class="table-responsive border rounded-3">
          <table class="table table-hover table-sm mb-0 align-middle" style="font-size:0.84rem;">
            <thead class="table-light">
              <tr>
                <th scope="col" class="py-2 px-3">Member Name</th>
                <th scope="col" class="py-2 px-3">Committee Role</th>
                <th scope="col" class="py-2 px-3">Designation / Affiliation</th>
              </tr>
            </thead>
            <tbody>
              ${(directoryData.technicalCommittee?.members || []).map(m => `
              <tr>
                <td class="px-3 fw-bold text-body">${m.name}</td>
                <td class="px-3"><span class="badge ${m.role === 'Chairman' ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}">${m.role}</span></td>
                <td class="px-3 text-secondary">${m.desig}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>`;
}

// Global Directory Filter Helper Function
if (typeof window !== 'undefined') {
  window.__filterBwssbDir = function () {
    const q = (document.getElementById('bwssbDirSearch')?.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.bwssb-dir-card');
    cards.forEach(c => {
      const text = c.getAttribute('data-search') || '';
      if (!q || text.includes(q)) {
        c.classList.remove('d-none');
      } else {
        c.classList.add('d-none');
      }
    });
  };
}

export function renderSteps(typeObj) {
  const steps = typeObj?.steps || [];
  return `
  <div class="nb-timeline pt-1">
    ${steps.map((s, idx) => `
    <div class="nb-timeline-item ${idx === steps.length - 1 ? 'is-last' : ''}">
      <div class="nb-timeline-badge">${s.step}</div>
      <div class="nb-timeline-content text-start">
        <div class="fw-bold" style="font-size:0.95rem;">${s.action || s.title || ''}</div>
        ${s.sla ? `<div class="text-secondary mt-1" style="font-size:0.82rem;"><i class="bi bi-clock me-1 text-primary"></i>SLA: <strong>${s.sla}</strong></div>` : ''}
        ${s.details ? `<div class="text-secondary mt-1" style="font-size:0.84rem; line-height:1.6;">${s.details}</div>` : ''}
        ${s.link ? `<a href="${s.link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary mt-2 py-1 px-3" style="font-size:0.78rem;"><i class="bi bi-box-arrow-up-right me-2"></i>Take Action</a>` : ''}
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
        <div class="fw-bold" style="font-size:0.9rem;">NammaBengaluru AI</div>
        <div style="font-size:0.72rem; color:var(--nb-emerald);">Online — ${activeCount} active keys in crowd pool</div>
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
        <input type="text" class="nb-chat-input" id="chatIn" placeholder="Ask about BWSSB water bill, tariff slabs, complaints..." onkeydown="if(event.key==='Enter')window.__send()" />
        <button class="nb-chat-send" id="chatSendBtn" onclick="window.__send()"><i class="bi bi-send-fill"></i></button>
      </div>
    </div>
  </div>`;
}
