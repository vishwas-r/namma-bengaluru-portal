/**
 * Dynamic Bengaluru Area & Pincode Lookup Service — Namma Bengaluru Portal
 * Supports PIN Code search (e.g. 560102) and locality query using free Nominatim API.
 */

// Cache for Nominatim responses to prevent hammering the API
const areaCache = new Map();

export async function searchAreas(query = '') {
  const q = query.trim().toLowerCase();
  
  if (!q || q.length < 3) {
    // Return empty array for very short queries
    return [];
  }

  if (areaCache.has(q)) {
    return areaCache.get(q);
  }

  try {
      // We use Photon (komoot) based on OpenStreetMap. It is faster, free, and has no strict rate limit.
      const apiUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q + ' Bengaluru')}&limit=5`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Photon API error');

      const data = await res.json();
      
      const results = (data.features || []).map(item => {
        const props = item.properties || {};
        const areaName = props.district || props.locality || props.name || props.street || q;
        const pincode = props.postcode || '';
        
        return {
          area: areaName,
          pincode: pincode,
          zone: props.city || 'Bengaluru',
          lat: item.geometry.coordinates[1], // GeoJSON is [lon, lat]
          lon: item.geometry.coordinates[0],
          displayName: `${props.name || props.street || ''} ${props.district || props.locality || ''}`.trim() || areaName
        };
      });

      // Dedup by area name to keep list clean
      const uniqueMap = new Map();
      results.forEach(r => uniqueMap.set(r.area + r.pincode, r));
      const finalResults = Array.from(uniqueMap.values());

      areaCache.set(q, finalResults);
      return finalResults;

  } catch (err) {
    console.warn('Area search failed:', err);
    return [];
  }
}
