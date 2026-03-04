'use client';

import { useState } from 'react';
import { Video, Loader2, CheckCircle2 } from 'lucide-react';
import { getAdminT } from '@/lib/i18n/admin';

export default function RecordingAttachForm({ sessionId, locale }: { sessionId: string; locale: string }) {
  const t = getAdminT(locale);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recording_url: url.trim() }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error('Failed to save recording:', err);
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
        {t.recordingSaved}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center gap-2">
        <Video className="h-3.5 w-3.5 text-white/30 shrink-0" strokeWidth={1.5} />
        <input
          type="url"
          placeholder={t.recordingPlaceholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold/30"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : t.save}
        </button>
      </div>
    </form>
  );
}
