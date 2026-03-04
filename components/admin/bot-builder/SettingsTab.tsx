'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { Check } from 'lucide-react';

interface Props {
  locale: string;
  initialSettings: Record<string, unknown>;
}

export default function SettingsTab({ locale, initialSettings }: Props) {
  const t = getAdminT(locale);

  const [fallbackBehavior, setFallbackBehavior] = useState<string>(
    (initialSettings.fallback_behavior as string) ?? 'forward_admin',
  );
  const [fallbackMessageDe, setFallbackMessageDe] = useState(
    (initialSettings.fallback_message_de as string) ?? '',
  );
  const [fallbackMessageRu, setFallbackMessageRu] = useState(
    (initialSettings.fallback_message_ru as string) ?? '',
  );
  const [adminNotifications, setAdminNotifications] = useState(() => {
    const notif = initialSettings.admin_notifications;
    if (notif && typeof notif === 'object') return notif as Record<string, boolean>;
    return { new_messages: true, unknown_commands: true };
  });
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
          fallback_behavior: fallbackBehavior,
          fallback_message_de: fallbackMessageDe,
          fallback_message_ru: fallbackMessageRu,
          admin_notifications: adminNotifications,
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

  const toggleNotification = (key: string) => {
    setAdminNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Fallback Behavior */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="font-serif text-base font-semibold text-white mb-4">{t.bbFallbackBehavior}</h3>
        <p className="text-xs text-white/40 mb-4">{t.bbFallbackDesc}</p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="fallback"
              value="forward_admin"
              checked={fallbackBehavior === 'forward_admin'}
              onChange={(e) => setFallbackBehavior(e.target.value)}
              className="accent-[#C9A55C]"
            />
            <div>
              <span className="text-sm text-white group-hover:text-gold transition-colors">
                {t.bbForwardAdmin}
              </span>
              <p className="text-[10px] text-white/30">{t.bbForwardAdminDesc}</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="fallback"
              value="auto_reply"
              checked={fallbackBehavior === 'auto_reply'}
              onChange={(e) => setFallbackBehavior(e.target.value)}
              className="accent-[#C9A55C]"
            />
            <div>
              <span className="text-sm text-white group-hover:text-gold transition-colors">
                {t.bbAutoReply}
              </span>
              <p className="text-[10px] text-white/30">{t.bbAutoReplyDesc}</p>
            </div>
          </label>
        </div>

        {/* Fallback Message (only when auto_reply) */}
        {fallbackBehavior === 'auto_reply' && (
          <div className="mt-4 space-y-3 pl-6 border-l-2 border-white/10">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Deutsch</label>
              <textarea
                value={fallbackMessageDe}
                onChange={(e) => setFallbackMessageDe(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/30 focus:outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Russisch</label>
              <textarea
                value={fallbackMessageRu}
                onChange={(e) => setFallbackMessageRu(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/30 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Admin Notifications */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="font-serif text-base font-semibold text-white mb-4">{t.bbAdminNotifications}</h3>
        <p className="text-xs text-white/40 mb-4">{t.bbAdminNotificationsDesc}</p>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">
              {t.bbNotifyNewMessages}
            </span>
            <button
              type="button"
              onClick={() => toggleNotification('new_messages')}
              className="relative"
            >
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  adminNotifications.new_messages ? 'bg-gold/30' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    adminNotifications.new_messages
                      ? 'left-5.5 bg-gold translate-x-[2px]'
                      : 'left-0.5 bg-white/30'
                  }`}
                />
              </div>
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">
              {t.bbNotifyUnknownCommands}
            </span>
            <button
              type="button"
              onClick={() => toggleNotification('unknown_commands')}
              className="relative"
            >
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  adminNotifications.unknown_commands ? 'bg-gold/30' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    adminNotifications.unknown_commands
                      ? 'left-5.5 bg-gold translate-x-[2px]'
                      : 'left-0.5 bg-white/30'
                  }`}
                />
              </div>
            </button>
          </label>
        </div>
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
