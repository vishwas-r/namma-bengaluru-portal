/**
 * Verified Community Outage Heatmap & Report Widget — Namma Bengaluru Portal
 */

import { getCurrentUser, promptGoogleLogin, demoSignIn, signOutUser } from '../services/googleAuth.js';
import { NEIGHBORHOODS, getOutageReports, getNeighborhoodStats, submitOutageReport, canUserReport } from '../services/outageStore.js';

export function renderOutageWidget(dept = 'bescom') {
  const isBescom = dept === 'bescom';
  const deptTitle = isBescom ? 'BESCOM Electricity Outage Tracker' : 'BWSSB Water Supply Disruption Tracker';
  const deptIcon = isBescom ? 'bi-lightning-charge-fill text-warning' : 'bi-droplet-fill text-primary';
  const unitLabel = isBescom ? 'Power Outage' : 'Water Supply Interruptions';
  const helplineNum = isBescom ? '1912' : '1916';

  const user = getCurrentUser();
  const stats = getNeighborhoodStats(dept);
  const reports = getOutageReports(dept);
  const reportCheck = canUserReport(user, dept);

  const activeAlerts = Object.values(stats).filter(s => s.level === 'high' || s.level === 'moderate');

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
            <i class="bi bi-shield-check text-success me-1"></i>Verified Citizen Reports · Google Authenticated · 2-Hour TTL
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        ${user ? `
        <div class="d-flex align-items-center gap-2 bg-body-tertiary px-3 py-1.5 rounded-pill border" style="font-size:0.82rem;">
          ${user.picture ? `<img src="${user.picture}" width="22" height="22" class="rounded-circle">` : `<i class="bi bi-person-circle text-primary"></i>`}
          <span class="fw-semibold me-1">${user.givenName || user.name}</span>
          <button class="btn btn-link btn-sm text-secondary p-0 ms-1 text-decoration-none" onclick="window.__nbSignOut('${dept}')" title="Sign Out" style="font-size:0.75rem;">(Sign Out)</button>
        </div>` : `
        <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold" onclick="window.__nbPromptLogin('${dept}')" style="font-size:0.82rem;">
          <i class="bi bi-google me-1"></i>Sign in with Google
        </button>`}
      </div>
    </div>

    <div class="card-body p-3 p-md-4">
      <!-- Top Action Bar -->
      <div class="row align-items-center g-3 mb-4">
        <div class="col-lg-7">
          <p class="text-secondary mb-0" style="font-size:0.88rem; line-height:1.45;">
            Report power or water cuts in your area. Every report is backed by verified Google Sign-In to ensure 100% genuine crowd data with zero bot spam.
          </p>
        </div>
        <div class="col-lg-5 text-lg-end">
          <button class="btn btn-primary btn-lg rounded-pill shadow-sm px-4 fw-semibold w-100 w-lg-auto"
            onclick="window.__nbOpenReportModal('${dept}')"
            ${!reportCheck.allowed && user ? 'disabled title="' + reportCheck.reason + '"' : ''}>
            <i class="bi bi-broadcast me-2"></i>Report ${isBescom ? 'Power Cut' : 'Water Issue'}
          </button>
          ${!reportCheck.allowed && user ? `<div class="text-warning mt-1" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i>${reportCheck.reason}</div>` : ''}
        </div>
      </div>

      <!-- Live Community Summary Alert Banner -->
      ${activeAlerts.length > 0 ? `
      <div class="alert alert-warning border-0 rounded-3 p-3 mb-4 d-flex align-items-center gap-3" style="background:rgba(245,158,11,0.12); border-left:4px solid #f59e0b!important;">
        <i class="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
        <div>
          <div class="fw-bold" style="font-size:0.92rem; color:var(--bs-body-color);">
            Active Community Disruption Alerts (${activeAlerts.length} Localities Affected)
          </div>
          <div class="text-secondary" style="font-size:0.8rem;">
            ${activeAlerts.map(a => `<span class="badge bg-warning text-dark me-1">${a.area} (${a.count} reports)</span>`).join('')}
          </div>
        </div>
      </div>` : `
      <div class="alert alert-success border-0 rounded-3 p-3 mb-4 d-flex align-items-center gap-3" style="background:rgba(16,185,129,0.1); border-left:4px solid #10b981!important;">
        <i class="bi bi-check-circle-fill fs-3 text-success"></i>
        <div>
          <div class="fw-bold" style="font-size:0.92rem; color:var(--bs-body-color);">All Major Neighborhoods Operating Normally</div>
          <div class="text-secondary" style="font-size:0.8rem;">No critical crowd-reported disruptions in the last 2 hours.</div>
        </div>
      </div>`}

      <!-- Neighborhood Disruption Heatmap Grid -->
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="fw-bold text-uppercase" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">Neighborhood Disruption Heatmap</div>
          <div class="d-flex gap-2" style="font-size:0.72rem;">
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>High (3+)</span>
            <span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>Moderate (1-2)</span>
            <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>Normal (0)</span>
          </div>
        </div>

        <div class="row g-2">
          ${NEIGHBORHOODS.slice(0, 12).map(area => {
            const item = stats[area] || { count: 0, level: 'normal' };
            let borderStyle = 'border:1px solid var(--bs-border-color);';
            let badgeBg = 'bg-body-tertiary text-secondary';
            let dotColor = '#10b981';

            if (item.level === 'high') {
              borderStyle = 'border:1.5px solid rgba(239,68,68,0.5); background:rgba(239,68,68,0.08);';
              badgeBg = 'bg-danger text-white';
              dotColor = '#ef4444';
            } else if (item.level === 'moderate') {
              borderStyle = 'border:1.5px solid rgba(245,158,11,0.5); background:rgba(245,158,11,0.08);';
              badgeBg = 'bg-warning text-dark';
              dotColor = '#f59e0b';
            }

            return `
            <div class="col-6 col-sm-4 col-md-3">
              <div class="p-2.5 rounded-3 d-flex align-items-center justify-content-between" style="${borderStyle} transition:all 0.2s ease;">
                <div class="text-truncate me-1" style="font-size:0.8rem; font-weight:600;" title="${area}">
                  <i class="bi bi-circle-fill me-1.5" style="color:${dotColor}; font-size:0.55rem;"></i>${area}
                </div>
                <span class="badge ${badgeBg} rounded-pill px-2 py-0.5" style="font-size:0.68rem;">${item.count}</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Live Verified Citizen Reports Feed -->
      <div>
        <div class="fw-bold text-uppercase mb-2" style="font-size:0.75rem; letter-spacing:0.06em; color:var(--bs-secondary-color);">Recent Verified Resident Reports</div>
        <div class="d-flex flex-column gap-2">
          ${reports.length > 0 ? reports.slice(0, 5).map(r => {
            const timeAgoMins = Math.max(1, Math.floor((Date.now() - new Date(r.timestamp).getTime()) / 60000));
            return `
            <div class="p-2.5 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2" style="background:var(--bs-tertiary-bg); font-size:0.82rem;">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width:28px; height:28px; font-size:0.75rem;">
                  ${r.user.picture ? `<img src="${r.user.picture}" class="rounded-circle" width="28" height="28">` : r.user.givenName[0]}
                </div>
                <div>
                  <span class="fw-bold">${r.user.name}</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle ms-1" style="font-size:0.65rem;"><i class="bi bi-patch-check-fill me-0.5"></i>Verified</span>
                  <span class="text-secondary ms-1">reported in <strong class="text-body">${r.area}</strong></span>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2 text-secondary" style="font-size:0.75rem;">
                <span>${r.outageType}</span>
                <span>·</span>
                <span><i class="bi bi-clock me-1"></i>${timeAgoMins}m ago</span>
              </div>
            </div>`;
          }).join('') : `
          <div class="text-center py-3 text-secondary" style="font-size:0.85rem;">No citizen reports in the last 2 hours.</div>`}
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
            <div class="text-secondary" style="font-size:0.75rem;">
              Or <a href="#" onclick="window.__nbDemoLogin('${dept}'); return false;" class="text-primary text-decoration-underline">Click here for instant local demo login</a>
            </div>
          </div>` : `
          <form id="outageReportForm" onsubmit="window.__nbSubmitReport(event, '${dept}'); return false;">
            <div class="mb-3">
              <label class="form-label fw-bold" style="font-size:0.85rem;">Reporter Profile</label>
              <div class="p-2.5 rounded-3 bg-body-tertiary border d-flex align-items-center gap-2">
                ${user.picture ? `<img src="${user.picture}" class="rounded-circle" width="30" height="30">` : `<i class="bi bi-person-circle text-primary fs-5"></i>`}
                <div>
                  <div class="fw-bold" style="font-size:0.85rem;">${user.name}</div>
                  <div class="text-secondary" style="font-size:0.72rem;">${user.email || 'Verified Google Citizen'}</div>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold" style="font-size:0.85rem;">Select Neighborhood / Locality</label>
              <select class="form-select" id="reportAreaSelect" required>
                ${NEIGHBORHOODS.map(n => `<option value="${n}">${n}</option>`).join('')}
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
                <i class="bi bi-send-fill me-1.5"></i>Submit Outage Report
              </button>
            </div>
          </form>`}
        </div>
      </div>
    </div>
  </div>`;
}

// Global Event Window Handlers for SPA Navigation
if (typeof window !== 'undefined') {
  window.__nbPromptLogin = (dept) => {
    promptGoogleLogin('googleBtnContainer', () => {
      window.dispatchEvent(new CustomEvent('nb_auth_changed'));
    });
  };

  window.__nbSignOut = (dept) => {
    signOutUser();
    window.dispatchEvent(new CustomEvent('nb_auth_changed'));
  };

  window.__nbDemoLogin = (dept) => {
    demoSignIn('Verified Bengaluru Resident');
    window.dispatchEvent(new CustomEvent('nb_auth_changed'));
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

    if (!user || !area) return;

    try {
      submitOutageReport(user, dept, area, category);
      const modalEl = document.getElementById('outageReportModal');
      if (modalEl && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      window.dispatchEvent(new CustomEvent('nb_outage_added'));
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    }
  };
}
