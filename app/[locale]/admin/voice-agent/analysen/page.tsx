'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  FileText,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CalendarCheck,
  PhoneForwarded,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CallAnalysis {
  id: string;
  anrufer_name: string | null;
  anrufer_email: string | null;
  anrufer_telefon: string | null;
  sprache: string;
  kategorie: string;
  thema: string;
  anliegen: string | null;
  interessiertes_paket: string;
  kaufbereitschaft: string;
  einwand: string;
  geburtsdatum_genannt: boolean;
  status: string;
  termin_gebucht: boolean;
  termin_datum: string | null;
  follow_up_noetig: boolean;
  naechster_schritt: string;
  zusammenfassung: string | null;
  created_at: string;
}

const kaufbereitschaftStyles: Record<string, string> = {
  hoch: 'bg-green-500/20 text-green-400 border-green-500/30',
  mittel: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  niedrig: 'bg-red-500/20 text-red-400 border-red-500/30',
  unklar: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  Termin_gebucht: 'Termin gebucht',
  Interesse_geweckt: 'Interesse geweckt',
  FAQ_beantwortet: 'FAQ beantwortet',
  Eskaliert: 'Eskaliert',
  Abgebrochen: 'Abgebrochen',
};

export default function VoiceAnalysenPage() {
  const { locale } = useParams();
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CallAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'follow_up' | 'termin' | 'hoch'>('all');

  const supabaseRef = useRef(createClient());

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from('voice_call_analyses' as never)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200) as { data: CallAnalysis[] | null };
    setAnalyses(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalyses();
    // Auto-refresh every 10 seconds for near-real-time updates
    const interval = setInterval(fetchAnalyses, 10_000);
    return () => clearInterval(interval);
  }, [fetchAnalyses]);

  const filtered = analyses.filter((a) => {
    if (filter === 'follow_up') return a.follow_up_noetig;
    if (filter === 'termin') return a.termin_gebucht;
    if (filter === 'hoch') return a.kaufbereitschaft === 'hoch';
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/voice-agent`}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          Call-Analysen
        </h1>
        <span className="text-sm text-gray-500">{filtered.length} Einträge</span>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'Alle', count: analyses.length },
          { key: 'follow_up', label: 'Follow-up nötig', count: analyses.filter((a) => a.follow_up_noetig).length },
          { key: 'termin', label: 'Termin gebucht', count: analyses.filter((a) => a.termin_gebucht).length },
          { key: 'hoch', label: 'Kaufbereitschaft hoch', count: analyses.filter((a) => a.kaufbereitschaft === 'hoch').length },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              filter === f.key
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Keine Analysen vorhanden</p>
          <p className="text-sm">
            Analysen werden am Ende jedes Voice Agent Calls automatisch erstellt
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Anrufer</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Kategorie</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Kaufbereit.</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${
                        selected?.id === a.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="text-white text-sm font-medium flex items-center gap-1">
                            {a.anrufer_name || 'Unbekannt'}
                            {a.follow_up_noetig && (
                              <PhoneForwarded className="w-3 h-3 text-orange-400" />
                            )}
                            {a.termin_gebucht && (
                              <CalendarCheck className="w-3 h-3 text-green-400" />
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.sprache === 'ru' ? '🇷🇺' : '🇩🇪'} {a.thema.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-300 text-xs">
                          {a.kategorie.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                            kaufbereitschaftStyles[a.kaufbereitschaft] || kaufbereitschaftStyles.unklar
                          }`}
                        >
                          {a.kaufbereitschaft}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-400 text-xs">
                          {statusLabels[a.status] || a.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleDateString('de-DE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 sticky top-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {selected.anrufer_name || 'Unbekannt'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      kaufbereitschaftStyles[selected.kaufbereitschaft] || kaufbereitschaftStyles.unklar
                    }`}
                  >
                    {selected.kaufbereitschaft}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-sm">
                  {selected.anrufer_email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      {selected.anrufer_email}
                    </div>
                  )}
                  {selected.anrufer_telefon && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      {selected.anrufer_telefon}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <Globe className="w-4 h-4" />
                    {selected.sprache === 'ru' ? 'Russisch' : 'Deutsch'}
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase">
                    Klassifikation
                  </h4>
                  <div className="space-y-1.5">
                    <DetailRow icon={<Tag className="w-3 h-3" />} label="Kategorie" value={selected.kategorie.replace(/_/g, ' ')} />
                    <DetailRow icon={<Tag className="w-3 h-3" />} label="Thema" value={selected.thema.replace(/_/g, ' ')} />
                    {selected.anliegen && (
                      <div className="text-xs text-gray-300 bg-white/5 p-2 rounded mt-1">
                        {selected.anliegen}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales Intelligence */}
                <div>
                  <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase">
                    Sales Intelligence
                  </h4>
                  <div className="space-y-1.5">
                    <DetailRow icon={<ShoppingBag className="w-3 h-3" />} label="Paket" value={selected.interessiertes_paket.replace(/_/g, ' ')} />
                    <DetailRow icon={<TrendingUp className="w-3 h-3" />} label="Kaufbereitschaft" value={selected.kaufbereitschaft} />
                    <DetailRow icon={<AlertTriangle className="w-3 h-3" />} label="Einwand" value={selected.einwand.replace(/_/g, ' ')} />
                    <DetailRow label="Geburtsdatum" value={selected.geburtsdatum_genannt ? 'Ja' : 'Nein'} />
                  </div>
                </div>

                {/* Result */}
                <div>
                  <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase">
                    Ergebnis
                  </h4>
                  <div className="space-y-1.5">
                    <DetailRow label="Status" value={statusLabels[selected.status] || selected.status.replace(/_/g, ' ')} />
                    <DetailRow icon={<CalendarCheck className="w-3 h-3" />} label="Termin" value={selected.termin_gebucht ? 'Ja' : 'Nein'} />
                    {selected.termin_datum && (
                      <DetailRow label="Termin-Datum" value={new Date(selected.termin_datum).toLocaleString('de-DE')} />
                    )}
                    <DetailRow icon={<PhoneForwarded className="w-3 h-3" />} label="Follow-up" value={selected.follow_up_noetig ? 'Ja' : 'Nein'} />
                    <DetailRow label="Nächster Schritt" value={selected.naechster_schritt.replace(/_/g, ' ')} />
                  </div>
                </div>

                {/* Summary */}
                {selected.zusammenfassung && (
                  <div>
                    <h4 className="text-xs text-gray-500 font-medium mb-1 uppercase">
                      Zusammenfassung
                    </h4>
                    <p className="text-sm text-white bg-white/5 p-3 rounded-lg leading-relaxed">
                      {selected.zusammenfassung}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Analyse auswählen für Details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="text-white">{value}</span>
    </div>
  );
}
