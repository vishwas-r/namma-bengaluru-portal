import deptData from '../data/departments.json';

export function renderGlobalSidebar(state, lang) {
  const currentPath = window.location.hash || '#/';
  const isHome = state.route === 'home' || currentPath === '#/' || currentPath === '';
  const isDept = state.route === 'dept';

  if (isDept) {
    const dept = deptData.find(d => d.id === state.deptId) || deptData[0];
    const activeTab = state.activeTab || 'calculator';
    const isOpen = state.deptSidebarOpen !== false;

    return `
    <div id="nbDeptSidebarBackdrop" class="nb-dept-sidebar-backdrop ${isOpen ? 'is-visible' : ''}" onclick="window.__toggleSidebar(false)"></div>
    <aside id="nbDeptSidebar" class="nb-dept-sidebar ${isOpen ? 'is-open' : ''}">
      <div>
        <!-- Sidebar Header with Close Button (Mobile Only) -->
        <div class="d-lg-none d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
          <div class="fw-bold text-primary d-flex align-items-center gap-2" style="font-size:0.88rem;">
            <i class="bi ${dept.icon}"></i>
            <span>${dept.name} Navigation</span>
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center" onclick="window.__toggleSidebar(false)" style="width:26px; height:26px;" title="Close Navigation">
            <i class="bi bi-x fs-6"></i>
          </button>
        </div>

        <!-- Top Dept Home Pill -->
        <a href="#/dept/${dept.id}" onclick="window.__tab('overview')" class="btn border-0 text-start px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${activeTab === 'overview' ? 'btn-primary text-white fw-bold shadow-sm' : 'bg-primary-subtle text-primary fw-bold'} w-100 mb-3 mt-1" style="font-size:0.88rem;">
          <i class="bi ${dept.icon} ${activeTab === 'overview' ? 'text-white' : ''}" style="font-size:1.05rem;"></i>
          <span>${dept.name} Home</span>
        </a>

        <!-- Section: INFORMATION -->
        <div class="mb-3 text-start">
          <div class="fw-bold text-uppercase text-secondary mb-2 px-2" style="font-size:0.68rem; letter-spacing:0.06em;">INFORMATION</div>
          <div class="nav flex-column gap-1">
            <button onclick="window.__tab('overview')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'overview' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-info-circle text-secondary"></i><span>About ${dept.name}</span>
            </button>
            <button onclick="window.__tab('tariff')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'tariff' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-currency-rupee text-secondary"></i><span>Tariff & Rates</span>
            </button>
            <button onclick="window.__tab('notices')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'notices' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-file-text text-secondary"></i><span>Regulations & Policies</span>
            </button>
          </div>
        </div>

        <!-- Section: TOOLS & CALCULATORS -->
        <div class="mb-3 text-start">
          <div class="fw-bold text-uppercase text-secondary mb-2 px-2" style="font-size:0.68rem; letter-spacing:0.06em;">TOOLS & CALCULATORS</div>
          <div class="nav flex-column gap-1">
            <button onclick="window.__tab('calculator')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'calculator' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-calculator text-secondary"></i><span>${(dept.id === 'bmrcl' || dept.id === 'metro') ? 'Fare Calculator' : 'Bill Calculator'}</span>
            </button>
          </div>
        </div>

        <!-- Section: REPORTS & ISSUES -->
        <div class="mb-3 text-start">
          <div class="fw-bold text-uppercase text-secondary mb-2 px-2" style="font-size:0.68rem; letter-spacing:0.06em;">${(dept.id === 'bmrcl' || dept.id === 'metro') ? 'REPORTS & ISSUES' : 'OUTAGES & REPORTS'}</div>
          <div class="nav flex-column gap-1">
            <button onclick="window.__tab('planned-outages')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'planned-outages' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-calendar-event text-secondary"></i><span>${(dept.id === 'bmrcl' || dept.id === 'metro') ? 'Official Announcements' : 'Planned Outages'}</span>
            </button>
            <button onclick="window.__tab('crowd-reports')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center justify-content-between ${activeTab === 'crowd-reports' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-people text-secondary"></i><span>Crowd Reports</span>
              </div>
              <span class="badge bg-success-subtle text-success" style="font-size:0.65rem;">Live</span>
            </button>
          </div>
        </div>

        <!-- Section: SERVICES & APPLICATIONS -->
        <div class="mb-3 text-start">
          <div class="fw-bold text-uppercase text-secondary mb-2 px-2" style="font-size:0.68rem; letter-spacing:0.06em;">SERVICES & APPLICATIONS</div>
          <div class="nav flex-column gap-1">
            <button onclick="window.__tab('services')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'services' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-file-earmark-text text-secondary"></i><span>${(dept.id === 'bmrcl' || dept.id === 'metro') ? 'Services & Guides' : 'All Services'}</span>
            </button>
          </div>
        </div>

        <!-- Section: COMPLAINT GUIDE -->
        <div class="mb-3 text-start">
          <div class="fw-bold text-uppercase text-secondary mb-2 px-2" style="font-size:0.68rem; letter-spacing:0.06em;">COMPLAINT GUIDE</div>
          <div class="nav flex-column gap-1">
            <button onclick="window.__tab('complaint')" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${activeTab === 'complaint' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
              <i class="bi bi-journal-check text-secondary"></i><span>Helpline & Directory</span>
            </button>
          </div>
        </div>

        <!-- Section: Back to Main Menu -->
        <div class="pt-2 border-top">
          <a href="#/" onclick="window.__toggleSidebar(false)" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 text-secondary hover-bg-tertiary w-100" style="font-size:0.82rem;">
            <i class="bi bi-arrow-left"></i><span>Back to Homepage</span>
          </a>
        </div>
      </div>

      <!-- Bottom Card -->
      <div class="mt-3 p-3 rounded-3 bg-body-tertiary border text-start">
        <div class="fw-bold text-body mb-1" style="font-size:0.8rem;">About This Project</div>
        <p class="text-secondary mb-2" style="font-size:0.75rem;">An open-source citizen help platform.</p>
        <a href="#/about" class="text-primary text-decoration-none fw-semibold" style="font-size:0.75rem;">Learn more &rarr;</a>
      </div>
    </aside>`;
  }

  return `
  <aside class="nb-global-sidebar d-none d-lg-flex flex-column justify-content-between px-3 pt-2 pb-3 border-end bg-body position-fixed start-0 bottom-0" style="top: 92px; width:240px; z-index:1020; overflow-y:auto;">
    <div>
      <!-- Navigation Menu -->
      <div class="nav flex-column gap-1 text-start" role="navigation">
        <!-- 1. Home -->
        <a href="#/" class="btn border-0 text-start px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${isHome ? 'btn-primary text-white fw-bold shadow-sm' : 'text-body hover-bg-tertiary'}" style="font-size:0.88rem; transition:all 0.15s ease;">
          <i class="bi bi-house-door-fill ${isHome ? 'text-white' : 'text-secondary'}" style="font-size:1.05rem;"></i>
          <span>Home</span>
        </a>

        <!-- 2. Departments Dropdown Expandable Sub-list -->
        <div class="nb-sidebar-dept-wrapper mt-1">
          <button class="btn border-0 w-100 text-start px-3 py-2 rounded-3 d-flex align-items-center justify-content-between ${isDept ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" style="font-size:0.88rem;" onclick="window.__toggleSidebarDepts(event)">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-grid-3x3-gap-fill ${isDept ? 'text-primary' : 'text-secondary'}" style="font-size:1.05rem;"></i>
              <span>Departments</span>
            </div>
            <i class="bi bi-chevron-down text-secondary" id="sidebarDeptChevron" style="font-size:0.75rem;"></i>
          </button>

          <!-- Expandable Sub-list -->
          <div class="ps-3 pe-1 pt-1 d-flex flex-column gap-1" id="sidebarDeptSublist">
            ${deptData.map(dept => {
              const isCurrentDept = isDept && state.deptId === dept.id;
              return `
              <a href="#/dept/${dept.id}" class="d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none ${isCurrentDept ? 'bg-primary text-white fw-semibold' : 'text-body hover-bg-tertiary'}" style="font-size:0.82rem;">
                <i class="bi ${dept.icon} ${isCurrentDept ? 'text-white' : ''}" style="color:${isCurrentDept ? '#ffffff' : dept.color}; font-size:0.95rem;"></i>
                <span>${dept.name}</span>
                ${dept.status !== 'live' ? '<span class="badge bg-secondary-subtle text-secondary ms-auto" style="font-size:0.65rem;">Soon</span>' : ''}
              </a>`;
            }).join('')}
          </div>
        </div>

        <!-- 3. About This Project -->
        <a href="#/about" class="btn border-0 text-start px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${state.route === 'about' ? 'btn-primary text-white fw-bold shadow-sm' : 'text-body hover-bg-tertiary'} mt-1" style="font-size:0.88rem; transition:all 0.15s ease;">
          <i class="bi bi-info-circle ${state.route === 'about' ? 'text-white' : 'text-secondary'}" style="font-size:1.05rem;"></i>
          <span>About This Project</span>
        </a>
      </div>
    </div>

    <!-- Sidebar Bottom Card -->
    <div class="mt-4 p-3 rounded-3 bg-body-tertiary border text-start" style="font-size:0.78rem;">
      <div class="fw-bold text-body mb-1">About Namma Bengaluru</div>
      <p class="text-secondary mb-3" style="font-size:0.72rem; line-height:1.45;">
        An open-source citizen help platform dedicated to making government services accessible and transparent.
      </p>
      <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold" style="font-size:0.76rem;">
        <i class="bi bi-github"></i>
        <span>Star on GitHub</span>
      </a>
      <div class="text-center text-secondary mt-2" style="font-size:0.68rem;">Made with ❤️ for Bengaluru</div>
    </div>
  </aside>`;
}

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
  <div class="nb-sos-bar d-flex align-items-center justify-content-start justify-content-md-center gap-2">
    <span class="opacity-75 flex-shrink-0" style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.08em;">
      <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergency
    </span>
    ${links.map((l, i) => `
      ${i > 0 ? '<span class="nb-sos-sep flex-shrink-0">|</span>' : ''}
      <a href="${l.href}" class="nb-sos-link flex-shrink-0">
        <i class="bi ${l.icon} me-1"></i>${l.label}: <strong>${l.num}</strong>
      </a>`).join('')}
  </div>`;
}

export function renderHeader(state, lang) {
  const isOnDeptPage = state.route === 'dept';
  const isDept = state.route === 'dept';
  const currentDept = isDept ? (deptData.find(d => d.id === state.deptId) || deptData[0]) : null;
  const activeTab = state.activeTab || 'overview';

  return `
  <header class="nb-header border-bottom bg-body" style="z-index: 1020;">
    <div class="container-fluid px-2 px-sm-3 px-lg-4 d-flex align-items-center justify-content-between py-2 gap-2">

      <!-- Left: Logo -->
      <a href="#/" class="d-flex align-items-center text-decoration-none flex-shrink-0">
        <img id="nbAppLogo" src="${state.theme === 'dark' ? './assets/images/logo.svg' : './assets/images/logo-light.svg'}" alt="Namma Bengaluru Logo" width="36" height="36" class="me-2 me-sm-3" style="border-radius:9px; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.12));" />
        <div class="lh-sm text-start">
          <div class="fw-bold display-font" style="font-size:0.98rem; color:var(--bs-body-color); letter-spacing:-0.01em;">Namma Bengaluru</div>
          <div class="nb-logo-subtitle d-none d-sm-block" style="font-size:0.66rem; color:var(--bs-secondary-color); font-weight:500;">Citizen Services Portal</div>
        </div>
      </a>

      <!-- Center: Header Search Bar (Desktop) -->
      <div class="d-none d-md-flex align-items-center flex-grow-1 mx-lg-4" style="max-width: 460px;">
        <div class="input-group input-group-sm rounded-3 border bg-body-tertiary w-100" style="cursor:pointer;" onclick="window.__modal()">
          <span class="input-group-text bg-transparent border-0 ps-3 text-secondary">
            <i class="bi bi-search" style="font-size:0.85rem;"></i>
          </span>
          <input type="text" id="headerGlobalSearch" class="form-control border-0 bg-transparent py-2 fs-7" placeholder="Search for departments, services, guides..." onkeyup="window.__handleHeaderSearch(event)">
          <span class="input-group-text bg-transparent border-0 pe-3">
            <kbd class="bg-body border text-secondary shadow-2xs" style="font-size:0.68rem; font-family:var(--nb-font-body);">Ctrl + K</kbd>
          </span>
        </div>
      </div>

      <!-- Right: Navigation links -->
      <div class="d-flex align-items-center gap-2 gap-sm-2 flex-shrink-0">
        <!-- Search Trigger Icon for Mobile -->
        <button class="btn btn-sm btn-outline-secondary rounded-circle d-md-none p-0 d-flex align-items-center justify-content-center" onclick="window.__modal()" title="Search" style="width:34px; height:34px;">
          <i class="bi bi-search" style="font-size:0.88rem;"></i>
        </button>

        <!-- Departments dropdown (Desktop & Tablet) -->
        <div class="nb-dropdown d-none d-md-inline-block" id="deptDropdown">
          <button class="nb-dropdown-toggle ${isOnDeptPage ? 'active-nav' : ''}"
            style="${isOnDeptPage ? 'color:var(--nb-primary); background:var(--nb-primary-glow);' : ''}"
            onclick="window.__toggleDropdown(event)" aria-haspopup="true">
            <i class="bi bi-grid-3x3-gap"></i>
            <span>Departments</span>
            <i class="bi bi-chevron-down nb-chevron"></i>
          </button>
          <div class="nb-dropdown-menu" id="deptMenu">
            <a href="#/departments" onclick="window.__toggleDropdown(event)" class="nb-dropdown-item text-primary fw-bold border-bottom py-3 d-flex align-items-center justify-content-between" style="font-size:0.82rem;">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-grid-3x3-gap-fill"></i>
                <span>All Departments Directory</span>
              </div>
              <i class="bi bi-arrow-right"></i>
            </a>
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
                ${dept.status !== 'live' ? `
                <span class="nb-dropdown-item-badge text-secondary" style="background:var(--bs-secondary-bg);">
                  Soon
                </span>` : ''}
              </button>`).join('')}
          </div>
        </div>

        <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="nb-dropdown-toggle text-decoration-none d-none d-lg-inline-flex">
          <i class="bi bi-code-slash"></i> Open Source
        </a>

        <!-- Language Dropdown (Tablet & Desktop) -->
        <div class="dropdown d-none d-sm-flex">
          <button class="btn btn-sm btn-outline-secondary rounded-2 px-2 py-1 d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Switch Language" style="font-size:0.78rem;">
            <i class="bi bi-translate"></i>
            <span>Language</span>
            <i class="bi bi-chevron-down ms-1" style="font-size:0.55rem;"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="font-size: 0.85rem;">
            <li><button class="dropdown-item" onclick="window.__changeLanguage('en')">English</button></li>
            <li><button class="dropdown-item" onclick="window.__changeLanguage('kn')">ಕನ್ನಡ (Kannada)</button></li>
            <li><button class="dropdown-item" onclick="window.__changeLanguage('te')">తెలుగు (Telugu)</button></li>
            <li><button class="dropdown-item" onclick="window.__changeLanguage('ta')">தமிழ் (Tamil)</button></li>
            <li><button class="dropdown-item" onclick="window.__changeLanguage('hi')">हिन्दी (Hindi)</button></li>
          </ul>
        </div>

        <!-- Theme toggle -->
        <button class="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center" onclick="window.__theme()" title="Toggle Theme" style="width:34px; height:34px;">
          <i class="bi ${state.theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars'}"></i>
        </button>

        <!-- Mobile menu hamburger toggle -->
        <button class="btn btn-sm btn-primary rounded-3 d-lg-none p-0 ms-1 d-flex align-items-center justify-content-center" onclick="window.__toggleMobileMenu()" title="Toggle Navigation Menu" style="width:36px; height:36px;">
          <i class="bi bi-list fs-4"></i>
        </button>
      </div>

    </div>

    <!-- Mobile Menu Drawer -->
    <div id="mobileMenu" class="d-lg-none bg-body border-top" style="display:none !important; padding:0.75rem 1rem;">
      <div class="py-2 d-flex flex-column gap-2 text-start">
        <!-- Search Trigger -->
        <button class="btn btn-sm btn-outline-primary w-100 text-start py-2 px-3 d-flex align-items-center justify-content-between" onclick="window.__modal(); window.__hideMobileMenu();">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-search text-primary"></i>
            <span>Search Services, Guides, Outages...</span>
          </div>
          <kbd class="bg-body border text-secondary" style="font-size:0.65rem;">Ctrl+K</kbd>
        </button>

        <a href="#/" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 ${state.route === 'home' ? 'bg-primary-subtle text-primary fw-bold' : 'text-body hover-bg-tertiary'}" onclick="window.__hideMobileMenu()" style="font-size:0.88rem;">
          <i class="bi bi-house-door-fill text-primary"></i> <span>Home</span>
        </a>

        <a href="#/departments" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center justify-content-between text-body hover-bg-tertiary" onclick="window.__hideMobileMenu()" style="font-size:0.88rem;">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-grid-3x3-gap-fill text-primary"></i> <span>All Departments Directory</span>
          </div>
          <i class="bi bi-arrow-right text-secondary" style="font-size:0.8rem;"></i>
        </a>

        <!-- Mobile Quick Settings Row -->
        <div class="d-flex gap-2 my-1">
          <select class="form-select form-select-sm border-secondary text-secondary flex-fill px-3 py-2" onchange="window.__changeLanguage(this.value); window.__hideMobileMenu();" style="font-size:0.82rem; height: auto; background-color: transparent;">
            <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
            <option value="kn" ${state.lang === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
            <option value="te" ${state.lang === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
            <option value="ta" ${state.lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
            <option value="hi" ${state.lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
          </select>
          <button class="btn btn-sm btn-outline-secondary flex-fill text-start py-2 px-3" onclick="window.__modal(); window.__hideMobileMenu();" style="font-size:0.82rem;">
            <i class="bi bi-key-fill me-2 text-primary"></i>API Keys
          </button>
        </div>

        <div class="fw-bold px-3 py-1 mt-1 text-uppercase text-secondary" style="font-size:0.68rem; letter-spacing:0.08em;">Departments</div>
        ${deptData.map(dept => `
          <button class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center justify-content-between text-body hover-bg-tertiary" onclick="window.__navDept('${dept.id}'); window.__hideMobileMenu();">
            <div class="d-flex align-items-center gap-2">
              <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="background:${dept.color}18; color:${dept.color}; width:28px; height:28px; border-radius:7px; font-size:0.85rem;">
                <i class="bi ${dept.icon}"></i>
              </div>
              <span style="font-size:0.86rem; font-weight:600;">${dept.name}</span>
            </div>
            ${dept.status !== 'live' ? '<span class="badge bg-secondary-subtle text-secondary" style="font-size:0.65rem;">Soon</span>' : ''}
          </button>`).join('')}

        <a href="#/about" class="btn border-0 text-start px-3 py-2 rounded-2 d-flex align-items-center gap-2 text-body hover-bg-tertiary mt-1" onclick="window.__hideMobileMenu()" style="font-size:0.88rem;">
          <i class="bi bi-info-circle text-primary"></i> <span>About This Project</span>
        </a>
      </div>
    </div>
  </header>`;
}
