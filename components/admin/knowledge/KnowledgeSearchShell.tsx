'use client';

import { useState } from 'react';
import {
  Search,
  BookOpen,
  Database,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Library,
} from 'lucide-react';

interface KnowledgeStats {
  totalSources: number;
  completedSources: number;
  totalChunks: number;
  sourceGroups: Array<{ name: string; files: number; chunks: number }>;
}

interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    source_name?: string;
    author?: string;
    method?: string;
    chapter?: string;
    page?: number;
    file_name?: string;
    chunk_index?: number;
    language?: string;
  };
}

export default function KnowledgeSearchShell({
  locale,
  stats,
}: {
  locale: string;
  stats: KnowledgeStats;
}) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isDE = locale === 'de';

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        action: 'search',
        q: query.trim(),
        topK: '10',
      });
      if (sourceFilter) params.set('source', sourceFilter);

      const res = await fetch(`/api/admin/knowledge?${params}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      console.error('[KnowledgeSearch] Error:', err);
      setError(err instanceof Error ? err.message : 'Suche fehlgeschlagen');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function copyContent(id: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const sourceNames = stats.sourceGroups.map((s) => s.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Library className="h-5 w-5 text-gold" strokeWidth={1.5} />
            {isDE ? 'Wissensbasis' : 'База знаний'}
          </h1>
          <p className="text-xs text-white/40 mt-1">
            {isDE
              ? 'Durchsuche vektorisierte Schulungsmaterialien mit KI-Semantic-Search'
              : 'Поиск по векторизированным учебным материалам с AI-семантическим поиском'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-xs text-white/40">{isDE ? 'Dateien' : 'Файлов'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.completedSources}</div>
          <div className="text-[10px] text-white/30">
            {isDE ? `von ${stats.totalSources} verarbeitet` : `из ${stats.totalSources} обработано`}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-xs text-white/40">{isDE ? 'Chunks' : 'Чанков'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalChunks.toLocaleString()}</div>
          <div className="text-[10px] text-white/30">{isDE ? 'in Pinecone vektorisiert' : 'векторизировано в Pinecone'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-xs text-white/40">{isDE ? 'Kurse' : 'Курсов'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.sourceGroups.length}</div>
          <div className="text-[10px] text-white/30">{isDE ? 'verschiedene Quellen' : 'различных источников'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-xs text-white/40">{isDE ? 'Status' : 'Статус'}</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {stats.completedSources > 0 ? (isDE ? 'Aktiv' : 'Активна') : (isDE ? 'Leer' : 'Пусто')}
          </div>
          <div className="text-[10px] text-white/30">Pinecone Namespace: knowledge</div>
        </div>
      </div>

      {/* Source Breakdown */}
      {stats.sourceGroups.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">
            {isDE ? 'Quellen-Übersicht' : 'Обзор источников'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.sourceGroups.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2"
              >
                <span className="text-sm text-white/80 truncate">{g.name}</span>
                <div className="flex gap-3 text-[10px] text-white/40 shrink-0 ml-2">
                  <span>{g.files} {isDE ? 'Dateien' : 'файл.'}</span>
                  <span>{g.chunks} Chunks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isDE
                ? 'z.B. "Wie berechnet man die Schicksalszahl?"'
                : 'напр. "Как рассчитать число судьбы?"'}
              className="w-full rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl border px-3 py-3 transition-colors ${showFilters
              ? 'border-gold/40 bg-gold/10 text-gold'
              : 'border-white/10 bg-[rgba(15,48,63,0.3)] text-white/40 hover:text-white/60'
            }`}
          >
            <Filter className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-xl bg-gold/10 border border-gold/30 px-6 py-3 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-40"
          >
            {loading
              ? (isDE ? 'Suche...' : 'Поиск...')
              : (isDE ? 'Suchen' : 'Найти')}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 px-1">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">
                {isDE ? 'Quelle / Kurs' : 'Источник / Курс'}
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-[rgba(15,48,63,0.4)] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
              >
                <option value="">{isDE ? 'Alle Kurse' : 'Все курсы'}</option>
                {sourceNames.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <strong>{isDE ? 'Fehler:' : 'Ошибка:'}</strong> {error}
        </div>
      )}

      {/* Results */}
      {searched && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">
              {results.length > 0
                ? `${results.length} ${isDE ? 'Ergebnisse' : 'результатов'}`
                : (isDE ? 'Keine Ergebnisse' : 'Нет результатов')}
            </h3>
            {sourceFilter && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold">
                {sourceFilter}
              </span>
            )}
          </div>

          {results.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <Search className="h-8 w-8 text-white/10 mx-auto mb-3" strokeWidth={1} />
              <p className="text-white/30 text-sm">
                {isDE
                  ? 'Keine passenden Wissens-Chunks gefunden. Versuche andere Suchbegriffe.'
                  : 'Подходящие чанки знаний не найдены. Попробуйте другие поисковые запросы.'}
              </p>
            </div>
          )}

          {results.map((r) => {
            const isExpanded = expandedId === r.id;
            const isCopied = copiedId === r.id;
            const scorePercent = Math.round(r.score * 100);
            const scoreColor = scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 60 ? 'text-gold' : 'text-white/40';

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono font-bold ${scoreColor}`}>
                      {scorePercent}%
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                          {r.metadata.source_name}
                        </span>
                        {r.metadata.file_name && (
                          <span className="text-[10px] text-white/30 truncate max-w-[200px]">
                            {r.metadata.file_name}
                          </span>
                        )}
                        {r.metadata.method && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/5 border border-gold/10 text-gold/60">
                            {r.metadata.method}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 mt-1 line-clamp-2">
                        {r.content.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-4 py-3">
                    <pre className="text-sm text-white/60 whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto">
                      {r.content}
                    </pre>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex gap-2 text-[10px] text-white/30">
                        {r.metadata.page && <span>Seite {r.metadata.page}</span>}
                        {r.metadata.chapter && <span>Kap: {r.metadata.chapter}</span>}
                        <span>Chunk #{r.metadata.chunk_index}</span>
                      </div>
                      <button
                        onClick={() => copyContent(r.id, r.content)}
                        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-gold transition-colors"
                      >
                        {isCopied ? (
                          <><Check className="h-3 w-3" strokeWidth={1.5} /> {isDE ? 'Kopiert' : 'Скопировано'}</>
                        ) : (
                          <><Copy className="h-3 w-3" strokeWidth={1.5} /> {isDE ? 'Text kopieren' : 'Копировать текст'}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State (no search yet) */}
      {!searched && stats.totalChunks === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 sm:p-12 text-center">
          <BookOpen className="h-10 w-10 text-white/10 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">
            {isDE
              ? 'Noch keine Wissens-Dokumente vektorisiert. Starte den Ingest:'
              : 'Документы ещё не векторизированы. Запустите инжест:'}
          </p>
          <code className="block mt-3 text-xs text-gold/60 bg-black/30 rounded-lg px-4 py-2 max-w-md mx-auto">
            npx tsx scripts/knowledge-ingest.ts --dry-run
          </code>
        </div>
      )}
    </div>
  );
}
