/**
 * Daily Sync Script — Namma Bengaluru
 * Scrapes official BWSSB portal for circulars/notices and archives PDFs cleanly,
 * preserving original official filenames.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const NOTICES_FILE = path.join(ROOT, 'src/data/bwssb/notices.json');
const DOCS_DIR = path.join(ROOT, 'public/docs/bwssb');

const SOURCES = [
  {
    name: 'BWSSB Official Notifications',
    url: 'https://bwssb.karnataka.gov.in',
    type: 'scrape',
  },
];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

/**
 * Extracts a clean original filename from an official URL.
 * e.g. "https://bwssb.karnataka.gov.in/storage/pdf-files/documents/adalath.pdf" -> "adalath.pdf"
 */
function getOriginalFilenameFromUrl(url) {
  try {
    const parsed = new URL(url);
    let base = path.basename(parsed.pathname);
    base = decodeURIComponent(base).trim();
    // Sanitize illegal Windows/Linux filename characters
    base = base.replace(/[/\\?%*:|"<>]/g, '_');
    if (!base.toLowerCase().endsWith('.pdf')) {
      base += '.pdf';
    }
    return base;
  } catch (e) {
    return `notice_${Date.now()}.pdf`;
  }
}

function fetchBuffer(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.9,*/*;q=0.8',
      },
      timeout: 20000
    }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        return resolve(fetchBuffer(redirectUrl, maxRedirects - 1));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          finalUrl: url
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
  });
}

async function downloadPDF(url, preferredFilename) {
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
    const localPath = path.join(DOCS_DIR, filename);
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    fs.writeFileSync(localPath, buffer);

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    log(`✅ Archived PDF with official filename: ${filename} (${buffer.length} bytes, SHA256: ${checksum.slice(0, 16)}...)`);
    return { localPath: `/docs/bwssb/${filename}`, checksum, directUrl: finalUrl || url };
  } catch (err) {
    log(`❌ Failed to download PDF ${url}: ${err.message}`);
    return null;
  }
}

function extractNoticesFromHTML(html, baseURL) {
  const notices = [];
  const linkPattern = /<a[^>]+href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawHref = match[1].trim();
    const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();

    try {
      const fullPdfUrl = new URL(rawHref, baseURL).toString();
      if (rawTitle.length > 3) {
        notices.push({ rawTitle, pdfURL: fullPdfUrl });
      }
    } catch (e) {}
  }
  return notices;
}

function categorizeNotice(title) {
  const lower = title.toLowerCase();
  if (/tariff|rate|price|charge|fee|revision|escalation/.test(lower)) return 'tariff';
  if (/water supply|maintenance|shutdown|interruption|repair/.test(lower)) return 'maintenance';
  if (/quality|test|report|safe|contamination/.test(lower)) return 'quality';
  if (/new connection|application|service|digital|portal|online/.test(lower)) return 'service';
  return 'policy';
}

function isTariffRevision(title, text = '') {
  const lower = (title + ' ' + text).toLowerCase();
  return /tariff revision|rate revision|new tariff|price hike|escalation|per kl|per kilolitre/.test(lower);
}

async function runSync() {
  log('🚀 Starting Namma Bengaluru daily sync...');
  
  let existingNotices = [];
  try {
    existingNotices = JSON.parse(fs.readFileSync(NOTICES_FILE, 'utf-8'));
  } catch { log('⚠️ Could not read existing notices, starting fresh.'); }

  const existingIds = new Set(existingNotices.map(n => n.id));
  const newNotices = [];
  const tariffFlaggedNotices = [];

  for (const source of SOURCES) {
    try {
      log(`📡 Fetching from: ${source.url}`);
      const { buffer, status } = await fetchBuffer(source.url);
      if (status !== 200) { log(`⚠️ HTTP ${status} from ${source.url}`); continue; }

      const html = buffer.toString('utf-8');
      const rawNotices = extractNoticesFromHTML(html, source.url);
      log(`📋 Found ${rawNotices.length} notice PDF links from ${source.name}`);

      for (const raw of rawNotices) {
        const stableId = 'sync_' + crypto.createHash('md5').update(raw.rawTitle).digest('hex').slice(0, 8);
        if (existingIds.has(stableId)) continue;

        let localBackup = null;
        let checksum = null;
        let directUrl = raw.pdfURL;

        if (raw.pdfURL) {
          const originalFilename = getOriginalFilenameFromUrl(raw.pdfURL);
          const result = await downloadPDF(raw.pdfURL, originalFilename);
          if (result) {
            localBackup = result.localPath;
            checksum = result.checksum;
            directUrl = result.directUrl || raw.pdfURL;
          }
        }

        const category = categorizeNotice(raw.rawTitle);
        const notice = {
          id: stableId,
          title: raw.rawTitle,
          date: new Date().toISOString().split('T')[0],
          category,
          summary: raw.rawTitle,
          aiSummary: `Official BWSSB notice regarding ${raw.rawTitle}. Download the archived PDF or check the official source for full document details.`,
          officialLink: directUrl || source.url,
          localBackup,
          hasLocalBackup: !!localBackup,
          checksum,
          tags: [category, 'auto-synced'],
          affectsCitizen: true,
          citizenImpact: 'Check official PDF document for full details.',
          autoSynced: true,
          syncedAt: new Date().toISOString(),
        };

        newNotices.push(notice);

        if (isTariffRevision(raw.rawTitle)) {
          tariffFlaggedNotices.push({ notice, pdfURL: raw.pdfURL });
          log(`⚡ Tariff revision detected: "${raw.rawTitle}"`);
        }
      }
    } catch (err) {
      log(`❌ Error processing ${source.url}: ${err.message}`);
    }
  }

  const updatedNotices = [...newNotices, ...existingNotices];
  fs.writeFileSync(NOTICES_FILE, JSON.stringify(updatedNotices, null, 2));
  log(`✅ notices.json updated: ${newNotices.length} new notices added.`);

  if (tariffFlaggedNotices.length > 0) {
    fs.writeFileSync(
      path.join(ROOT, 'scripts/.tariff_flagged.json'),
      JSON.stringify(tariffFlaggedNotices, null, 2)
    );
    process.exit(2);
  }

  log('🎉 Daily sync complete.');
  process.exit(0);
}

runSync().catch(err => { console.error('Fatal sync error:', err); process.exit(1); });
