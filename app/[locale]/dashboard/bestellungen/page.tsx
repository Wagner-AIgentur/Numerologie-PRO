import { createClient } from '@/lib/supabase/server';
import { getDateLocale } from '@/lib/i18n/admin';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BestellungenPage({
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

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  const statusLabel = (status: string) => {
    const map: Record<string, { de: string; ru: string; color: string }> = {
      paid: { de: 'Bezahlt', ru: 'Оплачен', color: 'bg-emerald-500/10 text-emerald-400' },
      pending: { de: 'Ausstehend', ru: 'Ожидание', color: 'bg-yellow-500/10 text-yellow-400' },
      refunded: { de: 'Erstattet', ru: 'Возврат', color: 'bg-blue-500/10 text-blue-400' },
      cancelled: { de: 'Storniert', ru: 'Отменён', color: 'bg-red-500/10 text-red-400' },
    };
    return map[status] ?? { de: status, ru: status, color: 'bg-white/5 text-white/50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">
          {de ? 'Meine Bestellungen' : 'Мои заказы'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {de ? 'Alle deine Käufe im Überblick.' : 'Все ваши покупки.'}
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50 mb-4">
            {de ? 'Noch keine Bestellungen.' : 'Заказов пока нет.'}
          </p>
          <Link
            href={`/${locale}/pakete`}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
          >
            {de ? 'Pakete ansehen' : 'Посмотреть пакеты'} →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-3 sm:px-5 py-3 text-white/50 font-medium">
                    {de ? 'Bestellung' : 'Заказ'}
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 text-white/50 font-medium hidden sm:table-cell">
                    {de ? 'Datum' : 'Дата'}
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 text-white/50 font-medium">
                    {de ? 'Betrag' : 'Сумма'}
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 text-white/50 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const s = statusLabel(order.status ?? 'pending');
                  return (
                    <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-3 sm:px-5 py-4 text-white font-mono text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-white/60 hidden sm:table-cell">
                        {new Date(order.created_at ?? '').toLocaleDateString(
                          getDateLocale(locale)
                        )}
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-white font-semibold">
                        {(order.amount_cents / 100).toFixed(2)} {(order.currency ?? 'EUR').toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
                          {de ? s.de : s.ru}
                        </span>
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
}
