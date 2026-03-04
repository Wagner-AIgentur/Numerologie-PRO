/**
 * Test script: Generate all 4 karmic numerology PDFs.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-generate-pdfs.ts
 *
 * Output: ./test-pdfs/ directory with 4 PDF files
 */

import * as fs from 'fs';
import * as path from 'path';

import { generateBirthdayCodePDF } from '../lib/numerology/karmic/birthday-pdf-generator-v2';
import { generateSelfRealizationPDF } from '../lib/numerology/karmic/selfrealization-pdf-generator';
import { generateKarmicKnotsPDF } from '../lib/numerology/karmic/karmicknots-pdf-generator';
import { generateYearForecastPDF } from '../lib/numerology/karmic/yearforecast-pdf-generator';

const TEST_NAME = 'Test Person';
const TEST_BIRTHDATE = '22.03.1990';
const TEST_LOCALE = 'ru' as const;
const TEST_YEAR = 2026;

// Local Chrome for PDF rendering (serverless @sparticuz/chromium doesn't work on Windows)
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const OUT_DIR = path.join(process.cwd(), 'test-pdfs');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('=== Generating all 4 test PDFs ===');
  console.log(`Name: ${TEST_NAME}`);
  console.log(`Birthdate: ${TEST_BIRTHDATE}`);
  console.log(`Locale: ${TEST_LOCALE}`);
  console.log(`Year (forecast): ${TEST_YEAR}`);
  console.log('');

  // 1. Birthday Code
  console.log('[1/4] Birthday Code...');
  try {
    const buf1 = await generateBirthdayCodePDF(TEST_BIRTHDATE, TEST_NAME, TEST_LOCALE, CHROME_PATH);
    const p1 = path.join(OUT_DIR, 'test-birthday-code.pdf');
    fs.writeFileSync(p1, buf1);
    console.log(`  -> ${p1} (${(buf1.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error('  FAILED:', (err as Error).message);
  }

  // 2. Self-Realization
  console.log('[2/4] Self-Realization...');
  try {
    const buf2 = await generateSelfRealizationPDF(TEST_BIRTHDATE, TEST_NAME, TEST_LOCALE, CHROME_PATH);
    const p2 = path.join(OUT_DIR, 'test-selfrealization.pdf');
    fs.writeFileSync(p2, buf2);
    console.log(`  -> ${p2} (${(buf2.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error('  FAILED:', (err as Error).message);
  }

  // 3. Karmic Knots
  console.log('[3/4] Karmic Knots...');
  try {
    const buf3 = await generateKarmicKnotsPDF(TEST_BIRTHDATE, TEST_NAME, TEST_LOCALE, CHROME_PATH);
    const p3 = path.join(OUT_DIR, 'test-karmic-knots.pdf');
    fs.writeFileSync(p3, buf3);
    console.log(`  -> ${p3} (${(buf3.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error('  FAILED:', (err as Error).message);
  }

  // 4. Year Forecast
  console.log('[4/4] Year Forecast...');
  try {
    const buf4 = await generateYearForecastPDF(TEST_BIRTHDATE, TEST_NAME, TEST_YEAR, TEST_LOCALE, CHROME_PATH);
    const p4 = path.join(OUT_DIR, 'test-year-forecast.pdf');
    fs.writeFileSync(p4, buf4);
    console.log(`  -> ${p4} (${(buf4.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error('  FAILED:', (err as Error).message);
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
