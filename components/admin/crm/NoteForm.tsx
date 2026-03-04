'use client';

import { useState, FormEvent } from 'react';
import { Send, StickyNote, Phone, Mail, Clock } from 'lucide-react';

interface Props {
  profileId: string;
  onCreated: () => void;
}

const NOTE_TYPES = [
  { value: 'note', label: 'Notiz', icon: StickyNote, color: 'text-yellow-400' },
  { value: 'call', label: 'Anruf', icon: Phone, color: 'text-green-400' },
  { value: 'email', label: 'E-Mail', icon: Mail, color: 'text-blue-400' },
  { value: 'follow_up', label: 'Follow-up', icon: Clock, color: 'text-purple-400' },
] as const;

export default function NoteForm({ profileId, onCreated }: Props) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<string>('note');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/customers/${profileId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          type,
          follow_up_date: type === 'follow_up' && followUpDate ? followUpDate : null,
        }),
      });

      if (res.ok) {
        setContent('');
        setFollowUpDate('');
        setType('note');
        onCreated();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
      <h3 className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">Neue Notiz</h3>

      {/* Type Selector */}
      <div className="flex gap-1 mb-3">
        {NOTE_TYPES.map((nt) => {
          const Icon = nt.icon;
          const isActive = type === nt.value;
          return (
            <button
              key={nt.value}
              type="button"
              onClick={() => setType(nt.value)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? `${nt.color} border-current/20 bg-current/10`
                  : 'text-white/40 border-white/10 hover:text-white/60'
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {nt.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Notiz schreiben..."
        className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold/30 resize-none mb-2"
      />

      {/* Follow-up Date (only for follow_up type) */}
      {type === 'follow_up' && (
        <div className="mb-2">
          <label className="text-xs text-white/40 block mb-1">Follow-up Datum</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="text-xs text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold/30"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="flex items-center gap-1.5 text-xs px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 disabled:opacity-30 transition-all"
      >
        <Send className="h-3 w-3" strokeWidth={2} />
        {submitting ? 'Speichert...' : 'Hinzufügen'}
      </button>
    </form>
  );
}
