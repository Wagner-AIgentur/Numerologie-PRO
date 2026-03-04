'use client';

import { useState } from 'react';
import CustomerProfile from './CustomerProfile';
import ActivityTimeline from './ActivityTimeline';
import NoteForm from './NoteForm';
import CustomFieldsSection from './CustomFieldsSection';

interface Props {
  profile: {
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
  };
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

export default function CustomerDetailShell({ profile, notes: initialNotes, emails, orders, sessions, contacts }: Props) {
  const [notes, setNotes] = useState(initialNotes);

  async function refreshNotes() {
    try {
      const res = await fetch(`/api/admin/customers/${profile.id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch {
      // Silently fail — notes still show initial data
    }
  }

  // Summary stats
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount_cents, 0);
  const totalOrders = orders.filter((o) => o.status === 'paid').length;
  const totalSessions = sessions.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Profile + Tags + Notes */}
      <div className="lg:col-span-1 space-y-4">
        <CustomerProfile profile={profile} />

        {/* Quick Stats */}
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
          <h3 className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">Statistiken</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gold">{(totalRevenue / 100).toFixed(0)}&euro;</p>
              <p className="text-[10px] text-white/30 uppercase">Umsatz</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalOrders}</p>
              <p className="text-[10px] text-white/30 uppercase">Bestellungen</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalSessions}</p>
              <p className="text-[10px] text-white/30 uppercase">Sitzungen</p>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        <CustomFieldsSection profileId={profile.id} locale={profile.language ?? 'de'} />

        {/* Note Form */}
        <NoteForm profileId={profile.id} onCreated={refreshNotes} />
      </div>

      {/* Right Column: Activity Timeline */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">
            Aktivitäten ({notes.length + emails.length + orders.length + sessions.length + contacts.length})
          </h3>
        </div>
        <ActivityTimeline
          notes={notes}
          emails={emails}
          orders={orders}
          sessions={sessions}
          contacts={contacts}
        />
      </div>
    </div>
  );
}
