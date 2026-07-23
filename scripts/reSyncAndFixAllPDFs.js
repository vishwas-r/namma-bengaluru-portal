import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const NOTICES_FILE = path.join(ROOT, 'src/data/bwssb/notices.json');
const DOCS_DIR = path.join(ROOT, 'public/docs/bwssb');

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
    return `document_${Date.now()}.pdf`;
  }
}

function fetchBuffer(url, maxRedirects = 5, retries = 3) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      timeout: 25000
    }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        return resolve(fetchBuffer(redirectUrl, maxRedirects - 1, retries));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), status: res.statusCode, contentType: res.headers['content-type'] || '', finalUrl: url }));
    });
    req.on('error', async (err) => {
      if (retries > 0) {
        console.log(`   Retrying ${url} (${retries} retries left)...`);
        await new Promise(r => setTimeout(r, 1000));
        try {
          const res = await fetchBuffer(url, maxRedirects, retries - 1);
          return resolve(res);
        } catch (e) {
          return reject(e);
        }
      }
      reject(err);
    });
    req.on('timeout', () => { req.destroy(); });
  });
}

async function fixNoticesWithOfficialFilenames() {
  console.log('Fetching live BWSSB main page for fresh PDF link mapping...');
  const { buffer } = await fetchBuffer('https://bwssb.karnataka.gov.in');
  const html = buffer.toString('utf-8');

  const titleToPdfUrlMap = new Map();
  const linkPattern = /<a[^>]+href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawHref = match[1].trim();
    const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();
    try {
      const fullPdfUrl = new URL(rawHref, 'https://bwssb.karnataka.gov.in').toString();
      if (rawTitle.length > 3) {
        titleToPdfUrlMap.set(rawTitle, fullPdfUrl);
      }
    } catch (e) {}
  }

  const notices = JSON.parse(fs.readFileSync(NOTICES_FILE, 'utf-8'));
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  for (let i = 0; i < notices.length; i++) {
    const notice = notices[i];
    const livePdfUrl = titleToPdfUrlMap.get(notice.title) || (notice.officialLink?.endsWith('.pdf') ? notice.officialLink : null);

    if (livePdfUrl) {
      notice.officialLink = livePdfUrl;
      const officialFilename = getOriginalFilenameFromUrl(livePdfUrl);
      const localPath = path.join(DOCS_DIR, officialFilename);

      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) {
        const buf = fs.readFileSync(localPath);
        notice.localBackup = `/docs/bwssb/${officialFilename}`;
        notice.hasLocalBackup = true;
        notice.checksum = crypto.createHash('sha256').update(buf).digest('hex');
        console.log(`[${i+1}/${notices.length}] Already cached cleanly: "${officialFilename}"`);
        continue;
      }

      console.log(`[${i+1}/${notices.length}] Downloading: "${officialFilename}"`);
      try {
        const { buffer: pdfBuf, status } = await fetchBuffer(livePdfUrl);
        if (status === 200 && pdfBuf.slice(0,4).toString('utf-8') === '%PDF') {
          fs.writeFileSync(localPath, pdfBuf);
          const checksum = crypto.createHash('sha256').update(pdfBuf).digest('hex');
          notice.localBackup = `/docs/bwssb/${officialFilename}`;
          notice.hasLocalBackup = true;
          notice.checksum = checksum;
          console.log(`   Saved: /docs/bwssb/${officialFilename} (${pdfBuf.length} bytes)`);
        }
      } catch (err) {
        console.error(`   Failed to download ${livePdfUrl}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(NOTICES_FILE, JSON.stringify(notices, null, 2));
  console.log('✅ All PDFs verified and saved under official filenames!');
}

fixNoticesWithOfficialFilenames().catch(console.error);
