import stationsData from '../data/metro/stations.json';
import faresData from '../data/metro/fares.json';

export function getAllStations() {
  return stationsData;
}

export function getStationById(id) {
  return stationsData.find(s => s.id === id);
}

export function getStationsByLine(lineName) {
  return stationsData.filter(s => s.line === lineName);
}

/**
 * Calculates fare, travel time, station list, and transfer info between two stations
 */
export function calculateMetroJourney(sourceId, destId) {
  const source = getStationById(sourceId);
  const dest = getStationById(destId);

  if (!source || !dest) return null;
  if (sourceId === destId) {
    return {
      sameStation: true,
      stationCount: 0,
      tokenFare: 0,
      smartCardFare: 0,
      estimatedTimeMins: 0,
      requiresInterchange: false,
      stationsList: [source],
      googleMapsDirUrl: getGoogleMapsTransitDirUrl(source.name, dest.name)
    };
  }

  // Green line sequence with Majestic interchange inserted at correct station position
  const greenLineSeq = [];
  for (const s of stationsData) {
    if (s.line === 'green') {
      greenLineSeq.push(s);
      if (s.id === 'mantri-square-sampige-road') {
        const maj = stationsData.find(st => st.id === 'majestic');
        if (maj && !greenLineSeq.some(st => st.id === 'majestic')) {
          greenLineSeq.push(maj);
        }
      }
    }
  }
  const purpleLineSeq = stationsData.filter(s => s.line === 'purple');
  const yellowLineSeq = stationsData.filter(s => s.line === 'yellow');

  let requiresInterchange = false;
  let interchangeStationName = null;
  let stationsList = [];

  const srcSeq = source.line === 'green' ? greenLineSeq : source.line === 'yellow' ? yellowLineSeq : purpleLineSeq;
  const dstSeq = dest.line === 'green' ? greenLineSeq : dest.line === 'yellow' ? yellowLineSeq : purpleLineSeq;

  if (source.line === dest.line) {
    // Same Line Journey
    const idx1 = srcSeq.findIndex(s => s.id === source.id);
    const idx2 = srcSeq.findIndex(s => s.id === dest.id);
    const startIdx = Math.min(idx1, idx2);
    const endIdx = Math.max(idx1, idx2);
    stationsList = srcSeq.slice(startIdx, endIdx + 1);
    if (idx1 > idx2) stationsList.reverse();
  } else {
    // Cross Line Journey via Interchange
    requiresInterchange = true;
    let interchangeId = 'majestic';
    if ((source.line === 'green' && dest.line === 'yellow') || (source.line === 'yellow' && dest.line === 'green')) {
      interchangeId = 'rv-road';
    }
    const interchangeStation = getStationById(interchangeId) || getStationById('majestic');
    interchangeStationName = interchangeStation ? interchangeStation.name : 'Nadaprabhu Kempegowda Station Majestic';

    // Path 1: Source to Interchange
    const idx1 = srcSeq.findIndex(s => s.id === source.id);
    const idxInt1 = srcSeq.findIndex(s => s.id === interchangeId);
    const startIdx1 = Math.min(idx1, idxInt1 >= 0 ? idxInt1 : 0);
    const endIdx1 = Math.max(idx1, idxInt1 >= 0 ? idxInt1 : 0);
    let path1 = srcSeq.slice(startIdx1, endIdx1 + 1);
    if (idx1 > idxInt1) path1.reverse();

    // Path 2: Interchange to Destination
    const idxInt2 = dstSeq.findIndex(s => s.id === interchangeId);
    const idx2 = dstSeq.findIndex(s => s.id === dest.id);
    const startIdx2 = Math.min(idxInt2 >= 0 ? idxInt2 : 0, idx2);
    const endIdx2 = Math.max(idxInt2 >= 0 ? idxInt2 : 0, idx2);
    let path2 = dstSeq.slice(startIdx2, endIdx2 + 1);
    if (idxInt2 > idx2) path2.reverse();

    // Combine paths avoiding duplicate interchange station
    stationsList = [...path1, ...path2.slice(1)];
  }

  const stationCount = Math.max(1, stationsList.length - 1);
  const fareObj = getFareForStationCount(stationCount);
  const travelTimeMins = Math.round(stationCount * 2.1 + (requiresInterchange ? 5 : 0));

  const tokenFare = fareObj.tokenFare;
  const peakCscFare = fareObj.peakCscFare || Number((tokenFare * 0.95).toFixed(2));
  const nonPeakCscFare = fareObj.nonPeakCscFare || Number((tokenFare * 0.90).toFixed(2));
  const groupFare = fareObj.groupFare || Number((tokenFare * 0.85).toFixed(2));

  return {
    source,
    dest,
    stationCount,
    intermediateStations: stationCount - 1,
    tokenFare,
    peakCscFare,
    nonPeakCscFare,
    groupFare,
    smartCardFare: nonPeakCscFare,
    savings: (tokenFare - nonPeakCscFare).toFixed(2),
    estimatedTimeMins: travelTimeMins,
    requiresInterchange,
    interchangeStationName,
    stationsList,
    googleMapsDirUrl: getGoogleMapsTransitDirUrl(source.name, dest.name),
    googleMapsEmbedUrl: getGoogleMapsEmbedUrl(dest.googleQuery || dest.name + ' Metro Station Bengaluru')
  };
}

/**
 * Generates direct Google Maps Transit Directions URL
 */
export function getGoogleMapsTransitDirUrl(originName, destName) {
  const originQuery = encodeURIComponent(originName + ' Metro Station Bengaluru');
  const destQuery = encodeURIComponent(destName + ' Metro Station Bengaluru');
  return `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destQuery}&travelmode=transit`;
}

/**
 * Generates direct Google Maps Search URL for a station
 */
export function getGoogleMapsStationUrl(stationQuery) {
  const query = encodeURIComponent(stationQuery || 'Namma Metro Station Bengaluru');
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Gets fare slab for a given station count
 */
export function getFareForStationCount(count) {
  const slab = faresData.fareSlabs.find(s => count >= s.minStations && count <= s.maxStations);
  if (slab) return slab;
  return faresData.fareSlabs[faresData.fareSlabs.length - 1];
}

function getYoInfraSlug(name) {
  let s = name.toLowerCase()
    .replace(/station/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/dr\.|sir m\.|kr /gi, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (name.includes('Majestic')) s = 'nadaprabhu-kempegowda';
  if (name.includes('Vidhana Soudha')) s = 'dr-br-ambedkar-vidhana-soudha';
  if (name.includes('Central College')) s = 'sir-m-visveshwaraya-station';
  if (name.includes('Indiranagar')) s = 'indiranagara';
  if (name.includes('Halasuru')) s = 'halasuru';
  if (name.includes('Yeshwanthpur')) s = 'yeshwanthpura';
  if (name.includes('Rajajinagar')) s = 'rajajinagara';
  if (name.includes('Market')) s = 'krishna-rajendra-market';
  return `${s}-metro-station-bangalore`;
}

/**
 * Live API Fetch from yoinfra.com (CORS enabled)
 */
export async function fetchOfficialMetroFare(fromStationInput, toStationInput) {
  const fromStation = typeof fromStationInput === 'string' ? getStationById(fromStationInput) : fromStationInput;
  const toStation = typeof toStationInput === 'string' ? getStationById(toStationInput) : toStationInput;

  if (!fromStation?.name || !toStation?.name) return null;

  try {
    const slug = `from-${getYoInfraSlug(fromStation.name)}-to-${getYoInfraSlug(toStation.name)}`;
    const url = `https://yoinfra.com/api/route?slug=${encodeURIComponent(slug)}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.route_custom) {
        const rc = data.route_custom;
        const normalFare = Number(rc.normal_fare);
        const smartCardFare = Number(rc.smart_card_fare);

        return {
          tokenFare: normalFare,
          smartCardFare: smartCardFare,
          peakSmartCardFare: Number((normalFare * 0.95).toFixed(2)),
          nonPeakCscFare: smartCardFare,
          groupFare: Number((normalFare * 0.85).toFixed(2)),
          totalDistance: rc.total_distance || null,
          totalTime: rc.total_time || null,
          stationCount: rc.station_count || null,
          isOfficialApi: true
        };
      }
    }
  } catch (err) {
    console.warn('Live yoinfra fare fetch failed, using local engine:', err);
  }

  return null;
}

/**
 * Generates direct Google Maps Embed iframe URL for static hosting
 */
export function getGoogleMapsEmbedUrl(stationQuery) {
  const query = encodeURIComponent(stationQuery || 'Namma Metro Station Bengaluru');
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
