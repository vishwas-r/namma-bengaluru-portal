export function renderAboutPage() {
  return `
  <div class="container-fluid px-lg-4 py-4 text-start">
    
    <!-- Hero Banner -->
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 text-white overflow-hidden position-relative" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);">
      <div class="position-relative z-1" style="max-width:720px;">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 text-white border border-white border-opacity-20 mb-3 fw-semibold" style="font-size:0.78rem;">
          <i class="bi bi-code-slash text-warning"></i>
          <span>100% Open-Source & Community-Driven</span>
        </div>
        <h1 class="fw-extrabold display-5 mb-3" style="letter-spacing:-0.02em;">About Namma Bengaluru Portal</h1>
        <p class="lead opacity-90 mb-4" style="font-size:1.1rem; line-height:1.6;">
          An open-source citizen utility platform built to empower the residents of Bengaluru with transparent bill calculators, official tariff breakdowns, step-by-step service guides, and direct escalation directories.
        </p>
        <div class="d-flex gap-3 flex-wrap">
          <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="btn btn-light rounded-pill fw-bold px-4 py-3 shadow-sm" style="font-size:0.9rem;">
            <i class="bi bi-github me-2"></i>Star on GitHub
          </a>
          <a href="https://github.com/vishwas-r/namma-bengaluru-portal/fork" target="_blank" rel="noopener" class="btn btn-outline-light rounded-pill fw-semibold px-4 py-3" style="font-size:0.9rem;">
            <i class="bi bi-git me-2"></i>Fork & Contribute
          </a>
        </div>
      </div>
    </div>

    <div class="row g-4">
      
      <!-- Left Column: Mission & Features -->
      <div class="col-lg-8 d-flex flex-column gap-4">
        
        <!-- Mission Card -->
        <div class="nb-card p-4">
          <h4 class="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
            <i class="bi bi-bullseye"></i>Our Mission
          </h4>
          <p class="text-body mb-3" style="line-height:1.7; font-size:0.95rem;">
            Navigating public utility portals in Bengaluru can often be confusing due to scattered government websites, outdated PDF notifications, complex tariff formulas, and opaque grievance redressal procedures.
          </p>
          <p class="text-body mb-0" style="line-height:1.7; font-size:0.95rem;">
            <strong>Namma Bengaluru Portal</strong> was created to solve this problem by providing a single, modern, high-performance web platform that consolidates essential civic information — starting with <strong>BWSSB (Water)</strong> and <strong>BESCOM (Electricity)</strong>, with upcoming modules for <strong>BBMP</strong>, <strong>BMTC</strong>, <strong>Namma Metro</strong>, and <strong>BDA</strong>.
          </p>
        </div>

        <!-- Key Pillars Grid -->
        <div class="row g-3">
          <div class="col-md-6">
            <div class="nb-card p-4 h-100">
              <div class="p-3 rounded-3 bg-primary-subtle text-primary d-inline-block mb-3" style="width:42px; height:42px; text-align:center;">
                <i class="bi bi-calculator-fill fs-5"></i>
              </div>
              <h5 class="fw-bold mb-2">Transparent Calculators</h5>
              <p class="text-secondary mb-0" style="font-size:0.86rem; line-height:1.5;">
                Instant, precise bill estimation based on official Karnataka Gazette tariff slabs for domestic, commercial, and bulk connections.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="nb-card p-4 h-100">
              <div class="p-3 rounded-3 bg-success-subtle text-success d-inline-block mb-3" style="width:42px; height:42px; text-align:center;">
                <i class="bi bi-diagram-3-fill fs-5"></i>
              </div>
              <h5 class="fw-bold mb-2">4-Level Escalation Directory</h5>
              <p class="text-secondary mb-0" style="font-size:0.86rem; line-height:1.5;">
                Direct phone numbers, office addresses, and emails for Executive Engineers (EE), AEEs, and Service Stations across 16 BWSSB zones.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="nb-card p-4 h-100">
              <div class="p-3 rounded-3 bg-warning-subtle text-warning d-inline-block mb-3" style="width:42px; height:42px; text-align:center;">
                <i class="bi bi-shield-check fs-5"></i>
              </div>
              <h5 class="fw-bold mb-2">100% Free & No Ads</h5>
              <p class="text-secondary mb-0" style="font-size:0.86rem; line-height:1.5;">
                Built strictly for public interest. Zero advertisements, zero paywalls, zero tracking scripts, and no commercial monetization.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="nb-card p-4 h-100">
              <div class="p-3 rounded-3 bg-purple-subtle text-purple d-inline-block mb-3" style="width:42px; height:42px; text-align:center; background:#f3e8ff; color:#7e22ce;">
                <i class="bi bi-translate fs-5"></i>
              </div>
              <h5 class="fw-bold mb-2">Bilingual (English & ಕನ್ನಡ)</h5>
              <p class="text-secondary mb-0" style="font-size:0.86rem; line-height:1.5;">
                Full localization support for English and Kannada to ensure digital accessibility for every resident of Namma Bengaluru.
              </p>
            </div>
          </div>
        </div>

        <!-- Contribution Guidelines Card -->
        <div class="nb-card p-4">
          <h4 class="fw-bold mb-3 d-flex align-items-center gap-2 text-success">
            <i class="bi bi-git"></i>How to Contribute
          </h4>
          <p class="text-body mb-3" style="font-size:0.92rem; line-height:1.6;">
            We welcome contributions from developers, civic tech enthusiasts, designers, and residents of Bengaluru! Here are ways you can get involved:
          </p>

          <div class="d-flex flex-column gap-3">
            <div class="d-flex align-items-start gap-3 p-3 border rounded-3 bg-body-tertiary">
              <div class="badge bg-primary rounded-circle p-2 fs-6">1</div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.9rem;">Submit Data & Gazette Updates</div>
                <div class="text-secondary" style="font-size:0.82rem;">Help keep tariff datasets, helpline contacts, and official circular links up-to-date by submitting JSON updates.</div>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3 p-3 border rounded-3 bg-body-tertiary">
              <div class="badge bg-primary rounded-circle p-2 fs-6">2</div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.9rem;">Build New Department Modules</div>
                <div class="text-secondary" style="font-size:0.82rem;">Help us build modules for upcoming civic departments such as <strong>BBMP</strong> (Property Tax, Trade License), <strong>BMTC</strong> (Bus Pass Wizards, Bus Stand Directory), or <strong>Namma Metro</strong>.</div>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3 p-3 border rounded-3 bg-body-tertiary">
              <div class="badge bg-primary rounded-circle p-2 fs-6">3</div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.9rem;">Improve Kannada Translations</div>
                <div class="text-secondary" style="font-size:0.82rem;">Enhance localization strings to make municipal information crystal clear for native Kannada speakers.</div>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3 p-3 border rounded-3 bg-body-tertiary">
              <div class="badge bg-primary rounded-circle p-2 fs-6">4</div>
              <div>
                <div class="fw-bold text-body" style="font-size:0.9rem;">Report Bugs & Feature Requests</div>
                <div class="text-secondary" style="font-size:0.82rem;">Spotted a broken link or an incorrect phone number? Open an Issue on our GitHub repository.</div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="text-secondary fw-medium" style="font-size:0.85rem;">Ready to start contributing?</span>
            <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" style="font-size:0.85rem;">
              <i class="bi bi-github me-2"></i>Visit GitHub Repository &rarr;
            </a>
          </div>
        </div>

      </div>

      <!-- Right Column: Tech Stack & Repository Meta -->
      <div class="col-lg-4 d-flex flex-column gap-4">
        
        <!-- Repo Overview Card -->
        <div class="nb-card p-4">
          <h5 class="fw-bold mb-3 border-bottom pb-2"><i class="bi bi-info-circle text-primary me-2"></i>Project Details</h5>
          
          <div class="d-flex flex-column gap-3" style="font-size:0.85rem;">
            <div class="d-flex justify-content-between border-bottom pb-2">
              <span class="text-secondary">Repository</span>
              <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="fw-bold text-primary text-decoration-none">vishwas-r/namma-bengaluru-portal</a>
            </div>
            <div class="d-flex justify-content-between border-bottom pb-2">
              <span class="text-secondary">License</span>
              <span class="fw-semibold text-body">MIT License</span>
            </div>
            <div class="d-flex justify-content-between border-bottom pb-2">
              <span class="text-secondary">Built With</span>
              <span class="fw-semibold text-body">JavaScript (ES6+), Vite, CSS3</span>
            </div>
            <div class="d-flex justify-content-between border-bottom pb-2">
              <span class="text-secondary">UI Framework</span>
              <span class="fw-semibold text-body">Bootstrap 5 + Vanilla CSS</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-secondary">Maps & Charts</span>
              <span class="fw-semibold text-body">Leaflet.js + CanvasJS</span>
            </div>
          </div>
        </div>

        <!-- Tech Stack Card -->
        <div class="nb-card p-4">
          <h5 class="fw-bold mb-3 border-bottom pb-2"><i class="bi bi-cpu text-primary me-2"></i>Technology Stack</h5>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style="font-size:0.78rem;">Vanilla JS</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style="font-size:0.78rem;">Vite 8</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style="font-size:0.78rem;">Bootstrap 5.3</span>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2" style="font-size:0.78rem;">Leaflet Maps</span>
            <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2" style="font-size:0.78rem;">CanvasJS</span>
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2" style="font-size:0.78rem;">Gemini AI API</span>
          </div>
        </div>

        <!-- Community Callout Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-primary text-white" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
          <i class="bi bi-heart-fill fs-1 text-danger mb-2"></i>
          <h5 class="fw-bold mb-2">Built for Bengaluru</h5>
          <p class="opacity-90 mb-3" style="font-size:0.84rem; line-height:1.5;">
            Namma Bengaluru is designed to put citizen rights and civic transparency back into the hands of the public.
          </p>
          <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="btn btn-light rounded-pill fw-bold w-100 py-2" style="font-size:0.84rem;">
            Join as a Contributor &rarr;
          </a>
        </div>

      </div>

    </div>

  </div>`;
}
