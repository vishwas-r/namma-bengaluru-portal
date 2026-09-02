import stationsData from '../data/metro/stations.json';

export function renderMetroMapHTML() {
  return `
  <div class="nb-card p-4 text-start shadow-sm border-0" style="position: relative; z-index: 1; background: var(--bs-card-bg); border-radius: 16px;">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div>
        <h5 class="fw-bold mb-1 text-body"><i class="bi bi-map-fill text-primary me-2"></i>Namma Metro Network on Google Maps</h5>
        <p class="text-secondary mb-0" style="font-size:0.85rem;">Live official Google Maps view of the Bengaluru Metro network.</p>
      </div>
    </div>

    <!-- Google Maps Native Embed Container -->
    <div class="rounded-3 border overflow-hidden shadow-2xs position-relative ratio ratio-21x9" style="width: 100%; min-height: 500px; z-index: 1;">
      <iframe 
        src="https://maps.google.com/maps?q=Namma+Metro+Stations+Bengaluru&t=m&z=11&ie=UTF8&iwloc=&output=embed" 
        allowfullscreen 
        loading="lazy" 
        style="border:0;"
        class="w-100 h-100">
      </iframe>
    </div>
  </div>`;
}

export function initMetroLeafletMap() {
  // Leaflet has been removed in favor of native Google Maps embed.
  // This function is kept empty to prevent breaking existing imports in main.js.
}
