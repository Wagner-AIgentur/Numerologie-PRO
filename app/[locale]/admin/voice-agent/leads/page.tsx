'use client';

import { useEffect, useState } from 'react';
import { Users, ArrowLeft, Calendar, Mail, Building2, Phone } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface VoiceLead {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  language: string;
  score: number;
  grade: string;
  status: string;
  qualification: Record<string, unknown>;
  objections: string[];
  next_steps: string | null;
  created_at: string;
}

const gradeStyles: Record<string, string> = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  new: 'Neu',
  qualified: 'Qualifiziert',
  demo_booked: 'Demo gebucht',
  disqualified: 'Disqualifiziert',
  converted: 'Konvertiert',
};

export default function VoiceAgentLeadsPage() {
  const { locale } = useParams();
  const [leads, setLeads] = useState<VoiceLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<VoiceLead | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('voice_leads' as never)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }: { data: VoiceLead[] | null }) => {
        setLeads(data || []);
        setLoading(false);
      });
  }, []);

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
          <Users className="w-6 h-6 text-purple-400" />
          Voice Leads
        </h1>
        <span className="text-sm text-gray-500">{leads.length} Leads</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Noch keine Leads vorhanden</p>
          <p className="text-sm">Leads werden automatisch während Voice Calls erfasst</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Table */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Lead</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Score</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Grade</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${
                        selectedLead?.id === lead.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {lead.name || 'Unbekannt'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.company || 'Keine Firma'}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-white font-mono text-sm">
                          {lead.score}/100
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            gradeStyles[lead.grade] || gradeStyles.C
                          }`}
                        >
                          {lead.grade}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-400 text-xs">
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString('de-DE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Detail Panel */}
          <div className="lg:col-span-1">
            {selectedLead ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedLead.name || 'Unbekannt'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${
                      gradeStyles[selectedLead.grade] || gradeStyles.C
                    }`}
                  >
                    {selectedLead.grade}-Lead ({selectedLead.score}/100)
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {selectedLead.company && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Building2 className="w-4 h-4" />
                      {selectedLead.company}
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      {selectedLead.email}
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      {selectedLead.phone}
                    </div>
                  )}
                </div>

                {/* Qualification Breakdown */}
                {selectedLead.qualification &&
                  typeof selectedLead.qualification === 'object' && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase">
                        Qualifizierung
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(selectedLead.qualification)
                          .filter(([key]) => key !== 'breakdown')
                          .map(([key, val]) => (
                            <div
                              key={key}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-gray-500">{key}</span>
                              <span className="text-white">{String(val)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Objections */}
                {selectedLead.objections &&
                  selectedLead.objections.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium mb-2 uppercase">
                        Einwände
                      </h4>
                      <div className="space-y-1">
                        {selectedLead.objections.map((obj, i) => (
                          <span
                            key={i}
                            className="inline-block mr-1 mb-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Next Steps */}
                {selectedLead.next_steps && (
                  <div>
                    <h4 className="text-xs text-gray-500 font-medium mb-1 uppercase">
                      Nächste Schritte
                    </h4>
                    <p className="text-sm text-white bg-white/5 p-2 rounded">
                      {selectedLead.next_steps}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Lead auswählen für Details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
