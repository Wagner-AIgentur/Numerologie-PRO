'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, RotateCcw, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function VoiceAgentConfigPage() {
  const { locale } = useParams();
  const [config, setConfig] = useState('');
  const [originalConfig, setOriginalConfig] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/voice-agent/config')
      .then((res) => res.text())
      .then((text) => {
        setConfig(text);
        setOriginalConfig(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/voice-agent/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: config,
      });
      if (res.ok) {
        setOriginalConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = config !== originalConfig;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/voice-agent`}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-400" />
            Conversation Config
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={() => setConfig(originalConfig)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
              saved
                ? 'bg-green-600 text-white'
                : hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-3 h-3" />
            {saving ? 'Speichern...' : saved ? 'Gespeichert!' : 'Speichern & Deploy'}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            config/conversation.yaml
          </span>
          {hasChanges && (
            <span className="text-xs text-yellow-400">Ungespeicherte Änderungen</span>
          )}
        </div>
        {loading ? (
          <div className="h-[600px] bg-white/5 animate-pulse" />
        ) : (
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full h-[600px] bg-transparent text-green-300 font-mono text-sm p-4 resize-none focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          <strong>Hinweis:</strong> Änderungen an der Conversation Config werden beim nächsten
          Call wirksam. Die YAML-Datei wird als Single Source of Truth für den
          ElevenLabs Agent verwendet. Der System Prompt, die Qualifizierungskriterien
          und die Einwandbehandlung werden automatisch daraus generiert.
        </p>
      </div>
    </div>
  );
}
