/**
 * Knowledge Base — Ingest + Search for Training Materials
 *
 * Handles vectorization of PDFs, DOCX, TXT files into Pinecone "knowledge" namespace.
 * Metadata tagging prevents mixing of different courses/methods.
 *
 * Flow: File → Parse → Chunk → Embed → Pinecone + Supabase tracking
 */

import { adminClient } from '@/lib/supabase/admin';
import {
  generateEmbedding,
  upsertToPinecone,
  querySimilar,
  type PineconeMetadata,
  type SimilarResult,
} from './embeddings';

// ── Constants ─────────────────────────────────────────────────────────

const KNOWLEDGE_NAMESPACE = 'knowledge';
const CHUNK_SIZE = 800; // Target tokens per chunk (~3200 chars)
const CHUNK_OVERLAP = 100; // Overlap tokens for context continuity

/**
 * Known course folders → source_name mapping.
 * Used by auto-detect to tag chunks correctly.
 */
export const SOURCE_MAP: Record<string, { source_name: string; author: string; method: string }> = {
  'Идеал': { source_name: 'Идеал', author: 'Идеал', method: 'matrix-numerologie' },
  'Нумерология Файман': { source_name: 'Файман', author: 'Файман', method: 'tarot-numerologie' },
  'Нумеррлогия Анна Спицина': { source_name: 'Анна Спицина', author: 'Анна Спицина', method: 'selbsterkenntnis' },
  'Пифагор Анаель': { source_name: 'Пифагор Анаель', author: 'Анаель', method: 'karmische-numerologie' },
  'Прогнозирование': { source_name: 'Прогнозирование', author: '', method: 'prognose' },
  'Matrix кабинет': { source_name: 'Matrix кабинет', author: '', method: 'matrix-berechnung' },
};

// ── Types ─────────────────────────────────────────────────────────────

export interface KnowledgeMetadata extends PineconeMetadata {
  type: 'knowledge';
  source_name: string;
  author?: string;
  method?: string;
  chapter?: string;
  page?: number;
  file_name?: string;
  chunk_index?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  score: number;
  content: string;
  metadata: KnowledgeMetadata;
}

export interface IngestProgress {
  sourceId: string;
  fileName: string;
  status: 'parsing' | 'chunking' | 'embedding' | 'done' | 'error';
  chunksTotal: number;
  chunksProcessed: number;
  error?: string;
}

export type ProgressCallback = (progress: IngestProgress) => void;

// ── Text Chunking ─────────────────────────────────────────────────────

/**
 * Split text into overlapping chunks of roughly CHUNK_SIZE tokens.
 * Splits on paragraph boundaries first, then sentences.
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const charSize = chunkSize * 4; // ~4 chars per token
  const charOverlap = overlap * 4;

  // Clean text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (cleaned.length <= charSize) return [cleaned];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + charSize;

    // Don't cut in the middle of a word
    if (end < cleaned.length) {
      // Try paragraph break first
      const paraBreak = cleaned.lastIndexOf('\n\n', end);
      if (paraBreak > start + charSize * 0.5) {
        end = paraBreak;
      } else {
        // Try sentence break
        const sentBreak = cleaned.lastIndexOf('. ', end);
        if (sentBreak > start + charSize * 0.5) {
          end = sentBreak + 1;
        }
      }
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 50) { // Skip tiny fragments
      chunks.push(chunk);
    }

    start = end - charOverlap;
    if (start >= cleaned.length) break;
  }

  return chunks;
}

/**
 * Detect source/course from file path using SOURCE_MAP.
 */
export function detectSource(filePath: string): { source_name: string; author: string; method: string } {
  for (const [folder, meta] of Object.entries(SOURCE_MAP)) {
    if (filePath.includes(folder)) return meta;
  }
  return { source_name: 'Unbekannt', author: '', method: '' };
}

// ── Ingest: Single File ───────────────────────────────────────────────

/**
 * Ingest a single parsed text file into the knowledge base.
 *
 * Steps:
 * 1. Register source in knowledge_sources
 * 2. Chunk the text
 * 3. Generate embeddings + upsert to Pinecone
 * 4. Track chunks in knowledge_chunks
 */
export async function ingestKnowledgeFile(params: {
  filePath: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'transcript';
  text: string;
  language?: string;
  sourceName?: string;
  author?: string;
  method?: string;
  onProgress?: ProgressCallback;
}): Promise<{ sourceId: string; chunkCount: number }> {
  const detected = detectSource(params.filePath);
  const sourceName = params.sourceName ?? detected.source_name;
  const author = params.author ?? detected.author;
  const method = params.method ?? detected.method;
  const language = params.language ?? 'ru';

  // 1. Register/update source
  const { data: source, error: sourceErr } = await adminClient
    .from('knowledge_sources')
    .upsert({
      file_path: params.filePath,
      file_name: params.fileName,
      file_type: params.fileType,
      source_name: sourceName,
      author,
      method,
      language,
      status: 'processing',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'file_path' })
    .select('id')
    .single();

  if (sourceErr || !source) {
    throw new Error(`Failed to register source: ${sourceErr?.message}`);
  }

  const sourceId = source.id;

  params.onProgress?.({
    sourceId, fileName: params.fileName,
    status: 'chunking', chunksTotal: 0, chunksProcessed: 0,
  });

  // 2. Chunk the text
  const chunks = chunkText(params.text);

  params.onProgress?.({
    sourceId, fileName: params.fileName,
    status: 'embedding', chunksTotal: chunks.length, chunksProcessed: 0,
  });

  // 3. Embed + upsert each chunk
  let processed = 0;
  const chunkRecords: Array<{
    source_id: string;
    chunk_index: number;
    content: string;
    pinecone_id: string;
    source_name: string;
    topic: string | null;
  }> = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const pineconeId = `knowledge-${sourceId}-${i}`;

    try {
      const embedding = await generateEmbedding(chunk);

      const metadata: KnowledgeMetadata = {
        type: 'knowledge',
        source_name: sourceName,
        author: author || undefined,
        method: method || undefined,
        language,
        file_name: params.fileName,
        chunk_index: i,
        created_at: new Date().toISOString(),
      };

      await upsertToPinecone(pineconeId, embedding, metadata, KNOWLEDGE_NAMESPACE);

      chunkRecords.push({
        source_id: sourceId,
        chunk_index: i,
        content: chunk,
        pinecone_id: pineconeId,
        source_name: sourceName,
        topic: null,
      });

      processed++;
      if (processed % 5 === 0) {
        params.onProgress?.({
          sourceId, fileName: params.fileName,
          status: 'embedding', chunksTotal: chunks.length, chunksProcessed: processed,
        });
      }

      // Rate limit: ~50ms between embeddings to avoid 429
      if (i < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, 50));
      }
    } catch (err) {
      console.error(`[Knowledge] Chunk ${i} failed for ${params.fileName}:`, err);
      // Continue with next chunk
    }
  }

  // 4. Batch insert chunk records
  if (chunkRecords.length > 0) {
    await adminClient.from('knowledge_chunks').insert(chunkRecords);
  }

  // 5. Update source status
  await adminClient
    .from('knowledge_sources')
    .update({
      status: processed > 0 ? 'completed' : 'failed',
      chunk_count: processed,
      processed_at: new Date().toISOString(),
      error_message: processed === 0 ? 'No chunks could be embedded' : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sourceId);

  params.onProgress?.({
    sourceId, fileName: params.fileName,
    status: 'done', chunksTotal: chunks.length, chunksProcessed: processed,
  });

  return { sourceId, chunkCount: processed };
}

// ── Search ────────────────────────────────────────────────────────────

/**
 * Search the knowledge base with optional source/method filtering.
 * Returns matching chunks with content from Supabase.
 */
export async function searchKnowledge(params: {
  query: string;
  topK?: number;
  sourceName?: string; // Filter by course
  method?: string;     // Filter by calculation method
  language?: string;   // Filter by language
}): Promise<KnowledgeSearchResult[]> {
  // Build Pinecone metadata filter
  const filter: Record<string, unknown> = { type: { $eq: 'knowledge' } };
  if (params.sourceName) filter.source_name = { $eq: params.sourceName };
  if (params.method) filter.method = { $eq: params.method };
  if (params.language) filter.language = { $eq: params.language };

  const results = await querySimilar(
    params.query,
    KNOWLEDGE_NAMESPACE,
    params.topK ?? 8,
    filter,
  );

  if (results.length === 0) return [];

  // Fetch chunk content from Supabase
  const pineconeIds = results.map((r) => r.id);
  const { data: chunks } = await adminClient
    .from('knowledge_chunks')
    .select('pinecone_id, content, chapter, source_name')
    .in('pinecone_id', pineconeIds);

  const contentMap = new Map<string, string>();
  const chapterMap = new Map<string, string>();
  for (const c of chunks ?? []) {
    contentMap.set(c.pinecone_id, c.content);
    if (c.chapter) chapterMap.set(c.pinecone_id, c.chapter);
  }

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    content: contentMap.get(r.id) ?? '',
    metadata: {
      ...(r.metadata as KnowledgeMetadata),
      chapter: chapterMap.get(r.id),
    },
  }));
}

/**
 * Format knowledge results into a prompt section for AI generation.
 */
export function formatKnowledgeForPrompt(
  results: KnowledgeSearchResult[],
  maxChars = 6000,
): string {
  if (results.length === 0) return '';

  const sections: string[] = [];
  let totalChars = 0;

  for (const r of results) {
    if (totalChars > maxChars) break;

    const sourceLabel = r.metadata.source_name ?? 'Unbekannt';
    const chapterLabel = r.metadata.chapter ? `, Kapitel: ${r.metadata.chapter}` : '';
    const pageLabel = r.metadata.page ? `, Seite ${r.metadata.page}` : '';
    const scorePercent = Math.round(r.score * 100);

    const section = `--- Quelle: ${sourceLabel}${chapterLabel}${pageLabel} (${scorePercent}% relevant) ---\n${r.content}`;
    sections.push(section);
    totalChars += section.length;
  }

  return `\n--- WISSENSBASIS ---\nDie folgenden Auszüge stammen aus professionellen Numerologie-Schulungen. Nutze dieses Fachwissen als Grundlage:\n\n${sections.join('\n\n')}\n--- ENDE WISSENSBASIS ---\n`;
}

// ── Stats ─────────────────────────────────────────────────────────────

/**
 * Get knowledge base statistics for the admin dashboard.
 */
export async function getKnowledgeStats(): Promise<{
  totalSources: number;
  completedSources: number;
  totalChunks: number;
  sourceBreakdown: Array<{ source_name: string; chunk_count: number; file_count: number }>;
}> {
  const [{ count: totalSources }, { count: completedSources }, { count: totalChunks }] = await Promise.all([
    adminClient.from('knowledge_sources').select('*', { count: 'exact', head: true }).neq('status', 'skipped'),
    adminClient.from('knowledge_sources').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('knowledge_chunks').select('*', { count: 'exact', head: true }),
  ]);

  const { data: breakdown } = await adminClient
    .from('knowledge_sources')
    .select('source_name, chunk_count')
    .eq('status', 'completed');

  const grouped = new Map<string, { chunk_count: number; file_count: number }>();
  for (const row of breakdown ?? []) {
    const existing = grouped.get(row.source_name) ?? { chunk_count: 0, file_count: 0 };
    existing.chunk_count += row.chunk_count ?? 0;
    existing.file_count += 1;
    grouped.set(row.source_name, existing);
  }

  return {
    totalSources: totalSources ?? 0,
    completedSources: completedSources ?? 0,
    totalChunks: totalChunks ?? 0,
    sourceBreakdown: Array.from(grouped.entries()).map(([source_name, stats]) => ({
      source_name,
      ...stats,
    })),
  };
}

/**
 * Get available knowledge sources for the UI filter dropdown.
 */
export async function getKnowledgeSources(): Promise<string[]> {
  const { data } = await adminClient
    .from('knowledge_sources')
    .select('source_name')
    .eq('status', 'completed');

  const unique = new Set<string>();
  for (const row of data ?? []) unique.add(row.source_name);
  return Array.from(unique).sort();
}
