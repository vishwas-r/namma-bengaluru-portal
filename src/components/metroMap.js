import stationsData from '../data/metro/stations.json';

export function renderMetroMapHTML() {
  return `
  <div class="nb-card p-4 text-start shadow-sm border-0" style="position: relative; z-index: 1; background: var(--bs-card-bg); border-radius: 16px;">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div>
        <h5 class="fw-bold mb-1 text-body"><i class="bi bi-map-fill text-primary me-2"></i>Interactive Namma Metro Network & Track Map</h5>
        <p class="text-secondary mb-0" style="font-size:0.85rem;">Live geographic map with full <i class="bi bi-circle-fill me-1" style="color: #16a34a;"></i> Green (32), <i class="bi bi-circle-fill me-1" style="color: #9333ea;"></i> Purple (37), and <i class="bi bi-circle-fill me-1" style="color: #eab308;"></i> Yellow (16) metro track corridors & station popups.</p>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="badge text-white px-3 py-2 rounded-pill" style="background:#9333ea;"><i class="bi bi-circle-fill me-1 text-white"></i> Purple Line (37)</span>
        <span class="badge text-white px-3 py-2 rounded-pill" style="background:#16a34a;"><i class="bi bi-circle-fill me-1 text-white"></i> Green Line (32)</span>
        <span class="badge text-dark fw-bold px-3 py-2 rounded-pill" style="background:#ffc61a;"><i class="bi bi-circle-fill me-1 text-dark"></i> Yellow Line (16)</span>
      </div>
    </div>

    <!-- Map Canvas Container -->
    <div id="nammaMetroMapCanvas" class="rounded-3 border overflow-hidden shadow-2xs position-relative" style="width: 100%; height: 540px; z-index: 1;"></div>
  </div>`;
}

let metroMapInstance = null;

export function initMetroLeafletMap() {
  const container = document.getElementById('nammaMetroMapCanvas');
  if (!container || typeof L === 'undefined') return;

  // Clean up previous map instance if already initialized
  if (metroMapInstance) {
    try {
      metroMapInstance.remove();
    } catch (e) {
      console.warn('Error removing previous metro map instance:', e);
    }
    metroMapInstance = null;
  }
  if (container._leaflet_id) {
    container._leaflet_id = null;
  }

  // Centered over Bengaluru Metro Core
  const map = L.map('nammaMetroMapCanvas', {
    center: [12.9757, 77.5723],
    zoom: 11,
    zoomControl: false,
    attributionControl: false
  });
  metroMapInstance = map;

  // Google Maps Tile Layer
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20
  }).addTo(map);

  // Group stations by line
  const purpleStations = stationsData.filter(s => s.line === 'purple' && s.lat && s.lng);
  const greenStations = stationsData.filter(s => (s.line === 'green' || s.id === 'majestic') && s.lat && s.lng);
  const yellowStations = stationsData.filter(s => s.line === 'yellow' && s.lat && s.lng);

  // Green line sequence
  const greenOrderIds = [
    'madavara', 'chikkabidarakallu', 'manjunathanagar', 'nagasandra', 'dasarahalli',
    'jalahalli', 'peenya-industry', 'peenya', 'goraguntepalya', 'yeshwanthpur',
    'sandal-soap-factory', 'mahalakshmi', 'rajajinagar', 'kuvempu-road', 'srirampura',
    'mantri-square-sampige-road', 'majestic', 'chickpet', 'kr-market', 'national-college',
    'lalbagh', 'south-end-circle', 'jayanagar', 'rv-road', 'banashankari',
    'jp-nagar', 'yelachenahalli', 'konanakunte-cross', 'doddakallasandra', 'vajrahalli',
    'thalaghattapura', 'silk-institute'
  ];

  const sortedGreen = [];
  greenOrderIds.forEach(id => {
    const s = stationsData.find(st => st.id === id);
    if (s && s.lat && s.lng) sortedGreen.push(s);
  });

  // Coordinates arrays
  const purpleCoords = purpleStations.map(s => [s.lat, s.lng]);
  const greenCoords = sortedGreen.map(s => [s.lat, s.lng]);
  const yellowCoords = yellowStations.map(s => [s.lat, s.lng]);

  // Draw Polylines for Metro Track Lines
  L.polyline(yellowCoords, {
    color: '#eab308',
    weight: 6,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round'
  }).addTo(map);

  L.polyline(greenCoords, {
    color: '#16a34a',
    weight: 6,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round'
  }).addTo(map);

  L.polyline(purpleCoords, {
    color: '#9333ea',
    weight: 6,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round'
  }).addTo(map);

  // Add Markers for all stations
  stationsData.forEach(s => {
    if (!s.lat || !s.lng) return;

    const color = s.line === 'purple' ? '#9333ea' : s.line === 'green' ? '#16a34a' : '#ffc61a';
    const isInterchange = s.isInterchange || s.id === 'majestic' || s.id === 'rv-road' || s.id === 'jayadeva-hospital' || s.id === 'central-silk-board';

    const radius = isInterchange ? 8 : 5;
    const strokeColor = isInterchange ? '#000000' : '#ffffff';
    const strokeWidth = isInterchange ? 2.5 : 2;

    const marker = L.circleMarker([s.lat, s.lng], {
      radius: radius,
      fillColor: color,
      color: strokeColor,
      weight: strokeWidth,
      opacity: 1,
      fillOpacity: 1
    }).addTo(map);

    const popupHtml = `
      <div style="font-family: inherit; text-align: left; min-width: 180px;">
        <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">${s.name}</div>
        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 4px;">${s.kannadaName || ''}</div>
        <span class="badge" style="background:${color}; color:${s.line === 'yellow' ? '#000' : '#fff'}; font-size:0.72rem;">${s.line.toUpperCase()} LINE</span>
        ${isInterchange ? `<span class="badge bg-dark text-white ms-1" style="font-size:0.72rem;"><i class="bi bi-arrow-counterclockwise me-1 text-warning"></i> INTERCHANGE</span>` : ''}
        ${s.neighborhood ? `<div style="font-size: 0.76rem; color: #475569; margin-top: 6px; line-height: 1.3;"><i class="bi bi-geo-alt-fill me-1 text-danger"></i> <strong>Area:</strong> ${s.neighborhood}</div>` : ''}
        ${s.parking?.hasParking ? `<div style="font-size: 0.76rem; color: #16a34a; font-weight: 600; margin-top: 4px;"><i class="bi bi-p-circle-fill me-1 text-primary"></i> Parking: ${s.parking.twoWheelerSlots} 2W Slots</div>` : '<div style="font-size: 0.74rem; color: #94a3b8; margin-top: 4px;">No Official Parking</div>'}
        <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.googleQuery || s.name + ' Metro Station Bengaluru')}" target="_blank" rel="noopener" style="font-size: 0.78rem; font-weight: 600; color: #6d28d9; text-decoration: none;">
            Open Pin on Google Maps &rarr;
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
  });
}
