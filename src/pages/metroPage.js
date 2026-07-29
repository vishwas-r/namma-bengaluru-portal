import stationsData from '../data/metro/stations.json';
import faresData from '../data/metro/fares.json';
import noticesData from '../data/metro/notices.json';
import { calculateMetroJourney, getGoogleMapsTransitDirUrl, getGoogleMapsStationUrl, getGoogleMapsEmbedUrl } from '../services/metroEngine.js';

export function renderMetroPage(dept, state, lang) {
  const activeTab = state.activeTab || 'calculator';

  const tabTitles = {
    overview: 'Overview & Network',
    calculator: 'Fare & Route Calculator',
    'live-stations': 'Live Stations & Google Maps',
    'smart-card': 'Smart Card & QR Tickets',
    tariff: 'Tariff & Passes',
    notices: 'Notices & Service Alerts',
    complaint: 'Helpline & Lost & Found'
  };
  const activeTabName = tabTitles[activeTab] || 'Overview';

  return `
  <div class="nb-dept-hero nb-dept-hero-metro">
    <div class="container nb-dept-hero-content text-start position-relative z-1">
      <div class="mb-2">
        <a href="#/" class="text-white-50 text-decoration-none" style="font-size:0.8rem;"><i class="bi bi-house me-1"></i>Home</a>
        <span class="text-white-50 mx-2">/</span>
        <span class="text-white fw-medium" style="font-size:0.8rem;">${dept.name}</span>
      </div>
      <div class="d-flex align-items-center gap-3 flex-wrap mb-3 mt-1">
        <div class="nb-dept-hero-icon mb-0 d-flex align-items-center justify-content-center bg-white shadow-sm" style="width:64px; height:64px; border-radius:14px; color:#7c3aed;">
          <i class="bi bi-train-front" style="font-size:2.2rem;"></i>
        </div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <h1 class="fw-bold text-white mb-0" style="font-size:2rem; letter-spacing:-0.02em;">Namma Metro (BMRCL)</h1>
            <i class="bi bi-patch-check-fill text-primary fs-4" title="Official Transit Source"></i>
          </div>
          <p class="text-white-50 mb-0 mt-1" style="font-size:0.95rem;">Bengaluru Rapid Transit Rail Network — Fares, Google Maps Transit, Route Pathfinder & Station Guide.</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap mt-4">
        <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary shadow-sm rounded-pill px-3 py-2 fw-medium d-inline-flex d-lg-none align-items-center gap-2" style="font-size:0.8rem; background:#7c3aed; border-color:#7c3aed;">
          <i class="bi bi-list fs-5"></i> <span>Metro Menu</span>
        </button>
        <a href="https://english.bmrc.co.in" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-globe me-1"></i> Official Website
        </a>
        <a href="https://wa.me/918105556677?text=Hi" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-whatsapp me-1 text-success"></i> WhatsApp Tickets (+91 81055 56677)
        </a>
        <a href="tel:180042512345" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-telephone me-1 text-warning"></i> Helpline (1800-425-12345)
        </a>
      </div>
    </div>
  </div>

  <!-- Sticky Mobile Department Bar (Visible on Mobile/Tablet only) -->
  <div class="d-lg-none bg-body border-bottom py-2 px-3 shadow-2xs sticky-top" style="top: 56px; z-index: 1010;">
    <div class="d-flex align-items-center justify-content-between gap-2">
      <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary fw-semibold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-2" style="font-size:0.82rem; background:#7c3aed; border-color:#7c3aed;">
        <i class="bi bi-list fs-5"></i>
        <span>Metro Menu</span>
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
  </div>

  <!-- Global Disruption Report Modal -->
  <div class="modal fade" id="nbMetroReportModal" tabindex="-1" aria-hidden="true" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content text-start shadow-lg border-0">
        <div class="modal-header bg-warning-subtle py-3 border-warning border-bottom">
          <h5 class="modal-title fw-bold text-dark mb-0"><i class="bi bi-exclamation-triangle-fill me-2 text-warning"></i>Report Metro Delay or Service Disruption</h5>
          <button type="button" class="btn-close" onclick="window.__closeMetroReportModal()"></button>
        </div>
        <div class="modal-body p-4">
          <form onsubmit="window.__submitMetroCrowdReport(event)">
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">AFFECTED METRO LINE</label>
              <select id="reportLineSelect" class="form-select">
                <option value="purple">🟣 Purple Line (Challaghatta ↔ Whitefield)</option>
                <option value="green">🟢 Green Line (Madavara ↔ Silk Institute)</option>
                <option value="yellow">🟡 Yellow Line (RV Road ↔ Bommasandra)</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">AFFECTED STATION / LOCATION</label>
              <input type="text" id="reportStationInput" class="form-control" placeholder="e.g. Majestic, MG Road, Whitefield, Indiranagar" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">DISRUPTION TYPE</label>
              <select id="reportCategorySelect" class="form-select">
                <option value="delay">⏱️ Train Delay (5-15 Mins)</option>
                <option value="halted">🛑 Service Halted / Technical Failure</option>
                <option value="crowd">🚨 Heavy Overcrowding / Long AFC Gate Queue</option>
                <option value="outage">🚪 Lift / Escalator Outage</option>
                <option value="normal">🟢 Service Recovered to Normal</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">DESCRIPTION / COMMENTS</label>
              <textarea id="reportCommentInput" class="form-control" rows="3" placeholder="Describe the current situation, delay length, or platform condition..." required></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" class="btn btn-secondary rounded-pill px-4" onclick="window.__closeMetroReportModal()">Cancel</button>
              <button type="submit" class="btn btn-warning rounded-pill px-4 fw-bold text-dark">Submit Report</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderTab(state, lang, dept) {
  const activeTab = state.activeTab || 'calculator';
  switch (activeTab) {
    case 'overview':
      return renderOverviewTab(state, lang);
    case 'calculator':
      return renderCalculatorTab(state, lang);
    case 'live-stations':
      return renderLiveStationsTab(state, lang);
    case 'smart-card':
      return renderSmartCardTab(state, lang);
    case 'tariff':
      return renderTariffTab(state, lang);
    case 'notices':
      return renderNoticesTab(state, lang);
    case 'complaint':
      return renderComplaintTab(state, lang);
    default:
      return renderCalculatorTab(state, lang);
  }
}

// ── TAB 1: OVERVIEW ─────────────────────────────────────────
function renderOverviewTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4">
    <!-- Hero Stats Row -->
    <div class="row g-3">
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-primary">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">NETWORK LENGTH</div>
          <div class="fs-4 fw-bold text-body">73.81 km</div>
          <div class="text-secondary" style="font-size:0.72rem;">Operational Corridors</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-success">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">ACTIVE STATIONS</div>
          <div class="fs-4 fw-bold text-body">66 Stations</div>
          <div class="text-secondary" style="font-size:0.72rem;">Purple & Green Lines</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-warning">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">DAILY RIDERSHIP</div>
          <div class="fs-4 fw-bold text-body">~7.5 Lakh</div>
          <div class="text-secondary" style="font-size:0.72rem;">Commuters Daily</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-info">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">QR & SMART CARD</div>
          <div class="fs-4 fw-bold text-success">5% Discount</div>
          <div class="text-secondary" style="font-size:0.72rem;">On Every Journey</div>
        </div>
      </div>
    </div>

    <!-- Quick Action Card -->
    <div class="nb-card p-4 text-start bg-primary-subtle border border-primary-subtle">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h5 class="fw-bold text-primary mb-1"><i class="bi bi-calculator me-2"></i>Calculate Metro Fare & Find Route</h5>
          <p class="text-secondary mb-0" style="font-size:0.88rem;">Select any two stations across Purple, Green, or Yellow lines to calculate token fare, smart card discount, and travel time.</p>
        </div>
        <button onclick="window.__tab('calculator')" class="btn btn-primary px-4 py-2 fw-semibold rounded-pill" style="background:#7c3aed; border-color:#7c3aed;">
          Open Fare Calculator &rarr;
        </button>
      </div>
    </div>

    <!-- Active Metro Lines Grid -->
    <div class="text-start">
      <h5 class="fw-bold mb-3"><i class="bi bi-signpost-split me-2 text-primary"></i>Operational & Upcoming Metro Lines</h5>
      <div class="row g-3">
        <!-- Purple Line -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-purple" style="border-left-color: #9333ea !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-purple text-white px-3 py-1" style="background:#9333ea;">🟣 Purple Line</span>
              <span class="badge bg-success-subtle text-success">100% Operational</span>
            </div>
            <h6 class="fw-bold mb-1">Challaghatta ↔ Whitefield (Kadugodi)</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">37 Stations · 43.49 km corridor connecting West Bengaluru to ITPL & East Tech Hubs.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Major Hubs: Majestic, MG Road, Indiranagar, KR Puram, ITPL</span>
            </div>
          </div>
        </div>
        <!-- Green Line -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-success">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-success text-white px-3 py-1">🟢 Green Line</span>
              <span class="badge bg-success-subtle text-success">100% Operational</span>
            </div>
            <h6 class="fw-bold mb-1">Madavara (BIEC) ↔ Silk Institute</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">31 Stations · 33.4 km North-South corridor connecting Tumakuru Road to Kanakapura Road.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Major Hubs: Yeshwanthpur, Rajajinagar, Majestic, Jayanagar, Banashankari</span>
            </div>
          </div>
        </div>
        <!-- Yellow Line -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-warning">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-warning text-dark px-3 py-1">🟡 Yellow Line</span>
              <span class="badge bg-info-subtle text-info">Opening Soon</span>
            </div>
            <h6 class="fw-bold mb-1">RV Road ↔ Bommasandra (Electronic City)</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">16 Stations · 19.15 km corridor serving Silk Board, BTM Layout, and Electronic City IT Hub.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Interchanges: RV Road (Green), Jayadeva (Pink), Silk Board (Blue)</span>
            </div>
          </div>
        </div>
        <!-- Blue & Pink Lines -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-info">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-info text-white px-3 py-1">🔵 Blue & 🔴 Pink Lines</span>
              <span class="badge bg-secondary-subtle text-secondary">Under Construction</span>
            </div>
            <h6 class="fw-bold mb-1">Airport Line & Kalena Agrahara ↔ Nagawara</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">Connecting Outer Ring Road (ORR), Hebbal, MG Road Underground, and Kempegowda International Airport (KIA).</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Phase 2A & 2B Expansion</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Official BMRCL Complete System Route Map Card -->
    <div class="nb-card p-4 text-start">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-map me-2 text-primary"></i>Official Namma Metro Complete System Route Map</h5>
          <p class="text-secondary mb-0" style="font-size:0.85rem;">Official BMRCL network sitemap showing operational & expansion corridors.</p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.8rem;">
          <button onclick="window.__openMetroMapModal()" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold" style="background:#7c3aed; border-color:#7c3aed;">
            <i class="bi bi-arrows-angle-expand me-1"></i> View Fullscreen Map
          </button>
          <a href="/namma-metro-sitemap.jpg" download class="btn btn-sm btn-outline-success rounded-pill px-3 py-1.5 fw-semibold">
            <i class="bi bi-download me-1"></i> Download Local Map (JPG)
          </a>
          <a href="https://www.bmrc.co.in/images/metro/travel-info/sitemapimg.jpg" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold">
            <i class="bi bi-box-arrow-up-right me-1"></i> Official BMRCL URL
          </a>
        </div>
      </div>
      <div class="position-relative rounded-3 overflow-hidden border shadow-2xs bg-dark text-center cursor-pointer" onclick="window.__openMetroMapModal()" style="max-height:420px;">
        <img src="/namma-metro-sitemap.jpg" alt="Namma Metro Complete System Sitemap Route Map" class="img-fluid w-100 object-fit-cover" style="max-height:420px; filter:brightness(0.95);" loading="lazy" />
        <div class="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 text-white d-flex align-items-center justify-content-between">
          <span style="font-size:0.82rem;"><i class="bi bi-info-circle me-1 text-warning"></i> Click image or button to expand in Fullscreen high-resolution mode</span>
          <span class="badge bg-primary rounded-pill px-3 py-1" style="background:#7c3aed;"><i class="bi bi-search me-1"></i> Click to Zoom</span>
        </div>
      </div>
    </div>

    <!-- Embedded Google Maps Interactive Network Map -->
    <div class="nb-card p-4 text-start">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1"><i class="bi bi-geo-alt me-2 text-primary"></i>Google Maps Live Namma Metro Transit View</h5>
          <p class="text-secondary mb-0" style="font-size:0.85rem;">Authentic live transit lines & station locations powered by Google Maps.</p>
        </div>
        <a href="https://www.google.com/maps/search/Namma+Metro+Stations+Bengaluru" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3">
          <i class="bi bi-box-arrow-up-right me-1"></i> Open Full Map on Google Maps
        </a>
      </div>
      <div class="rounded-3 overflow-hidden border shadow-2xs" style="height:380px;">
        <iframe src="https://maps.google.com/maps?q=Namma+Metro+Stations+Bengaluru&t=&z=12&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>

    <!-- Fullscreen Metro Sitemap Lightbox Modal -->
    <div class="modal fade" id="nbMetroMapModal" tabindex="-1" aria-hidden="true" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content bg-dark text-white border-0">
          <div class="modal-header border-secondary py-3 px-4 bg-dark">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-map text-primary fs-4" style="color:#a78bfa !important;"></i>
              <h5 class="modal-title fw-bold text-white mb-0">Namma Metro Official Complete System Route Map</h5>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="/namma-metro-sitemap.jpg" download class="btn btn-sm btn-success rounded-pill px-3">
                <i class="bi bi-download me-1"></i> Download Image
              </a>
              <button type="button" class="btn-close btn-close-white" onclick="window.__closeMetroMapModal()" aria-label="Close"></button>
            </div>
          </div>
          <div class="modal-body p-2 d-flex align-items-center justify-content-center bg-black overflow-auto" style="min-height: calc(100vh - 70px);">
            <img src="/namma-metro-sitemap.jpg" alt="Namma Metro Fullscreen Map" class="img-fluid rounded shadow-lg" style="max-height: 92vh; object-fit: contain;" />
          </div>
        </div>
    </div>
  </div>`;
}

// ── TAB 2: FARE & ROUTE CALCULATOR ──────────────────────────
function renderCalculatorTab(state, lang) {
  const sourceId = state.metroSource || 'majestic';
  const destId = state.metroDest || 'whitefield';

  const journey = calculateMetroJourney(sourceId, destId);

  const liveFare = state.liveMetroFare;
  const tokenFare = liveFare?.tokenFare !== undefined ? liveFare.tokenFare : journey?.tokenFare;
  const smartCardFare = liveFare?.smartCardFare !== undefined ? liveFare.smartCardFare : journey?.smartCardFare;

  return `
  <div class="d-flex flex-column gap-4">
    <!-- Calculator Input Box -->
    <div class="nb-card p-4 text-start shadow-sm">
      <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
        <div>
          <h5 class="fw-bold mb-0 text-primary"><i class="bi bi-calculator me-2"></i>Namma Metro Official Fare & Route Pathfinder</h5>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">Select origin and destination stations to fetch live BMRCL official fares, travel time, and Google Maps directions.</p>
        </div>
        <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5" style="font-size:0.75rem;">
          <i class="bi bi-shield-check me-1"></i>Official BMRCL Tariff Structure Sourced from bmrc.co.in
        </span>
      </div>

      <div class="row g-3 align-items-center">
        <!-- Source Selector -->
        <div class="col-md-5">
          <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">STARTING STATION (ORIGIN)</label>
          <select id="metroSourceSelect" class="form-select form-select-lg border-2" onchange="window.__onMetroStationChange()">
            ${stationsData.map(s => {
              const stationName = lang === 'kn' && s.kannadaName ? s.kannadaName : s.name;
              return `<option value="${s.id}" data-line="${s.line}" ${s.id === sourceId ? 'selected' : ''}>${stationName}</option>`;
            }).join('')}
          </select>
        </div>

        <!-- Swap Button -->
        <div class="col-md-2 text-center my-2 my-md-0">
          <button onclick="window.__swapMetroStations()" class="btn btn-outline-primary rounded-circle p-2 d-inline-flex align-items-center justify-content-center hover-shadow" style="width:44px; height:44px;" title="Swap Origin & Destination">
            <i class="bi bi-arrow-down-up fs-5"></i>
          </button>
        </div>

        <!-- Destination Selector -->
        <div class="col-md-5">
          <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">DESTINATION STATION</label>
          <select id="metroDestSelect" class="form-select form-select-lg border-2" onchange="window.__onMetroStationChange()">
            ${stationsData.map(s => {
              const stationName = lang === 'kn' && s.kannadaName ? s.kannadaName : s.name;
              return `<option value="${s.id}" data-line="${s.line}" ${s.id === destId ? 'selected' : ''}>${stationName}</option>`;
            }).join('')}
          </select>
        </div>
      </div>

      <!-- Action Calculate Button -->
      <div class="mt-4 text-center">
        <button type="button" onclick="window.__calculateMetroFare()" class="btn btn-primary btn-lg rounded-pill px-5 py-2.5 fw-bold shadow" style="background:#7c3aed; border-color:#7c3aed;">
          <i class="bi bi-calculator-fill me-2"></i>Calculate Fare & Route Pathfinder
        </button>
      </div>
    </div>

    ${journey ? `
    <!-- Journey Result Summary Cards -->
    <div class="row g-3">
      <!-- Token Fare -->
      <div class="col-6 col-lg-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-secondary">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">TOKEN / SINGLE FARE</div>
          <div class="fs-3 fw-bold text-body">₹${journey.tokenFare}</div>
          <div class="text-secondary" style="font-size:0.72rem;">Paper Token / Single Journey</div>
        </div>
      </div>
      <!-- Peak Hour CSC -->
      <div class="col-6 col-lg-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-primary">
          <div class="text-primary fw-semibold mb-1" style="font-size:0.75rem;">PEAK HOUR CSC (5% OFF)</div>
          <div class="fs-3 fw-bold text-primary">₹${journey.peakCscFare}</div>
          <div class="text-secondary" style="font-size:0.72rem;">Smart Card (Peak Hours)</div>
        </div>
      </div>
      <!-- Non-Peak Hour CSC -->
      <div class="col-6 col-lg-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-success bg-success-subtle bg-opacity-25">
          <div class="text-success fw-bold mb-1" style="font-size:0.75rem;">NON-PEAK CSC (10% OFF)</div>
          <div class="fs-3 fw-bold text-success">₹${journey.nonPeakCscFare}</div>
          <div class="text-success fw-semibold" style="font-size:0.72rem;">Smart Card / WhatsApp QR</div>
        </div>
      </div>
      <!-- Group Ticket -->
      <div class="col-6 col-lg-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-info">
          <div class="text-info-emphasis fw-bold mb-1" style="font-size:0.75rem;">GROUP TICKET (15% OFF)</div>
          <div class="fs-3 fw-bold text-info-emphasis">₹${journey.groupFare}</div>
          <div class="text-secondary" style="font-size:0.72rem;">Group Travel (10+ Commuters)</div>
        </div>
      </div>
    </div>

    <!-- Additional Route & Transfer Details -->
    <div class="row g-3">
      <!-- Travel Time -->
      <div class="col-md-6">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-dark d-flex align-items-center justify-content-between">
          <div>
            <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">ESTIMATED TRAVEL TIME</div>
            <div class="fs-4 fw-bold text-body">~${journey.estimatedTimeMins} Mins</div>
            <div class="text-secondary" style="font-size:0.75rem;">${journey.stationCount} Intermediate Stations</div>
          </div>
          <i class="bi bi-clock-history fs-1 text-secondary opacity-50"></i>
        </div>
      </div>
      <!-- Transfer Info -->
      <div class="col-md-6">
        <div class="nb-card p-3 text-start h-100 border-start border-4 ${journey.requiresInterchange ? 'border-warning' : 'border-success'} d-flex align-items-center justify-content-between">
          <div>
            <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">METRO LINE TRANSFER</div>
            <div class="fs-5 fw-bold ${journey.requiresInterchange ? 'text-warning' : 'text-success'}">
              ${journey.requiresInterchange ? '1 Transfer Required' : 'Direct (No Transfer Needed)'}
            </div>
            <div class="text-secondary" style="font-size:0.75rem;">
              ${journey.requiresInterchange ? 'Interchange at ' + journey.interchangeStationName : 'Same Metro Line Journey'}
            </div>
          </div>
          <i class="bi ${journey.requiresInterchange ? 'bi-arrow-left-right text-warning' : 'bi-check-circle-fill text-success'} fs-1 opacity-75"></i>
        </div>
      </div>
    </div>

    <!-- Station Parking Availability Summary -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="nb-card p-3 text-start bg-body-tertiary border">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-p-circle-fill text-primary me-1.5"></i>${journey.source.name} Parking</span>
            <span class="badge ${journey.source.parking?.hasParking ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}">${journey.source.parking?.hasParking ? 'Parking Available' : 'No Official Parking'}</span>
          </div>
          ${journey.source.parking?.hasParking ? `
            <div class="d-flex gap-3 text-secondary" style="font-size:0.8rem;">
              <span><strong>🛵 2-Wheeler:</strong> ${journey.source.parking.twoWheelerSlots} Slots</span>
              <span><strong>🚗 4-Wheeler:</strong> ${journey.source.parking.fourWheelerSlots ? journey.source.parking.fourWheelerSlots + ' Slots' : 'N/A'}</span>
            </div>
          ` : '<span class="text-secondary" style="font-size:0.8rem;">No official BMRCL parking lot at this station.</span>'}
        </div>
      </div>
      <div class="col-md-6">
        <div class="nb-card p-3 text-start bg-body-tertiary border">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-p-circle-fill text-primary me-1.5"></i>${journey.dest.name} Parking</span>
            <span class="badge ${journey.dest.parking?.hasParking ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}">${journey.dest.parking?.hasParking ? 'Parking Available' : 'No Official Parking'}</span>
          </div>
          ${journey.dest.parking?.hasParking ? `
            <div class="d-flex gap-3 text-secondary" style="font-size:0.8rem;">
              <span><strong>🛵 2-Wheeler:</strong> ${journey.dest.parking.twoWheelerSlots} Slots</span>
              <span><strong>🚗 4-Wheeler:</strong> ${journey.dest.parking.fourWheelerSlots ? journey.dest.parking.fourWheelerSlots + ' Slots' : 'N/A'}</span>
            </div>
          ` : '<span class="text-secondary" style="font-size:0.8rem;">No official BMRCL parking lot at this station.</span>'}
        </div>
      </div>
    </div>

    <!-- Google Maps Action Banner -->
    <div class="nb-card p-4 text-start bg-primary-subtle border border-primary-subtle">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="p-3 bg-white rounded-circle shadow-sm text-primary">
            <i class="bi bi-google fs-3"></i>
          </div>
          <div>
            <h6 class="fw-bold mb-1 text-body">View Live Transit Directions on Google Maps</h6>
            <p class="text-secondary mb-0" style="font-size:0.83rem;">Get live Google Maps transit route from <strong>${journey.source.name}</strong> to <strong>${journey.dest.name}</strong>.</p>
          </div>
        </div>
        <a href="${journey.googleMapsDirUrl}" target="_blank" rel="noopener" class="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm" style="background:#7c3aed; border-color:#7c3aed;">
          <i class="bi bi-box-arrow-up-right me-1"></i> Open Google Maps Transit &rarr;
        </a>
      </div>
    </div>

    ${journey.requiresInterchange ? `
    <!-- Interchange Guidance Box -->
    <div class="nb-card p-3.5 text-start border-warning bg-warning-subtle bg-opacity-30">
      <div class="d-flex gap-3">
        <i class="bi bi-arrow-repeat text-warning fs-3 flex-shrink-0"></i>
        <div>
          <h6 class="fw-bold text-dark mb-1">Interchange Transfer Required at ${journey.interchangeStationName}</h6>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">
            You are traveling from <strong>${journey.source.name}</strong> (${journey.source.line.toUpperCase()} Line) to <strong>${journey.dest.name}</strong> (${journey.dest.line.toUpperCase()} Line).
            De-board at <strong>${journey.interchangeStationName}</strong> and follow the color-coded floor signage to switch platforms. No extra ticket required!
          </p>
        </div>
      </div>
    </div>` : ''}

    <!-- Station By Station Route Pathfinder List -->
    <div class="nb-card p-4 text-start">
      <h6 class="fw-bold mb-3"><i class="bi bi-geo me-2 text-primary"></i>Station-by-Station Route List (${journey.stationsList.length} Stations)</h6>
      <div class="d-flex flex-column gap-2 position-relative ms-2 ps-3 border-start border-3 border-primary">
        ${journey.stationsList.map((st, idx) => `
          <div class="d-flex align-items-center justify-content-between p-2 rounded-2 ${idx === 0 || idx === journey.stationsList.length - 1 ? 'bg-primary-subtle fw-bold' : 'hover-bg-tertiary'}">
            <div class="d-flex align-items-center gap-3">
              <span class="badge ${st.line === 'purple' ? 'bg-purple' : st.line === 'green' ? 'bg-success' : 'bg-warning text-dark'}" style="${st.line === 'purple' ? 'background:#9333ea;' : ''}">
                ${idx + 1}
              </span>
              <div>
                <span class="text-body" style="font-size:0.88rem;">${st.name}</span>
                <span class="text-secondary ms-2" style="font-size:0.75rem;">${st.kannadaName}</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              ${st.isInterchange ? '<span class="badge bg-warning text-dark" style="font-size:0.68rem;"><i class="bi bi-arrow-repeat me-1"></i>Interchange Node</span>' : ''}
              <a href="${getGoogleMapsStationUrl(st.googleQuery || st.name + ' Metro Station Bengaluru')}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary py-1 px-2" style="font-size:0.72rem;" title="View on Google Maps">
                <i class="bi bi-geo-alt me-1 text-primary"></i>Maps
              </a>
            </div>
          </div>`).join('')}
      </div>
    </div>` : ''}
  </div>`;
}

// ── TAB 3: LIVE STATIONS & GOOGLE MAPS ──────────────────────
function renderLiveStationsTab(state, lang) {
  const selectedStationId = state.selectedMetroStationId || 'nagasandra';
  const selectedStation = stationsData.find(s => s.id === selectedStationId) || stationsData[0];
  const embedUrl = getGoogleMapsEmbedUrl(selectedStation.googleQuery || selectedStation.name + ' Metro Station Bengaluru');

  return `
  <div class="d-flex flex-column gap-4">
    <!-- Station Selector Header -->
    <div class="nb-card p-4 text-start">
      <div class="row g-3 align-items-center">
        <div class="col-md-6">
          <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-geo-alt me-2"></i>Metro Station Directory & Live Google Maps</h5>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">Select any station to view parking availability, lifts/escalators, BMTC feeder buses, and live Google Maps view.</p>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold text-secondary" style="font-size:0.78rem;">SELECT METRO STATION</label>
          <select id="metroLiveSelect" class="form-select form-select-lg" onchange="window.__selectMetroStation(this.value)">
            ${stationsData.map(s => {
              const stationName = lang === 'kn' && s.kannadaName ? s.kannadaName : s.name;
              return `<option value="${s.id}" data-line="${s.line}" ${s.id === selectedStationId ? 'selected' : ''}>${stationName}</option>`;
            }).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Selected Station Detail Card -->
    <div class="nb-card p-4 text-start">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="p-3 rounded-3 text-white fw-bold fs-4" style="background:${selectedStation.line === 'purple' ? '#9333ea' : selectedStation.line === 'green' ? '#16a34a' : '#eab308'};">
            <i class="bi bi-train-front"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0 text-body">${selectedStation.name}</h4>
            <div class="text-secondary" style="font-size:0.85rem;">${selectedStation.kannadaName} · <span class="text-uppercase fw-semibold text-primary">${selectedStation.line} Line</span></div>
          </div>
        </div>
        <a href="${getGoogleMapsStationUrl(selectedStation.googleQuery || selectedStation.name + ' Metro Station Bengaluru')}" target="_blank" rel="noopener" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold" style="background:#7c3aed; border-color:#7c3aed;">
          <i class="bi bi-box-arrow-up-right me-1"></i> Open Station on Google Maps
        </a>
      </div>

      <!-- Facilities Grid -->
      <div class="row g-3 mb-4">
        <!-- Parking Slots -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 bg-body-tertiary border text-start h-100">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-p-circle-fill fs-5 ${selectedStation.parking.hasParking ? 'text-success' : 'text-secondary'}"></i>
              <span class="fw-bold" style="font-size:0.88rem;">Parking Availability</span>
            </div>
            ${selectedStation.parking.hasParking ? `
              <div class="text-body fw-semibold" style="font-size:0.83rem;">
                🛵 2-Wheeler: <strong>${selectedStation.parking.twoWheelerSlots} Slots</strong>
              </div>
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                🚗 4-Wheeler: <strong>${selectedStation.parking.fourWheelerSlots > 0 ? selectedStation.parking.fourWheelerSlots + ' Slots' : 'No 4W Slots'}</strong>
              </div>
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                🚲 Bicycle: <strong>${selectedStation.parking.cycles || 10} Slots (FREE)</strong>
              </div>
              ${selectedStation.parking.lcv > 0 ? `
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                🚛 LCV: <strong>${selectedStation.parking.lcv} Slots</strong>
              </div>` : ''}` : `
              <div class="text-secondary" style="font-size:0.82rem;">No designated parking lot at this station</div>`}
          </div>
        </div>

        <!-- Accessibility -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 bg-body-tertiary border text-start h-100">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-person-wheelchair fs-5 text-primary"></i>
              <span class="fw-bold" style="font-size:0.88rem;">Accessibility & Lifts</span>
            </div>
            <div class="d-flex flex-wrap gap-1.5">
              <span class="badge ${selectedStation.accessibility.lift ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">
                <i class="bi bi-check-circle me-1"></i>Lifts Available
              </span>
              <span class="badge ${selectedStation.accessibility.escalator ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">
                <i class="bi bi-check-circle me-1"></i>Escalators
              </span>
              <span class="badge ${selectedStation.accessibility.wheelchair ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">
                <i class="bi bi-check-circle me-1"></i>Wheelchair Ramps
              </span>
            </div>
          </div>
        </div>

        <!-- Feeder Buses -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 bg-body-tertiary border text-start h-100">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-bus-front-fill fs-5 text-warning"></i>
              <span class="fw-bold" style="font-size:0.88rem;">BMTC Feeder Bus Routes</span>
            </div>
            <div class="d-flex flex-wrap gap-1">
              ${selectedStation.feederBuses.map(b => `<span class="badge bg-primary-subtle text-primary border">${b}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Official BMRCL Vehicle Parking Tariff Structure Card -->
      <div class="p-3.5 rounded-3 bg-primary-subtle border border-primary-subtle mb-4 text-start">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h6 class="fw-bold text-primary mb-0" style="font-size:0.88rem;"><i class="bi bi-info-circle me-1"></i>Official BMRCL Vehicle Parking Tariff Rates</h6>
          <a href="${faresData.parkingPolicy.officialUrl}" target="_blank" rel="noopener" class="text-primary text-decoration-none fw-semibold" style="font-size:0.78rem;">
            Source: BMRCL Official Parking Portal (bmrc.co.in/parking) &rarr;
          </a>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-bordered bg-white text-center align-middle mb-2" style="font-size:0.78rem;">
            <thead class="table-light">
              <tr>
                <th>Class of Vehicle</th>
                <th>First 4 Hours (₹)</th>
                <th>Subsequent Hour / Part (₹)</th>
                <th>Max Daily Rate (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="fw-semibold text-start ps-2">🛵 Two Wheeler</td><td>₹15</td><td>₹5</td><td class="fw-bold text-success">₹30</td></tr>
              <tr><td class="fw-semibold text-start ps-2">🛺 Three Wheeler</td><td>₹20</td><td>₹5</td><td class="fw-bold text-success">₹45</td></tr>
              <tr><td class="fw-semibold text-start ps-2">🚗 Car / 4 Wheeler</td><td>₹30</td><td>₹10</td><td class="fw-bold text-success">₹60</td></tr>
              <tr><td class="fw-semibold text-start ps-2">🚛 Light Commercial (LCV)</td><td>₹50</td><td>₹15</td><td class="fw-bold text-success">₹150</td></tr>
              <tr><td class="fw-semibold text-start ps-2">🚌 Heavy Passenger Bus</td><td>₹100</td><td>₹25</td><td class="fw-bold text-success">₹300</td></tr>
              <tr class="table-success"><td class="fw-bold text-start ps-2">🚲 Bicycle</td><td colspan="3" class="fw-bold text-success">FREE</td></tr>
            </tbody>
          </table>
        </div>
        <div class="text-secondary mt-1" style="font-size:0.75rem;">⚠️ <strong>Note</strong>: Overnight parking is NOT available at any BMRCL Metro station.</div>
      </div>

      <!-- Official BMRCL Disclaimer & Policy PDF Links Card -->
      <div class="p-3.5 rounded-3 bg-warning-subtle border border-warning mb-4 text-start">
        <div class="d-flex align-items-start gap-2.5">
          <i class="bi bi-shield-check text-warning fs-4 flex-shrink-0 mt-0.5"></i>
          <div>
            <div class="fw-bold text-dark mb-1" style="font-size:0.88rem;">Official Data Source Disclaimer & BMRCL Parking Policy Documents</div>
            <p class="text-secondary mb-2.5" style="font-size:0.81rem;">
              ${faresData.parkingPolicy.disclaimer}
            </p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <a href="${faresData.parkingPolicy.officialUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-dark rounded-pill px-3 py-1 fw-medium">
                <i class="bi bi-box-arrow-up-right me-1"></i> BMRCL Parking Portal (bmrc.co.in/parking)
              </a>
              <a href="${faresData.parkingPolicy.localPolicyPdf}" download target="_blank" class="btn btn-sm btn-danger rounded-pill px-3 py-1 fw-medium text-white" title="Download local copy of Parking Policy PDF">
                <i class="bi bi-download me-1"></i> Parking Policy (Local PDF)
              </a>
              <a href="${faresData.parkingPolicy.localPolicyOrderPdf}" download target="_blank" class="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-medium" style="background:#7c3aed; border-color:#7c3aed;" title="Download local copy of Parking Policy Order PDF">
                <i class="bi bi-download me-1"></i> Parking Policy Order (Local PDF)
              </a>
              <a href="${faresData.parkingPolicy.policyPdf}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-medium">
                <i class="bi bi-file-earmark-pdf me-1"></i> Official Policy PDF
              </a>
              <a href="${faresData.parkingPolicy.policyOrderPdf}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-medium">
                <i class="bi bi-file-earmark-text me-1"></i> Official Order PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Embedded Google Maps View -->
      <div class="rounded-3 overflow-hidden border shadow-2xs" style="height:360px;">
        <iframe src="${embedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
      </div>
    </div>
  </div>`;
}

// ── TAB 4: SMART CARD & QR TICKETS ──────────────────────────
function renderSmartCardTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Header Banner -->
    <div class="nb-card p-4 bg-primary-subtle border border-primary-subtle">
      <div class="d-flex align-items-center gap-3">
        <div class="p-3 bg-primary text-white rounded-circle flex-shrink-0">
          <i class="bi bi-qr-code-scan fs-3"></i>
        </div>
        <div>
          <h5 class="fw-bold text-primary mb-1">WhatsApp QR Ticketing & Smart Cards Guide</h5>
          <p class="text-secondary mb-0" style="font-size:0.88rem;">Save 5% on every trip with WhatsApp QR tickets or NCMC Metro Smart Cards.</p>
        </div>
      </div>
    </div>

    <!-- WhatsApp Guide Grid -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="nb-card p-4 h-100 border-start border-4 border-success">
          <h6 class="fw-bold mb-3 text-success"><i class="bi bi-whatsapp me-2"></i>How to Book Tickets via WhatsApp & Apps</h6>
          <ol class="ps-3 text-secondary d-flex flex-column gap-2" style="font-size:0.84rem;">
            <li>Save BMRCL Official WhatsApp Number: <strong>+91 81055 56677</strong>.</li>
            <li>Send <strong>"Hi"</strong> or <strong>"Namaskara"</strong> in WhatsApp chat.</li>
            <li>Select <strong>"QR Ticket"</strong> option from the interactive menu.</li>
            <li>Select Source & Destination stations. Pay via UPI (PhonePe, Google Pay, Paytm, BHIM) — <strong>Get 5% discount</strong>.</li>
            <li>QR tickets are also available on <strong>Paytm</strong> and <strong>Yatra App</strong>.</li>
            <li><strong>Refund Policy</strong>: 100% refund if cancelled before entering AFC gate (refunded within 7 days). No refund after gate entry.</li>
          </ol>
          <a href="https://wa.me/918105556677?text=Hi" target="_blank" rel="noopener" class="btn btn-success rounded-pill px-4 py-2 mt-2 fw-semibold">
            <i class="bi bi-whatsapp me-1"></i> Open WhatsApp Chat Now &rarr;
          </a>
        </div>
      </div>

      <div class="col-md-6">
        <div class="nb-card p-4 h-100 border-start border-4 border-primary">
          <h6 class="fw-bold mb-3 text-primary"><i class="bi bi-credit-card-2-front me-2"></i>Smart Cards (Varshik) & NCMC Rules</h6>
          <ul class="ps-3 text-secondary d-flex flex-column gap-2" style="font-size:0.84rem;">
            <li><strong>Card Price</strong>: Available for ₹50. (Travel value loaded separately in multiples of ₹50 up to ₹3,000 max).</li>
            <li><strong>Discount</strong>: 5% discount on all token fares automatically deducted.</li>
            <li><strong>NCMC Compatibility</strong>: Any RuPay NCMC transit card (SBI, Canara, HDFC, ICICI, RBL) works directly at AFC turnstile gates.</li>
            <li><strong>Top-Up Outlets</strong>: Station counters, Namma Metro App, BMRCL website, Paytm, Amazon Pay.</li>
            <li><strong>Card Validity</strong>: Valid for 10 years from purchase or last recharge.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Metro Rules & Penalties Card -->
    <div class="nb-card p-4">
      <h6 class="fw-bold mb-3"><i class="bi bi-shield-exclamation me-2 text-warning"></i>Namma Metro Official Rules & Guidelines</h6>
      <div class="row g-3">
        <div class="col-md-3 col-6">
          <div class="p-3 bg-body-tertiary rounded-3 border h-100">
            <div class="fw-bold mb-1 text-body" style="font-size:0.85rem;">🎟️ Token 30-Min Entry</div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">Must present token at entry gate within 30 mins of purchase, or <strong>₹5 admin fee</strong> applies.</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="p-3 bg-body-tertiary rounded-3 border h-100">
            <div class="fw-bold mb-1 text-body" style="font-size:0.85rem;">⏱️ Max Stay Limit: 120 Mins</div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">Maximum stay inside metro system is 2 hours. Penalty for overstay: <strong>₹50 + Max Fare</strong>.</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="p-3 bg-body-tertiary rounded-3 border h-100">
            <div class="fw-bold mb-1 text-body" style="font-size:0.85rem;">🎒 Luggage Limit: Max 15 kg</div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">Max 15 kg baggage per passenger (60cm x 45cm x 25cm). Excess baggage needs clearance.</p>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="p-3 bg-body-tertiary rounded-3 border h-100">
            <div class="fw-bold mb-1 text-body" style="font-size:0.85rem;">🚭 Photography & Spitting</div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">Photography inside train/track area is prohibited. Fine for spitting/littering: <strong>₹500</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── TAB 5: TARIFF & PASSES ──────────────────────────────────
function renderTariffTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Distance Fare Slab Table -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-table me-2"></i>Official BMRCL Distance-Based Fare Slab Matrix</h5>
      <div class="table-responsive">
        <table class="table table-bordered align-middle text-center mb-0" style="font-size:0.88rem;">
          <thead class="table-primary">
            <tr>
              <th>Station Distance Slab</th>
              <th>Token / Single Journey Fare (₹)</th>
              <th>Smart Card / QR Discounted Fare (₹)</th>
              <th>Savings Per Trip</th>
            </tr>
          </thead>
          <tbody>
            ${faresData.fareSlabs.map(s => `
              <tr>
                <td class="fw-bold">${s.minStations} - ${s.maxStations} Stations</td>
                <td>₹${s.tokenFare}</td>
                <td class="text-success fw-bold">₹${s.smartCardFare}</td>
                <td><span class="badge bg-success-subtle text-success">Save ₹${(s.tokenFare - s.smartCardFare).toFixed(2)}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Unlimited Day Passes Table -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h5 class="fw-bold mb-0 text-primary"><i class="bi bi-ticket-perforated me-2"></i>Unlimited Travel Day Passes</h5>
        <span class="badge bg-success-subtle text-success border border-success-subtle">Surrender pass for ₹50 cash refund</span>
      </div>
      <div class="table-responsive mb-2">
        <table class="table table-bordered align-middle text-center mb-0" style="font-size:0.86rem;">
          <thead class="table-dark">
            <tr>
              <th>Pass Type</th>
              <th>Smart Card Price (Including ₹50 Refundable Deposit)</th>
              <th>Mobile QR Price (No Deposit)</th>
              <th>Validity</th>
            </tr>
          </thead>
          <tbody>
            ${faresData.dayPasses.map(p => `
              <tr>
                <td class="fw-bold text-primary">${p.name}</td>
                <td class="fw-bold">₹${p.smartCardPrice} <span class="text-secondary font-monospace" style="font-size:0.75rem;">(₹${p.smartCardPrice - p.refundableDeposit} + ₹50 deposit)</span></td>
                <td class="fw-bold text-success">₹${p.mobileQrPrice}</td>
                <td class="text-secondary">${p.validity}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-secondary" style="font-size:0.78rem;">
        * <strong>Cashback Note</strong>: Surrender the valid pass after completion of your journey at any Metro Customer Care Center to get cash refund of ₹50.
      </div>
    </div>

    <!-- Group Ticket Discounts Card -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-people me-2"></i>Group Ticket Discounts (Large & Medium Groups)</h5>
      <div class="row g-3">
        ${faresData.groupDiscounts.map(g => `
          <div class="col-md-4">
            <div class="p-3.5 rounded-3 border bg-body-tertiary h-100">
              <div class="fw-bold text-primary mb-1" style="font-size:0.88rem;">${g.type}</div>
              <div class="badge bg-success-subtle text-success border mb-2" style="font-size:0.78rem;">${g.discount}</div>
              <p class="text-secondary mb-0" style="font-size:0.8rem;">${g.details}</p>
            </div>
          </div>`).join('')}
      </div>
      <div class="text-secondary mt-3" style="font-size:0.78rem;">
        * Requests for Medium & Large group tickets must be submitted in writing to BMRCL at least 7 days prior to date of travel.
      </div>
    </div>
  </div>`;
}

// ── TAB 6: NOTICES & LIVE DISRUPTION TRACKER ─────────────────────────
function renderNoticesTab(state, lang) {
  const reports = state.metroCrowdReports || [];

  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Live Line Service Status Grid -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-broadcast me-2"></i>Live Metro Line Status & Commuter Alerts</h5>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">Real-time service status across Purple, Green, and Yellow lines with live commuter crowd reports.</p>
        </div>
        <button onclick="window.__openMetroReportModal()" class="btn btn-warning rounded-pill px-3.5 py-2 fw-bold text-dark shadow-sm">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> Report Delay or Halted Service
        </button>
      </div>

      <div class="row g-3">
        <!-- Purple Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border bg-body-tertiary text-start border-start border-4" style="border-left-color: #9333ea !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">🟣 Purple Line</span>
              <span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>Minor Delays</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">Challaghatta ↔ Whitefield</div>
            <div class="mt-2 text-dark fw-medium" style="font-size:0.78rem;">Commuters report ~5 min delay near Majestic.</div>
          </div>
        </div>
        <!-- Green Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border bg-body-tertiary text-start border-start border-4 border-success">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">🟢 Green Line</span>
              <span class="badge bg-success text-white"><i class="bi bi-check-circle me-1"></i>Normal Service</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">Madavara ↔ Silk Institute</div>
            <div class="mt-2 text-success fw-medium" style="font-size:0.78rem;">All trains operating on regular schedule.</div>
          </div>
        </div>
        <!-- Yellow Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border bg-body-tertiary text-start border-start border-4 border-warning">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">🟡 Yellow Line</span>
              <span class="badge bg-info text-white"><i class="bi bi-gear-wide-connected me-1"></i>Testing Phase</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">RV Road ↔ Bommasandra</div>
            <div class="mt-2 text-info fw-medium" style="font-size:0.78rem;">Trail runs ongoing for launch.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Citizen Crowd Disruption Reports Feed -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h5 class="fw-bold mb-0 text-body"><i class="bi bi-people-fill me-2 text-warning"></i>Citizen Crowd Disruption Reports (${reports.length})</h5>
        <span class="text-secondary" style="font-size:0.8rem;"><i class="bi bi-shield-check me-1 text-success"></i>Verified by commuters</span>
      </div>

      <div class="d-flex flex-column gap-3">
        ${reports.map(r => `
          <div class="p-3.5 rounded-3 border bg-body-tertiary text-start">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge ${r.badgeClass}">${r.categoryLabel}</span>
                <span class="badge ${r.line === 'purple' ? 'bg-purple' : r.line === 'green' ? 'bg-success' : 'bg-warning text-dark'}" style="${r.line === 'purple' ? 'background:#9333ea;' : ''}">
                  ${r.lineName}
                </span>
                <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-geo-alt me-1"></i>${r.station}</span>
              </div>
              <span class="text-secondary" style="font-size:0.78rem;"><i class="bi bi-clock me-1"></i>${r.timeAgo}</span>
            </div>
            <p class="text-body mb-2.5" style="font-size:0.88rem;">"${r.comment}"</p>
            <div class="d-flex align-items-center justify-content-between pt-2 border-top border-secondary-subtle">
              <span class="text-secondary" style="font-size:0.78rem;">Status: <strong class="text-dark">${r.status}</strong></span>
              <button onclick="window.__upvoteMetroReport('${r.id}')" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold" style="font-size:0.78rem;">
                <i class="bi bi-hand-thumbs-up me-1"></i> Confirm & Upvote (${r.upvotes})
              </button>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Official BMRCL Press Releases & Circulars -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-newspaper me-2"></i>Official BMRCL Announcements & Gazette Circulars</h5>
      <div class="d-flex flex-column gap-3">
        ${noticesData.notices.map(n => `
          <div class="p-3.5 rounded-3 border bg-body-tertiary text-start border-start border-4 border-primary">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <span class="badge bg-primary-subtle text-primary border">${n.category}</span>
              <span class="text-secondary" style="font-size:0.78rem;"><i class="bi bi-calendar3 me-1"></i>${n.date}</span>
            </div>
            <h6 class="fw-bold mb-1 text-body">${n.title}</h6>
            <p class="text-secondary mb-2" style="font-size:0.85rem;">${n.summary}</p>
            <a href="${n.link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3">
              Official Circular &rarr;
            </a>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── TAB 7: COMPLAINTS & LOST AND FOUND ──────────────────────
function renderComplaintTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Lost and Found Highlight Box -->
    <div class="nb-card p-4 bg-warning-subtle border border-warning">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="p-3 bg-warning text-dark rounded-circle flex-shrink-0">
            <i class="bi bi-search fs-3"></i>
          </div>
          <div>
            <h5 class="fw-bold text-dark mb-1">Central Lost & Found Office — Majestic Station</h5>
            <p class="text-secondary mb-0" style="font-size:0.85rem;">
              Located at <strong>Nadaprabhu Kempegowda Station Majestic</strong> (Platform 2 Level).
              Hours: <strong>${noticesData.helpline.lostAndFoundHours}</strong>
            </p>
          </div>
        </div>
        <a href="${noticesData.helpline.officialLostAndFoundUrl || 'https://www.bmrc.co.in/lost-and-found/'}" target="_blank" rel="noopener" class="btn btn-dark rounded-pill px-4 py-2 fw-semibold">
          <i class="bi bi-box-arrow-up-right me-1"></i> BMRCL Official Lost & Found Portal
        </a>
      </div>

      <!-- Line-Specific Lost & Found Officers Grid -->
      <h6 class="fw-bold text-dark mb-2.5" style="font-size:0.88rem;"><i class="bi bi-person-lines-fill me-1"></i>Official Line-Specific Lost & Found Contact Officers</h6>
      <div class="row g-3">
        ${(noticesData.helpline.officers || []).map(o => `
          <div class="col-md-6">
            <div class="p-3 rounded-3 bg-white border text-start shadow-2xs">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="badge ${o.color === 'purple' ? 'bg-purple' : 'bg-success'}" style="${o.color === 'purple' ? 'background:#9333ea;' : ''}">
                  ${o.line}
                </span>
                <i class="bi bi-telephone-fill ${o.color === 'purple' ? 'text-purple' : 'text-success'}"></i>
              </div>
              <div class="fw-bold text-body" style="font-size:0.92rem;">Officer: ${o.officer}</div>
              <div class="mt-1">
                <a href="${o.tel}" class="fw-bold fs-6 text-decoration-none ${o.color === 'purple' ? 'text-purple' : 'text-success'}">
                  <i class="bi bi-telephone me-1"></i>${o.phone}
                </a>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Helpline Numbers Grid -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-telephone-outbound me-2"></i>BMRCL Emergency Helplines & Contacts</h5>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="p-3 rounded-3 border bg-body-tertiary">
            <div class="text-secondary fw-bold mb-1" style="font-size:0.75rem;">TOLL-FREE CUSTOMER CARE</div>
            <div class="fs-4 fw-bold text-primary mb-1">${noticesData.helpline.tollFree}</div>
            <p class="text-secondary mb-0" style="font-size:0.8rem;">For queries on fares, smart cards, lost tokens, or train schedules.</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 rounded-3 border bg-body-tertiary">
            <div class="text-secondary fw-bold mb-1" style="font-size:0.75rem;">METRO SECURITY CONTROL ROOM</div>
            <div class="fs-4 fw-bold text-danger mb-1">${noticesData.helpline.securityControlRoom}</div>
            <p class="text-secondary mb-0" style="font-size:0.8rem;">For emergency assistance, medical help, or security concerns.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
