import { adminClient } from '@/lib/supabase/admin';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';
import { UserPlus, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);
  const dateLocale = getDateLocale(locale);

  const { data: leads } = await adminClient
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  const allLeads = leads ?? [];
  const verified = allLeads.filter((l) => l.email_verified);
  const converted = allLeads.filter((l) => l.converted);
  const notConverted = allLeads.filter((l) => l.email_verified && !l.converted);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{t.leadsTitle}</h1>
        <p className="text-white/50 text-sm mt-1">
          {allLeads.length} {t.leadsTotal} &middot; {verified.length} {t.verified} &middot; {converted.length} {t.converted}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t.totalLabel} value={allLeads.length} color="text-white" />
        <StatCard label={t.verifiedLabel} value={verified.length} color="text-blue-400" />
        <StatCard label={t.convertedLabel} value={converted.length} color="text-emerald-400" />
        <StatCard label={t.warmLabel} value={notConverted.length} color="text-gold" />
      </div>

      {/* Table */}
      {allLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <UserPlus className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">{t.noLeadsYet}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">{t.email}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden md:table-cell">{t.birthdate}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden md:table-cell">{t.source}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">{t.verifiedLabel}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">{t.convertedLabel}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden lg:table-cell">{t.language}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden xl:table-cell">{t.date}</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">{t.profile}</th>
                </tr>
              </thead>
              <tbody>
                {allLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-white/70">{lead.email}</td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 hidden md:table-cell">
                      {lead.birthdate ? new Date(lead.birthdate).toLocaleDateString(dateLocale) : '—'}
                    </td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 hidden md:table-cell">{lead.source}</td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                      {lead.email_verified ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="h-4 w-4 text-white/20" strokeWidth={1.5} />
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                      {lead.converted ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">{t.yes}</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">{t.no}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-white/40 hidden lg:table-cell">{lead.language?.toUpperCase()}</td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-white/40 text-xs hidden xl:table-cell">
                      {new Date(lead.created_at ?? '').toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                      {lead.profile_id ? (
                        <Link
                          href={`/${locale}/admin/kunden/${lead.profile_id}`}
                          className="inline-flex items-center gap-1 text-xs text-gold/60 hover:text-gold transition-colors"
                        >
                          {t.profile} <ArrowRight className="h-3 w-3" strokeWidth={2} />
                        </Link>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
