import { getKeyPool } from '../services/keyPool.js';
import { searchPortal } from '../services/searchEngine.js';

export function renderModal() {
  const pool = getKeyPool();
  return `
  <div class="nb-modal-backdrop" onclick="if(event.target===this)window.__closeModal()">
    <div class="nb-modal">
      <div class="nb-modal-header">
        <div class="fw-bold display-font d-flex align-items-center gap-2" style="font-size:1.05rem;">
          <div class="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style="width:32px; height:32px;">
            <i class="bi bi-key-fill"></i>
          </div>
          <span>Manage Gemini AI Keys</span>
        </div>
        <button class="btn-close" onclick="window.__closeModal()" aria-label="Close"></button>
      </div>

      <div class="nb-modal-body p-4 text-start">

        <!-- Info Callout Banner -->
        <div class="p-3 bg-body-tertiary border rounded-3 mb-4 d-flex gap-3 align-items-start" style="border-left:4px solid #3451b8 !important;">
          <i class="bi bi-shield-check text-primary fs-5 mt-1 flex-shrink-0"></i>
          <div style="font-size:0.83rem; line-height:1.6;">
            <strong class="text-body d-block mb-1">100% Private & Free Community AI</strong>
            NammaBengaluru AI auto-rotates across community-donated keys to keep the platform 100% free for everyone. Any keys you add are stored <strong>only locally in your browser</strong> and sent directly to Google Gemini API servers — they are <strong>never saved on our servers</strong> or shared with anyone else.
          </div>
        </div>

        <!-- Add Key Form -->
        <div class="mb-4">
          <label class="form-label fw-semibold text-secondary mb-2" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.04em;" for="newKey">Add Gemini API Key</label>
          <div class="input-group">
            <input type="password" class="form-control py-2 px-3" id="newKey" placeholder="Paste AIzaSy..." style="border-top-left-radius:12px; border-bottom-left-radius:12px; font-size:0.88rem;" />
            <button class="btn btn-primary px-4 fw-semibold" onclick="window.__addKey()" style="border-top-right-radius:12px; border-bottom-right-radius:12px; font-size:0.88rem;">
              <i class="bi bi-plus-lg me-1"></i>Add Key
            </button>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2" style="font-size:0.76rem;">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="text-primary fw-semibold text-decoration-none">
              <i class="bi bi-box-arrow-up-right me-1"></i>Get Free Key on AI Studio
            </a>
            <span class="text-secondary opacity-75">15 RPM / 1M TPM Free Limit</span>
          </div>
        </div>

        <!-- Active Key Pool List -->
        <div>
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-semibold text-secondary" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.04em;">Active Key Pool (${pool.length})</span>
            <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.7rem;">Auto-Rotated</span>
          </div>

          <div class="d-flex flex-column gap-2" style="max-height:220px; overflow-y:auto; scrollbar-width:thin;">
            ${pool.map((k, i) => `
            <div class="p-3 bg-body-tertiary border rounded-3 d-flex align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="badge ${k.status === 'ok' ? 'bg-success-subtle text-success border border-success-subtle' : k.status === 'exhausted' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-secondary-subtle text-secondary border'}" style="font-size:0.72rem;">
                  ${k.status === 'ok' ? 'Active' : k.status === 'exhausted' ? 'Quota Full' : 'Unchecked'}
                </span>
                <code class="px-2 py-1 bg-body border rounded text-body font-mono" style="font-size:0.8rem;">...${k.key.slice(-8)}</code>
                ${k.addedBy === 'user' ? '<span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.7rem;">Your Key</span>' : '<span class="badge bg-body border text-secondary" style="font-size:0.7rem;">Community</span>'}
              </div>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <button class="btn btn-sm btn-outline-primary py-1 px-3 rounded-pill" onclick="window.__testKey(${i})" title="Test connection" style="font-size:0.76rem;">Test</button>
                ${k.addedBy === 'user' ? `<button class="btn btn-sm btn-outline-danger py-1 px-3 rounded-circle" onclick="window.__removeKey(${i})" title="Remove key" style="font-size:0.76rem;">✕</button>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

// Search Results Content Renderer
export function renderSearchResultsHTML(query = '') {
  const results = searchPortal(query);
  if (query.trim().length < 2) {
    return `
    <div class="py-4 text-center text-secondary">
      <i class="bi bi-search display-6 opacity-50 mb-2 d-block text-primary"></i>
      <div class="fw-bold text-body" style="font-size:0.92rem;">Universal Namma Bengaluru Search</div>
      <div style="font-size:0.8rem;" class="mt-1">Try searching for <em>"tariff"</em>, <em>"bescom calculator"</em>, <em>"name change"</em>, <em>"outages"</em>, or <em>"1916 helpline"</em></div>
    </div>`;
  }
  if (results.length === 0) {
    return `
    <div class="py-4 text-center text-secondary">
      <i class="bi bi-exclamation-circle display-6 opacity-50 mb-2 d-block text-warning"></i>
      <div class="fw-bold text-body" style="font-size:0.92rem;">No matching results found for "${query}"</div>
      <div style="font-size:0.8rem;" class="mt-1">Check for spelling errors or try searching for major topics like <em>water bill</em>, <em>electricity tariff</em>, or <em>complaint guide</em>.</div>
    </div>`;
  }
  return `
  <div class="text-uppercase text-secondary fw-bold mb-3 px-1" style="font-size:0.72rem; letter-spacing:0.06em;">Matching Results (${results.length})</div>
  <div class="d-flex flex-column gap-2">
    ${results.map(r => `
    <a href="${r.url}" onclick="window.__closeSearchModal()" class="p-3 border rounded-3 text-decoration-none bg-body hover-bg-tertiary d-flex align-items-center justify-content-between gap-3 transition-all">
      <div class="d-flex align-items-center gap-3">
        <div class="p-3 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px; height:40px; font-size:1.1rem;">
          <i class="bi ${r.icon}"></i>
        </div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold text-body" style="font-size:0.9rem;">${r.title}</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.68rem;">${r.badge}</span>
          </div>
          <div class="text-secondary mt-1" style="font-size:0.78rem;">${r.desc}</div>
        </div>
      </div>
      <i class="bi bi-arrow-right text-primary fs-6 flex-shrink-0"></i>
    </a>`).join('')}
  </div>`;
}

// Universal Search Command Palette Modal
export function renderSearchModal(state) {
  const query = state.searchQuery || '';

  return `
  <div class="nb-modal-backdrop" onclick="if(event.target===this)window.__closeSearchModal()">
    <div class="nb-modal shadow-lg border-0 rounded-4 overflow-hidden" style="max-width: 680px; width:92%; background:var(--bs-body-bg);">
      
      <!-- Input Search Header -->
      <div class="p-3 p-md-4 border-bottom bg-body-tertiary">
        <div class="input-group input-group-lg border rounded-3 bg-body">
          <span class="input-group-text bg-transparent border-0 ps-3 text-primary">
            <i class="bi bi-search fs-4"></i>
          </span>
          <input type="text" id="modalSearchInput" class="form-control border-0 bg-transparent py-3 fs-6" 
            placeholder="Type to search departments, tariffs, calculators, services, 1916 helpline..." 
            value="${query}" 
            oninput="window.__onSearchInput(this.value)" 
            autocomplete="off" autofocus />
          <button class="btn border-0 text-secondary me-2" onclick="window.__closeSearchModal()">
            <kbd class="bg-body border text-secondary" style="font-size:0.7rem;">ESC</kbd>
          </button>
        </div>
      </div>

      <!-- Results Body -->
      <div class="p-3 p-md-4 text-start" id="modalSearchResults" style="max-height: 420px; overflow-y: auto; scrollbar-width: thin;">
        ${renderSearchResultsHTML(query)}
      </div>

      <!-- Footer Keyboard Hints -->
      <div class="p-3 bg-body-tertiary border-top d-flex align-items-center justify-content-between text-secondary" style="font-size:0.75rem;">
        <div>
          <span class="me-3"><kbd class="bg-body border text-body me-1" style="font-size:0.65rem;">Ctrl + K</kbd> Quick Search</span>
          <span><kbd class="bg-body border text-body me-1" style="font-size:0.65rem;">ESC</kbd> Close</span>
        </div>
        <div class="fw-medium text-primary">Namma Bengaluru Search</div>
      </div>

    </div>
  </div>`;
}

