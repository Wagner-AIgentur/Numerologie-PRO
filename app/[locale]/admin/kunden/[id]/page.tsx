import { adminClient } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomerDetailShell from '@/components/admin/crm/CustomerDetailShell';
import { getAdminT } from '@/lib/i18n/admin';
import { isDemoReviewer } from '@/lib/auth/admin-guard';

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getAdminT(locale);

  // Demo reviewers cannot view individual customer profiles
  if (await isDemoReviewer()) {
    redirect(`/${locale}/admin/kunden`);
  }

  // Parallel queries for all customer data
  const [profileRes, notesRes, emailsRes, ordersRes, sessionsRes] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', id).single(),
    adminClient
      .from('crm_notes')
      .select('*')
      .eq('profile_id', id)
      .order('created_at', { ascending: false }),
    adminClient
      .from('email_log')
      .select('*')
      .eq('profile_id', id)
      .order('created_at', { ascending: false }),
    adminClient
      .from('orders')
      .select('*, products(name_de, package_key)')
      .eq('profile_id', id)
      .order('created_at', { ascending: false }),
    adminClient
      .from('sessions')
      .select('*')
      .eq('profile_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (profileRes.error || !profileRes.data) {
    notFound();
  }

  // Fetch contact submissions by email
  const { data: contacts } = await adminClient
    .from('contact_submissions')
    .select('*')
    .eq('email', profileRes.data.email)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/admin/kunden`}
          className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {profileRes.data.full_name ?? profileRes.data.email}
          </h1>
          <p className="text-white/40 text-sm">{t.customerProfileSubtitle}</p>
        </div>
      </div>

      {/* Client Shell */}
      <CustomerDetailShell
        profile={{
          id: profileRes.data.id,
          email: profileRes.data.email,
          full_name: profileRes.data.full_name,
          phone: profileRes.data.phone,
          birthdate: profileRes.data.birthdate,
          language: (profileRes.data.language ?? 'de') as 'de' | 'ru',
          notes: profileRes.data.notes,
          tags: profileRes.data.tags ?? [],
          source: profileRes.data.source ?? '',
          crm_status: (profileRes.data.crm_status ?? 'lead') as 'lead' | 'client' | 'vip' | 'inactive' | 'admin',
          telegram_chat_id: profileRes.data.telegram_chat_id,
          created_at: profileRes.data.created_at ?? '',
        }}
        notes={(notesRes.data ?? []).map(n => ({
          id: n.id,
          content: n.content,
          type: 'note' as const,
          follow_up_date: null,
          created_at: n.created_at ?? '',
        }))}
        emails={(emailsRes.data ?? []).map(e => ({
          id: e.id,
          to_email: e.to_email,
          subject: e.subject,
          template: e.template,
          status: e.status,
          created_at: e.created_at ?? '',
        }))}
        orders={(ordersRes.data ?? []).map(o => ({
          id: o.id,
          amount_cents: o.amount_cents,
          currency: o.currency ?? 'EUR',
          status: o.status ?? 'pending',
          metadata: o.metadata as Record<string, string> | null,
          products: o.products as { name_de: string; package_key: string | null } | null,
          created_at: o.created_at ?? '',
        }))}
        sessions={(sessionsRes.data ?? []).map(s => ({
          id: s.id,
          title: s.title ?? '',
          status: s.status,
          session_type: s.session_type ?? '',
          scheduled_at: s.scheduled_at,
          package_type: s.package_type,
          created_at: s.created_at ?? '',
        }))}
        contacts={(contacts ?? []).map(c => ({
          id: c.id,
          topic: c.topic,
          message: c.message,
          status: c.status ?? 'new',
          created_at: c.created_at ?? '',
        }))}
      />
    </div>
  );
}
