'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Mail,
  MessageCircle,
  FileText,
  ShoppingBag,
  Calendar,
  StickyNote,
  TrendingUp,
  ExternalLink,
  User,
  Loader2,
  Instagram,
} from 'lucide-react';

interface Props {
  feedId: string;
  locale: string;
  onClose: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function getTypeIcon(type: string) {
  switch (type) {
    case 'email_received':
    case 'email_sent':
      return Mail;
    case 'telegram_in':
    case 'telegram_out':
      return MessageCircle;
    case 'contact_form':
      return FileText;
    case 'order':
      return ShoppingBag;
    case 'session':
      return Calendar;
    case 'note':
      return StickyNote;
    case 'deal_update':
      return TrendingUp;
    case 'instagram_dm_in':
    case 'instagram_dm_out':
    case 'instagram_lead':
      return Instagram;
    default:
      return Mail;
  }
}

function getTypeLabel(type: string, de: boolean): string {
  const labels: Record<string, [string, string]> = {
    email_received: ['E-Mail empfangen', 'E-Mail получен'],
    email_sent: ['E-Mail gesendet', 'E-Mail отправлен'],
    telegram_in: ['Telegram Nachricht', 'Telegram сообщение'],
    telegram_out: ['Telegram gesendet', 'Telegram отправлен'],
    contact_form: ['Kontaktanfrage', 'Контактный запрос'],
    order: ['Bestellung', 'Заказ'],
    session: ['Sitzung', 'Сессия'],
    note: ['Notiz', 'Заметка'],
    deal_update: ['Deal Update', 'Обновление сделки'],
    instagram_dm_in: ['Instagram DM', 'Instagram DM'],
    instagram_dm_out: ['Instagram DM gesendet', 'Instagram DM отправлен'],
    instagram_lead: ['Instagram Lead', 'Instagram Lead'],
  };
  const pair = labels[type];
  return pair ? pair[de ? 0 : 1] : type;
}

export default function InboxDetailPanel({ feedId, locale, onClose }: Props) {
  const de = locale === 'de';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [contactStatus, setContactStatus] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/inbox/${feedId}`);
        if (res.ok) {
          const json = await res.json();
          setEntry(json.entry);
          setSourceData(json.sourceData);
          if (json.sourceData?.status) setContactStatus(json.sourceData.status);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [feedId]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function updateContactStatus(newStatus: string) {
    if (!sourceData?.id || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/contacts/${sourceData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setContactStatus(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  }

  const Icon = entry ? getTypeIcon(entry.activity_type) : Mail;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0a1a24] border-l border-white/10 z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10 shrink-0">
          {!loading && entry && (
            <>
              <div className="p-2 rounded-xl bg-white/5">
                <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-sm truncate">
                  {getTypeLabel(entry.activity_type, de)}
                </h2>
                <p className="text-white/40 text-xs truncate">{entry.title}</p>
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-white/30" strokeWidth={1.5} />
            </div>
          ) : !entry ? (
            <p className="text-white/40 text-sm text-center py-12">
              {de ? 'Eintrag nicht gefunden.' : 'Запись не найдена.'}
            </p>
          ) : (
            <>
              {/* Customer Info */}
              {entry.profiles && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {entry.profiles.full_name ?? de ? 'Unbekannt' : 'Неизвестно'}
                    </p>
                    <p className="text-white/40 text-xs truncate">{entry.profiles.email}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-white/30">
                {new Date(entry.created_at).toLocaleString(de ? 'de-DE' : 'ru-RU')}
              </p>

              {/* Dynamic Content based on activity_type */}
              {renderSourceContent(entry, sourceData, de, contactStatus, updatingStatus, updateContactStatus)}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && entry && (
          <div className="p-5 border-t border-white/10 shrink-0 flex gap-2">
            {entry.profile_id && (
              <button
                onClick={() => router.push(`/${locale}/admin/kunden/${entry.profile_id}`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                {de ? 'Kundenprofil' : 'Профиль клиента'}
              </button>
            )}
            {(entry.activity_type === 'email_received' || entry.activity_type === 'email_sent') && (
              <button
                onClick={() => window.open('https://mail.ionos.de', 'ionos-mail', 'width=1200,height=800')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                IONOS
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Source Content Renderer ─── */

function renderSourceContent(
  entry: any,
  source: any,
  de: boolean,
  contactStatus: string,
  updatingStatus: boolean,
  updateContactStatus: (s: string) => void,
) {
  const type = entry.activity_type;

  // Contact Form
  if (type === 'contact_form' && source) {
    const topicLabels: Record<string, string> = {
      relationships: de ? 'Beziehungen' : 'Отношения',
      children: de ? 'Kinder' : 'Дети',
      career: de ? 'Karriere' : 'Карьера',
      growth: de ? 'Persönliches Wachstum' : 'Личностный рост',
    };

    const statuses = [
      { value: 'new', label: de ? 'Neu' : 'Новый', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
      { value: 'read', label: de ? 'Gelesen' : 'Прочитано', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      { value: 'replied', label: de ? 'Beantwortet' : 'Отвечено', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      { value: 'archived', label: de ? 'Archiviert' : 'Архив', color: 'bg-white/5 text-white/30 border-white/10' },
    ];

    return (
      <div className="space-y-3">
        {/* Name + Email */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{de ? 'Name' : 'Имя'}</span>
            <span className="text-sm text-white">{source.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">E-Mail</span>
            <a href={`mailto:${source.email}`} className="text-sm text-gold/70 hover:text-gold transition-colors">
              {source.email}
            </a>
          </div>
          {source.phone && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{de ? 'Telefon' : 'Телефон'}</span>
              <span className="text-sm text-white/70">{source.phone}</span>
            </div>
          )}
          {source.topic && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{de ? 'Thema' : 'Тема'}</span>
              <span className="text-sm text-white/70">{topicLabels[source.topic] ?? source.topic}</span>
            </div>
          )}
        </div>

        {/* Full Message */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-2">{de ? 'Nachricht' : 'Сообщение'}</p>
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{source.message}</p>
        </div>

        {/* Status Buttons */}
        <div>
          <p className="text-xs text-white/40 mb-2">Status</p>
          <div className="flex gap-1 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => updateContactStatus(s.value)}
                disabled={s.value === contactStatus || updatingStatus}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  s.value === contactStatus
                    ? `${s.color} font-medium`
                    : 'border-white/10 text-white/30 hover:text-white/60 hover:bg-white/5'
                } disabled:cursor-default`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reply Button */}
        <a
          href={`mailto:${source.email}?subject=${encodeURIComponent(de ? 'Re: Deine Anfrage bei Numerologie PRO' : 'Re: Ваш запрос в Numerologie PRO')}`}
          className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors"
        >
          <Mail className="h-4 w-4" strokeWidth={1.5} />
          {de ? 'Antworten' : 'Ответить'}
        </a>
      </div>
    );
  }

  // Email
  if ((type === 'email_received' || type === 'email_sent') && source) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{de ? 'Betreff' : 'Тема'}</span>
            <span className="text-sm text-white truncate ml-2">{source.subject ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{type === 'email_sent' ? 'An' : 'Von'}</span>
            <span className="text-sm text-white/70">{source.to_email ?? source.from_email ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Status</span>
            <span className="text-sm text-white/70">{source.status ?? '—'}</span>
          </div>
        </div>
        {source.body && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-white/40 mb-2">{de ? 'Inhalt' : 'Содержание'}</p>
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              {source.body}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Telegram
  if ((type === 'telegram_in' || type === 'telegram_out')) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-2">{de ? 'Nachricht' : 'Сообщение'}</p>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {entry.preview ?? (de ? 'Keine Vorschau verfügbar.' : 'Предпросмотр недоступен.')}
        </p>
      </div>
    );
  }

  // Order
  if (type === 'order' && source) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
        {source.products?.name_de && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{de ? 'Produkt' : 'Продукт'}</span>
            <span className="text-sm text-white">{source.products.name_de}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">{de ? 'Betrag' : 'Сумма'}</span>
          <span className="text-sm text-gold font-semibold">
            {(source.amount_cents / 100).toFixed(2)} {source.currency?.toUpperCase() ?? 'EUR'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Status</span>
          <span className="text-sm text-white/70">{source.status}</span>
        </div>
      </div>
    );
  }

  // Session
  if (type === 'session' && source) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">{de ? 'Titel' : 'Название'}</span>
          <span className="text-sm text-white">{source.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Status</span>
          <span className="text-sm text-white/70">{source.status}</span>
        </div>
        {source.scheduled_at && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{de ? 'Termin' : 'Дата'}</span>
            <span className="text-sm text-white/70">
              {new Date(source.scheduled_at).toLocaleString(de ? 'de-DE' : 'ru-RU')}
            </span>
          </div>
        )}
        {source.session_type && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{de ? 'Typ' : 'Тип'}</span>
            <span className="text-sm text-white/70">{source.session_type}</span>
          </div>
        )}
      </div>
    );
  }

  // Note / Deal Update
  if (type === 'note' && source) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-2">
          {source.type === 'call' ? (de ? 'Anruf-Notiz' : 'Заметка звонка') :
           source.type === 'follow_up' ? 'Follow-Up' :
           de ? 'Notiz' : 'Заметка'}
        </p>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{source.content}</p>
      </div>
    );
  }

  if (type === 'deal_update') {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-2">Deal Update</p>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {entry.preview ?? entry.title}
        </p>
      </div>
    );
  }

  // Instagram
  if ((type === 'instagram_dm_in' || type === 'instagram_dm_out' || type === 'instagram_lead') && source) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/40 mb-2">
          {type === 'instagram_lead' ? 'Lead Ad Data' : de ? 'Nachricht' : 'Сообщение'}
        </p>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {source.message_text ?? source.message ?? JSON.stringify(source.lead_data ?? {}, null, 2)}
        </p>
      </div>
    );
  }

  // Fallback: show preview
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-sm text-white/60 whitespace-pre-wrap">
        {entry.preview ?? entry.title}
      </p>
    </div>
  );
}
