'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { X, Plus, Trash2 } from 'lucide-react';
import type { BotCommand, ButtonConfig } from './BotBuilderShell';

interface Props {
  locale: string;
  command: BotCommand | null;
  onSave: (data: Partial<BotCommand> & { command?: string }) => Promise<void>;
  onClose: () => void;
}

export default function CommandEditor({ locale, command, onSave, onClose }: Props) {
  const t = getAdminT(locale);
  const isNew = !command;

  const [commandName, setCommandName] = useState(command?.command ?? '');
  const [responseDe, setResponseDe] = useState(command?.response_de ?? '');
  const [responseRu, setResponseRu] = useState(command?.response_ru ?? '');
  const [buttons, setButtons] = useState<ButtonConfig[]>((command?.buttons as ButtonConfig[]) ?? []);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...(isNew ? { command: commandName } : {}),
        response_de: responseDe,
        response_ru: responseRu,
        buttons,
      });
    } finally {
      setSaving(false);
    }
  };

  const addButton = () => {
    setButtons([...buttons, { text_de: '', text_ru: '', url: '' }]);
  };

  const updateButton = (index: number, field: keyof ButtonConfig, value: string) => {
    setButtons(buttons.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(5,26,36,0.95)] backdrop-blur-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold text-white">
            {isNew ? t.bbNewCommand : t.bbEditCommand}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Command Name */}
          {isNew && (
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{t.bbCommandName}</label>
              <div className="flex items-center">
                <span className="text-white/30 text-sm mr-1">/</span>
                <input
                  type="text"
                  value={commandName}
                  onChange={(e) => setCommandName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="promo"
                  required
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Response DE */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbResponseDe}</label>
            <textarea
              value={responseDe}
              onChange={(e) => setResponseDe(e.target.value)}
              rows={4}
              required
              placeholder={t.bbResponsePlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
            <p className="text-[10px] text-white/30 mt-1">HTML: &lt;b&gt;, &lt;i&gt;, &lt;a href=&quot;&quot;&gt;</p>
          </div>

          {/* Response RU */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbResponseRu}</label>
            <textarea
              value={responseRu}
              onChange={(e) => setResponseRu(e.target.value)}
              rows={4}
              placeholder={t.bbResponsePlaceholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/50">{t.bbButtons}</label>
              <button
                type="button"
                onClick={addButton}
                className="inline-flex items-center gap-1 text-xs text-gold/60 hover:text-gold transition-colors"
              >
                <Plus className="h-3 w-3" strokeWidth={1.5} />
                {t.bbAddButton}
              </button>
            </div>
            {buttons.map((btn, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={btn.text_de}
                  onChange={(e) => updateButton(i, 'text_de', e.target.value)}
                  placeholder="Text DE"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none"
                />
                <input
                  type="text"
                  value={btn.text_ru}
                  onChange={(e) => updateButton(i, 'text_ru', e.target.value)}
                  placeholder="Text RU"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none"
                />
                <input
                  type="text"
                  value={btn.url ?? ''}
                  onChange={(e) => updateButton(i, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeButton(i)}
                  className="p-1 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gold/10 border border-gold/30 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
            >
              {saving ? t.bbSaving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
