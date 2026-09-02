import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import * as xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../src/data/bescom');

async function fetchWithRetry(url, options = {}, retries = 3) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };

  const finalOptions = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) }
  };

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      // 15 seconds timeout
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(url, { ...finalOptions, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res;
    } catch (err) {
      console.warn(`⚠️ Attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
    }
  }
}

async function syncOutages() {
  console.log('🔄 Fetching BESCOM Planned Outages...');
  try {
    const res = await fetchWithRetry('https://bescom.karnataka.gov.in/319/planned-outages/en');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const html = await res.text();
    
    const $ = cheerio.load(html);
    let xlsxLink = null;
    
    // Find all links to xlsx files
    const links = [];
    $('a[href$=".xlsx"], a[href$=".XLSX"]').each((i, el) => {
      const href = $(el).attr('href');
      // Filter out known unrelated static links based on path
      if (!href.includes('RTI') && !href.includes('IPSet') && !href.includes('CTAZ') && !href.includes('BRAZ')) {
        links.push(href);
      }
    });

    if (links.length > 0) {
       // Usually the most recently uploaded planned outages is at the end of the content
       xlsxLink = links[links.length - 1];
    }

    if (!xlsxLink) {
      console.log('⚠️ No planned outages XLSX found on the BESCOM page.');
      return;
    }

    console.log(`📥 Downloading: ${xlsxLink}`);
    
    // In case the URL is relative (though usually absolute on their site)
    if (xlsxLink.startsWith('/')) {
        xlsxLink = 'https://bescom.karnataka.gov.in' + xlsxLink;
    }

    const fileRes = await fetchWithRetry(xlsxLink);
    if (!fileRes.ok) throw new Error(`Failed to download file: ${fileRes.status}`);
    
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📊 Parsing Excel data...');
    // Drop cellDates: true to get raw Excel serial numbers which are robust
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with array of arrays format
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    const outages = [];
    
    // Data starts at row index 4 in this specific BESCOM template
    for (let i = 4; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length < 16) continue;
      
      // Sl No check to ensure it's a valid data row
      if (!row[0]) continue;

      // Extract based on column indices discovered from the format
      const subdivision = row[5];
      const station = row[6];
      const dateFrom = row[8];
      const timeFrom = row[10];
      const timeTo = row[11];
      const reason = row[13];
      const areas = row[15];

      // Format Dates manually from Excel serial number (days since Dec 30 1899)
      let dateStr = "";
      if (typeof dateFrom === 'number' && dateFrom > 1000) {
         // 25569 is days between Dec 30 1899 and Jan 1 1970
         const d = new Date(Math.round((dateFrom - 25569) * 86400 * 1000));
         const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
         dateStr = `${d.getUTCDate().toString().padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      } else if (dateFrom) {
         dateStr = String(dateFrom).trim();
      }

      // Format Times manually from Excel time fraction
      const formatExcelTime = (val) => {
         if (typeof val === 'number') {
            const totalMins = Math.round(val * 24 * 60);
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
         }
         return String(val || "").trim();
      };

      const fromTimeStr = formatExcelTime(timeFrom);
      const toTimeStr = formatExcelTime(timeTo);

    if (dateStr && (areas || subdivision)) {
          outages.push({
              date: dateStr,
              areas: String(areas || subdivision).trim(),
              fromTime: fromTimeStr,
              toTime: toTimeStr,
              feeder: String(station).trim(),
              reason: String(reason).trim()
          });
      }
    }

    console.log(`🌍 Pre-Geocoding unique areas to ensure instant map load (this takes a moment)...`);
    
    // Extract unique primary areas for geocoding
    const uniqueAreas = [...new Set(outages.map(po => po.areas.split(',')[0].trim()))].filter(a => a.length > 2);
    const coordinatesCache = {};
    
    for (let i = 0; i < uniqueAreas.length; i++) {
        const areaName = uniqueAreas[i];
        
        try {
            // Photon API (komoot) is fast and doesn't require strict rate limits, but a small delay is polite
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const apiUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(areaName + ' Bengaluru')}&limit=1`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const res = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const data = await res.json();
                if (data && data.features && data.features.length > 0) {
                    // Photon returns GeoJSON: coordinates are [lon, lat]
                    coordinatesCache[areaName] = { 
                        lat: parseFloat(data.features[0].geometry.coordinates[1]), 
                        lon: parseFloat(data.features[0].geometry.coordinates[0]) 
                    };
                }
            }
        } catch (e) {
            console.warn(`⚠️ Failed to geocode ${areaName} - ${e.message}`);
        }
    }
    
    // Attach coordinates to the final outages JSON
    const enrichedOutages = outages.map(po => {
        const primaryArea = po.areas.split(',')[0].trim();
        const coords = coordinatesCache[primaryArea];
        return {
            ...po,
            lat: coords ? coords.lat : null,
            lon: coords ? coords.lon : null
        };
    });

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(DATA_DIR, 'planned_outages.json'),
      JSON.stringify(enrichedOutages, null, 2)
    );
    
    console.log(`✅ Successfully synced and geocoded ${enrichedOutages.length} planned outages.`);
  } catch (err) {
    console.error('❌ Failed to sync BESCOM outages:', err);
    process.exit(1);
  }
}

syncOutages();
