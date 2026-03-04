'use client';

import { useEffect, useState } from 'react';
import { Phone, Play, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface VoiceCall {
  id: string;
  elevenlabs_conversation_id: string;
  channel: string;
  phone_number: string | null;
  language: string;
  duration_seconds: number;
  recording_url: string | null;
  transcript: Array<{ role: string; message: string; timestamp?: number }>;
  summary: string | null;
  status: string;
  ended_reason: string | null;
  created_at: string;
  lead_id: string | null;
}

export default function VoiceAgentCallsPage() {
  const { locale } = useParams();
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('voice_calls' as never)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }: { data: VoiceCall[] | null }) => {
        setCalls(data || []);
        setLoading(false);
      });
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
    no_answer: 'bg-gray-500/20 text-gray-400',
  };

  const languageFlags: Record<string, string> = {
    de: '🇩🇪',
    ru: '🇷🇺',
    en: '🇬🇧',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/voice-agent`}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Phone className="w-6 h-6 text-blue-400" />
          Call History
        </h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Noch keine Calls vorhanden</p>
          <p className="text-sm">Calls erscheinen hier sobald der Voice Agent genutzt wird</p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Call Row */}
              <button
                onClick={() =>
                  setExpandedCall(expandedCall === call.id ? null : call.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">
                    {languageFlags[call.language] || '🌐'}
                  </span>
                  <div>
                    <p className="text-white font-medium">
                      {call.channel === 'phone' ? call.phone_number || 'Telefon' : 'Web Widget'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(call.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-3 h-3" />
                    {formatDuration(call.duration_seconds || 0)}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[call.status] || statusColors.failed}`}
                  >
                    {call.status}
                  </span>
                  {call.recording_url && (
                    <Play className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              </button>

              {/* Expanded: Transcript + Summary */}
              {expandedCall === call.id && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  {/* Recording */}
                  {call.recording_url && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Aufnahme
                      </h4>
                      <audio controls className="w-full" src={call.recording_url}>
                        Dein Browser unterstützt kein Audio.
                      </audio>
                    </div>
                  )}

                  {/* Summary */}
                  {call.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">
                        Zusammenfassung
                      </h4>
                      <p className="text-white text-sm bg-white/5 p-3 rounded-lg">
                        {call.summary}
                      </p>
                    </div>
                  )}

                  {/* Transcript */}
                  {call.transcript && call.transcript.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Transkript
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {call.transcript.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-2 ${entry.role === 'agent' ? '' : 'flex-row-reverse'}`}
                          >
                            <div
                              className={`p-2 rounded-lg text-sm max-w-[80%] ${
                                entry.role === 'agent'
                                  ? 'bg-blue-500/20 text-blue-200'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              <span className="text-xs text-gray-500 block mb-1">
                                {entry.role === 'agent' ? '🤖 Lisa' : '👤 Lead'}
                              </span>
                              {entry.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
