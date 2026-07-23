import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TARIFFS_FILE = path.join(ROOT, 'src/data/bwssb/tariffs.json');
const DOCS_DIR = path.join(ROOT, 'public/docs/bwssb');

// 1. Update tariffs.json
const tariffs = JSON.parse(fs.readFileSync(TARIFFS_FILE, 'utf-8'));
for (const h of tariffs.historicalRates) {
  h.officialLink = 'https://bwssb.karnataka.gov.in/storage/pdf-files/WaterTariff-2025.pdf';
  h.localBackup = '/docs/bwssb/WaterTariff-2025.pdf';
}

fs.writeFileSync(TARIFFS_FILE, JSON.stringify(tariffs, null, 2));
console.log('✅ Updated tariffs.json to reference /docs/bwssb/WaterTariff-2025.pdf for all historical years.');

// 2. Remove duplicate generated files
const duplicates = [
  'tariff_2020_21.pdf',
  'tariff_2021_22.pdf',
  'tariff_2022_23.pdf',
  'tariff_2023_24.pdf',
  'tariff_2024_25.pdf',
  'tariff_2025_26.pdf',
  'tariff_2026_27.pdf',
];

for (const d of duplicates) {
  const p = path.join(DOCS_DIR, d);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Deleted duplicate file: ${d}`);
  }
}

console.log('🎉 Cleanup completed.');
