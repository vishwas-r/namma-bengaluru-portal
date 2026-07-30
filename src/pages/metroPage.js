import stationsData from '../data/metro/stations.json';
import faresData from '../data/metro/fares.json';
import noticesData from '../data/metro/notices.json';
import metroServicesData from '../data/metro/services.json';
import { calculateMetroJourney, getGoogleMapsTransitDirUrl, getGoogleMapsStationUrl, getGoogleMapsEmbedUrl } from '../services/metroEngine.js';
import { renderMetroMapHTML } from '../components/metroMap.js';
import { getCurrentUser } from '../services/googleAuth.js';

export function renderMetroPage(dept, state, lang) {
  const activeTab = state.activeTab || 'calculator';
  const user = getCurrentUser();

  const tabTitles = {
    overview: 'Overview & Network',
    calculator: 'Fare & Route Calculator',
    'live-stations': 'Live Stations & Google Maps',
    'smart-card': 'Smart Card & QR Tickets',
    tariff: 'Tariff & Passes',
    'crowd-reports': 'Live Crowd & Delay Reports',
    notices: 'Official Circulars & Notices',
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
        <div class="nb-dept-hero-icon mb-0 d-flex align-items-center justify-content-center bg-white shadow-sm" style="width:64px; height:64px; border-radius:12px; color:#7c3aed;">
          <i class="bi ${dept.icon}" style="font-size:2.2rem;"></i>
        </div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <h1 class="fw-bold text-white mb-0" style="font-size:2rem; letter-spacing:-0.02em;">${dept.fullName}</h1>
            <i class="bi bi-patch-check-fill text-primary fs-4" title="Verified Official Source"></i>
          </div>
          <p class="text-white-50 mb-0 mt-1" style="font-size:0.95rem;">Official source for metro fares, routes, station directory, and commuter services in Bengaluru.</p>
        </div>
      </div>

      <!-- Action Pill Buttons Row -->
      <div class="d-flex align-items-center gap-2 flex-wrap mt-4">
        <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary shadow-sm rounded-pill px-3 py-2 fw-medium d-inline-flex d-lg-none align-items-center gap-2" style="font-size:0.8rem;" title="Toggle Sidebar Navigation">
          <i class="bi bi-list fs-5"></i> <span>${dept.name} Menu</span>
        </button>
        <a href="https://english.bmrc.co.in" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-globe me-1"></i> Official Website
        </a>
        <a href="tel:180042512345" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-pill px-3 py-2 hover-bg-tertiary fw-medium" style="font-size:0.8rem; backdrop-filter:blur(4px);">
          <i class="bi bi-telephone me-1 text-success"></i> Customer Care (1800-425-12345)
        </a>
        <a href="https://x.com/OfficialBMRCL" target="_blank" rel="noopener" class="btn btn-sm bg-white bg-opacity-10 text-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center hover-bg-tertiary" style="width:34px; height:34px; backdrop-filter:blur(4px);">
          <i class="bi bi-twitter-x"></i>
        </a>
      </div>
    </div>
  </div>

  <!-- Mobile Quick Category Selector Strip (Visible on Mobile/Tablet only) -->
  <div class="d-lg-none bg-body border-bottom py-2 px-3 shadow-2xs sticky-top" style="top: 56px; z-index: 1010;">
    <div class="d-flex align-items-center justify-content-between gap-2">
      <button onclick="window.__toggleSidebar()" class="btn btn-sm btn-primary fw-semibold rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2" style="font-size:0.82rem; background:#7c3aed; border-color:#7c3aed;">
        <i class="bi bi-list fs-5"></i>
        <span>Metro Menu</span>
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
          ${!user ? `
            <div class="text-center py-4 px-3 bg-body-tertiary rounded-3 border">
              <div class="p-3 bg-primary-subtle text-primary rounded-circle d-inline-flex mb-3">
                <i class="bi bi-shield-lock fs-1"></i>
              </div>
              <h5 class="fw-bold text-body mb-2">Google Sign-In Required</h5>
              <p class="text-secondary mb-4" style="font-size:0.88rem;">To maintain high data quality and prevent spam across all departments, commuters must sign in with Google to report live Metro disruptions.</p>
              <button type="button" class="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-bold shadow-sm w-100" onclick="window.__triggerGoogleLoginForReport()">
                <i class="bi bi-google me-2"></i>Sign in with Google
              </button>
            </div>
          ` : `
            <div class="d-flex align-items-center gap-2 mb-3 p-2 bg-primary-subtle rounded-3 border border-primary-subtle">
              <img src="${user.picture || 'https://lh3.googleusercontent.com/a/default-user'}" alt="${user.name}" width="36" height="36" class="rounded-circle border border-white flex-shrink-0" />
              <div style="font-size:0.83rem;">
                <div class="fw-bold text-primary">${user.name}</div>
                <div class="text-secondary" style="font-size:0.75rem;">${user.email} · Verified Citizen Account</div>
              </div>
            </div>
            <form onsubmit="window.__submitMetroCrowdReport(event)">
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">AFFECTED METRO LINE</label>
                <select id="reportLineSelect" class="form-select">
                  <option value="purple"><i class="bi bi-circle-fill me-1"></i> Purple Line (Challaghatta ↔ Whitefield)</option>
                  <option value="green"><i class="bi bi-circle-fill me-1"></i> Green Line (Madavara ↔ Silk Institute)</option>
                  <option value="yellow"><i class="bi bi-circle-fill me-1"></i> Yellow Line (RV Road ↔ Bommasandra)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">AFFECTED STATION / LOCATION</label>
                <input type="text" id="reportStationInput" class="form-control" placeholder="e.g. Majestic, MG Road, Whitefield, Indiranagar" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">DISRUPTION TYPE</label>
                <select id="reportCategorySelect" class="form-select">
                  <option value="delay"><i class="bi bi-clock-history me-1 text-warning"></i> Train Delay (5-15 Mins)</option>
                  <option value="halted"><i class="bi bi-exclamation-octagon-fill me-1 text-danger"></i> Service Halted / Technical Failure</option>
                  <option value="crowd"><i class="bi bi-shield-exclamation me-1 text-danger"></i> Heavy Overcrowding / Long AFC Gate Queue</option>
                  <option value="outage"><i class="bi bi-door-open-fill me-1 text-secondary"></i> Lift / Escalator Outage</option>
                  <option value="normal"><i class="bi bi-circle-fill me-1" style="color: #16a34a;"></i> Service Recovered to Normal</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary" style="font-size:0.8rem;">DESCRIPTION / COMMENTS</label>
                <textarea id="reportCommentInput" class="form-control" rows="3" placeholder="Describe the current situation, delay length, or platform condition..." required></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" class="btn btn-secondary rounded-pill px-4" onclick="window.__closeMetroReportModal()">Cancel</button>
                <button type="submit" class="btn btn-warning rounded-pill px-4 fw-bold text-dark">Submit Report to Firebase</button>
              </div>
            </form>
          `}
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
    case 'crowd-reports':
      return renderCrowdReportsTab(state, lang);
    case 'planned-outages':
    case 'outages':
      return renderAnnouncementsTab(state, lang);
    case 'services':
      return renderServicesTab(state, lang);
    case 'social':
      return renderSocialFeedTab(state, lang);
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
          <div class="fs-4 fw-bold text-body">92.96 km</div>
          <div class="text-secondary" style="font-size:0.72rem;">Operational Corridors</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-success">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">ACTIVE STATIONS</div>
          <div class="fs-4 fw-bold text-body">82 Stations</div>
          <div class="text-secondary" style="font-size:0.72rem;">Purple, Green & Yellow Lines</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="nb-card p-3 text-start h-100 border-start border-4 border-warning">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.75rem;">DAILY RIDERSHIP</div>
          <div class="fs-4 fw-bold text-body">~8.5 Lakh</div>
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
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-purple" style="border-color: #9333ea !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-purple text-white px-3 py-1" style="background:#9333ea;"><i class="bi bi-circle-fill me-1"></i> Purple Line</span>
              <span class="badge bg-success-subtle text-success">100% Operational</span>
            </div>
            <h6 class="fw-bold mb-1">Challaghatta ↔ Whitefield (Kadugodi)</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">36 Stations · 43.49 km corridor connecting West Bengaluru to ITPL & East Tech Hubs.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Major Hubs: Majestic, MG Road, Indiranagar, KR Puram, ITPL</span>
            </div>
          </div>
        </div>
        <!-- Green Line -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-success">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-success text-white px-3 py-1"><i class="bi bi-circle-fill me-1"></i> Green Line</span>
              <span class="badge bg-success-subtle text-success">100% Operational</span>
            </div>
            <h6 class="fw-bold mb-1">Madavara (BIEC) ↔ Silk Institute</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">32 Stations · 33.4 km North-South corridor connecting Tumakuru Road to Kanakapura Road.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Major Hubs: Yeshwanthpur, Rajajinagar, Majestic, Jayanagar, Banashankari</span>
            </div>
          </div>
        </div>
        <!-- Yellow Line -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-warning">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-warning text-white px-3 py-1"><i class="bi bi-circle-fill me-1"></i> Yellow Line</span>
              <span class="badge bg-success-subtle text-success">100% Operational</span>
            </div>
            <h6 class="fw-bold mb-1">RV Road ↔ Delta Electronics Bommasandra</h6>
            <p class="text-secondary mb-3" style="font-size:0.83rem;">16 Stations · 19.15 km corridor serving Silk Board, BTM Layout, and Electronic City IT Hub.</p>
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.78rem;">
              <span class="badge bg-body-tertiary text-body border">Major Hubs: RV Road (Green Line), Jayadeva, Silk Board, Electronic City</span>
            </div>
          </div>
        </div>
        <!-- Blue & Pink Lines -->
        <div class="col-md-6">
          <div class="nb-card p-4 text-start h-100 border-start border-4 border-info">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-info text-white px-3 py-1"><i class="bi bi-circle-fill me-1"></i> Blue and <i class="bi bi-circle-fill me-1"></i> Pink Lines</span>
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
          <button onclick="window.__openMetroMapModal()" class="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-semibold" style="background:#7c3aed; border-color:#7c3aed;">
            <i class="bi bi-arrows-angle-expand me-1"></i> View Fullscreen Map
          </button>
          <a href="/assets/images/namma-metro-sitemap.jpg" download class="btn btn-sm btn-outline-success rounded-pill px-3 py-2 fw-semibold">
            <i class="bi bi-download me-1"></i> Download Sitemap
          </a>
          <a href="https://www.bmrc.co.in/images/metro/travel-info/sitemapimg.jpg" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold">
            <i class="bi bi-box-arrow-up-right me-1"></i> Official BMRCL URL
          </a>
        </div>
      </div>
      <div class="position-relative rounded-3 overflow-hidden border shadow-2xs bg-dark text-center cursor-pointer" onclick="window.__openMetroMapModal()" style="max-height:420px;">
        <img src="/assets/images/namma-metro-sitemap.jpg" alt="Namma Metro Complete System Sitemap Route Map" class="img-fluid w-100 object-fit-cover" style="max-height:420px; filter:brightness(0.95);" loading="lazy" />
        <div class="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-75 text-white d-flex align-items-center justify-content-between">
          <span style="font-size:0.82rem;"><i class="bi bi-info-circle me-1 text-warning"></i> Click image or button to expand in Fullscreen high-resolution mode</span>
          <span class="badge bg-primary rounded-pill px-3 py-1" style="background:#7c3aed;"><i class="bi bi-search me-1"></i> Click to Zoom</span>
        </div>
      </div>
    </div>

    <!-- Interactive Namma Metro Network Map (Google Maps) -->
    ${renderMetroMapHTML(state.selectedMetroStationId)}

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
              <a href="/assets/images/namma-metro-sitemap.jpg" download class="btn btn-sm btn-success rounded-pill px-3">
                <i class="bi bi-download me-1"></i> Download Image
              </a>
              <button type="button" class="btn-close btn-close-white" onclick="window.__closeMetroMapModal()" aria-label="Close"></button>
            </div>
          </div>
          <div class="modal-body p-2 d-flex align-items-center justify-content-center bg-black overflow-auto" style="min-height: calc(100vh - 70px);">
            <img src="/assets/images/namma-metro-sitemap.jpg" alt="Namma Metro Fullscreen Map" class="img-fluid rounded shadow-lg" style="max-height: 92vh; object-fit: contain;" />
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
  const groupFare = liveFare?.groupFare !== undefined ? liveFare.groupFare : journey?.groupFare;

  const totalTime = liveFare?.totalTime || (journey ? `${Math.floor(journey.estimatedTimeMins / 60)} hrs ${journey.estimatedTimeMins % 60} mins` : '0 mins');
  const totalDistance = liveFare?.totalDistance || (journey ? `${(journey.stationCount * 1.15).toFixed(1)} Km` : '0 Km');
  const stationCountDisplay = liveFare?.stationCount || journey?.stationCount || 0;

  return `
  <div class="d-flex flex-column gap-4">
    <!-- Calculator Hero Search Card -->
    <div class="nb-card p-4 text-start shadow-md border-0" style="position: relative; z-index: 50; background:#ffffff; border-radius: 16px;">
      <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-send-fill text-primary fs-4" style="color: #6d28d9 !important;"></i>
          <h5 class="fw-bold mb-0 text-dark" style="color: #1e1b4b !important; font-size: 1.2rem;">Bangalore Metro Fare Calculator</h5>
        </div>
        <span class="badge bg-purple-subtle text-purple border border-purple-subtle px-3 py-2" style="font-size:0.78rem; background: #f3e8ff; color: #6d28d9;">
          <i class="bi bi-shield-check me-1"></i>Official BMRCL Tariff & Live Route Pathfinder
        </span>
      </div>

      <div class="row g-3 align-items-end">
        <!-- Source Selector -->
        <div class="col-12 col-md-4">
          <label class="form-label fw-bold text-secondary text-uppercase mb-1" style="font-size:0.75rem; letter-spacing: 0.05em;">FROM STATION</label>
          <select id="metroSourceSelect" class="form-select form-select-lg border-2" onchange="window.__onMetroStationChange()">
            ${stationsData.map(s => {
    const stationName = lang === 'kn' && s.kannadaName ? s.kannadaName : s.name;
    return `<option value="${s.id}" data-line="${s.line}" data-neighborhood="${s.neighborhood || ''}" ${s.id === sourceId ? 'selected' : ''}>${stationName}</option>`;
  }).join('')}
          </select>
        </div>

        <!-- Swap Button -->
        <div class="col-12 col-md-1 text-center my-2 my-md-0">
          <button onclick="window.__swapMetroStations()" class="btn btn-light rounded-circle p-2 d-inline-flex align-items-center justify-content-center hover-shadow border" style="width:42px; height:42px; color: #64748b;" title="Swap Origin & Destination">
            <i class="bi bi-arrow-left-right fs-5"></i>
          </button>
        </div>

        <!-- Destination Selector -->
        <div class="col-12 col-md-4">
          <label class="form-label fw-bold text-secondary text-uppercase mb-1" style="font-size:0.75rem; letter-spacing: 0.05em;">TO STATION</label>
          <select id="metroDestSelect" class="form-select form-select-lg border-2" onchange="window.__onMetroStationChange()">
            ${stationsData.map(s => {
    const stationName = lang === 'kn' && s.kannadaName ? s.kannadaName : s.name;
    return `<option value="${s.id}" data-line="${s.line}" data-neighborhood="${s.neighborhood || ''}" ${s.id === destId ? 'selected' : ''}>${stationName}</option>`;
  }).join('')}
          </select>
        </div>

        <!-- Action Calculate Button -->
        <div class="col-12 col-md-3">
          <button type="button" onclick="window.__calculateMetroFare()" class="btn w-100 btn-lg rounded-pill px-4 py-3 fw-bold text-white shadow-sm" style="background:#6d28d9; border-color:#6d28d9; font-size: 1rem;">
            Calculate &rarr;
          </button>
        </div>
      </div>
    </div>

    ${journey ? `
    <!-- Main Fare Display Banner -->
    <div class="nb-card p-4 text-start shadow-sm border-0" style="position: relative; z-index: 1; background:#ffffff; border-radius: 14px;">
      <div class="row g-3 text-center align-items-center">
        <!-- Normal Fare -->
        <div class="col-4 border-end">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.8rem;">Normal Fare</div>
          <div class="fs-2 fw-bold text-dark">₹${tokenFare}</div>
        </div>
        <!-- Smart Card -->
        <div class="col-4 border-end">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.8rem;">Smart Card</div>
          <div class="fs-2 fw-bold text-success" style="color: #16a34a !important;">₹${smartCardFare}</div>
        </div>
        <!-- Special / Group -->
        <div class="col-4">
          <div class="text-secondary fw-semibold mb-1" style="font-size:0.8rem;">Special Day / Group</div>
          <div class="fs-2 fw-bold text-dark">₹${groupFare}</div>
        </div>
      </div>
    </div>

    <!-- Journey Details Grid Card -->
    <div class="nb-card p-4 text-start shadow-sm border-0" style="position: relative; z-index: 1; background:#ffffff; border-radius: 14px;">
      <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <i class="bi bi-train-front text-secondary fs-5"></i>
        <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">Journey Details</h6>
      </div>

      <div class="row g-3 text-start">
        <div class="col-6 col-md-3">
          <div class="text-secondary fw-semibold mb-1" style="font-size: 0.78rem;">Stations</div>
          <div class="fs-5 fw-bold text-dark">${stationCountDisplay}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-secondary fw-semibold mb-1" style="font-size: 0.78rem;">Interchanges</div>
          <div class="fs-5 fw-bold text-dark">${journey.requiresInterchange ? 1 : 0}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-secondary fw-semibold mb-1" style="font-size: 0.78rem;">Travel Time</div>
          <div class="fs-5 fw-bold text-dark">${totalTime}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-secondary fw-semibold mb-1" style="font-size: 0.78rem;">Distance</div>
          <div class="fs-5 fw-bold text-dark">${totalDistance}</div>
        </div>
      </div>
    </div>

    <!-- Station Parking Availability Summary -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="nb-card p-3 text-start bg-body-tertiary border">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-p-circle-fill text-primary me-2"></i>${journey.source.name} Parking</span>
            <span class="badge ${journey.source.parking?.hasParking ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}">${journey.source.parking?.hasParking ? 'Parking Available' : 'No Official Parking'}</span>
          </div>
          ${journey.source.parking?.hasParking ? `
            <div class="d-flex gap-3 text-secondary" style="font-size:0.8rem;">
              <span><strong><i class="bi bi-scooter me-1"></i> 2-Wheeler:</strong> ${journey.source.parking.twoWheelerSlots} Slots</span>
              <span><strong><i class="bi bi-car-front-fill me-1"></i> 4-Wheeler:</strong> ${journey.source.parking.fourWheelerSlots ? journey.source.parking.fourWheelerSlots + ' Slots' : 'N/A'}</span>
            </div>
          ` : '<span class="text-secondary" style="font-size:0.8rem;">No official BMRCL parking lot at this station.</span>'}
        </div>
      </div>
      <div class="col-md-6">
        <div class="nb-card p-3 text-start bg-body-tertiary border">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-body" style="font-size:0.85rem;"><i class="bi bi-p-circle-fill text-primary me-2"></i>${journey.dest.name} Parking</span>
            <span class="badge ${journey.dest.parking?.hasParking ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}">${journey.dest.parking?.hasParking ? 'Parking Available' : 'No Official Parking'}</span>
          </div>
          ${journey.dest.parking?.hasParking ? `
            <div class="d-flex gap-3 text-secondary" style="font-size:0.8rem;">
              <span><strong><i class="bi bi-scooter me-1"></i> 2-Wheeler:</strong> ${journey.dest.parking.twoWheelerSlots} Slots</span>
              <span><strong><i class="bi bi-car-front-fill me-1"></i> 4-Wheeler:</strong> ${journey.dest.parking.fourWheelerSlots ? journey.dest.parking.fourWheelerSlots + ' Slots' : 'N/A'}</span>
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
    <div class="nb-card p-3 text-start border-warning bg-warning-subtle bg-opacity-30">
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
                <i class="bi bi-scooter me-1"></i> 2-Wheeler: <strong>${selectedStation.parking.twoWheelerSlots} Slots</strong>
              </div>
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                <i class="bi bi-car-front-fill me-1"></i> 4-Wheeler: <strong>${selectedStation.parking.fourWheelerSlots > 0 ? selectedStation.parking.fourWheelerSlots + ' Slots' : 'No 4W Slots'}</strong>
              </div>
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                <i class="bi bi-bicycle me-1"></i> Bicycle: <strong>${selectedStation.parking.cycles || 10} Slots (FREE)</strong>
              </div>
              ${selectedStation.parking.lcv > 0 ? `
              <div class="text-body fw-semibold mt-1" style="font-size:0.83rem;">
                <i class="bi bi-truck me-1"></i> LCV: <strong>${selectedStation.parking.lcv} Slots</strong>
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
            <div class="d-flex flex-wrap gap-2">
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
      <div class="p-3 rounded-3 bg-primary-subtle border border-primary-subtle mb-4 text-start">
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
              <tr><td class="fw-semibold text-start ps-2"><i class="bi bi-scooter me-1"></i> Two Wheeler</td><td>₹15</td><td>₹5</td><td class="fw-bold text-success">₹30</td></tr>
              <tr><td class="fw-semibold text-start ps-2">🛺 Three Wheeler</td><td>₹20</td><td>₹5</td><td class="fw-bold text-success">₹45</td></tr>
              <tr><td class="fw-semibold text-start ps-2"><i class="bi bi-car-front-fill me-1"></i> Car / 4 Wheeler</td><td>₹30</td><td>₹10</td><td class="fw-bold text-success">₹60</td></tr>
              <tr><td class="fw-semibold text-start ps-2"><i class="bi bi-truck me-1"></i> Light Commercial (LCV)</td><td>₹50</td><td>₹15</td><td class="fw-bold text-success">₹150</td></tr>
              <tr><td class="fw-semibold text-start ps-2"><i class="bi bi-bus-front-fill me-1"></i> Heavy Passenger Bus</td><td>₹100</td><td>₹25</td><td class="fw-bold text-success">₹300</td></tr>
              <tr class="table-success"><td class="fw-bold text-start ps-2"><i class="bi bi-bicycle me-1"></i> Bicycle</td><td colspan="3" class="fw-bold text-success">FREE</td></tr>
            </tbody>
          </table>
        </div>
        <div class="text-secondary mt-1" style="font-size:0.75rem;">⚠️ <strong>Note</strong>: Overnight parking is NOT available at any BMRCL Metro station.</div>
      </div>

      <!-- Official BMRCL Disclaimer & Policy PDF Links Card -->
      <div class="p-3 rounded-3 bg-warning-subtle border border-warning mb-4 text-start">
        <div class="d-flex align-items-start gap-3">
          <i class="bi bi-shield-check text-warning fs-4 flex-shrink-0 mt-1"></i>
          <div>
            <div class="fw-bold text-dark mb-1" style="font-size:0.88rem;">Official Data Source Disclaimer & BMRCL Parking Policy Documents</div>
            <p class="text-secondary mb-3" style="font-size:0.81rem;">
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
            <div class="fw-bold mb-1 text-body" style="font-size:0.85rem;"><i class="bi bi-clock-history me-1 text-warning"></i> Max Stay Limit: 120 Mins</div>
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
            ${faresData.fareSlabs.map(s => {
    const cardFare = s.nonPeakCscFare !== undefined ? s.nonPeakCscFare : s.peakCscFare;
    const savings = (s.tokenFare - cardFare).toFixed(2);
    const label = s.minStations === s.maxStations ? `${s.minStations} Station` : `${s.minStations} - ${s.maxStations > 50 ? '27+' : s.maxStations} Stations`;
    return `
              <tr>
                <td class="fw-bold">${label}</td>
                <td>₹${s.tokenFare}</td>
                <td class="text-success fw-bold">₹${cardFare.toFixed(2)}</td>
                <td><span class="badge bg-success-subtle text-success">Save ₹${savings}</span></td>
              </tr>`;
  }).join('')}
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
            <div class="p-3 rounded-3 border bg-body-tertiary h-100">
              <div class="fw-bold text-primary mb-1" style="font-size:0.88rem;">${g.groupSize}</div>
              <div class="badge bg-success-subtle text-success border mb-2" style="font-size:0.78rem;">${g.discount}</div>
              <p class="text-secondary mb-0" style="font-size:0.8rem;">${g.description}</p>
            </div>
          </div>`).join('')}
      </div>
      <div class="text-secondary mt-3" style="font-size:0.78rem;">
        * Requests for Medium & Large group tickets must be submitted in writing to BMRCL at least 7 days prior to date of travel.
      </div>
    </div>
  </div>`;
}

// ── TAB 6: DEDICATED COMMUTER CROWD REPORTS ──────────────────
function renderCrowdReportsTab(state, lang) {
  const reports = state.metroCrowdReports || [];

  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Live Line Service Status Grid -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-broadcast me-2"></i>Live Metro Line Status & Commuter Alerts</h5>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">Real-time service status across Purple, Green, and Yellow lines powered by live commuter reports.</p>
        </div>
        <button onclick="window.__openMetroReportModal()" class="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark shadow-sm">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> Report Delay or Halted Service
        </button>
      </div>

      <div class="row g-3">
        <!-- Purple Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border text-start border-4 bg-body-tertiary" style="border-color: #9333ea !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">
                <i class="bi bi-circle-fill me-1"></i>Purple Line
              </span>
              <span class="badge text-white" style="background: #9333ea;"><i class="bi bi-check-circle-fill me-1"></i>Normal Operations</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">Challaghatta ↔ Whitefield (Kadugodi)</div>
            <div class="mt-2 fw-medium" style="font-size:0.78rem; color: #9333ea;">Operating smoothly on regular schedule.</div>
          </div>
        </div>
        <!-- Green Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border text-start border-4 bg-body-tertiary" style="border-color: #16a34a !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">
                <i class="bi bi-circle-fill me-1"></i>Green Line
              </span>
              <span class="badge text-white" style="background: #16a34a;"><i class="bi bi-check-circle-fill me-1"></i>Normal Operations</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">Madavara (BIEC) ↔ Silk Institute</div>
            <div class="mt-2 text-success fw-medium" style="font-size:0.78rem;">All trains operating on regular schedule.</div>
          </div>
        </div>
        <!-- Yellow Line -->
        <div class="col-md-4">
          <div class="p-3 rounded-3 border text-start border-4 bg-body-tertiary" style="border-color: #ffc61a !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-body" style="font-size:0.88rem;">
                <i class="bi bi-circle-fill me-1"></i>Yellow Line
              </span>
              <span class="badge text-dark fw-bold" style="background: #ffc61a;"><i class="bi bi-check-circle-fill me-1"></i>Normal Operations</span>
            </div>
            <div class="text-secondary" style="font-size:0.8rem;">RV Road ↔ Delta Electronics Bommasandra</div>
            <div class="mt-2 fw-medium" style="font-size:0.78rem; color: #b45309;">Operational corridor running on schedule.</div>
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

      ${reports.length > 0 ? `
      <div class="d-flex flex-column gap-3">
        ${reports.map(r => `
          <div class="p-3 rounded-3 border bg-body-tertiary text-start">
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
            <p class="text-body mb-3" style="font-size:0.88rem;">"${r.comment}"</p>
            <div class="d-flex align-items-center justify-content-between pt-2 border-top border-secondary-subtle">
              <span class="text-secondary" style="font-size:0.78rem;">Status: <strong class="text-dark">${r.status}</strong></span>
              <button onclick="window.__upvoteMetroReport('${r.id}')" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold" style="font-size:0.78rem;">
                <i class="bi bi-hand-thumbs-up me-1"></i> Confirm & Upvote (${r.upvotes})
              </button>
            </div>
          </div>`).join('')}
      </div>` : `
      <div class="p-5 text-center bg-body-tertiary rounded-3 border">
        <i class="bi bi-shield-check text-success display-4 mb-2"></i>
        <h5 class="fw-bold text-body mb-1">No Active Disruption Reports</h5>
        <p class="text-secondary mb-3" style="font-size:0.88rem;">All Metro lines (Purple, Green & Yellow) are currently operating smoothly on regular schedule.</p>
        <button onclick="window.__openMetroReportModal()" class="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark shadow-sm">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> Report Delay or Halted Service
        </button>
      </div>`}
    </div>
  </div>`;
}

// ── TAB 7: OFFICIAL CIRCULARS & NOTICES ─────────────────────
function renderNoticesTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4 text-start">
    <!-- Official BMRCL Press Releases & Circulars -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-newspaper me-2"></i>Official BMRCL Announcements & Gazette Circulars</h5>
          <p class="text-secondary mb-0" style="font-size:0.85rem;">Official press releases, timetable updates, and gazette notifications published by BMRCL.</p>
        </div>
        <a href="https://english.bmrc.co.in" target="_blank" rel="noopener" class="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold" style="font-size:0.82rem;">
          Official BMRCL Portal &rarr;
        </a>
      </div>

      <div class="d-flex flex-column gap-3">
        ${noticesData.notices.map(n => `
          <div class="p-3 rounded-3 border bg-body-tertiary text-start border-start border-4 border-primary">
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

// ── TAB 7: COMPLAINTS, MANAGEMENT PROFILES & GRIEVANCES ─────────
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
      <h6 class="fw-bold text-dark mb-3" style="font-size:0.88rem;"><i class="bi bi-person-lines-fill me-1"></i>Official Line-Specific Lost & Found Contact Officers</h6>
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

    <!-- Helpline & Offices Grid -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h5 class="fw-bold mb-0 text-primary"><i class="bi bi-telephone-outbound me-2"></i>BMRCL Official Contact Directory</h5>
        <a href="${noticesData.helpline.officialContactUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold" style="font-size:0.82rem;">
          <i class="bi bi-box-arrow-up-right me-1"></i> Official BMRCL Contact Page &rarr;
        </a>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="p-4 rounded-3 border bg-body-tertiary text-start h-100">
            <div class="text-primary fw-bold mb-1" style="font-size:0.82rem;"><i class="bi bi-train-front me-1 text-primary"></i> TRAVEL & PASSENGER RELATED INQUIRIES</div>
            <div class="fw-bold fs-5 text-body mb-1">Toll-Free: ${noticesData.helpline.tollFree}</div>
            <div class="text-secondary mb-2" style="font-size:0.82rem;">
              <i class="bi bi-telephone-fill me-1"></i> Phone: <strong>${noticesData.helpline.travelPhone}</strong><br>
              <i class="bi bi-envelope-fill me-1"></i> Email: <strong>${noticesData.helpline.email}</strong>
            </div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">
              <strong>Address:</strong> BMRCL, Baiyappanahalli Depot, Old Madras Road, NGEF Stop, Bangalore – 560 038.
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-4 rounded-3 border bg-body-tertiary text-start h-100">
            <div class="text-primary fw-bold mb-1" style="font-size:0.82rem;"><i class="bi bi-building me-1"></i> PROJECT & CORPORATE HEADQUARTERS</div>
            <div class="fw-bold fs-5 text-body mb-1">Phone: ${noticesData.helpline.projectPhone}</div>
            <div class="text-secondary mb-2" style="font-size:0.82rem;">
              <i class="bi bi-shield-exclamation me-1 text-danger"></i> Security Control Room: <strong>${noticesData.helpline.securityControlRoom}</strong>
            </div>
            <p class="text-secondary mb-0" style="font-size:0.78rem;">
              <strong>Address:</strong> BMRCL, 3rd Floor, BMTC Complex, K.H. Road, Shanthinagar, Bangalore – 560 027.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Official Management Profiles Section -->
    <div class="nb-card p-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-person-badge me-2"></i>BMRCL Management Profiles & Executive Leadership</h5>
          <p class="text-secondary mb-0" style="font-size:0.83rem;">Official functional directors and board leaders overseeing Bengaluru Metro operations.</p>
        </div>
        <a href="${noticesData.helpline.officialManageProfileUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold" style="font-size:0.82rem;">
          <i class="bi bi-box-arrow-up-right me-1"></i> BMRCL Management Page &rarr;
        </a>
      </div>

      <div class="row g-3">
        ${(noticesData.managementProfiles || []).map(m => `
          <div class="col-md-4">
            <div class="p-3 rounded-3 border bg-body-tertiary text-start h-100">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="p-2 rounded-circle bg-primary-subtle text-primary fw-bold">
                  <i class="bi bi-person-fill fs-5"></i>
                </div>
                <div>
                  <div class="fw-bold text-body" style="font-size:0.92rem;">${m.name}</div>
                  <span class="badge bg-primary-subtle text-primary border" style="font-size:0.72rem;">${m.title}</span>
                </div>
              </div>
              <p class="text-secondary mb-0" style="font-size:0.78rem;">${m.role}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Full BMRCL Board of Directors Table -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-building me-2"></i>BMRCL Board of Directors</h5>
      <div class="table-responsive">
        <table class="table table-bordered table-striped align-middle text-start mb-0" style="font-size:0.82rem;">
          <thead class="table-dark">
            <tr>
              <th style="width:50px;">Sl. No</th>
              <th>Name & Position</th>
              <th>Nominated By</th>
              <th>Official Address</th>
            </tr>
          </thead>
          <tbody>
            ${(noticesData.boardOfDirectors || []).map(b => `
              <tr>
                <td class="fw-bold text-center">${b.slNo}</td>
                <td>
                  <div class="fw-bold text-body">${b.name}</div>
                  <div class="text-secondary" style="font-size:0.78rem;">${b.designation}</div>
                </td>
                <td><span class="badge ${b.nominatedBy === 'Govt of India' ? 'bg-primary' : b.nominatedBy === 'Govt of Karnataka' ? 'bg-success' : 'bg-secondary'}">${b.nominatedBy}</span></td>
                <td class="text-secondary" style="font-size:0.78rem;">${b.address}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grievance Redressal Officers Directory Table -->
    <div class="nb-card p-4">
      <h5 class="fw-bold mb-3 text-primary"><i class="bi bi-journal-check me-2"></i>BMRCL Grievance Redressal Officers Directory</h5>
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle text-start mb-0" style="font-size:0.83rem;">
          <thead class="table-primary">
            <tr>
              <th style="width:50px;">Sl. No</th>
              <th>Name / Designation of Officer</th>
              <th>Functional Area / Responsibilities</th>
              <th>Contact Details</th>
            </tr>
          </thead>
          <tbody>
            ${(noticesData.grievanceOfficers || []).map(g => `
              <tr>
                <td class="fw-bold text-center">${g.slNo}</td>
                <td class="fw-bold text-body">${g.officer}</td>
                <td class="text-secondary">${g.area}</td>
                <td class="fw-semibold text-primary">${g.contact}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ── TAB 8: OFFICIAL ANNOUNCEMENTS & SERVICE ALERTS ───────────
function renderAnnouncementsTab(state, lang) {
  return `
  <div class="d-flex flex-column gap-4 text-start">
    <div class="nb-card p-4 text-center">
      <div class="p-3 rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3" style="width:64px; height:64px;">
        <i class="bi bi-megaphone fs-2"></i>
      </div>
      <h5 class="fw-bold text-body mb-2">Official BMRCL Announcements & Service Maintenance</h5>
      <p class="text-secondary mb-4 mx-auto" style="max-width:560px; font-size:0.88rem;">
        There are currently no scheduled maintenance disruptions or corridor closures across Purple, Green, or Yellow lines. All trains are operating on normal timetables.
      </p>
      <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap">
        <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
          <i class="bi bi-check-circle-fill me-1"></i>100% Operational Network
        </span>
        <a href="https://english.bmrc.co.in/PressRelease" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-4 py-2">
          <i class="bi bi-box-arrow-up-right me-1"></i> View Official BMRCL Press Releases &rarr;
        </a>
      </div>
    </div>
  </div>`;
}

// ── TAB 9: SERVICES & STEP-BY-STEP COMMUTER GUIDES ──────────
function renderServicesTab(state, lang) {
  const list = metroServicesData.services || [];
  const selectedId = state.selectedServiceId || list[0]?.id || 'smart-card-ncmc';
  const selected = list.find(s => s.id === selectedId) || list[0];

  return `
  <div class="row g-4 text-start">
    <div class="col-lg-4">
      <div class="nb-card h-100">
        <div class="nb-card-header"><i class="bi bi-file-earmark-check text-primary me-2"></i>Select Service / Guide</div>
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
              <i class="bi bi-box-arrow-up-right me-2"></i>Open Direct Portal (${selected.officialPortalName || 'BMRCL Portal'})
            </a>` : ''}
          </div>
        </div>
        <div class="nb-card-body p-4">
          <p class="text-secondary mb-4" style="font-size:0.9rem; line-height:1.6;">${selected.description}</p>

          <!-- Interactive Document Checklist -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-card-checklist text-primary me-2"></i>Required Documents & Requirements Checklist (Check items ready)
            </h6>
            <div class="d-flex flex-column gap-2">
              ${(selected.documents || []).map((doc, idx) => `
              <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-start justify-content-between gap-2">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="doc_metro_${idx}" onchange="window.__toggleDoc(this)" />
                  <label class="form-check-label ms-2 fw-medium" for="doc_metro_${idx}" style="font-size:0.86rem; cursor:pointer;">
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
              <i class="bi bi-diagram-3 text-primary me-2"></i>Step-by-Step Application & Booking Procedure Timeline
            </h6>
            <div class="nb-timeline pt-1">
              ${(selected.steps || []).map((st, idx) => `
              <div class="nb-timeline-item ${idx === selected.steps.length - 1 ? 'is-last' : ''}">
                <div class="nb-timeline-badge">${st.step}</div>
                <div class="nb-timeline-content text-start">
                  <div class="fw-bold" style="font-size:0.92rem;">${st.title}</div>
                  <div class="text-secondary mt-1" style="font-size:0.84rem; line-height:1.6;">${st.details}</div>
                  ${st.link ? `<a href="${st.link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary mt-2 py-1 px-3" style="font-size:0.76rem;"><i class="bi bi-box-arrow-up-right me-1"></i>Open Direct Portal / WhatsApp Chat</a>` : ''}
                </div>
              </div>`).join('')}
            </div>
          </div>

          <!-- Fee Structure Table -->
          ${selected.fees && selected.fees.length > 0 ? `
          <div>
            <h6 class="fw-bold text-uppercase text-secondary mb-3" style="font-size:0.78rem; letter-spacing:0.05em;">
              <i class="bi bi-receipt text-primary me-2"></i>Official Tariff & Fee Schedule
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
                    <td class="py-3 ps-3 fw-medium">${f.head}</td>
                    <td class="py-3 pe-3 text-end fw-bold text-primary font-mono">${f.amount}</td>
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

// ── TAB 10: NAMMA METRO SOCIAL MEDIA FEED ────────────────────
function renderSocialFeedTab(state, lang) {
  setTimeout(() => {
    if (window.twttr?.widgets) window.twttr.widgets.load();
  }, 120);

  return `
  <div class="row g-4 text-start">
    <div class="col-lg-5">
      <div class="d-flex flex-column gap-3">
        <div class="nb-card p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px; height:48px; font-size:1.4rem;">
              <i class="bi bi-share-fill"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0" style="font-size:1.05rem;">Namma Metro (BMRCL)</h5>
              <div class="text-secondary" style="font-size:0.8rem;">Official Public Social Media Suite</div>
            </div>
          </div>
          <p class="text-secondary mb-4" style="font-size:0.85rem; line-height:1.6;">
            Connect directly with verified official social media accounts, emergency broadcasts, and direct helpdesk channels for Namma Metro.
          </p>

          <div class="d-flex flex-column gap-2">
            <a href="https://x.com/OfficialBMRCL" target="_blank" rel="noopener" class="p-3 border rounded-3 text-decoration-none text-body hover-bg-tertiary d-flex align-items-center justify-content-between transition-all">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-twitter-x"></i></div>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">Official X (Twitter) Feed</div>
                  <div class="text-secondary" style="font-size:0.75rem;">@OfficialBMRCL</div>
                </div>
              </div>
              <i class="bi bi-chevron-right text-secondary"></i>
            </a>

            <a href="https://wa.me/918105556677?text=Hi" target="_blank" rel="noopener" class="p-3 border rounded-3 text-decoration-none text-body hover-bg-tertiary d-flex align-items-center justify-content-between transition-all">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style="width:36px; height:36px;"><i class="bi bi-whatsapp"></i></div>
                <div>
                  <div class="fw-bold" style="font-size:0.88rem;">Official WhatsApp Helpdesk</div>
                  <div class="text-secondary" style="font-size:0.75rem;">+91 81055 56677</div>
                </div>
              </div>
              <i class="bi bi-chevron-right text-secondary"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-7">
      <div class="nb-card p-4">
        <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-twitter-x text-primary fs-5"></i>
            <h5 class="fw-bold mb-0" style="font-size:1rem;">Live Official X Feed (@OfficialBMRCL)</h5>
          </div>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Verified Account</span>
        </div>
        <div class="overflow-y-auto pe-1" style="max-height: 600px;">
          <a class="twitter-timeline" data-height="580" data-theme="${document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'}" href="https://twitter.com/OfficialBMRCL?ref_src=twsrc%5Etfw">
            Loading official tweets from @OfficialBMRCL...
          </a>
        </div>
      </div>
    </div>
  </div>`;
}
