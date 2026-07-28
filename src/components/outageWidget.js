/**
 * Verified Community Outage Map & Report Widget — Namma Bengaluru Portal
 */

import { getCurrentUser, promptGoogleLogin, signOutUser } from '../services/googleAuth.js';
import { getOutageReports, submitOutageReport, canUserReport } from '../services/outageStore.js';
import { searchAreas } from '../services/areaService.js';
// We also import the pre-fetched planned outages dataset
import bescomPlannedOutages from '../data/bescom/planned_outages.json';
import bwssbPlannedOutages from '../data/bwssb/planned_outages.json';

// Keep track of leaflet map instance
let outageMap = null;
let currentMarkers = [];

export function renderPlannedOutagesWidget(dept = 'bescom') {
  const isBescom = dept === 'bescom';
  const deptTitle = isBescom ? 'BESCOM Planned Power Outages Schedule' : 'BWSSB Scheduled Water Maintenance';
  const deptIcon = isBescom ? 'bi-calendar-event-fill text-warning' : 'bi-droplet-half text-primary';
  const plannedData = isBescom ? bescomPlannedOutages : bwssbPlannedOutages;
  const officialPortalUrl = isBescom ? 'https://bescom.karnataka.gov.in/info-4/Power+Outages/en' : 'https://bwssb.karnataka.gov.in/';
  const rawFileUrl = `https://github.com/vishwas-r/namma-bengaluru-portal/tree/main/src/data/${dept}`;

  return `
  <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style="background:var(--bs-card-bg, rgba(27,33,62,0.6)); backdrop-filter:blur(12px); border:1px solid var(--bs-border-color)!important;">
    <div class="card-header bg-transparent border-bottom p-3 p-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <div class="p-2 rounded-3" style="background:rgba(var(--nb-dept-rgb),0.12);">
          <i class="bi ${deptIcon} fs-4"></i>
        </div>
        <div>
          <h3 class="h5 fw-bold mb-0">${deptTitle}</h3>
          <div class="text-secondary" style="font-size:0.78rem;">
            <i class="bi bi-shield-check text-success me-1"></i>Official ${isBescom ? 'BESCOM Power Maintenance' : 'BWSSB Water Supply Disruption'} Schedule
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <a href="${officialPortalUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold" style="font-size:0.8rem;">
          <i class="bi bi-box-arrow-up-right me-2"></i>Official Govt Portal
        </a>
        <a href="${rawFileUrl}" target="_blank" rel="noopener" class="btn btn-sm bg-body-tertiary text-body border rounded-pill px-3 py-2 fw-medium" style="font-size:0.8rem;" title="Local dataset file: src/data/${dept}/planned_outages.json">
          <i class="bi bi-filetype-json me-2 text-warning"></i>Data Folder
        </a>
      </div>
    </div>

    <div class="card-body p-3 p-md-4">

      <!-- Informative Source Disclaimer Banner -->
      <div class="p-3 mb-4 rounded-3 border bg-body-tertiary d-flex align-items-start gap-3" style="border-left:4px solid #f59e0b !important;">
        <i class="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-0.5"></i>
        <div style="font-size:0.83rem; line-height:1.5;">
          <strong>Data Source Transparency:</strong>
          ${isBescom ? 
            'BESCOM planned power outage schedules are fetched from official KPTCL/BESCOM feeder maintenance bulletins.' : 
            'BWSSB does not publish a daily automated public API for planned water shutdowns. Official emergency maintenance notices are issued via press releases on <a href="https://bwssb.karnataka.gov.in/" target="_blank" rel="noopener" class="fw-semibold text-primary">bwssb.karnataka.gov.in</a> and Twitter <a href="https://twitter.com/chairmanbwssb" target="_blank" rel="noopener" class="fw-semibold text-primary">@chairmanbwssb</a>. Unverified mock records have been removed.'}
        </div>
      </div>

      <!-- Live Interactive Leaflet Map -->
      <div class="mb-4">
        <div class="fw-bold text-uppercase mb-2" id="mapTitleLabel" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">${isBescom ? 'Planned Power Outages Map' : 'Water Disruption & Maintenance Map'}</div>
        <div id="outageMapContainer" style="height: 400px; border-radius: 12px; overflow: hidden; border: 1px solid var(--bs-border-color); position: relative; z-index: 1;"></div>
      </div>
      
      <!-- PLANNED OUTAGES CONTENT -->
      <div id="outageTabPlanned" class="d-block">
        <div class="mb-2">
          <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="fw-bold text-uppercase" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">
                 Official Planned ${isBescom ? 'Power Outages' : 'Water Maintenance'} (Auto-Synced Daily)
              </div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle" id="poCountBadge">${plannedData.length || 0} scheduled</span>
          </div>
          
          <div class="row g-2 mb-3">
            <div class="col-md-6 position-relative">
              <input type="text" class="form-control" id="poSearchInput" placeholder="Search by Area or Feeder..." oninput="window.__nbFilterPlannedOutages()" style="padding-right: 2.5rem;">
              <i class="bi bi-search text-secondary position-absolute top-50 translate-middle-y" style="right: 1.25rem;"></i>
            </div>
            <div class="col-md-4">
              <input type="date" class="form-control text-secondary" id="poDateInput" onchange="window.__nbFilterPlannedOutages()" onclick="try{this.showPicker();}catch(e){}" title="Click to open calendar">
            </div>
            <div class="col-md-2">
              <button type="button" class="btn btn-outline-secondary w-100 fw-semibold" onclick="window.__nbResetPlannedFilters()" title="Clear search & date filters" style="font-size:0.85rem;">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            </div>
          </div>
          
          <div class="table-responsive border rounded-3" style="max-height: 400px;">
            <table class="table table-hover table-sm mb-0 align-middle" style="font-size:0.85rem;">
              <thead class="table-light sticky-top" style="z-index: 0;">
                <tr>
                  <th scope="col" class="py-2 px-3" style="width:140px;">Date & Time</th>
                  <th scope="col" class="py-2 px-3" style="min-width:300px;">Areas Affected</th>
                  <th scope="col" class="py-2 px-3" style="width:250px;">Reason</th>
                </tr>
              </thead>
              <tbody id="plannedOutagesBody">
                ${plannedData.length > 0 ? plannedData.map(po => {
                  let isoDate = "";
                  try {
                    const d = new Date(po.date);
                    if(!isNaN(d)) isoDate = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                  } catch(e){}
                  
                  return `
                  <tr class="po-row" data-date="${isoDate}">
                    <td class="px-3 text-nowrap"><span class="fw-semibold text-danger">${po.date}</span><br><span class="text-secondary" style="font-size:0.75rem;">${po.fromTime} - ${po.toTime}</span></td>
                    <td class="px-3 po-area"><div class="fw-medium">${po.areas}</div><div class="text-secondary" style="font-size:0.75rem;">Pipeline/Feeder: ${po.feeder}</div></td>
                    <td class="px-3 text-secondary text-wrap" style="font-size:0.8rem;">${po.reason || '-'}</td>
                  </tr>
                `}).join('') : `<tr id="poEmptyRow"><td colspan="3" class="text-center py-4 text-secondary">No planned maintenance found.</td></tr>`}
                <tr id="poNoResultsRow" class="d-none"><td colspan="3" class="text-center py-4 text-secondary">No matching records found for the selected filters.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>`;
}

export function renderCrowdReportsWidget(dept = 'bescom') {
  const isBescom = dept === 'bescom';
  const deptTitle = isBescom ? 'BESCOM Crowd Outage Reports' : 'BWSSB Crowd Disruption Reports';
  const deptIcon = isBescom ? 'bi-people-fill text-success' : 'bi-people-fill text-primary';
  const user = getCurrentUser();
  const reports = getOutageReports(dept);
  const reportCheck = canUserReport(user, dept);

  return `
  <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style="background:var(--bs-card-bg, rgba(27,33,62,0.6)); backdrop-filter:blur(12px); border:1px solid var(--bs-border-color)!important;">
    <div class="card-header bg-transparent border-bottom p-3 p-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <div class="p-2 rounded-3" style="background:rgba(var(--nb-dept-rgb),0.12);">
          <i class="bi ${deptIcon} fs-4"></i>
        </div>
        <div>
          <h3 class="h5 fw-bold mb-0">${deptTitle}</h3>
          <div class="text-secondary" style="font-size:0.78rem;">
            <i class="bi bi-shield-check text-success me-1"></i>Verified Citizen Reports & Real-Time Heatmap
          </div>
        </div>
      </div>
    </div>

    <div class="card-body p-3 p-md-4">
      <!-- Live Interactive Leaflet Map -->
      <div class="mb-4">
        <div class="fw-bold text-uppercase mb-2" id="mapTitleLabel" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">Citizen Outage Heatmap</div>
        <div id="outageMapContainer" style="height: 400px; border-radius: 12px; overflow: hidden; border: 1px solid var(--bs-border-color); position: relative; z-index: 1;"></div>
      </div>

      <!-- COMMUNITY REPORTS CONTENT -->
      <div id="outageTabReports" class="d-block">
        <!-- Top Action Bar -->
        <div class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4 p-3 p-md-4 rounded-4 shadow-sm" style="background:var(--bs-tertiary-bg); border:1px solid var(--bs-border-color);">
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-2"><i class="bi bi-people-fill text-primary me-2"></i>Crowdsourced Reporting</h6>
            <p class="text-secondary mb-0" style="font-size:0.9rem; line-height:1.5;">
              Help your neighbors by reporting power or water cuts in your area. Every report is backed by verified Google Sign-In to ensure 100% genuine data.
            </p>
          </div>
          
          <div class="flex-shrink-0 text-md-end" style="min-width:280px;">
            ${user ? `
              <div class="d-flex flex-column align-items-md-end gap-3">
                <div class="d-flex align-items-center justify-content-center justify-content-md-end gap-2 px-3 py-2 rounded-pill bg-body border shadow-sm w-100" style="font-size:0.85rem;">
                  ${user.picture ? `<img src="${user.picture}" width="24" height="24" class="rounded-circle shadow-sm">` : `<i class="bi bi-person-circle text-primary fs-5"></i>`}
                  <span class="fw-semibold text-nowrap">${user.givenName || user.name} <span class="badge bg-success-subtle text-success ms-1"><i class="bi bi-patch-check-fill me-1"></i>Verified</span></span>
                  <div class="vr mx-1"></div>
                  <button class="btn btn-link btn-sm text-secondary p-0 text-decoration-none fw-medium text-nowrap" onclick="window.__nbSignOut('${dept}')">Sign Out</button>
                </div>
                <div class="w-100 d-flex flex-column align-items-md-end">
                  <button class="btn btn-primary rounded-pill shadow-sm px-4 py-2 fw-bold w-100 w-md-auto"
                    onclick="window.__nbOpenReportModal('${dept}')"
                    ${!reportCheck.allowed ? 'disabled title="' + reportCheck.reason + '"' : ''}>
                    <i class="bi bi-broadcast me-2"></i>Report ${isBescom ? 'Power Cut' : 'Water Issue'}
                  </button>
                  ${!reportCheck.allowed ? `<div class="text-warning mt-2 fw-medium text-center text-md-end" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i>${reportCheck.reason}</div>` : ''}
                </div>
              </div>
            ` : `
              <div class="d-flex flex-column gap-2">
                <button class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold w-100 shadow-sm" onclick="window.__nbPromptLogin('${dept}')">
                  <i class="bi bi-google me-2"></i>Sign in with Google
                </button>
              </div>
            `}
          </div>
        </div>

        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="fw-bold text-uppercase" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">
             Verified Community Reports (Last 2 Hours)
          </div>
          <span class="badge bg-success-subtle text-success border border-success-subtle" id="reportsCountBadge">${reports.length} active</span>
        </div>

        <div id="outageReportsList">
          ${reports.length === 0 ? `
            <div class="text-center py-5 text-secondary border rounded-3 bg-body-tertiary">
              <i class="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
              <div class="fw-bold fs-6 mb-1">No Citizen Outages Reported in Last 2 Hours</div>
              <div style="font-size:0.85rem;">System is normal or all power cuts are restored.</div>
            </div>
          ` : `
            <div class="list-group list-group-flush border rounded-3">
              ${reports.map(r => `
                <div class="list-group-item p-3 d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div class="p-2 rounded-circle bg-warning-subtle text-warning">
                      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-body" style="font-size:0.9rem;">${r.area}</div>
                      <div class="text-secondary" style="font-size:0.78rem;">${r.outageType} &bull; Reported by ${r.user?.name || 'Citizen'}</div>
                    </div>
                  </div>
                  <div class="text-end text-secondary" style="font-size:0.75rem;">
                    ${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  </div>

  <!-- Outage Report Modal -->
  <div class="modal fade" id="outageReportModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-bottom p-3">
          <h5 class="modal-title fw-bold" id="outageModalTitle">
            <i class="bi ${deptIcon} me-2"></i>Report ${isBescom ? 'Power Cut' : 'Water Interruption'}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-3 p-md-4">
          ${!user ? `
          <div class="text-center py-3">
            <div class="mb-3">
              <i class="bi bi-shield-lock-fill text-primary" style="font-size:2.5rem;"></i>
            </div>
            <h6 class="fw-bold mb-1">Google Verification Required</h6>
            <p class="text-secondary mb-4" style="font-size:0.85rem;">
              To keep community outage reports 100% genuine and prevent bot spam, please sign in with Google.
            </p>
            <div id="googleBtnContainer" class="d-flex justify-content-center mb-3"></div>
          </div>` : `
          <form id="outageReportForm" onsubmit="window.__nbSubmitReport(event, '${dept}'); return false;">
            <div class="mb-3">
              <label class="form-label fw-bold" style="font-size:0.85rem;">Reporter Profile</label>
              <div class="p-3 rounded-3 bg-body-tertiary border d-flex align-items-center gap-2">
                ${user.picture ? `<img src="${user.picture}" class="rounded-circle" width="30" height="30">` : `<i class="bi bi-person-circle text-primary fs-5"></i>`}
                <div>
                  <div class="fw-bold" style="font-size:0.85rem;">${user.name}</div>
                  <div class="text-secondary" style="font-size:0.72rem;">${user.email || 'Verified Google Citizen'}</div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold" style="font-size:0.85rem;">Locate Neighborhood / PIN Code</label>
              <div class="position-relative mb-2">
                <i class="bi bi-geo-alt position-absolute top-50 translate-middle-y text-secondary" style="left: 1rem;"></i>
                <input type="text" class="form-control ps-5 py-2" id="areaSearchInput" placeholder="Start typing Area (e.g. Indiranagar)" autocomplete="off" oninput="window.__nbDebounceSearchArea()" />
              </div>
              
              <div id="areaLoadingSpinner" class="d-none text-center py-2 text-primary">
                 <div class="spinner-border spinner-border-sm" role="status"></div><span class="ms-2" style="font-size:0.8rem;">Searching maps...</span>
              </div>
              
              <select class="form-select mt-2" id="reportAreaSelect" required>
                 <option value="">-- Type above to search an area --</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold" style="font-size:0.85rem;">Outage Category</label>
              <select class="form-select" id="reportCategorySelect" required>
                ${isBescom ? `
                  <option value="Power Outage (Unscheduled)">Power Outage (Complete Shutdown)</option>
                  <option value="Feeder Trip / Transformer Breakdown">Feeder Trip / Transformer Breakdown</option>
                  <option value="Voltage Fluctuation / Phase Drop">Low Voltage / Single Phase Drop</option>
                ` : `
                  <option value="Water Supply Interruption">Complete Water Supply Interruption</option>
                  <option value="Low Water Pressure">Low Water Pressure / Pipeline Leakage</option>
                  <option value="Contaminated Water Quality">Contaminated / Muddy Water Supply</option>
                `}
              </select>
            </div>

            <div class="d-flex align-items-center justify-content-between pt-2 border-top">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold">
                <i class="bi bi-send-fill me-2"></i>Submit Outage Report
              </button>
            </div>
          </form>`}
        </div>
      </div>
    </div>
  </div>`;
}

export function renderOutageWidget(dept = 'bescom') {
  return renderPlannedOutagesWidget(dept);
}

// Global Event Window Handlers for SPA Navigation
if (typeof window !== 'undefined') {
  
  // Track current active tab context globally for the widget
  window.__nbCurrentOutageTab = 'planned';

  window.__nbInitOutageMap = (dept = 'bescom') => {
    const container = document.getElementById('outageMapContainer');
    if (!container) return;
    
    // Check if L (Leaflet) is loaded
    if (typeof L === 'undefined') {
        console.warn("Leaflet not loaded yet, retrying...");
        setTimeout(() => window.__nbInitOutageMap(dept), 500);
        return;
    }

    if (outageMap) {
       outageMap.remove();
       outageMap = null;
    }

    // Default center to Vidhana Soudha, Bengaluru
    outageMap = L.map('outageMapContainer').setView([12.9796, 77.5906], 11);
    
    // Use CartoDB Positron for a clean, modern look matching the portal
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(outageMap);

    const mapTitleLabel = document.getElementById('mapTitleLabel');

    const isPlannedTab = document.getElementById('outageTabPlanned') !== null || window.__nbCurrentOutageTab === 'planned';

    if (isPlannedTab) {
      const isBescom = dept === 'bescom';
      const dataset = isBescom ? bescomPlannedOutages : bwssbPlannedOutages;
      if(mapTitleLabel) mapTitleLabel.textContent = isBescom ? "BESCOM Planned Power Outages Map" : "BWSSB Water Maintenance Map";
      
      // Plot Planned Outages dynamically via Photon API
      const uniqueAreas = [...new Set(dataset.map(po => {
        return po.areas.split(',')[0].trim();
      }))].filter(a => a.length > 2 && a.toLowerCase() !== 'nil' && a.toLowerCase() !== 'none');
      
      (async () => {
        for (let i = 0; i < uniqueAreas.length; i++) {
            const areaName = uniqueAreas[i];
            if (i > 0) await new Promise(r => setTimeout(r, 100)); 
            
            const results = await searchAreas(areaName);
            if (results && results.length > 0) {
                const match = results[0];
                const matchedOutages = dataset.filter(po => po.areas.includes(areaName));
                const count = matchedOutages.length;
                
                let color = isBescom ? '#fcd34d' : '#93c5fd';
                if(count > 1) color = isBescom ? '#fbbf24' : '#60a5fa';
                if(count > 3) color = isBescom ? '#f59e0b' : '#3b82f6';
                if(count > 5) color = isBescom ? '#d97706' : '#1d4ed8';
                
                const outageDatesTimes = matchedOutages.slice(0, 3).map(o => `
                  <div style="font-size:0.75rem;" class="mt-1">
                    <span class="fw-bold text-danger">🗓️ ${o.date}</span> (${o.fromTime} - ${o.toTime})
                    <div class="text-secondary text-truncate" style="max-width:180px;">${o.reason || 'Maintenance work'}</div>
                  </div>
                `).join('');

                const popupContent = `
                  <div style="font-family:var(--nb-font-body); min-width: 180px;">
                    <div class="fw-bold mb-1" style="font-size:0.85rem;">${areaName}</div>
                    <div class="badge bg-warning-subtle text-warning border border-warning-subtle mb-1" style="font-size:0.7rem;">${count} Scheduled Outage(s)</div>
                    ${outageDatesTimes}
                    ${matchedOutages.length > 3 ? `<div class="text-secondary text-center" style="font-size:0.7rem;">+ ${matchedOutages.length - 3} more</div>` : ''}
                  </div>
                `;

                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="nb-ripple-marker" style="background:${color}; box-shadow: 0 0 12px ${color}" title="Click to filter: ${areaName}"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                const marker = L.marker([parseFloat(match.lat), parseFloat(match.lon)], { icon }).addTo(outageMap);
                marker.bindPopup(popupContent);
                marker.on('click', () => {
                  window.__nbFilterByArea(areaName);
                });
            }
        }
      })();
    } else {
      if(mapTitleLabel) mapTitleLabel.textContent = "Community Reports Heatmap";
      
      // Plot Citizen Reports
      const reports = getOutageReports(dept);
      const uniqueAreas = [...new Set(reports.map(r => r.area))];
      
      (async () => {
        for (let i = 0; i < uniqueAreas.length; i++) {
            const areaName = uniqueAreas[i];
            
            if (i > 0) await new Promise(r => setTimeout(r, 1100)); // 1.1s delay
            
            const results = await searchAreas(areaName);
            if (results && results.length > 0) {
                const match = results[0];
                const count = reports.filter(r => r.area === areaName).length;
                
                let color;
                if (dept === 'bescom') {
                  color = '#fca5a5';
                  if(count > 1) color = '#f87171';
                  if(count > 3) color = '#ef4444';
                  if(count > 5) color = '#b91c1c';
                } else {
                  color = '#93c5fd';
                  if(count > 1) color = '#60a5fa';
                  if(count > 3) color = '#3b82f6';
                  if(count > 5) color = '#1d4ed8';
                }
                
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="nb-ripple-marker" style="background:${color}; box-shadow: 0 0 12px ${color}"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                const marker = L.marker([parseFloat(match.lat), parseFloat(match.lon)], { icon }).addTo(outageMap);
                marker.bindPopup(`<b>${areaName}</b><br>${count} verified report(s)`);
            }
        }
      })();
    }
  };

  window.__nbSwitchOutageTab = (tabId) => {
    window.__nbCurrentOutageTab = tabId;
    
    // Update pills UI
    document.getElementById('tab-planned')?.classList.toggle('active', tabId === 'planned');
    document.getElementById('tab-reports')?.classList.toggle('active', tabId === 'reports');
    
    // Update Containers visibility
    const plannedContainer = document.getElementById('outageTabPlanned');
    const reportsContainer = document.getElementById('outageTabReports');
    
    if (tabId === 'planned') {
      plannedContainer?.classList.replace('d-none', 'd-block');
      reportsContainer?.classList.replace('d-block', 'd-none');
    } else {
      plannedContainer?.classList.replace('d-block', 'd-none');
      reportsContainer?.classList.replace('d-none', 'd-block');
    }
    
    // Re-initialize map to reflect current tab's data
    const dept = document.getElementById('outageMapContainer')?.closest('.card')?.innerHTML.includes('BWSSB') ? 'bwssb' : 'bescom';
    window.__nbInitOutageMap(dept);
  };

  window.__nbPromptLogin = (dept) => {
    promptGoogleLogin(null, () => {
      window.dispatchEvent(new CustomEvent('nb_auth_changed'));
    });
  };

  window.__nbSignOut = async (dept) => {
    await signOutUser();
    window.dispatchEvent(new CustomEvent('nb_auth_changed'));
  };

  let searchTimeout = null;
  window.__nbDebounceSearchArea = () => {
    const input = document.getElementById('areaSearchInput');
    const select = document.getElementById('reportAreaSelect');
    if (!input || !select) return;

    const query = input.value;
    if (query.length < 3) {
        select.innerHTML = '<option value="">-- Please type at least 3 characters --</option>';
        return;
    }

    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(window.__nbDoSearchArea, 400);
  };

  window.__nbDoSearchArea = async () => {
    const input = document.getElementById('areaSearchInput');
    const select = document.getElementById('reportAreaSelect');
    const spinner = document.getElementById('areaLoadingSpinner');
    if (!input || !select) return;

    const query = input.value;
    if (query.length < 3) return;

    if (spinner) spinner.classList.remove('d-none');
    
    try {
        const matches = await searchAreas(query);
        if (matches.length === 0) {
            select.innerHTML = `<option value="">No results found for "${query}"</option>`;
        } else {
            select.innerHTML = matches.map(a => `<option value="${a.area}" data-lat="${a.lat}" data-lon="${a.lon}">${a.area} ${a.pincode ? `(${a.pincode})` : ''} - ${a.zone}</option>`).join('');
        }
    } catch (e) {
        select.innerHTML = `<option value="">Error fetching areas.</option>`;
    } finally {
        if (spinner) spinner.classList.add('d-none');
    }
  };

  window.__nbOpenReportModal = (dept) => {
    const modalEl = document.getElementById('outageReportModal');
    if (modalEl && window.bootstrap) {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
      setTimeout(() => {
        promptGoogleLogin('googleBtnContainer', () => {
          window.dispatchEvent(new CustomEvent('nb_auth_changed'));
        });
      }, 200);
    }
  };

  window.__nbSubmitReport = (event, dept) => {
    event.preventDefault();
    const user = getCurrentUser();
    const area = document.getElementById('reportAreaSelect')?.value;
    const category = document.getElementById('reportCategorySelect')?.value;

    if (!user || !area) {
        alert("Please search and select an area.");
        return;
    }

    try {
      submitOutageReport(user, dept, area, category);
      const modalEl = document.getElementById('outageReportModal');
      if (modalEl && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      window.dispatchEvent(new CustomEvent('nb_outage_added'));
      
      // Refresh the map automatically
      if (window.__nbInitOutageMap) window.__nbInitOutageMap(dept);

    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    }
  };

  window.__nbFilterPlannedOutages = () => {
    const searchInput = document.getElementById('poSearchInput')?.value.toLowerCase().trim() || "";
    const dateInput = document.getElementById('poDateInput')?.value || "";
    const rows = document.querySelectorAll('#plannedOutagesBody .po-row');
    const noResultsRow = document.getElementById('poNoResultsRow');
    const countBadge = document.getElementById('poCountBadge');
    
    if (!rows.length) return;

    let visibleCount = 0;

    rows.forEach(row => {
      let isMatch = true;
      
      // Date filter (exact match on ISO date)
      if (dateInput) {
        const rowDate = row.getAttribute('data-date');
        if (rowDate !== dateInput) {
           isMatch = false;
        }
      }

      // Text search on the area cell (contains areas and feeder)
      if (isMatch && searchInput) {
        const textContent = row.querySelector('.po-area')?.textContent.toLowerCase() || "";
        if (!textContent.includes(searchInput)) {
           isMatch = false;
        }
      }

      if (isMatch) {
        row.classList.remove('d-none');
        visibleCount++;
      } else {
        row.classList.add('d-none');
      }
    });

    if (noResultsRow) {
      if (visibleCount === 0) {
         noResultsRow.classList.remove('d-none');
      } else {
         noResultsRow.classList.add('d-none');
      }
    }
    
    if (countBadge) {
       countBadge.textContent = `${visibleCount} scheduled`;
    }
  };

  window.__nbFilterByArea = (areaName) => {
    const input = document.getElementById('poSearchInput');
    if (input) {
      input.value = areaName;
      window.__nbFilterPlannedOutages();
      const el = document.getElementById('poSearchInput');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  window.__nbResetPlannedFilters = () => {
    const searchInput = document.getElementById('poSearchInput');
    const dateInput = document.getElementById('poDateInput');
    if (searchInput) searchInput.value = '';
    if (dateInput) dateInput.value = '';
    window.__nbFilterPlannedOutages();
  };
}
