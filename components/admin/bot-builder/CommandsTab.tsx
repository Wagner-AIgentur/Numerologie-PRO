'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { Plus, Lock, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BotCommand } from './BotBuilderShell';
import CommandEditor from './CommandEditor';

interface Props {
  locale: string;
  initialCommands: BotCommand[];
}

export default function CommandsTab({ locale, initialCommands }: Props) {
  const [commands, setCommands] = useState<BotCommand[]>(initialCommands);
  const [editingCommand, setEditingCommand] = useState<BotCommand | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const t = getAdminT(locale);

  const handleToggle = async (cmd: BotCommand) => {
    setSaving(cmd.id);
    try {
      const res = await fetch(`/api/admin/bot/commands/${cmd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !cmd.is_enabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCommands((prev) => prev.map((c) => (c.id === cmd.id ? updated : c)));
      }
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (cmd: BotCommand) => {
    if (!confirm(t.bbConfirmDelete)) return;
    const res = await fetch(`/api/admin/bot/commands/${cmd.id}`, { method: 'DELETE' });
    if (res.ok) {
      setCommands((prev) => prev.filter((c) => c.id !== cmd.id));
    }
  };

  const handleSave = async (data: Partial<BotCommand> & { command?: string }) => {
    if (editingCommand) {
      // Update existing
      const res = await fetch(`/api/admin/bot/commands/${editingCommand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCommands((prev) => prev.map((c) => (c.id === editingCommand.id ? updated : c)));
      }
    } else {
      // Create new
      const res = await fetch('/api/admin/bot/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setCommands((prev) => [...prev, created]);
      }
    }
    setShowEditor(false);
    setEditingCommand(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {commands.length} {t.bbCommandsCount}
        </p>
        <button
          onClick={() => {
            setEditingCommand(null);
            setShowEditor(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {t.bbNewCommand}
        </button>
      </div>

      {/* Commands Table */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/50 font-medium w-12">{t.bbActive}</th>
              <th className="text-left px-5 py-3 text-white/50 font-medium">{t.bbCommand}</th>
              <th className="text-left px-5 py-3 text-white/50 font-medium hidden md:table-cell">{t.bbType}</th>
              <th className="text-left px-5 py-3 text-white/50 font-medium hidden lg:table-cell">{t.bbResponse}</th>
              <th className="text-right px-5 py-3 text-white/50 font-medium w-24">{t.bbActions}</th>
            </tr>
          </thead>
          <tbody>
            {commands.map((cmd) => {
              const isBuiltinLocked = cmd.type === 'builtin' && !cmd.is_editable;
              return (
                <tr
                  key={cmd.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(cmd)}
                      disabled={saving === cmd.id}
                      className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {cmd.is_enabled ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-white/30" strokeWidth={1.5} />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-white/80">/{cmd.command}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    {cmd.type === 'builtin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        {!cmd.is_editable && <Lock className="h-3 w-3" strokeWidth={1.5} />}
                        System
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/60">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-white/40 text-xs max-w-[300px] truncate block">
                      {(locale === 'de' ? cmd.response_de : cmd.response_ru) || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(cmd.is_editable || cmd.type === 'custom') && (
                        <button
                          onClick={() => {
                            setEditingCommand(cmd);
                            setShowEditor(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-gold transition-colors"
                          title={t.bbEdit}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}
                      {cmd.type === 'custom' && (
                        <button
                          onClick={() => handleDelete(cmd)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                          title={t.bbDelete}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <CommandEditor
          locale={locale}
          command={editingCommand}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingCommand(null);
          }}
        />
      )}
    </div>
  );
}
