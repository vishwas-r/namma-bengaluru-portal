/**
 * Daily Sync Script — Namma Bengaluru Portal
 * Automatically scrapes official BWSSB & BESCOM portals for circulars, notices, and planned outages.
 * Ensures officialLink ALWAYS points to the specific direct document/webpage URL.
 */


import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEPARTMENTS = [
  {
    deptId: 'bwssb',
    name: 'BWSSB',
    noticesFile: path.join(ROOT, 'src/data/bwssb/notices.json'),
    docsDir: path.join(ROOT, 'public/docs/bwssb'),
    sources: [
      {
        name: 'BWSSB Official Notifications',
        url: 'https://bwssb.karnataka.gov.in',
      }
    ]
  },
  {
    deptId: 'bescom',
    name: 'BESCOM',
    noticesFile: path.join(ROOT, 'src/data/bescom/notices.json'),
    docsDir: path.join(ROOT, 'public/docs/bescom'),
    sources: [
      {
        name: 'BESCOM Planned Outages Page',
        url: 'https://bescom.karnataka.gov.in/319/planned-outages/en',
      },
      {
        name: 'BESCOM Official Portal Notifications',
        url: 'https://bescom.karnataka.gov.in',
      }
    ]
  }
];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

function getOriginalFilenameFromUrl(url) {
  try {
    const parsed = new URL(url);
    let base = path.basename(parsed.pathname);
    base = decodeURIComponent(base).trim();
    base = base.replace(/[/\\?%*:|"<>]/g, '_');
    if (!base.toLowerCase().endsWith('.pdf')) {
      base += '.pdf';
    }
    return base;
  } catch (e) {
    return `notice_${Date.now()}.pdf`;
  }
}

async function fetchBuffer(url, retries = 3) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const res = await fetch(url, { headers: defaultHeaders, signal: controller.signal, redirect: 'follow' });
      clearTimeout(timeoutId);
      
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      return {
        buffer,
        status: res.status,
        contentType: res.headers.get('content-type') || '',
        finalUrl: res.url
      };
    } catch (err) {
      log(`⚠️ Attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
    }
  }
}

async function downloadPDF(url, docsDir, deptId, preferredFilename) {
  try {
    const { buffer, contentType, status, finalUrl } = await fetchBuffer(url);
    if (status !== 200) {
      log(`⚠️ HTTP ${status} when fetching PDF: ${url}`);
      return null;
    }
    const header = buffer.slice(0, 5).toString('utf-8');
    if (!header.startsWith('%PDF') && !contentType.includes('pdf')) {
      log(`⚠️ Not a valid PDF (header: "${header}"): ${url}`);
      return null;
    }

    const filename = preferredFilename || getOriginalFilenameFromUrl(finalUrl || url);
    const localPath = path.join(docsDir, filename);
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(localPath, buffer);

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    log(`✅ Archived PDF for ${deptId}: ${filename} (${buffer.length} bytes, SHA256: ${checksum.slice(0, 16)}...)`);
    return { localPath: `/docs/${deptId}/${filename}`, checksum, directUrl: finalUrl || url };
  } catch (err) {
    log(`❌ Failed to download PDF ${url}: ${err.message}`);
    return null;
  }
}

function extractNoticesFromHTML(html, baseURL) {
  const notices = [];
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawHref = match[1].trim();
    const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();

    if (rawTitle.length < 4 || rawHref.startsWith('javascript:') || rawHref.startsWith('#')) continue;

    const isPdf = rawHref.toLowerCase().includes('.pdf');
    const isOutage = rawHref.toLowerCase().includes('outage') || rawTitle.toLowerCase().includes('outage');
    const isTariff = rawTitle.toLowerCase().includes('tariff') || rawTitle.toLowerCase().includes('kerc');

    if (isPdf || isOutage || isTariff) {
      try {
        const fullUrl = new URL(rawHref, baseURL).toString();
        notices.push({ rawTitle, directURL: fullUrl, isPdf });
      } catch (e) {}
    }
  }
  return notices;
}

function categorizeNotice(title) {
  const lower = title.toLowerCase();
  if (/tariff|rate|price|charge|fee|revision|escalation|kerc/.test(lower)) return 'tariff';
  if (/water supply|power|outage|maintenance|shutdown|interruption|repair/.test(lower)) return 'maintenance';
  if (/quality|test|report|safe|contamination/.test(lower)) return 'quality';
  if (/new connection|application|service|digital|portal|online|name change|e-katha/.test(lower)) return 'service';
  return 'policy';
}

function isTariffRevision(title, text = '') {
  const lower = (title + ' ' + text).toLowerCase();
  return /tariff revision|rate revision|new tariff|price hike|escalation|per kl|per unit/.test(lower);
}

async function runSync() {
  log('🚀 Starting Namma Bengaluru daily automated sync (10:00 AM IST)...');
  let tariffFlagged = [];

  for (const dept of DEPARTMENTS) {
    log(`\n🏢 Syncing Department: ${dept.name}`);
    let existingNotices = [];
    try {
      existingNotices = JSON.parse(fs.readFileSync(dept.noticesFile, 'utf-8'));
    } catch {
      log(`⚠️ Could not read ${dept.noticesFile}, starting fresh.`);
    }

    const existingIds = new Set(existingNotices.map(n => n.id));
    const newNotices = [];

    for (const source of dept.sources) {
      try {
        log(`📡 Fetching from: ${source.url}`);
        const { buffer, status } = await fetchBuffer(source.url);
        if (status !== 200) { log(`⚠️ HTTP ${status} from ${source.url}`); continue; }

        const html = buffer.toString('utf-8');
        const rawNotices = extractNoticesFromHTML(html, source.url);
        log(`📋 Found ${rawNotices.length} candidate notice links from ${source.name}`);

        for (const raw of rawNotices) {
          const stableId = dept.deptId.toUpperCase() + '-' + crypto.createHash('md5').update(raw.rawTitle).digest('hex').slice(0, 8);
          if (existingIds.has(stableId)) continue;

          let localBackup = null;
          let checksum = null;
          let directUrl = raw.directURL;

          if (raw.isPdf) {
            const originalFilename = getOriginalFilenameFromUrl(raw.directURL);
            const result = await downloadPDF(raw.directURL, dept.docsDir, dept.deptId, originalFilename);
            if (result) {
              localBackup = result.localPath;
              checksum = result.checksum;
              directUrl = result.directUrl || raw.directURL;
            }
          }

          const category = categorizeNotice(raw.rawTitle);
          const notice = {
            id: stableId,
            title: raw.rawTitle,
            date: new Date().toISOString().split('T')[0],
            category,
            summary: raw.rawTitle,
            aiSummary: `Official ${dept.name} notification regarding ${raw.rawTitle}. Check the official link for complete details.`,
            officialLink: directUrl,
            localBackup,
            hasLocalBackup: !!localBackup,
            checksum,
            tags: [category, 'auto-synced'],
            affectsCitizen: true,
            citizenImpact: `Review official ${dept.name} portal link for direct details.`,
            autoSynced: true,
            syncedAt: new Date().toISOString(),
          };

          newNotices.push(notice);

          if (isTariffRevision(raw.rawTitle)) {
            tariffFlagged.push({ dept: dept.deptId, notice });
            log(`⚡ Tariff revision detected for ${dept.name}: "${raw.rawTitle}"`);
          }
        }
      } catch (err) {
        log(`❌ Error processing ${source.url}: ${err.message}`);
      }
    }

    const updatedNotices = [...newNotices, ...existingNotices];
    fs.writeFileSync(dept.noticesFile, JSON.stringify(updatedNotices, null, 2));
    log(`✅ Updated ${dept.noticesFile}: ${newNotices.length} new notices added.`);
  }

  if (tariffFlagged.length > 0) {
    fs.writeFileSync(
      path.join(ROOT, 'scripts/.tariff_flagged.json'),
      JSON.stringify(tariffFlagged, null, 2)
    );
    process.exit(2);
  }

  log('\n🎉 Namma Bengaluru daily automated sync complete.');
  process.exit(0);
}

runSync().catch(err => { console.error('Fatal sync error:', err); process.exit(1); });
