import { renderBreadcrumb } from './comingSoonPage.js';
import { renderSocialFeed } from './bwssbPage.js';
import tariffData from '../data/bescom/tariffs.json';
import noticesData from '../data/bescom/notices.json';
import complaintsData from '../data/bescom/complaints.json';
import servicesData from '../data/bescom/services.json';
import bescomPlannedOutages from '../data/bescom/planned_outages.json';
import { calcDomesticElectricityBill, calcCommercialElectricityBill } from '../services/bescomCalculator.js';
import { queryGemini, getKeyPool } from '../services/keyPool.js';
import { renderOutageWidget, renderPlannedOutagesWidget, renderCrowdReportsWidget } from '../components/outageWidget.js';
import { getOutageReports } from '../services/outageStore.js';
import CanvasJSModule from '@canvasjs/charts';
const CanvasJS = CanvasJSModule.CanvasJS || CanvasJSModule.default || CanvasJSModule;

export function renderBESCOMPage(dept, state, lang) {
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
  <div class="nb-dept-hero nb-dept-hero-bescom">
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
          <p class="text-white-50 mb-0 mt-1" style="font-size:0.95rem;">Official source for electricity tariff, outages, and services in Bengaluru.</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap mt-4">
        <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary shadow-sm rounded-pill px-3 py-2 fw-medium d-inline-flex d-lg-none align-items-center gap-2" style="font-size:0.8rem;" title="Toggle Sidebar Navigation">
          <i class="bi bi-list fs-5"></i> <span>${dept.name} Menu</span>
        </button>
        <a href="https://bescom.co.in" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-globe me-1"></i> Official Website
        </a>
        <a href="tel:1912" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-telephone me-1 text-success"></i> Customer Care (1912)
        </a>
        <a href="https://twitter.com/NammaBESCOM" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-tertiary" style="width:34px; height:34px; backdrop-filter:blur(4px);">
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
      <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary fw-semibold rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2" style="font-size:0.82rem;">
        <i class="bi bi-list fs-5"></i>
        <span>${dept.name} Menu</span>
      </button>
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style="font-size:0.75rem;">
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
      return renderPlannedOutagesWidget('bescom');
    case 'crowd-reports':
      return renderCrowdReportsWidget('bescom');
    case 'notices': return renderNotices(state);
    case 'social': return renderSocialFeed('bescom');
    case 'complaint': return renderComplaint(state);
    case 'ai': return renderAI(state);
    default: return renderOverview(state, lang, dept);
  }
}

export function renderOverview(state, lang, dept) {
  const firstSlab = tariffData?.domestic?.slabs?.[0] || { rate: 4.75, from: 0, to: 50, label: 'Slab 1' };
  const bescomReports = getOutageReports('bescom') || [];
  const plannedCount = Array.isArray(bescomPlannedOutages) ? bescomPlannedOutages.length : 0;
  const crowdCount = bescomReports.length;

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
          <p class="text-secondary mb-3 mt-1" style="font-size:0.75rem; line-height:1.4;">Calculate your estimated electricity bill.</p>
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
          <div class="fs-5 fw-bold text-body">₹${firstSlab.rate.toFixed(2)} <span class="text-secondary fw-normal fs-6">/Unit</span></div>
          <p class="text-secondary mb-2" style="font-size:0.7rem;">${firstSlab.from}-${firstSlab.to || '50'} Units (${firstSlab.label})</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">View All Tariffs &rarr;</div>
        </div>
      </div>
      <!-- Planned Outages Card -->
      <div class="col-lg-3 col-md-6">
        <div class="nb-card h-100 p-3 text-start hover-shadow-sm" style="cursor:pointer;" onclick="window.__tab('planned-outages')">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-calendar-event"></i></div>
            <div class="fw-bold" style="font-size:0.85rem;">Planned Outages</div>
          </div>
          <div class="fs-5 fw-bold text-body">${plannedCount}</div>
          <p class="text-secondary mb-2" style="font-size:0.7rem;">Active scheduled maintenance</p>
          <div class="text-primary fw-semibold mt-auto" style="font-size:0.75rem;">View All Planned &rarr;</div>
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
          <p class="text-secondary mb-2" style="font-size:0.7rem;">Citizen reports in last 24 hrs</p>
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
                <div class="text-secondary" style="font-size:0.75rem;">File complaint online or via app</div>
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
                <div class="text-secondary mb-2 text-truncate" style="font-size:0.65rem;">${(s.documents||[]).map(d=>d.name).join(', ')}</div>
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
            <a href="https://x.com/NammaBESCOM" target="_blank" rel="noopener" class="d-flex gap-2 text-decoration-none text-body hover-bg-tertiary p-2 rounded-3 transition-all">
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:28px;height:28px;"><i class="bi bi-twitter-x"></i></div>
              <div>
                <div class="fw-bold text-body mb-1" style="font-size:0.8rem;">BESCOM <i class="bi bi-patch-check-fill text-primary" style="font-size:0.7rem;"></i> <span class="text-secondary fw-normal">@NammaBESCOM</span></div>
                <div class="text-secondary mb-2" style="font-size:0.75rem; line-height:1.4;">24x7 Helpline 1912 operational for reporting power failures, feeder trips & street light complaints.</div>
                <div class="d-flex align-items-center justify-content-between text-secondary" style="font-size:0.7rem;">
                  <span><i class="bi bi-arrow-repeat me-1"></i> Live Official Feed</span>
                  <span class="text-primary fw-semibold">View on X &rarr;</span>
                </div>
              </div>
            </a>
            <div class="border-top pt-2">
              <a href="https://www.facebook.com/bescomblr" target="_blank" rel="noopener" class="d-flex gap-2 text-decoration-none text-body hover-bg-tertiary p-2 rounded-3 transition-all">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:28px;height:28px;"><i class="bi bi-facebook"></i></div>
                <div>
                  <div class="fw-bold text-body mb-1" style="font-size:0.8rem;">BESCOM Official Page</div>
                  <div class="text-secondary mb-2" style="font-size:0.75rem; line-height:1.4;">Check official announcements for solar rooftop subsidies and EV charging station tariffs.</div>
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
            <select class="form-select py-2 px-3" id="connType" onchange="window.__calc('type', this.value)" style="border-radius:12px;">
              <option value="domestic"   ${f.type === 'domestic' ? 'selected' : ''}>Domestic (LT-2(a))</option>
              <option value="commercial" ${f.type === 'commercial' ? 'selected' : ''}>Commercial (LT-3)</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="loadInput">Sanctioned Load (kW)</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control py-2 px-3" id="loadInput"
                min="1" max="100" step="1" value="${f.sanctionedLoad || 1}" style="border-top-left-radius:12px; border-bottom-left-radius:12px;"
                oninput="window.__calc('sanctionedLoad', parseFloat(this.value)||1)" />
              <span class="input-group-text fw-bold px-3 bg-body-tertiary" style="font-size:0.85rem; border-top-right-radius:12px; border-bottom-right-radius:12px;">kW</span>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold text-secondary" style="font-size:0.84rem; text-transform:uppercase; letter-spacing:0.04em;" for="consumptionInput">Monthly Consumption</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control py-2 px-3" id="consumptionInput"
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

          <button class="btn btn-primary w-100 py-2 mb-2 fw-semibold" onclick="window.__downloadPDF()" style="font-size:0.88rem;">
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Save Estimate as PDF
          </button>
          <a href="https://bescom.co.in/bescom/main/quick-payment" target="_blank" rel="noopener" class="btn btn-success w-100 py-2 fw-semibold" style="font-size:0.88rem;">
            <i class="bi bi-lightning-charge-fill me-2"></i> Pay BESCOM Bill Online (Quick Payment)
          </a>
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
              <th class="py-2" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Charge Item</th>
              <th class="py-2" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Details</th>
              <th class="py-2 text-end" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Amount</th>
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
          dataPoints: d.map((s, i) => ({ label: `Slab ${i + 1}`, y: s.rate }))
        },
        {
          type: 'column',
          name: 'Commercial (LT-3)',
          showInLegend: true,
          color: '#3b82f6',
          dataPoints: c.map((s, i) => ({ label: `Slab ${i + 1}`, y: s.rate }))
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
              ${s.isOnlineAvailable === false
                ? `<span class="badge bg-warning-subtle text-warning border border-warning-subtle ms-2 flex-shrink-0" style="font-size:0.68rem;"><i class="bi bi-building me-1"></i>Offline SDO</span>`
                : (s.badge ? `<span class="badge bg-success-subtle text-success border border-success-subtle ms-2 flex-shrink-0" style="font-size:0.68rem;">${s.badge}</span>` : '')}
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
            ${selected.isOnlineAvailable === false
              ? `<span class="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2" style="font-size:0.78rem;"><i class="bi bi-building me-1"></i>Offline — Visit SDO Office</span>`
              : (selected.onlineLink ? `
            <a href="${selected.onlineLink}" target="_blank" rel="noopener" class="btn btn-sm btn-primary fw-semibold px-3 py-2" style="font-size:0.8rem;">
              <i class="bi bi-box-arrow-up-right me-2"></i>Apply Online (${selected.officialPortalName || 'Seva Sindhu'})
            </a>` : '')}
          </div>
        </div>
        <div class="nb-card-body p-4">
          <p class="text-secondary mb-4" style="font-size:0.9rem; line-height:1.6;">${selected.description}</p>

          ${selected.isOnlineAvailable === false ? `
          <!-- Offline SDO Callout -->
          <div class="p-3 mb-4 rounded-3 bg-warning-subtle border border-warning-subtle text-start" style="font-size:0.82rem;">
            <div class="fw-bold mb-1 d-flex align-items-center gap-2 text-warning-emphasis" style="font-size:0.9rem;">
              <i class="bi bi-building-fill text-warning"></i>
              <span>Physical Offline Process — Visit Your Nearest BESCOM SDO</span>
            </div>
            <div class="text-dark" style="line-height:1.55;">This service <strong>cannot be applied online</strong>. You must personally visit your concerned local <strong>BESCOM Sub-Division Office (SDO)</strong> with physical documents and original IDs for verification. Online submission is not accepted for this application type.</div>
          </div>` : ''}

          ${selected.eligibility && selected.eligibility.length > 0 ? `
          <!-- Janasnehi Eligibility & Exclusions Grid -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <div class="p-3 rounded-3 bg-success-subtle text-success border border-success-subtle h-100">
                <div class="fw-bold mb-2 d-flex align-items-center gap-2" style="font-size:0.84rem;">
                  <i class="bi bi-check-circle-fill"></i>
                  <span>Eligible Services (Janasnehi Fast Track)</span>
                </div>
                <ul class="mb-0 ps-3 text-start" style="font-size:0.78rem; line-height:1.55;">
                  ${selected.eligibility.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>

            <div class="col-md-6">
              <div class="p-3 rounded-3 bg-danger-subtle text-danger border border-danger-subtle h-100">
                <div class="fw-bold mb-2 d-flex align-items-center gap-2" style="font-size:0.84rem;">
                  <i class="bi bi-x-circle-fill"></i>
                  <span>Not Eligible Under Fast Track</span>
                </div>
                <ul class="mb-0 ps-3 text-start" style="font-size:0.78rem; line-height:1.55;">
                  ${(selected.exclusions || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>` : ''}

          ${selected.complianceRules && selected.complianceRules.length > 0 ? `
          <!-- Mandatory Compliance Rules -->
          <div class="p-3 mb-4 rounded-3 bg-body-tertiary border text-start">
            <div class="fw-bold text-body mb-2 d-flex align-items-center gap-2" style="font-size:0.84rem;">
              <i class="bi bi-shield-lock-fill text-primary"></i>
              <span>Mandatory Provisioning & Compliance Requirements</span>
            </div>
            <ul class="mb-0 ps-3 text-secondary" style="font-size:0.78rem; line-height:1.55;">
              ${selected.complianceRules.map(r => `<li class="mb-1">${r}</li>`).join('')}
            </ul>
          </div>` : ''}

          ${selected.refundPolicy ? `
          <!-- Refund & Rejection Policy -->
          <div class="p-3 mb-4 rounded-3 bg-warning-subtle text-dark border border-warning-subtle text-start" style="font-size:0.78rem; line-height:1.55;">
            <div class="fw-bold mb-1 d-flex align-items-center gap-2 text-warning-emphasis" style="font-size:0.84rem;">
              <i class="bi bi-info-circle-fill text-warning me-1"></i>
              <span>Refund & Rejection Rules</span>
            </div>
            <div>${selected.refundPolicy}</div>
          </div>` : ''}

          <!-- Interactive Document Checklist -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-card-checklist text-primary me-2"></i>Required Documents Checklist (Check items you have ready)
            </h6>
            <div class="d-flex flex-column gap-2">
              ${(selected.documents || []).map((doc, idx) => `
              <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-start justify-content-between gap-2">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="doc_bescom_${idx}" onchange="window.__toggleDoc(this)" />
                  <label class="form-check-label ms-2 fw-medium" for="doc_bescom_${idx}" style="font-size:0.86rem; cursor:pointer;">
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
        ${s.link ? `<a href="${s.link}" target="_blank" rel="noopener" class="btn btn-sm mt-2 py-1 px-3 btn-outline-primary" style="font-size:0.78rem;"><i class="bi bi-box-arrow-up-right me-2"></i>Take Action</a>` : ''}
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
