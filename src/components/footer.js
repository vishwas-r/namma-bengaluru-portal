export function renderFooter() {
  return `
  <footer class="nb-footer mt-5">
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-4 col-md-6 text-start">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="nb-logo-icon"><i class="bi bi-geo-alt-fill"></i></div>
            <div>
              <div class="fw-bold display-font" style="font-size:1.05rem; color:var(--bs-body-color);">Namma Bengaluru</div>
              <div style="font-size:0.72rem; color:var(--bs-secondary-color);">Citizen Services Portal</div>
            </div>
          </div>
          <p class="text-secondary mb-3" style="font-size:0.84rem; line-height:1.65; max-width:320px;">
            Unofficial open-source citizen services portal for Bengaluru. Access utility calculators, official circulars, complaint guides, and emergency helplines across BWSSB, BESCOM, BBMP, BMTC, BDA, and more. Maintained by community volunteers.
          </p>
          <div class="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-body-tertiary border" style="font-size:0.73rem; color:var(--bs-secondary-color); font-weight:600;">
            <i class="bi bi-code-slash text-primary me-1"></i>MIT License — Open Source
          </div>
        </div>

        <div class="col-lg-2 col-md-6 text-start">
          <div class="fw-bold mb-3 display-font" style="font-size:0.9rem; letter-spacing:0.02em;">Emergency</div>
          <ul class="nb-footer-links">
            <li><a href="tel:112"><i class="bi bi-shield-fill text-danger me-2"></i>Police (112)</a></li>
            <li><a href="tel:1916"><i class="bi bi-droplet-fill text-primary me-2"></i>BWSSB (1916)</a></li>
            <li><a href="tel:1912"><i class="bi bi-lightning-charge-fill text-warning me-2"></i>BESCOM (1912)</a></li>
            <li><a href="tel:1533"><i class="bi bi-building-fill text-success me-2"></i>BBMP (1533)</a></li>
            <li><a href="tel:1098"><i class="bi bi-heart-fill me-2" style="color:#ec4899;"></i>Childline (1098)</a></li>
            <li><a href="tel:1090"><i class="bi bi-person-heart text-info me-2"></i>Senior (1090)</a></li>
            <li><a href="tel:108"><i class="bi bi-hospital-fill text-danger me-2"></i>Ambulance (108)</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6 text-start">
          <div class="fw-bold mb-3 display-font" style="font-size:0.9rem; letter-spacing:0.02em;">Departments</div>
          <ul class="nb-footer-links">
            <li><a href="#/dept/bwssb"><i class="bi bi-chevron-right text-primary me-1.5" style="font-size:0.7rem;"></i>BWSSB Water Board</a></li>
            <li><a href="#/dept/bescom"><i class="bi bi-chevron-right text-primary me-1.5" style="font-size:0.7rem;"></i>BESCOM Electricity</a></li>
            <li><a href="#/dept/bbmp"><i class="bi bi-chevron-right text-primary me-1.5" style="font-size:0.7rem;"></i>GBA / BBMP Civic</a></li>
            <li><a href="#/dept/bmtc"><i class="bi bi-chevron-right text-primary me-1.5" style="font-size:0.7rem;"></i>BMTC City Transit</a></li>
            <li><a href="#/dept/bda"><i class="bi bi-chevron-right text-primary me-1.5" style="font-size:0.7rem;"></i>BDA Development</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6 text-start">
          <div class="fw-bold mb-3 display-font" style="font-size:0.9rem; letter-spacing:0.02em;">Open Source</div>
          <ul class="nb-footer-links">
            <li><a href="https://github.com" target="_blank" rel="noopener"><i class="bi bi-github me-2"></i>GitHub Repository</a></li>
            <li><a href="https://rti.karnataka.gov.in" target="_blank" rel="noopener"><i class="bi bi-file-earmark-text me-2"></i>Karnataka RTI Portal</a></li>
            <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener"><i class="bi bi-key-fill me-2 text-warning"></i>Get Free AI Key</a></li>
            <li><a href="https://bwssb.karnataka.gov.in" target="_blank" rel="noopener"><i class="bi bi-globe me-2 text-primary"></i>Official BWSSB Portal</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="nb-footer-bottom py-3">
      <div class="container d-flex align-items-center justify-content-between flex-wrap gap-2 text-secondary" style="font-size:0.78rem;">
        <div>© 2026 Namma Bengaluru. Unofficial community project. Not affiliated with any government department.</div>
        <div class="d-flex gap-3">
          <a href="https://bwssb.karnataka.gov.in" target="_blank" rel="noopener" class="text-secondary text-decoration-none">BWSSB</a>
          <a href="https://bescom.karnataka.gov.in" target="_blank" rel="noopener" class="text-secondary text-decoration-none">BESCOM</a>
          <a href="https://bbmp.gov.in" target="_blank" rel="noopener" class="text-secondary text-decoration-none">BBMP</a>
        </div>
      </div>
    </div>
  </footer>`;
}
