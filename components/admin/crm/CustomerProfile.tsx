'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Globe, Calendar, Tag, MessageCircle, Trash2 } from 'lucide-react';
import TagManager from './TagManager';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  birthdate: string | null;
  language: 'de' | 'ru';
  notes: string | null;
  tags: string[];
  source: string;
  crm_status: 'lead' | 'client' | 'vip' | 'inactive' | 'admin';
  telegram_chat_id: number | null;
  created_at: string;
}

const statusOptions = [
  { value: 'lead', label: 'Lead', color: 'bg-white/5 text-white/50 border-white/10' },
  { value: 'client', label: 'Kunde', color: 'bg-gold/10 text-gold border-gold/20' },
  { value: 'vip', label: 'VIP', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'inactive', label: 'Inaktiv', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function CustomerProfile({ profile: initial }: { profile: Profile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(initial.notes ?? '');

  async function updateField(updates: Partial<Profile>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('User und alle Daten wirklich löschen? (DSGVO Soft-Delete)')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/customers/${profile.id}`, { method: 'DELETE' });
      if (res.ok) {
        const locale = window.location.pathname.split('/')[1] || 'de';
        router.push(`/${locale}/admin/kunden`);
      }
    } finally {
      setDeleting(false);
    }
  }

  const currentStatus = statusOptions.find((s) => s.value === profile.crm_status) ?? statusOptions[0];

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-serif text-lg font-bold truncate">
              {profile.full_name ?? 'Unbekannt'}
            </h2>
            <p className="text-white/40 text-xs truncate">{profile.email}</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="User löschen"
            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shrink-0"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* CRM Status Dropdown */}
        <div className="mb-4">
          <label className="text-xs text-white/40 block mb-1.5">CRM Status</label>
          <select
            value={profile.crm_status}
            onChange={(e) => updateField({ crm_status: e.target.value as Profile['crm_status'] })}
            disabled={saving}
            className={`w-full text-sm px-3 py-2 rounded-xl border bg-transparent appearance-none cursor-pointer transition-colors ${currentStatus.color}`}
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0d2d42] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 text-sm">
          {profile.phone && (
            <div className="flex items-center gap-2 text-white/60">
              <Phone className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <a href={`tel:${profile.phone}`} className="hover:text-gold transition-colors">{profile.phone}</a>
            </div>
          )}
          {profile.birthdate && (
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <span>{new Date(profile.birthdate).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/60">
            <Globe className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
            <span>{profile.language === 'de' ? 'Deutsch' : 'Russisch'}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Tag className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
            <span>Quelle: {profile.source || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            <span>Registriert: {new Date(profile.created_at).toLocaleDateString('de-DE')}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <a
            href={`mailto:${profile.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-gold py-2 rounded-lg border border-white/10 hover:border-gold/20 transition-all"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            Email
          </a>
          {profile.telegram_chat_id && (
            <a
              href={`https://t.me/`}
              target="_blank"
              rel="noopener"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-blue-400 py-2 rounded-lg border border-white/10 hover:border-blue-400/20 transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              Telegram
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">Tags</h3>
        <TagManager
          tags={profile.tags ?? []}
          onUpdate={(tags) => updateField({ tags })}
        />
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Notizen</h3>
          {!editNotes && (
            <button
              onClick={() => setEditNotes(true)}
              className="text-xs text-gold/60 hover:text-gold transition-colors"
            >
              Bearbeiten
            </button>
          )}
        </div>
        {editNotes ? (
          <div>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              className="w-full text-sm text-white/80 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold/30 resize-none"
              placeholder="Notizen zum Kunden..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  updateField({ notes: notesValue || null });
                  setEditNotes(false);
                }}
                disabled={saving}
                className="text-xs px-3 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setNotesValue(profile.notes ?? '');
                  setEditNotes(false);
                }}
                className="text-xs px-3 py-1.5 text-white/40 hover:text-white/60 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/50 whitespace-pre-wrap">
            {profile.notes || 'Keine Notizen vorhanden.'}
          </p>
        )}
      </div>
    </div>
  );
}
