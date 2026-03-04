import { adminClient } from '@/lib/supabase/admin';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';
import Link from 'next/link';
import ContentHubShell from '@/components/admin/content/ContentHubShell';
import {
  Megaphone,
  FileEdit,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  MessageCircle,
  Plus,
} from 'lucide-react';

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  draft: { icon: FileEdit, color: 'text-white/50', bg: 'bg-white/5' },
  scheduled: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  sending: { icon: Send, color: 'text-gold', bg: 'bg-gold/10' },
  sent: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  partially_sent: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);
  const dateLocale = getDateLocale(locale);

  const { data: broadcasts } = await adminClient
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const all = broadcasts ?? [];
  const drafts = all.filter((b) => b.status === 'draft');
  const scheduled = all.filter((b) => b.status === 'scheduled');
  const sent = all.filter((b) => ['sent', 'partially_sent'].includes(b.status));

  const broadcastsContent = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
            <div className="text-2xl font-bold text-white">{drafts.length}</div>
            <div className="text-xs text-white/50 mt-1">{t.draftPlural}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
            <div className="text-2xl font-bold text-white">{scheduled.length}</div>
            <div className="text-xs text-white/50 mt-1">{t.scheduledPlural}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
            <div className="text-2xl font-bold text-white">{sent.length}</div>
            <div className="text-xs text-white/50 mt-1">{t.sentPlural}</div>
          </div>
        </div>
        <Link
          href={`/${locale}/admin/content/neu`}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {t.newBroadcast}
        </Link>
      </div>

      {/* Broadcast List */}
      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <Megaphone className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">{t.noBroadcastsYet}</p>
          <Link
            href={`/${locale}/admin/content/neu`}
            className="inline-flex items-center gap-2 mt-4 text-sm text-gold hover:text-gold/80 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {t.newBroadcast}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-medium">{t.broadcastStatus}</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">{t.broadcastTitle}</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">{t.channels}</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden md:table-cell">{t.recipients}</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden lg:table-cell">{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {all.map((b) => {
                  const sc = statusConfig[b.status] ?? statusConfig.draft;
                  const Icon = sc.icon;
                  const channels = (b.channels as string[]) ?? [];
                  const isEditable = b.status === 'draft' || b.status === 'scheduled';

                  return (
                    <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                          <Icon className="h-3 w-3" strokeWidth={1.5} />
                          {t[`status_${b.status}` as keyof typeof t] ?? b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {isEditable ? (
                          <Link
                            href={`/${locale}/admin/content/neu?id=${b.id}`}
                            className="text-white hover:text-gold transition-colors"
                          >
                            {b.title}
                          </Link>
                        ) : (
                          <span className="text-white/70">{b.title}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          {channels.includes('email') && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                              <Mail className="h-3 w-3" strokeWidth={1.5} />
                              E-Mail
                            </span>
                          )}
                          {channels.includes('telegram') && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                              <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                              Telegram
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {(b.total_recipients ?? 0) > 0 ? (
                          <span className="text-white/60 text-xs">
                            {b.sent_count}/{b.total_recipients}
                            {(b.failed_count ?? 0) > 0 && (
                              <span className="text-red-400 ml-1">({b.failed_count} {t.failedShort})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell text-white/40 text-xs">
                        {b.sent_at
                          ? new Date(b.sent_at).toLocaleString(dateLocale)
                          : b.scheduled_at
                            ? `${t.scheduledFor} ${new Date(b.scheduled_at).toLocaleString(dateLocale)}`
                            : new Date(b.created_at ?? '').toLocaleString(dateLocale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ContentHubShell
      locale={locale}
      t={t as unknown as Record<string, string>}
      initialTab="studio"
      broadcastsContent={broadcastsContent}
    />
  );
}
