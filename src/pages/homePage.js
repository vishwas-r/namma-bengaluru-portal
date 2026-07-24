import deptData from '../data/departments.json';

export function renderHomePage(lang) {
  const l = lang;
  return `
  <!-- Elevate Inspired Hero -->
  <section class="nb-hero">
    <div class="container position-relative">
      <div class="row align-items-center g-5">
        <div class="col-lg-7 text-start">
            <div class="nb-hero-badge">
              <i class="bi bi-lightning-fill text-warning"></i>
              <span>Official Bengaluru Citizen Services Hub</span>
            </div>

            <h1 class="nb-hero-title">${l.heroTitle}</h1>

            <p class="nb-hero-desc">
              ${l.heroSub} Access accurate BWSSB water bill estimates, BESCOM electricity bill calculations, official gazettes, and instant AI guidance.
            </p>

            <div class="nb-feature-checklist mb-4">
              <div class="check-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Verified 2026-27 BWSSB & BESCOM Tariff Slabs</span>
              </div>
              <div class="check-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Apartment Per-Flat Consumption Breakdown</span>
              </div>
              <div class="check-item">
                <i class="bi bi-check-circle-fill"></i>
                <span>Official Gazette PDF Links & 24x7 Helplines</span>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 flex-wrap mb-4">
              <a href="#/dept/bwssb" class="btn btn-primary btn-lg">
                <span>Calculate Water Bill</span>
                <i class="bi bi-arrow-right ms-2"></i>
              </a>
              <a href="#/dept/bescom" class="btn btn-outline-primary btn-lg">
                <span>BESCOM Electricity Hub</span>
                <i class="bi bi-lightning-charge ms-2"></i>
              </a>
            </div>

            <div class="d-flex align-items-center gap-3 flex-wrap pt-2">
              ${[['6', 'Departments'], ['₹0', 'Cost to Use'], ['10 AM', 'Daily AI Sync']].map(([n, lbl]) => `
              <div class="nb-stat-pill">
                <div class="nb-stat-num">${n}</div>
                <div class="nb-stat-label">${lbl}</div>
              </div>`).join('')}
            </div>
          </div>

          <div class="col-lg-5">
            <div class="d-flex flex-column gap-3">
              <div class="nb-floating-card">
                <div class="nb-floating-card-icon" style="background:rgba(14,165,233,0.12); color:#0ea5e9;">
                  <i class="bi bi-droplet-half fs-2"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.92rem;">BWSSB Water Slabs</div>
                  <div class="text-secondary" style="font-size:0.78rem;">Verified 2026-27 Slabs & Apartment Bulk Rates</div>
                </div>
              </div>

              <div class="nb-floating-card">
                <div class="nb-floating-card-icon" style="background:rgba(245,158,11,0.12); color:#f59e0b;">
                  <i class="bi bi-lightning-charge-fill fs-2"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.92rem;">BESCOM Electricity</div>
                  <div class="text-secondary" style="font-size:0.78rem;">Bill Estimator & e-Katha Online Name Change</div>
                </div>
              </div>

              <div class="nb-floating-card">
                <div class="nb-floating-card-icon" style="background:rgba(124,58,237,0.12); color:#7c3aed;">
                  <i class="bi bi-train-front fs-2"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.92rem;">Namma Metro & Transit</div>
                  <div class="text-secondary" style="font-size:0.78rem;">Route Maps, Fares & BMTC Pass Guides</div>
                </div>
              </div>

              <div class="nb-floating-card">
                <div class="nb-floating-card-icon" style="background:rgba(239,68,68,0.12); color:#ef4444;">
                  <i class="bi bi-headset fs-2"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.92rem;">24x7 Helpline Directory</div>
                  <div class="text-secondary" style="font-size:0.78rem;">BWSSB 1916 · BESCOM 1912 · Metro 1800-425-12345</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </section>

  <!-- Department Cards -->
  <div class="container py-5">
    <div class="mb-4 text-start">
      <div class="nb-section-label">All Departments</div>
      <h2 class="h3 fw-bold mb-1" style="letter-spacing:-0.015em;">Bengaluru Civic Services Hub</h2>
      <p class="text-secondary mb-0" style="font-size:0.9rem;">
        Click a department to access calculators, official notices, complaint guides, and AI assistance.
      </p>
    </div>

    <div class="row g-4">
      ${deptData.map(dept => `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="nb-dept-card" style="--dept-color:${dept.color};"
          onclick="window.__navDept('${dept.id}')"
          role="button" tabindex="0"
          onkeydown="if(event.key==='Enter')window.__navDept('${dept.id}')">
          <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div class="nb-dept-icon mb-0" style="background:${dept.color}18; color:${dept.color};">
              <i class="bi ${dept.icon}"></i>
            </div>
            <span class="nb-live-badge ${dept.status === 'live' ? 'text-success' : 'text-secondary'}"
              style="background:${dept.status === 'live' ? 'rgba(16,185,129,0.12)' : 'var(--bs-secondary-bg)'};">
              ${dept.status === 'live' ? 'Live' : 'Coming Soon'}
            </span>
          </div>
          <h3 class="nb-dept-name">${dept.name}</h3>
          <div class="text-secondary mb-1" style="font-size:0.78rem; font-weight:500;">${dept.fullName}</div>
          <p class="nb-dept-desc">${dept.description}</p>
          <div class="d-flex align-items-center justify-content-between pt-3" style="border-top:1px solid var(--bs-border-color);">
            <div class="d-flex gap-1 flex-wrap">
              ${(dept.features || []).slice(0, 3).map(f => `
              <span style="font-size:0.67rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:6px; background:var(--bs-tertiary-bg); color:var(--bs-secondary-color);">${f}</span>`).join('')}
            </div>
            <div style="color:${dept.color}; font-size:1.1rem; opacity:${dept.status === 'live' ? '1' : '0.35'};">
              <i class="bi bi-arrow-right-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Info Strip -->
    <div class="row g-3 mt-4 mb-4">
      ${[
      { icon: 'bi-robot', title: 'Daily Automated Sync', desc: 'Official circulars scraped daily at 10 AM IST, linking directly to official government portals and PDFs with SHA-256 verification.' },
      { icon: 'bi-key', title: 'Crowd-Sourced AI Keys', desc: 'Bring your free Gemini API key. Auto-rotates across donated keys when quota is exhausted.' },
      { icon: 'bi-github', title: 'Open Source on GitHub', desc: 'Anyone can contribute data updates, translations, or new department modules. MIT licensed.' },
    ].map(item => `
      <div class="col-md-4">
        <div class="nb-card h-100 p-4" style="border-left:3.5px solid var(--nb-primary);">
          <i class="bi ${item.icon} mb-2 d-block" style="font-size:1.5rem; color:var(--nb-primary);"></i>
          <div class="fw-bold mb-1" style="font-size:0.92rem;">${item.title}</div>
          <div class="text-secondary" style="font-size:0.82rem; line-height:1.65;">${item.desc}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Essential Helplines Directory -->
    <div class="nb-card">
      <div class="nb-card-header"><i class="bi bi-telephone-fill text-danger me-2"></i>Bengaluru Essential & Emergency Helplines</div>
      <div class="nb-card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle mb-0" style="font-size:0.86rem;">
            <thead class="table-light">
              <tr style="border-bottom:2px solid var(--bs-border-color);">
                <th class="ps-4 py-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Service / Department</th>
                <th class="py-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Helpline Numbers</th>
                <th class="py-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Mobile / Direct</th>
                <th class="pe-4 text-end py-3" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em;">Quick Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-shield-fill text-danger me-2"></i>Police Emergency Services</td>
                <td class="py-3"><span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-6">100 / 112</span></td>
                <td class="py-3 text-secondary font-mono" style="font-size:0.8rem;">080-27271100 · 080-27273456</td>
                <td class="pe-4 text-end py-3"><a href="tel:112" class="btn btn-sm btn-danger nb-tbl-btn py-1 px-3" style="font-size:0.78rem;">Call 112</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-phone-fill text-primary me-2"></i>Police Mobile Helpline</td>
                <td class="py-3 text-secondary">Direct Mobile Support</td>
                <td class="py-3 font-mono fw-semibold" style="font-size:0.82rem;">9480802800</td>
                <td class="pe-4 text-end py-3"><a href="tel:9480802800" class="btn btn-sm btn-outline-primary nb-tbl-btn py-1 px-3" style="font-size:0.78rem;">Call Mobile</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-heart-fill text-danger me-2"></i>Children Helpline (Childline)</td>
                <td class="py-3"><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fs-6">1098</span></td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">24/7 Child Protection & Assistance</td>
                <td class="pe-4 text-end py-3"><a href="tel:1098" class="btn btn-sm btn-warning nb-tbl-btn py-1 px-3 text-dark fw-semibold" style="font-size:0.78rem;">Call 1098</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-person-heart text-info me-2"></i>Senior Citizen Helpline</td>
                <td class="py-3"><span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-6">1090</span></td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">Assistance, Safety & Legal Guidance</td>
                <td class="pe-4 text-end py-3"><a href="tel:1090" class="btn btn-sm btn-info nb-tbl-btn py-1 px-3 text-white" style="font-size:0.78rem;">Call 1090</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-droplet-fill text-primary me-2"></i>BWSSB Water Supply & Sewerage</td>
                <td class="py-3"><span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-6">1916</span></td>
                <td class="py-3 text-secondary font-mono" style="font-size:0.8rem;">080-22238888 (WhatsApp)</td>
                <td class="pe-4 text-end py-3"><a href="#/dept/bwssb" class="btn btn-sm btn-outline-primary nb-tbl-btn py-1 px-3" style="font-size:0.78rem;">BWSSB Hub →</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-lightning-charge-fill text-warning me-2"></i>BESCOM Electricity Supply</td>
                <td class="py-3"><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fs-6">1912</span></td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">Power Outages & Billing</td>
                <td class="pe-4 text-end py-3"><a href="tel:1912" class="btn btn-sm btn-outline-secondary nb-tbl-btn py-1 px-3" style="font-size:0.78rem;">Call 1912</a></td>
              </tr>
              <tr style="border-bottom:1px solid var(--bs-border-color);">
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-train-front-fill text-purple me-2" style="color:#7c3aed;"></i>Namma Metro (BMRCL) Rapid Transit</td>
                <td class="py-3"><span class="badge bg-purple-subtle text-purple border px-2 py-1 fs-6" style="background:rgba(124,58,237,0.12); color:#7c3aed; border-color:rgba(124,58,237,0.25)!important;">1800-425-12345</span></td>
                <td class="py-3 text-secondary font-mono" style="font-size:0.8rem;">080-25501234 (Metro Toll-Free)</td>
                <td class="pe-4 text-end py-3"><a href="tel:180042512345" class="btn btn-sm btn-outline-primary nb-tbl-btn py-1 px-3" style="font-size:0.78rem; border-color:#7c3aed; color:#7c3aed;">Call Metro</a></td>
              </tr>
              <tr>
                <td class="ps-4 py-3 fw-bold"><i class="bi bi-building-fill text-success me-2"></i>GBA / BBMP Civic Services</td>
                <td class="py-3"><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-6">1533</span></td>
                <td class="py-3 text-secondary" style="font-size:0.8rem;">Roads, Drainage, Property Tax & Potholes</td>
                <td class="pe-4 text-end py-3"><a href="tel:1533" class="btn btn-sm btn-outline-secondary nb-tbl-btn py-1 px-3" style="font-size:0.78rem;">Call 1533</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;
}
