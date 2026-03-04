import { createClient } from '@/lib/supabase/server';
import { getDateLocale } from '@/lib/i18n/admin';
import { redirect } from 'next/navigation';
import { FileDown, FileText, Video, Link as LinkIcon } from 'lucide-react';

export default async function UnterlagenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const de = locale === 'de';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: deliverables } = await supabase
    .from('deliverables')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  const typeIcon = (type: string | null) => {
    if (type === 'video') return Video;
    if (type === 'link') return LinkIcon;
    return FileText;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">
          {de ? 'Meine Unterlagen' : 'Мои материалы'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {de ? 'PDFs, Aufzeichnungen und mehr.' : 'PDF, записи и другие материалы.'}
        </p>
      </div>

      {!deliverables || deliverables.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <FileDown className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">
            {de
              ? 'Noch keine Unterlagen verfügbar. Nach deiner Sitzung werden Materialien hier bereitgestellt.'
              : 'Материалов пока нет. После сессии здесь появятся материалы.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliverables.map((item) => {
            const Icon = typeIcon(item.file_type);
            const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5 flex flex-col"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 mb-4">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                {'description' in item && (item as { description?: string }).description && (
                  <p className="text-white/50 text-xs mb-3">{(item as { description?: string }).description}</p>
                )}
                <div className="mt-auto pt-4">
                  {isExpired ? (
                    <p className="text-xs text-red-400">{de ? 'Link abgelaufen' : 'Ссылка истекла'}</p>
                  ) : item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-medium text-gold hover:text-gold-light transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {de ? 'Herunterladen' : 'Скачать'}
                    </a>
                  ) : null}
                  {item.expires_at && !isExpired && (
                    <p className="text-xs text-white/30 mt-2">
                      {de ? 'Verfügbar bis' : 'Доступно до'}{' '}
                      {new Date(item.expires_at).toLocaleDateString(getDateLocale(locale))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
