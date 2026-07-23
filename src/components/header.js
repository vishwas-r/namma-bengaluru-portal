import deptData from '../data/departments.json';

export function renderSOSBar() {
  const links = [
    { label: 'Police', num: '100 / 112', icon: 'bi-shield-fill', href: 'tel:112' },
    { label: 'BWSSB Water', num: '1916', icon: 'bi-droplet-fill', href: 'tel:1916' },
    { label: 'BESCOM Power', num: '1912', icon: 'bi-lightning-charge-fill', href: 'tel:1912' },
    { label: 'GBA / BBMP', num: '1533', icon: 'bi-building-fill', href: 'tel:1533' },
    { label: 'Senior Citizen', num: '1090', icon: 'bi-person-heart', href: 'tel:1090' },
    { label: 'Childline', num: '1098', icon: 'bi-heart-fill', href: 'tel:1098' },
    { label: 'Ambulance', num: '108', icon: 'bi-hospital-fill', href: 'tel:108' },
  ];
  return `
  <div class="nb-sos-bar d-flex align-items-center justify-content-center gap-2 flex-wrap">
    <span class="opacity-75" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.08em;">
      <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergency
    </span>
    ${links.map((l, i) => `
      ${i > 0 ? '<span class="nb-sos-sep">|</span>' : ''}
      <a href="${l.href}" class="nb-sos-link">
        <i class="bi ${l.icon} me-1"></i>${l.label}: <strong>${l.num}</strong>
      </a>`).join('')}
  </div>`;
}

export function renderHeader(state, lang) {
  const isOnDeptPage = state.route === 'dept';
  return `
  <header class="nb-header">
    <div class="container d-flex align-items-center py-2 gap-2">

      <!-- Logo — always links to home -->
      <a href="#/" class="d-flex align-items-center gap-2 text-decoration-none flex-shrink-0">
        <div class="nb-logo-icon"><i class="bi bi-geo-alt-fill"></i></div>
        <div class="lh-sm">
          <div class="fw-bold display-font" style="font-size:0.95rem; color:var(--bs-body-color);">Namma Bengaluru</div>
          <div class="nb-logo-subtitle" style="font-size:0.67rem; color:var(--bs-secondary-color); font-weight:500;">Citizen Services Portal</div>
        </div>
      </a>

      <!-- Desktop Nav links -->
      <nav class="d-none d-lg-flex align-items-center gap-1 ms-2">
        <a href="#/" class="nb-dropdown-toggle text-decoration-none ${state.route === 'home' ? 'active-nav' : ''}"
          style="${state.route === 'home' ? 'color:var(--nb-primary); background:var(--nb-primary-glow);' : ''}">
          <i class="bi bi-house-door"></i> Home
        </a>

        <!-- Departments dropdown -->
        <div class="nb-dropdown" id="deptDropdown">
          <button class="nb-dropdown-toggle ${isOnDeptPage ? 'active-nav' : ''}"
            style="${isOnDeptPage ? 'color:var(--nb-primary); background:var(--nb-primary-glow);' : ''}"
            onclick="window.__toggleDropdown(event)" aria-haspopup="true">
            <i class="bi bi-grid-3x3-gap-fill"></i>
            Departments
            <i class="bi bi-chevron-down nb-chevron"></i>
          </button>
          <div class="nb-dropdown-menu" id="deptMenu">
            ${deptData.map((dept, i) => `
              ${i > 0 && i === deptData.findIndex(d => d.status !== 'live') ? '<div class="nb-dropdown-divider"></div>' : ''}
              <button class="nb-dropdown-item"
                onclick="window.__navDept('${dept.id}')"
                ${dept.status !== 'live' ? 'title="Coming soon"' : ''}>
                <div class="nb-dropdown-item-icon" style="background:${dept.color}18; color:${dept.color};">
                  <i class="bi ${dept.icon}"></i>
                </div>
                <div class="nb-dropdown-item-info">
                  <div class="nb-dropdown-item-name">${dept.fullName}</div>
                  <div class="nb-dropdown-item-desc">${dept.description}</div>
                </div>
                <span class="nb-dropdown-item-badge ${dept.status === 'live' ? 'text-success' : 'text-secondary'}"
                  style="background:${dept.status === 'live' ? 'rgba(16,185,129,0.12)' : 'var(--bs-secondary-bg)'};">
                  ${dept.status === 'live' ? 'Live' : 'Soon'}
                </span>
              </button>`).join('')}
          </div>
        </div>

        <a href="https://github.com" target="_blank" rel="noopener" class="nb-dropdown-toggle text-decoration-none">
          <i class="bi bi-github"></i> Contribute
        </a>
      </nav>

      <!-- Desktop Right actions -->
      <div class="d-none d-lg-flex align-items-center gap-2 ms-auto">
        <button class="btn btn-sm btn-outline-secondary px-3 py-1" onclick="window.__lang()"
          style="font-size:0.78rem;">
          <i class="bi bi-translate me-1"></i>${lang.langToggle}
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="window.__modal()" title="Manage API Keys"
          style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center;">
          <i class="bi bi-key-fill" style="font-size:0.88rem;"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" id="themeBtn" onclick="window.__theme()"
          style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center;">
          ${state.theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>'}
        </button>
      </div>

      <!-- Mobile Right actions -->
      <div class="d-flex d-lg-none align-items-center gap-1 ms-auto">
        <button class="btn btn-sm btn-outline-secondary" onclick="window.__theme()"
          style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center;">
          ${state.theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>'}
        </button>
        <button class="btn btn-sm btn-outline-secondary"
          style="width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center;"
          onclick="window.__toggleMobileMenu()">
          <i class="bi bi-list fs-5"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobileMenu" class="d-lg-none" style="display:none !important; border-top:1px solid var(--bs-border-color); padding:0.5rem 1rem;">
      <div class="py-2 d-flex flex-column gap-1">
        <a href="#/" class="nb-dropdown-item py-2" onclick="window.__hideMobileMenu()">
          <i class="bi bi-house-door text-primary"></i> Home
        </a>

        <!-- Mobile Quick Settings Row -->
        <div class="d-flex gap-2 my-1">
          <button class="btn btn-sm btn-outline-secondary flex-fill text-start py-2 px-3" onclick="window.__lang(); window.__hideMobileMenu();" style="font-size:0.83rem;">
            <i class="bi bi-translate me-2 text-primary"></i>Language: <strong>${state.lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</strong>
          </button>
          <button class="btn btn-sm btn-outline-secondary flex-fill text-start py-2 px-3" onclick="window.__modal(); window.__hideMobileMenu();" style="font-size:0.83rem;">
            <i class="bi bi-key-fill me-2 text-primary"></i>API Keys
          </button>
        </div>

        <div class="nb-dropdown-item-name px-3 py-1 mt-1" style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--bs-secondary-color);">Departments</div>
        ${deptData.map(dept => `
          <button class="nb-dropdown-item py-2" onclick="window.__navDept('${dept.id}'); window.__hideMobileMenu();">
            <div class="nb-dropdown-item-icon" style="background:${dept.color}18; color:${dept.color}; width:28px; height:28px; border-radius:7px; font-size:0.85rem;">
              <i class="bi ${dept.icon}"></i>
            </div>
            <span style="font-size:0.86rem; font-weight:600;">${dept.name}</span>
            <span class="ms-auto" style="font-size:0.65rem; color:${dept.status === 'live' ? 'var(--nb-emerald)' : 'var(--bs-secondary-color)'};">${dept.status === 'live' ? 'Live' : 'Soon'}</span>
          </button>`).join('')}
      </div>
    </div>
  </header>`;
}
