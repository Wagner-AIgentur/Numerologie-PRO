#!/usr/bin/env npx tsx
/**
 * Knowledge Base Ingest Script
 *
 * Scannt den Konfguratr-Ordner nach PDFs/DOCX/TXT,
 * parst sie, chunked den Text und vektorisiert alles nach Pinecone.
 *
 * Usage:
 *   npx tsx scripts/knowledge-ingest.ts                     # Alle Dateien
 *   npx tsx scripts/knowledge-ingest.ts --source "Идеал"    # Nur ein Kurs
 *   npx tsx scripts/knowledge-ingest.ts --dry-run            # Nur zaehlen, nicht vektorisieren
 *   npx tsx scripts/knowledge-ingest.ts --file "path/to.pdf" # Einzelne Datei
 *
 * Requires: .env.local with OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_HOST,
 *           NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load env from project root
config({ path: path.resolve(__dirname, '..', '.env.local') });
config({ path: path.resolve(__dirname, '..', '.env') });

// ── PDF + DOCX Parsers ───────────────────────────────────────────────

async function parsePDF(filePath: string): Promise<string> {
  const mod = await import('pdf-parse');
  const PDFParse = mod.PDFParse || mod.default || mod;
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  return data.text;
}

async function parseDOCX(filePath: string): Promise<string> {
  const mammoth = await import('mammoth');
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseTXT(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

// ── File Discovery ───────────────────────────────────────────────────

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const SKIP_FOLDERS = ['node_modules', '.next', '.git', '.claude', 'Numerologie-PRO', '.playwright-mcp', 'OBS Videos'];

function discoverFiles(rootDir: string, sourceFilter?: string): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_FOLDERS.some((skip) => entry.name === skip || entry.name.startsWith('.'))) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;
        if (entry.name.startsWith('~$')) continue; // Skip temp files

        // Source filter: only files from matching folder
        if (sourceFilter) {
          const relativePath = path.relative(rootDir, fullPath);
          if (!relativePath.includes(sourceFilter)) continue;
        }

        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files.sort();
}

// ── Source Detection ─────────────────────────────────────────────────

const SOURCE_MAP: Record<string, { source_name: string; author: string; method: string }> = {
  'Идеал': { source_name: 'Идеал', author: 'Идеал', method: 'matrix-numerologie' },
  'Нумерология Файман': { source_name: 'Файман', author: 'Файман', method: 'tarot-numerologie' },
  'Нумеррлогия Анна Спицина': { source_name: 'Анна Спицина', author: 'Анна Спицина', method: 'selbsterkenntnis' },
  'Пифагор Анаель': { source_name: 'Пифагор Анаель', author: 'Анаель', method: 'karmische-numerologie' },
  'Прогнозирование': { source_name: 'Прогнозирование', author: '', method: 'prognose' },
  'Matrix кабинет': { source_name: 'Matrix кабинет', author: '', method: 'matrix-berechnung' },
};

function detectSource(filePath: string): { source_name: string; author: string; method: string } {
  for (const [folder, meta] of Object.entries(SOURCE_MAP)) {
    if (filePath.includes(folder)) return meta;
  }
  return { source_name: 'Unbekannt', author: '', method: '' };
}

// ── Chunking ─────────────────────────────────────────────────────────

function chunkText(text: string, chunkChars = 3200, overlapChars = 400): string[] {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (cleaned.length <= chunkChars) return cleaned.length > 50 ? [cleaned] : [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + chunkChars;

    if (end < cleaned.length) {
      const paraBreak = cleaned.lastIndexOf('\n\n', end);
      if (paraBreak > start + chunkChars * 0.5) {
        end = paraBreak;
      } else {
        const sentBreak = cleaned.lastIndexOf('. ', end);
        if (sentBreak > start + chunkChars * 0.5) {
          end = sentBreak + 1;
        }
      }
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk);

    start = end - overlapChars;
    if (start >= cleaned.length) break;
  }

  return chunks;
}

// ── Embedding + Pinecone (direct HTTP, no Next.js) ──────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000),
      dimensions: 1536,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

async function upsertToPinecone(
  id: string,
  embedding: number[],
  metadata: Record<string, unknown>,
): Promise<void> {
  if (!PINECONE_API_KEY || !PINECONE_HOST) throw new Error('PINECONE_API_KEY/HOST not set');

  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      namespace: 'knowledge',
      vectors: [{ id, values: embedding, metadata }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert error ${res.status}: ${err}`);
  }
}

// ── Supabase (direct Postgres via pg) ──────────────────────────────

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL env var required');

let pgClient: any = null;
async function getPgClient() {
  if (!pgClient) {
    const { Client } = require('pg');
    pgClient = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();
  }
  return pgClient;
}

async function supabaseQuery(table: string, method: string, body?: any, query = ''): Promise<any> {
  const client = await getPgClient();

  if (method === 'POST') {
    if (Array.isArray(body)) {
      if (body.length === 0) return [];
      const keys = Object.keys(body[0]);
      const values: any[] = [];
      const placeholders: string[] = [];
      body.forEach((row, i) => {
        const rowPls = keys.map((_, j) => `$${i * keys.length + j + 1}`);
        placeholders.push(`(${rowPls.join(', ')})`);
        values.push(...keys.map(k => row[k]));
      });
      const sql = `INSERT INTO public.${table} (${keys.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING RETURNING *`;
      const res = await client.query(sql, values);
      return res.rows;
    } else {
      const keys = Object.keys(body);
      const values = Object.values(body);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO public.${table} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING RETURNING *`;
      const res = await client.query(sql, values);
      return res.rows;
    }
  } else if (method === 'PATCH') {
    let whereClause = '';
    let whereValue = '';
    if (query.startsWith('?file_path=eq.')) {
      whereClause = 'file_path = $1';
      whereValue = decodeURIComponent(query.replace('?file_path=eq.', ''));
    } else if (query.startsWith('?id=eq.')) {
      whereClause = 'id = $1';
      whereValue = decodeURIComponent(query.replace('?id=eq.', ''));
    } else {
      throw new Error(`Unsupported PATCH query: ${query}`);
    }

    const keys = Object.keys(body);
    const setFields = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [whereValue, ...Object.values(body)];

    const sql = `UPDATE public.${table} SET ${setFields} WHERE ${whereClause} RETURNING *`;
    const res = await client.query(sql, values);
    return res.rows;
  } else if (method === 'GET') {
    let whereClause = '';
    let whereValue = '';
    if (query.includes('file_path=eq.')) {
      const match = query.match(/file_path=eq\.([^&]+)/);
      if (match) {
        whereClause = 'file_path = $1';
        whereValue = decodeURIComponent(match[1]);
      }
    }
    const sql = `SELECT * FROM public.${table} WHERE ${whereClause}`;
    const res = await client.query(sql, [whereValue]);
    return res.rows;
  }

  throw new Error(`Unsupported query method: ${method}`);
}

// ── Main Ingest ─────────────────────────────────────────────────────

async function ingestFile(filePath: string, dryRun: boolean): Promise<{ chunks: number; skipped: boolean }> {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  const relativePath = path.relative('c:\\Users\\Lisa\\Desktop\\Konfguratr', filePath).replace(/\\/g, '/');
  const source = detectSource(filePath);
  const stats = fs.statSync(filePath);

  // Parse file
  let text: string;
  try {
    if (ext === '.pdf') text = await parsePDF(filePath);
    else if (ext === '.docx' || ext === '.doc') text = await parseDOCX(filePath);
    else if (ext === '.txt') text = parseTXT(filePath);
    else return { chunks: 0, skipped: true };
  } catch (err) {
    console.error(`  [SKIP] Parse error: ${err instanceof Error ? err.message : err}`);

    if (!dryRun) {
      await supabaseQuery('knowledge_sources', 'POST', {
        file_path: relativePath,
        file_name: fileName,
        file_type: ext.replace('.', ''),
        source_name: source.source_name,
        author: source.author,
        method: source.method,
        language: 'ru',
        status: 'failed',
        error_message: `Parse error: ${err instanceof Error ? err.message : 'Unknown'}`,
        file_size_bytes: stats.size,
      }).catch(() => { });
    }
    return { chunks: 0, skipped: true };
  }

  // Skip near-empty files
  if (text.trim().length < 100) {
    console.log(`  [SKIP] Too short (${text.length} chars)`);
    return { chunks: 0, skipped: true };
  }

  // Chunk
  const chunks = chunkText(text);
  console.log(`  ${chunks.length} chunks (${text.length} chars)`);

  if (dryRun) return { chunks: chunks.length, skipped: false };

  // Register source in Supabase
  let sourceId: string;
  try {
    const result = await supabaseQuery('knowledge_sources', 'POST', {
      file_path: relativePath,
      file_name: fileName,
      file_type: ext.replace('.', ''),
      source_name: source.source_name,
      author: source.author,
      method: source.method,
      language: 'ru',
      status: 'processing',
      file_size_bytes: stats.size,
    }) as Array<{ id: string }>;
    sourceId = result[0].id;
  } catch (err) {
    // Likely duplicate file_path — update instead
    console.log(`  [UPDATE] Source exists, updating...`);
    await supabaseQuery('knowledge_sources', 'PATCH', {
      status: 'processing',
      updated_at: new Date().toISOString(),
    }, `?file_path=eq.${encodeURIComponent(relativePath)}`);
    const existing = await supabaseQuery('knowledge_sources', 'GET', undefined,
      `?file_path=eq.${encodeURIComponent(relativePath)}&select=id`) as Array<{ id: string }>;
    sourceId = existing[0]?.id;
    if (!sourceId) throw err;
  }

  // Embed + upsert each chunk
  let processed = 0;
  const chunkRecords: Array<Record<string, unknown>> = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const pineconeId = `knowledge-${sourceId}-${i}`;

    try {
      const embedding = await generateEmbedding(chunk);

      await upsertToPinecone(pineconeId, embedding, {
        type: 'knowledge',
        source_name: source.source_name,
        author: source.author || undefined,
        method: source.method || undefined,
        language: 'ru',
        file_name: fileName,
        chunk_index: i,
        created_at: new Date().toISOString(),
      });

      chunkRecords.push({
        source_id: sourceId,
        chunk_index: i,
        content: chunk,
        pinecone_id: pineconeId,
        source_name: source.source_name,
      });

      processed++;

      if (processed % 10 === 0) {
        process.stdout.write(`  ${processed}/${chunks.length} chunks embedded\r`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 60));
    } catch (err) {
      console.error(`  [ERR] Chunk ${i}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`  ${processed}/${chunks.length} chunks embedded`);

  // Batch insert chunk records (in batches of 50)
  for (let i = 0; i < chunkRecords.length; i += 50) {
    const batch = chunkRecords.slice(i, i + 50);
    await supabaseQuery('knowledge_chunks', 'POST', batch).catch((err) =>
      console.error(`  [ERR] Chunk batch insert: ${err}`),
    );
  }

  // Update source status
  await supabaseQuery('knowledge_sources', 'PATCH', {
    status: processed > 0 ? 'completed' : 'failed',
    chunk_count: processed,
    processed_at: new Date().toISOString(),
    error_message: processed === 0 ? 'No chunks embedded' : null,
    updated_at: new Date().toISOString(),
  }, `?id=eq.${sourceId}`);

  return { chunks: processed, skipped: false };
}

// ── CLI ──────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const sourceIdx = args.indexOf('--source');
  const sourceFilter = sourceIdx >= 0 ? args[sourceIdx + 1] : undefined;
  const fileIdx = args.indexOf('--file');
  const singleFile = fileIdx >= 0 ? args[fileIdx + 1] : undefined;

  console.log('='.repeat(60));
  console.log('  Knowledge Base Ingest');
  console.log(`  Mode: ${dryRun ? 'DRY RUN (nur zaehlen)' : 'LIVE (vektorisieren)'}`);
  if (sourceFilter) console.log(`  Filter: ${sourceFilter}`);
  if (singleFile) console.log(`  File: ${singleFile}`);
  console.log('='.repeat(60));

  // Check env
  if (!dryRun) {
    if (!OPENAI_API_KEY) { console.error('OPENAI_API_KEY nicht gesetzt!'); process.exit(1); }
    if (!PINECONE_API_KEY) { console.error('PINECONE_API_KEY nicht gesetzt!'); process.exit(1); }
    if (!PINECONE_HOST) { console.error('PINECONE_HOST nicht gesetzt!'); process.exit(1); }
    console.log('\nEnv vars OK.\n');
  }

  // Discover files
  const rootDir = 'c:\\Users\\Lisa\\Desktop\\Konfguratr';
  let files: string[];

  if (singleFile) {
    const fullPath = path.isAbsolute(singleFile) ? singleFile : path.resolve(rootDir, singleFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`Datei nicht gefunden: ${fullPath}`);
      process.exit(1);
    }
    files = [fullPath];
  } else {
    files = discoverFiles(rootDir, sourceFilter);
  }

  console.log(`${files.length} Dateien gefunden.\n`);

  // Group by source for display
  const bySource = new Map<string, string[]>();
  for (const f of files) {
    const source = detectSource(f).source_name;
    const arr = bySource.get(source) ?? [];
    arr.push(f);
    bySource.set(source, arr);
  }

  for (const [source, sourceFiles] of bySource) {
    console.log(`[${source}] ${sourceFiles.length} Dateien`);
  }
  console.log();

  // Process files
  let totalChunks = 0;
  let totalFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const fileName = path.basename(filePath);
    const source = detectSource(filePath).source_name;

    console.log(`[${i + 1}/${files.length}] ${source} / ${fileName}`);

    try {
      const result = await ingestFile(filePath, dryRun);
      if (result.skipped) {
        skippedFiles++;
      } else {
        totalFiles++;
        totalChunks += result.chunks;
      }
    } catch (err) {
      console.error(`  [FATAL] ${err instanceof Error ? err.message : err}`);
      errorFiles++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  ERGEBNIS');
  console.log('='.repeat(60));
  console.log(`  Verarbeitet: ${totalFiles} Dateien`);
  console.log(`  Chunks:      ${totalChunks}`);
  console.log(`  Übersprungen: ${skippedFiles}`);
  console.log(`  Fehler:      ${errorFiles}`);
  if (dryRun) console.log('\n  (DRY RUN — nichts wurde vektorisiert)');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
}).finally(async () => {
  if (pgClient) {
    await pgClient.end();
  }
});
