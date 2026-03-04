import { adminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import SequenceBuilderShell from '@/components/admin/sequences/SequenceBuilderShell';

export default async function SequenceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Handle "neu" (new sequence) — create and redirect
  if (id === 'neu') {
    const { data: newSeq } = await adminClient
      .from('email_sequences')
      .insert({
        name: locale === 'de' ? 'Neue Sequenz' : 'Новая последовательность',
        trigger_event: 'lead_verified',
        is_active: false,
      })
      .select()
      .single();

    if (newSeq) {
      redirect(`/${locale}/admin/sequenzen/${newSeq.id}`);
    }
    redirect(`/${locale}/admin/sequenzen`);
  }

  // Fetch sequence with steps
  const { data: sequence, error } = await adminClient
    .from('email_sequences')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !sequence) {
    redirect(`/${locale}/admin/sequenzen`);
  }

  const { data: steps } = await adminClient
    .from('email_sequence_steps')
    .select('*')
    .eq('sequence_id', id)
    .order('step_order', { ascending: true });

  // Fetch enrollment stats
  const { data: enrollments } = await adminClient
    .from('email_sequence_enrollments')
    .select('id, status')
    .eq('sequence_id', id);

  const allEnrollments = enrollments ?? [];

  const sequenceData = {
    ...sequence,
    steps: steps ?? [],
    stats: {
      total: allEnrollments.length,
      active: allEnrollments.filter((e) => e.status === 'active').length,
      completed: allEnrollments.filter((e) => e.status === 'completed').length,
      paused: allEnrollments.filter((e) => e.status === 'paused').length,
      unsubscribed: allEnrollments.filter((e) => e.status === 'unsubscribed').length,
    },
  };

  return <SequenceBuilderShell sequence={sequenceData} locale={locale} />;
}
