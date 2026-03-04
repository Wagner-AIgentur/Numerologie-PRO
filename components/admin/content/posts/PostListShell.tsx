'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText, Plus, Filter, Search, Copy, Check,
  Download, Trash2, Eye, ChevronDown,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  body: string | null;
  content_type: string;
  status: string;
  funnel_stage: string;
  language: string;
  target_platforms: string[];
  manychat_enabled: boolean;
  manychat_keyword: string | null;
  manychat_conversions: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  idea: 'bg-white/5 text-white/40',
  draft: 'bg-white/5 text-white/50',
  review: 'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-blue-500/10 text-blue-400',
  scheduled: 'bg-purple-500/10 text-purple-400',
  published: 'bg-emerald-500/10 text-emerald-400',
  archived: 'bg-white/5 text-white/30',
};

const funnelColors: Record<string, string> = {
  tofu: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mofu: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  bofu: 'bg-gold/10 text-gold border-gold/20',
  retention: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

interface Props {
  locale: string;
  t: Record<string, string>;
}

export default function PostListShell({ locale, t }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [funnelFilter, setFunnelFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (funnelFilter) params.set('funnel_stage', funnelFilter);
    params.set('limit', '50');

    const res = await fetch(`/api/admin/content/posts?${params}`);
    const data = await res.json();
    setPosts(data.data ?? []);
    setLoading(false);
  }, [statusFilter, funnelFilter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleCopy(post: Post) {
    await navigator.clipboard.writeText(post.body ?? post.title);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm('Post wirklich löschen?')) return;
    await fetch(`/api/admin/content/posts/${id}`, { method: 'DELETE' });
    loadPosts();
  }

  // Funnel balance
  const funnelCounts = {
    tofu: posts.filter((p) => p.funnel_stage === 'tofu').length,
    mofu: posts.filter((p) => p.funnel_stage === 'mofu').length,
    bofu: posts.filter((p) => p.funnel_stage === 'bofu').length,
    retention: posts.filter((p) => p.funnel_stage === 'retention').length,
  };
  const total = posts.length || 1;

  return (
    <div className="space-y-4">
      {/* Funnel Balance Bar */}
      {posts.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/40">{t.csFunnelBalance}</span>
          </div>
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500" style={{ width: `${(funnelCounts.tofu / total) * 100}%` }} />
            <div className="bg-orange-500" style={{ width: `${(funnelCounts.mofu / total) * 100}%` }} />
            <div className="bg-gold" style={{ width: `${(funnelCounts.bofu / total) * 100}%` }} />
            <div className="bg-emerald-500" style={{ width: `${(funnelCounts.retention / total) * 100}%` }} />
          </div>
          <div className="flex gap-3 mt-2 text-[10px] text-white/40">
            <span>TOFU: {funnelCounts.tofu}</span>
            <span>MOFU: {funnelCounts.mofu}</span>
            <span>BOFU: {funnelCounts.bofu}</span>
            <span>Ret: {funnelCounts.retention}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-2 text-xs text-white/70 focus:outline-none"
        >
          <option value="">Alle Status</option>
          <option value="idea">{t.status_idea}</option>
          <option value="draft">{t.status_draft}</option>
          <option value="review">{t.status_review}</option>
          <option value="approved">{t.status_approved}</option>
          <option value="scheduled">{t.status_scheduled}</option>
          <option value="published">{t.status_published}</option>
          <option value="archived">{t.status_archived}</option>
        </select>

        <select
          value={funnelFilter}
          onChange={(e) => setFunnelFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-2 text-xs text-white/70 focus:outline-none"
        >
          <option value="">Alle Funnel-Stages</option>
          <option value="tofu">TOFU</option>
          <option value="mofu">MOFU</option>
          <option value="bofu">BOFU</option>
          <option value="retention">Retention</option>
        </select>
      </div>

      {/* Post List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <FileText className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">{t.csNoPostsYet}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 hover:border-white/15 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded', statusColors[post.status])}>
                      {t[`status_${post.status}` as keyof typeof t] ?? post.status}
                    </span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', funnelColors[post.funnel_stage])}>
                      {post.funnel_stage.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/20">{post.content_type}</span>
                    {post.manychat_enabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                        MC: {post.manychat_keyword}
                      </span>
                    )}
                    {post.manychat_conversions > 0 && (
                      <span className="text-[10px] text-emerald-400">{post.manychat_conversions} leads</span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{post.title}</h3>
                  {post.body && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{post.body.substring(0, 200)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-white/20">
                    <span>{post.language.toUpperCase()}</span>
                    {post.target_platforms?.map((p) => (
                      <span key={p} className="px-1 py-0.5 rounded bg-white/5">{p}</span>
                    ))}
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(post)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    title={t.csCopyToClipboard}
                  >
                    {copiedId === post.id
                      ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                      : <Copy className="h-3.5 w-3.5 text-white/30" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white/20 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
