import { getKeyPool } from '../services/keyPool.js';

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
          <i class="bi bi-shield-check text-primary fs-5 mt-0.5 flex-shrink-0"></i>
          <div style="font-size:0.83rem; line-height:1.6;">
            <strong class="text-body d-block mb-1">Crowd-Sourced Key Pool</strong>
            Ask NammaBengaluru AI auto-rotates across community-donated keys. Keys are stored <em>locally in your browser</em> and sent directly to Google Gemini API servers.
          </div>
        </div>

        <!-- Add Key Form -->
        <div class="mb-4">
          <label class="form-label fw-semibold text-secondary mb-2" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.04em;" for="newKey">Add Gemini API Key</label>
          <div class="input-group">
            <input type="password" class="form-control py-2.5 px-3" id="newKey" placeholder="Paste AIzaSy..." style="border-top-left-radius:12px; border-bottom-left-radius:12px; font-size:0.88rem;" />
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
              <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                <button class="btn btn-sm btn-outline-primary py-1 px-3 rounded-pill" onclick="window.__testKey(${i})" title="Test connection" style="font-size:0.76rem;">Test</button>
                ${k.addedBy === 'user' ? `<button class="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-circle" onclick="window.__removeKey(${i})" title="Remove key" style="font-size:0.76rem;">✕</button>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>

      </div>
    </div>
  </div>`;
}
