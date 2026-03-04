'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface Props {
  contactId: string;
  currentStatus: string;
}

const STATUSES = [
  { value: 'new', label: 'Neu', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'read', label: 'Gelesen', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'replied', label: 'Beantwortet', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'archived', label: 'Archiviert', color: 'bg-white/5 text-white/30 border-white/10' },
];

export default function ContactStatusButtons({ contactId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Kontaktanfrage endgültig löschen?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setUpdating(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex gap-1 flex-wrap items-center">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleStatusChange(s.value)}
          disabled={s.value === status || updating}
          className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
            s.value === status
              ? `${s.color} font-medium`
              : 'border-white/10 text-white/30 hover:text-white/60 hover:bg-white/5'
          } disabled:cursor-default`}
        >
          {s.label}
        </button>
      ))}
      <button
        onClick={handleDelete}
        disabled={updating}
        title="Löschen"
        className="ml-1 p-1 rounded-md text-red-400/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}
