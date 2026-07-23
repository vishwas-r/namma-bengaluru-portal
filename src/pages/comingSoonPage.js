export function renderBreadcrumb(dept) {
  return `
  <nav class="d-flex align-items-center gap-2 my-3 text-secondary" style="font-size:0.82rem;" aria-label="Breadcrumb">
    <a href="#/" class="text-secondary text-decoration-none">Home</a>
    <span class="opacity-50"><i class="bi bi-chevron-right" style="font-size:0.65rem;"></i></span>
    <span class="fw-semibold text-body">${dept.name}</span>
  </nav>`;
}

export function renderComingSoonPage(dept) {
  return `
  <div class="nb-dept-hero" style="--dept-hero-glow:${dept.color}22;">
    <div class="container nb-dept-hero-content text-start">
      ${renderBreadcrumb(dept)}
      <div class="nb-dept-hero-icon" style="background:${dept.color}18; color:${dept.color};">
        <i class="bi ${dept.icon}"></i>
      </div>
      <h1 class="fw-bold mb-1" style="font-size:1.85rem; letter-spacing:-0.02em;">${dept.fullName}</h1>
      <p class="text-secondary mb-0">${dept.description}</p>
    </div>
  </div>
  <div class="container py-5 text-center" style="max-width:600px;">
    <i class="bi bi-tools mb-3 d-block" style="font-size:3.5rem; color:var(--bs-secondary-color); opacity:0.35;"></i>
    <h2 class="h3 fw-bold">Module Under Development</h2>
    <p class="text-secondary mb-4">The ${dept.name} service hub is being built by the open-source community. You can help by contributing data, translations, or code.</p>
    <div class="d-flex justify-content-center gap-2 flex-wrap">
      <a href="https://github.com" target="_blank" rel="noopener" class="btn btn-primary">
        <i class="bi bi-github me-1"></i>Contribute on GitHub
      </a>
      <a href="#/" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Back to Home
      </a>
    </div>
    <div class="mt-4 p-3 nb-card text-start">
      <div class="nb-section-label mb-2">Quick Access</div>
      <a href="${dept.website}" target="_blank" rel="noopener" class="nb-btn-official me-2 mb-2">
        <i class="bi bi-globe"></i> ${dept.name} Official Website
      </a>
      <a href="tel:${dept.helpline}" class="nb-btn-official mb-2">
        <i class="bi bi-telephone"></i> Helpline: ${dept.helpline}
      </a>
    </div>
  </div>`;
}
