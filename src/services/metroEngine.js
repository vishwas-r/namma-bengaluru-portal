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

  let totalDistanceKm = 0;
  for (let i = 0; i < stationsList.length - 1; i++) {
    const s1 = stationsList[i];
    const s2 = stationsList[i + 1];
    if (s1.lat && s1.lng && s2.lat && s2.lng) {
      totalDistanceKm += getDistanceKm(s1.lat, s1.lng, s2.lat, s2.lng);
    }
  }

  // To account for curves in actual track, BMRCL track distance is slightly longer than straight-line sum.
  // Using 1.05x coefficient closely aligns Haversine sums with BMRCL's official chained distances.
  const trackDistanceKm = totalDistanceKm * 1.05;

  const stationCount = Math.max(1, stationsList.length - 1);
  const fareObj = getFareForDistance(trackDistanceKm);
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
    totalDistanceKm: trackDistanceKm,
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
 * Gets fare slab for a given distance
 */
export function getFareForDistance(distanceKm) {
  const slab = faresData.fareSlabs.find(s => distanceKm > s.minDist && distanceKm <= s.maxDist);
  if (slab) return slab;
  if (distanceKm === 0) return faresData.fareSlabs[0];
  return faresData.fareSlabs[faresData.fareSlabs.length - 1];
}

/**
 * Calculates Haversine distance between two coordinates in km
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}



/**
 * Generates direct Google Maps Embed iframe URL for static hosting
 */
export function getGoogleMapsEmbedUrl(stationQuery) {
  const query = encodeURIComponent(stationQuery || 'Namma Metro Station Bengaluru');
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Generates direct Google Maps Embed iframe URL for transit directions
 */
export function getGoogleMapsTransitEmbedUrl(sourceQuery, destQuery) {
  const saddr = encodeURIComponent(sourceQuery || 'Namma Metro Station Bengaluru');
  const daddr = encodeURIComponent(destQuery || 'Namma Metro Station Bengaluru');
  return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&dirflg=r&output=embed`;
}
