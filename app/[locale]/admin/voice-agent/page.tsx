'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Phone,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  PhoneForwarded,
  CalendarCheck,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface NameCount {
  name: string;
  count: number;
}

interface VoiceStats {
  total_calls: number;
  completed_calls: number;
  conversion_rate: number;
  avg_duration_seconds: number;
  leads_by_grade: { A: number; B: number; C: number };
  total_appointments: number;
  top_objections: NameCount[];
  drop_off_points: NameCount[];
  // Call analysis aggregates
  total_analyses: number;
  follow_up_noetig: number;
  termine_gebucht: number;
  kaufbereitschaft: NameCount[];
  kategorien: NameCount[];
  call_status_verteilung: NameCount[];
}

const GRADE_COLORS = { A: '#22c55e', B: '#eab308', C: '#ef4444' };

const KAUFBEREITSCHAFT_COLORS: Record<string, string> = {
  hoch: '#22c55e',
  mittel: '#eab308',
  niedrig: '#ef4444',
  unklar: '#64748b',
};

const KATEGORIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

export default function VoiceAgentDashboard() {
  const { locale } = useParams();
  const [stats, setStats] = useState<VoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    fetch('/api/voice-agent/stats?days=30')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 15 seconds for near-real-time updates
    const interval = setInterval(fetchStats, 15_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Voice Agent</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const gradeData = stats
    ? [
        { name: 'A-Leads', value: stats.leads_by_grade.A, fill: GRADE_COLORS.A },
        { name: 'B-Leads', value: stats.leads_by_grade.B, fill: GRADE_COLORS.B },
        { name: 'C-Leads', value: stats.leads_by_grade.C, fill: GRADE_COLORS.C },
      ]
    : [];

  const kaufbereitschaftData = (stats?.kaufbereitschaft ?? []).map((k) => ({
    name: k.name.charAt(0).toUpperCase() + k.name.slice(1),
    value: k.count,
    fill: KAUFBEREITSCHAFT_COLORS[k.name] || '#64748b',
  }));

  const avgMinutes = stats
    ? Math.round(stats.avg_duration_seconds / 60)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-400" />
            Voice Agent Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Letzte 30 Tage — ElevenLabs Conversational AI
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/admin/voice-agent/calls`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition flex items-center gap-1"
          >
            Calls <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href={`/${locale}/admin/voice-agent/leads`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition flex items-center gap-1"
          >
            Leads <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href={`/${locale}/admin/voice-agent/analysen`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition flex items-center gap-1"
          >
            <FileText className="w-3 h-3" /> Analysen <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          icon={<Phone className="w-5 h-5 text-blue-400" />}
          label="Calls gesamt"
          value={stats?.total_calls ?? 0}
          subtitle={`${stats?.completed_calls ?? 0} abgeschlossen`}
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          label="Conversion Rate"
          value={`${stats?.conversion_rate ?? 0}%`}
          subtitle={`${stats?.total_appointments ?? 0} Termine`}
        />
        <KPICard
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          label="Gesprächsdauer"
          value={`${avgMinutes} Min`}
          subtitle="Durchschnitt"
        />
        <KPICard
          icon={<Users className="w-5 h-5 text-purple-400" />}
          label="Qualifizierte Leads"
          value={
            (stats?.leads_by_grade.A ?? 0) + (stats?.leads_by_grade.B ?? 0)
          }
          subtitle={`${stats?.leads_by_grade.A ?? 0}x A, ${stats?.leads_by_grade.B ?? 0}x B`}
        />
        <KPICard
          icon={<PhoneForwarded className="w-5 h-5 text-orange-400" />}
          label="Follow-up nötig"
          value={stats?.follow_up_noetig ?? 0}
          subtitle={`von ${stats?.total_analyses ?? 0} Analysen`}
        />
        <KPICard
          icon={<CalendarCheck className="w-5 h-5 text-emerald-400" />}
          label="Termine gebucht"
          value={stats?.termine_gebucht ?? 0}
          subtitle="Voice Agent Calls"
        />
      </div>

      {/* Charts Row 1: Lead Quality + Kaufbereitschaft */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Quality Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Lead-Qualität (A/B/C)
          </h3>
          {gradeData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {gradeData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              Noch keine Daten vorhanden
            </div>
          )}
        </div>

        {/* Kaufbereitschaft */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Kaufbereitschaft
          </h3>
          {kaufbereitschaftData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={kaufbereitschaftData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {kaufbereitschaftData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              Noch keine Analysen vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Top Einwände */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Objections */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Top Einwände
          </h3>
          {stats?.top_objections && stats.top_objections.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.top_objections} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              Noch keine Einwände erfasst
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3: Kategorien + Call Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategorien */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Gesprächskategorien
          </h3>
          {stats?.kategorien && stats.kategorien.length > 0 ? (
            <div className="space-y-3">
              {stats.kategorien.map((k, idx) => {
                const maxCount = stats.kategorien[0]?.count || 1;
                const pct = Math.round((k.count / maxCount) * 100);
                return (
                  <div key={k.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{k.name.replace(/_/g, ' ')}</span>
                      <span className="text-white font-mono">{k.count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: KATEGORIE_COLORS[idx % KATEGORIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Noch keine Kategorien erfasst
            </div>
          )}
        </div>

        {/* Call Status Verteilung */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Call-Ergebnis Verteilung
          </h3>
          {stats?.call_status_verteilung && stats.call_status_verteilung.length > 0 ? (
            <div className="space-y-3">
              {stats.call_status_verteilung.map((s) => {
                const maxCount = stats.call_status_verteilung[0]?.count || 1;
                const pct = Math.round((s.count / maxCount) * 100);
                const statusColor =
                  s.name === 'Termin_gebucht'
                    ? '#22c55e'
                    : s.name === 'Interesse_geweckt'
                    ? '#3b82f6'
                    : s.name === 'FAQ_beantwortet'
                    ? '#eab308'
                    : s.name === 'Eskaliert'
                    ? '#ef4444'
                    : '#64748b';
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{s.name.replace(/_/g, ' ')}</span>
                      <span className="text-white font-mono">{s.count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: statusColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Noch keine Ergebnis-Daten vorhanden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
