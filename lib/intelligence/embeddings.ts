/**
 * Embedding Engine + Pinecone Operations
 *
 * Handles vector embeddings for the Content Intelligence Layer:
 * - Generate embeddings via OpenAI text-embedding-3-small
 * - Upsert/query/delete vectors in Pinecone
 * - Time-decay scoring for relevance ranking
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX ?? 'numerologie-content';
const PINECONE_HOST = process.env.PINECONE_HOST; // e.g. https://numerologie-content-xxxxx.svc.xxx.pinecone.io

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface PineconeMetadata {
  type: string; // 'post' | 'intel' | 'script' | 'strategy'
  title?: string;
  funnel_stage?: string;
  platform?: string;
  content_type?: string;
  triggers?: string[];
  language?: string;
  created_at: string;
  is_pinned?: boolean;
}

export interface SimilarResult {
  id: string;
  score: number;
  metadata: PineconeMetadata;
}

export interface DecayedResult extends SimilarResult {
  decayedScore: number;
  recencyScore: number;
  ageHours: number;
}

export interface DecayConfig {
  halfLifeHours: number;  // Default: 168 (7 days)
  recencyWeight: number;  // Default: 0.15
  pinnedIds?: string[];   // IDs immune to decay
}

const DEFAULT_DECAY: DecayConfig = {
  halfLifeHours: 168,
  recencyWeight: 0.15,
};

// ── Embeddings ─────────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.substring(0, 8000), // Token limit safety
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) throw new Error(`Embedding error: ${res.status}`);

  const data = await res.json();
  return data.data[0].embedding;
}

// ── Pinecone Operations ────────────────────────────────────────────────

function getPineconeUrl(): string {
  if (!PINECONE_HOST) throw new Error('PINECONE_HOST not configured');
  return PINECONE_HOST;
}

export async function upsertToPinecone(
  id: string,
  embedding: number[],
  metadata: PineconeMetadata,
  namespace: string,
): Promise<void> {
  if (!PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not configured');

  const res = await fetch(`${getPineconeUrl()}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      namespace,
      vectors: [{ id, values: embedding, metadata }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Pinecone] Upsert failed:', err);
    throw new Error(`Pinecone upsert error: ${res.status}`);
  }
}

export async function querySimilar(
  query: string,
  namespace: string,
  topK = 5,
  filter?: Record<string, unknown>,
): Promise<SimilarResult[]> {
  if (!PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not configured');

  const embedding = await generateEmbedding(query);

  const res = await fetch(`${getPineconeUrl()}/query`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      namespace,
      vector: embedding,
      topK,
      includeMetadata: true,
      ...(filter ? { filter } : {}),
    }),
  });

  if (!res.ok) throw new Error(`Pinecone query error: ${res.status}`);

  const data = await res.json();
  return (data.matches ?? []).map((m: { id: string; score: number; metadata: PineconeMetadata }) => ({
    id: m.id,
    score: m.score,
    metadata: m.metadata,
  }));
}

export async function querySimilarWithDecay(
  query: string,
  namespace: string,
  topK = 5,
  config: DecayConfig = DEFAULT_DECAY,
): Promise<DecayedResult[]> {
  // Fetch more results than needed so decay re-ranking has room
  const results = await querySimilar(query, namespace, topK * 3);
  const decayed = applyTimeDecay(results, config);
  return decayed.slice(0, topK);
}

export async function deleteFromPinecone(id: string, namespace: string): Promise<void> {
  if (!PINECONE_API_KEY) throw new Error('PINECONE_API_KEY not configured');

  await fetch(`${getPineconeUrl()}/vectors/delete`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ namespace, ids: [id] }),
  });
}

// ── Time-Decay Scoring ─────────────────────────────────────────────────

/**
 * Calculate time-decay recency score.
 * Formula: exp(-decayRate * ageInHours)
 * decayRate = ln(2) / halfLifeHours
 */
export function calculateDecayScore(createdAt: Date, halfLifeHours: number): number {
  const ageMs = Date.now() - createdAt.getTime();
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));
  const decayRate = Math.LN2 / halfLifeHours;
  return Math.exp(-decayRate * ageHours);
}

/**
 * Apply time-decay to similarity results.
 * finalScore = (1 - recencyWeight) * similarityScore + recencyWeight * recencyScore
 * Pinned items always get recencyScore = 1.0
 */
export function applyTimeDecay(
  results: SimilarResult[],
  config: DecayConfig = DEFAULT_DECAY,
): DecayedResult[] {
  const pinnedSet = new Set(config.pinnedIds ?? []);

  const decayed = results.map((r) => {
    const createdAt = r.metadata.created_at ? new Date(r.metadata.created_at) : new Date();
    const ageMs = Date.now() - createdAt.getTime();
    const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));

    const isPinned = pinnedSet.has(r.id) || r.metadata.is_pinned;
    const recencyScore = isPinned ? 1.0 : calculateDecayScore(createdAt, config.halfLifeHours);

    const decayedScore =
      (1 - config.recencyWeight) * r.score +
      config.recencyWeight * recencyScore;

    return {
      ...r,
      decayedScore,
      recencyScore,
      ageHours,
    };
  });

  return decayed.sort((a, b) => b.decayedScore - a.decayedScore);
}
