import deptData from '../data/departments.json';

export function renderDepartmentsPage(lang) {
  return `
  <div class="container-fluid px-lg-4 py-4 text-start">
    
    <!-- Hero Header Banner -->
    <div class="nb-card p-4 p-md-5 mb-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(59,59,152,0.08) 0%, rgba(0,147,220,0.08) 100%); border-left:5px solid #3b3b98;">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-body border shadow-2xs mb-3 fw-bold text-primary" style="font-size:0.75rem;">
            <i class="bi bi-grid-3x3-gap-fill"></i>
            <span>BENGALURU PUBLIC UTILITIES DIRECTORY</span>
          </div>
          <h1 class="fw-extrabold text-body mb-2" style="font-size: clamp(1.8rem, 3vw, 2.5rem); letter-spacing:-0.03em;">
            Government Departments & Civic Bodies
          </h1>
          <p class="text-secondary mb-0" style="font-size:0.95rem; max-width:640px; line-height:1.6;">
            Your official open-source gateway to all public utility boards, transport corporations, municipal authorities, and development agencies serving Namma Bengaluru.
          </p>
        </div>
        <div class="col-lg-4 d-none d-lg-flex justify-content-end">
          <div class="p-3 rounded-circle bg-body border shadow-sm d-flex align-items-center justify-content-center" style="width:110px; height:110px;">
            <i class="bi bi-building-gear display-4 text-primary"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Departments Grid -->
    <div class="row g-4">
      ${deptData.map(dept => {
        const isLive = dept.status === 'live';
        return `
        <div class="col-md-6 col-xl-4">
          <div class="nb-card p-4 h-100 d-flex flex-column justify-content-between hover-shadow position-relative overflow-hidden">
            <div>
              
              <!-- Card Header Row -->
              <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-2xs" style="width:48px; height:48px; background:${dept.color}15; color:${dept.color}; font-size:1.35rem;">
                    <i class="bi ${dept.icon}"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold text-body mb-0" style="font-size:1.1rem;">${dept.name}</h5>
                    <div class="text-secondary" style="font-size:0.75rem;">${dept.kannada}</div>
                  </div>
                </div>

                <span class="badge ${isLive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}" style="font-size:0.72rem;">
                  ${isLive ? '<i class="bi bi-check-circle-fill me-1"></i> Live' : 'Under Integration'}
                </span>
              </div>

              <!-- Full Name & Description -->
              <div class="fw-semibold text-body mb-1" style="font-size:0.86rem;">${dept.fullName}</div>
              <p class="text-secondary mb-3" style="font-size:0.8rem; line-height:1.5;">${dept.description}</p>

              <!-- Helpline & Website Info Pills -->
              <div class="d-flex flex-wrap gap-2 mb-3" style="font-size:0.75rem;">
                ${dept.helpline ? `
                <span class="px-2.5 py-1 rounded-2 bg-body-tertiary border text-body d-inline-flex align-items-center gap-1.5">
                  <i class="bi bi-telephone-fill text-primary"></i>
                  <span>Helpline: <strong>${dept.helpline}</strong></span>
                </span>` : ''}
                ${dept.website ? `
                <a href="${dept.website}" target="_blank" rel="noopener" class="px-2.5 py-1 rounded-2 bg-body-tertiary border text-secondary text-decoration-none d-inline-flex align-items-center gap-1.5 hover-bg-tertiary">
                  <i class="bi bi-globe"></i>
                  <span>Official Site <i class="bi bi-box-arrow-up-right ms-0.5" style="font-size:0.65rem;"></i></span>
                </a>` : ''}
              </div>

              <!-- Feature Tags -->
              <div class="d-flex flex-wrap gap-1.5 mb-4">
                ${(dept.features || []).map(f => `
                  <span class="badge bg-body border text-body font-normal" style="font-size:0.7rem;">${f}</span>
                `).join('')}
              </div>
            </div>

            <!-- Action Button -->
            <div>
              ${isLive ? `
              <a href="#/dept/${dept.id}" class="btn btn-primary w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2" style="font-size:0.85rem;">
                <span>Explore ${dept.name} Portal</span>
                <i class="bi bi-arrow-right"></i>
              </a>` : `
              <button class="btn btn-outline-secondary w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2" disabled style="font-size:0.85rem;">
                <i class="bi bi-clock-history"></i>
                <span>Integration Coming Soon</span>
              </button>`}
            </div>

          </div>
        </div>`;
      }).join('')}
    </div>

  </div>`;
}
