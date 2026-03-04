'use client';

import {
  StickyNote,
  Phone,
  Mail,
  Clock,
  ShoppingBag,
  Calendar,
  MessageSquare,
} from 'lucide-react';

type TimelineEntry = {
  id: string;
  date: string;
  type: 'note' | 'call' | 'email_note' | 'follow_up' | 'email_sent' | 'order' | 'session' | 'contact';
  title: string;
  detail: string;
  meta?: string;
};

interface Props {
  notes: Array<{
    id: string;
    content: string;
    type: 'note' | 'call' | 'email' | 'follow_up';
    follow_up_date: string | null;
    created_at: string;
  }>;
  emails: Array<{
    id: string;
    to_email: string;
    subject: string;
    template: string | null;
    status: string;
    created_at: string;
  }>;
  orders: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    status: string;
    metadata: Record<string, string> | null;
    products?: { name_de: string; package_key: string | null } | null;
    created_at: string;
  }>;
  sessions: Array<{
    id: string;
    title: string;
    status: string;
    session_type: string;
    scheduled_at: string | null;
    package_type: string | null;
    created_at: string;
  }>;
  contacts: Array<{
    id: string;
    topic: string | null;
    message: string;
    status: string;
    created_at: string;
  }>;
}

const typeConfig: Record<
  TimelineEntry['type'],
  { icon: typeof StickyNote; color: string; bgColor: string }
> = {
  note: { icon: StickyNote, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20' },
  call: { icon: Phone, color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/20' },
  email_note: { icon: Mail, color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20' },
  follow_up: { icon: Clock, color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20' },
  email_sent: { icon: Mail, color: 'text-sky-400', bgColor: 'bg-sky-400/10 border-sky-400/20' },
  order: { icon: ShoppingBag, color: 'text-gold', bgColor: 'bg-gold/10 border-gold/20' },
  session: { icon: Calendar, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10 border-emerald-400/20' },
  contact: { icon: MessageSquare, color: 'text-orange-400', bgColor: 'bg-orange-400/10 border-orange-400/20' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function ActivityTimeline({ notes, emails, orders, sessions, contacts }: Props) {
  // Merge all sources into a unified timeline
  const entries: TimelineEntry[] = [];

  for (const n of notes) {
    const noteType = n.type === 'email' ? 'email_note' : n.type;
    entries.push({
      id: `note-${n.id}`,
      date: n.created_at,
      type: noteType as TimelineEntry['type'],
      title: n.type === 'call' ? 'Anruf' : n.type === 'email' ? 'E-Mail-Notiz' : n.type === 'follow_up' ? 'Follow-up' : 'Notiz',
      detail: n.content,
      meta: n.follow_up_date ? `Follow-up: ${formatDate(n.follow_up_date)}` : undefined,
    });
  }

  for (const e of emails) {
    entries.push({
      id: `email-${e.id}`,
      date: e.created_at,
      type: 'email_sent',
      title: e.subject,
      detail: e.template ? `Template: ${e.template}` : 'Manuell',
      meta: e.status,
    });
  }

  for (const o of orders) {
    const product = o.products?.name_de ?? (o.metadata as Record<string, string>)?.package_key ?? 'Produkt';
    entries.push({
      id: `order-${o.id}`,
      date: o.created_at,
      type: 'order',
      title: `Bestellung: ${product}`,
      detail: `${(o.amount_cents / 100).toFixed(2)} ${o.currency.toUpperCase()}`,
      meta: o.status,
    });
  }

  for (const s of sessions) {
    entries.push({
      id: `session-${s.id}`,
      date: s.scheduled_at ?? s.created_at,
      type: 'session',
      title: s.title || s.package_type || 'Sitzung',
      detail: `${s.session_type === 'paid' ? 'Bezahlt' : 'Kostenlos'} — ${s.status}`,
      meta: s.scheduled_at ? `Termin: ${formatDate(s.scheduled_at)}` : undefined,
    });
  }

  for (const c of contacts) {
    entries.push({
      id: `contact-${c.id}`,
      date: c.created_at,
      type: 'contact',
      title: `Kontaktanfrage${c.topic ? ` (${c.topic})` : ''}`,
      detail: c.message.length > 120 ? c.message.slice(0, 120) + '...' : c.message,
      meta: c.status,
    });
  }

  // Sort by date descending
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <StickyNote className="h-8 w-8 text-white/15 mx-auto mb-3" strokeWidth={1} />
        <p className="text-white/30 text-sm">Noch keine Aktivitäten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const config = typeConfig[entry.type];
        const Icon = config.icon;
        return (
          <div
            key={entry.id}
            className={`flex gap-3 rounded-xl border p-3 transition-colors hover:bg-white/[0.02] ${config.bgColor}`}
          >
            <div className={`shrink-0 mt-0.5 ${config.color}`}>
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white/80 font-medium">{entry.title}</p>
                <span className="text-xs text-white/30 shrink-0 tabular-nums">
                  {formatDate(entry.date)} {formatTime(entry.date)}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 whitespace-pre-wrap break-words">{entry.detail}</p>
              {entry.meta && (
                <span className="inline-block text-[10px] text-white/30 mt-1 uppercase tracking-wider">
                  {entry.meta}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
