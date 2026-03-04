'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { Check } from 'lucide-react';

interface Props {
  locale: string;
  initialSettings: Record<string, unknown>;
}

export default function WelcomeTab({ locale, initialSettings }: Props) {
  const t = getAdminT(locale);

  const [welcomeNewDe, setWelcomeNewDe] = useState(
    (initialSettings.welcome_new_de as string) ?? '',
  );
  const [welcomeNewRu, setWelcomeNewRu] = useState(
    (initialSettings.welcome_new_ru as string) ?? '',
  );
  const [welcomeReturningDe, setWelcomeReturningDe] = useState(
    (initialSettings.welcome_returning_de as string) ?? '',
  );
  const [welcomeReturningRu, setWelcomeReturningRu] = useState(
    (initialSettings.welcome_returning_ru as string) ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/bot/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcome_new_de: welcomeNewDe,
          welcome_new_ru: welcomeNewRu,
          welcome_returning_de: welcomeReturningDe,
          welcome_returning_ru: welcomeReturningRu,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Users */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="font-serif text-base font-semibold text-white mb-4">{t.bbWelcomeNew}</h3>
        <p className="text-xs text-white/40 mb-3">{t.bbWelcomeNewDesc}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Deutsch</label>
            <textarea
              value={welcomeNewDe}
              onChange={(e) => setWelcomeNewDe(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Russisch</label>
            <textarea
              value={welcomeNewRu}
              onChange={(e) => setWelcomeNewRu(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <p className="text-[10px] text-white/30 mt-2">{t.bbPlaceholderHint}</p>
      </div>

      {/* Returning Users */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="font-serif text-base font-semibold text-white mb-4">{t.bbWelcomeReturning}</h3>
        <p className="text-xs text-white/40 mb-3">{t.bbWelcomeReturningDesc}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Deutsch</label>
            <textarea
              value={welcomeReturningDe}
              onChange={(e) => setWelcomeReturningDe(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Russisch</label>
            <textarea
              value={welcomeReturningRu}
              onChange={(e) => setWelcomeReturningRu(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <p className="text-[10px] text-white/30 mt-2">
          {t.bbPlaceholderHint} — {'{name}'} = Telegram Vorname
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              {t.saved}
            </>
          ) : saving ? (
            t.bbSaving
          ) : (
            t.save
          )}
        </button>
      </div>
    </div>
  );
}
