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

  const purpleStations = stationsData.filter(s => s.line === 'purple');
  const greenStations = stationsData.filter(s => s.line === 'green');
  const yellowStations = stationsData.filter(s => s.line === 'yellow');

  let requiresInterchange = false;
  let interchangeStationName = null;
  let stationsList = [];

  if (source.line === dest.line) {
    // Same Line Journey
    const lineArr = stationsData.filter(s => s.line === source.line);
    const idx1 = lineArr.findIndex(s => s.id === source.id);
    const idx2 = lineArr.findIndex(s => s.id === dest.id);
    const startIdx = Math.min(idx1, idx2);
    const endIdx = Math.max(idx1, idx2);
    stationsList = lineArr.slice(startIdx, endIdx + 1);
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
    const lineArr1 = stationsData.filter(s => s.line === source.line);
    const idx1 = lineArr1.findIndex(s => s.id === source.id);
    const idxInt1 = lineArr1.findIndex(s => s.id === interchangeId || s.isInterchange);
    const startIdx1 = Math.min(idx1, idxInt1 >= 0 ? idxInt1 : 0);
    const endIdx1 = Math.max(idx1, idxInt1 >= 0 ? idxInt1 : 0);
    let path1 = lineArr1.slice(startIdx1, endIdx1 + 1);
    if (idx1 > idxInt1) path1.reverse();

    // Path 2: Interchange to Destination
    const lineArr2 = stationsData.filter(s => s.line === dest.line);
    const idxInt2 = lineArr2.findIndex(s => s.id === interchangeId || s.isInterchange);
    const idx2 = lineArr2.findIndex(s => s.id === dest.id);
    const startIdx2 = Math.min(idxInt2 >= 0 ? idxInt2 : 0, idx2);
    const endIdx2 = Math.max(idxInt2 >= 0 ? idxInt2 : 0, idx2);
    let path2 = lineArr2.slice(startIdx2, endIdx2 + 1);
    if (idxInt2 > idx2) path2.reverse();

    // Combine paths avoiding duplicate interchange station
    stationsList = [...path1, ...path2.slice(1)];
  }

  const stationCount = Math.max(1, stationsList.length - 1);
  const effectiveCount = stationCount + (requiresInterchange ? Math.max(5, Math.round(stationCount * 0.5)) : 0);
  const fareObj = getFareForStationCount(effectiveCount);
  const travelTimeMins = Math.round(stationCount * 2.2 + (requiresInterchange ? 4 : 0));

  const tokenFare = fareObj.tokenFare;
  const peakCscFare = fareObj.peakCscFare || Number((tokenFare * 0.95).toFixed(2));
  const nonPeakCscFare = fareObj.nonPeakCscFare || Number((tokenFare * 0.90).toFixed(2));
  const groupFare = fareObj.groupFare || Number((tokenFare * 0.85).toFixed(2));

  return {
    source,
    dest,
    stationCount,
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
 * Gets fare slab for a given station count
 */
export function getFareForStationCount(count) {
  const slab = faresData.fareSlabs.find(s => count >= s.minStations && count <= s.maxStations);
  if (slab) return slab;
  // Fallback to highest slab
  return faresData.fareSlabs[faresData.fareSlabs.length - 1];
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
 * Direct Live API Fetch from Official BMRCL Fare Endpoint:
 * POST https://www.bmrc.co.in:8282/api/users/fare/get-fare-details
 */
export async function fetchOfficialMetroFare(fromStationInput, toStationInput) {
  const fromStation = typeof fromStationInput === 'string' ? getStationById(fromStationInput) : fromStationInput;
  const toStation = typeof toStationInput === 'string' ? getStationById(toStationInput) : toStationInput;

  if (!fromStation?.code || !toStation?.code) return null;

  const fromGroupId = String(fromStation.lineId || (fromStation.line === 'purple' ? 1 : fromStation.line === 'green' ? 2 : 3));
  const toGroupId = String(toStation.lineId || (toStation.line === 'purple' ? 1 : toStation.line === 'green' ? 2 : 3));

  const payload = {
    from: { value: fromStation.code, groupId: fromGroupId },
    to: { value: toStation.code, groupId: toGroupId }
  };

  const defaultApiUrl = 'https://dev.csultimates.com/namma-bengaluru-api.php?endpoint=namma-metro-fare';
  const customProxy = window.CUSTOM_PROXY_URL || (import.meta && import.meta.env && import.meta.env.VITE_CUSTOM_PROXY_URL);
  const endpoint = customProxy
    ? (customProxy.includes('?') ? `${customProxy}&endpoint=namma-metro-fare` : `${customProxy}?endpoint=namma-metro-fare`)
    : defaultApiUrl;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.success === true || data.success === 'success') && data.results) {
        return {
          tokenFare: data.results.TValue,
          smartCardFare: data.results.CSCValue,
          peakSmartCardFare: data.results.PeakCSCValue,
          groupFare: data.results.GTValue,
          fareZone: data.results.FareZone || 'F8',
          twoWheelerSlots: data.results.vTwoWheeler,
          fourWheelerSlots: data.results.vFourWheeler,
          isOfficialApi: true
        };
      }
    }
  } catch (err) {
    console.warn('Live fare API fetch failed, falling back to local engine:', err);
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
