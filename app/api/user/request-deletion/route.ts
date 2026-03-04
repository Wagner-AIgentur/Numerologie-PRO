/**
 * Account Deletion Request API (Art. 17 DSGVO)
 *
 * POST /api/user/request-deletion
 * - Marks the user's profile with deletion_requested_at
 * - Sends confirmation email
 * - Actual deletion happens after 30-day grace period via cron
 *
 * DELETE /api/user/request-deletion
 * - Cancels a pending deletion request (within grace period)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { baseTemplate, heading, paragraph } from '@/lib/email/templates/base';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await rateLimit(`deletion:${user.id}`, { preset: 'strict' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Fetch profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, email, full_name, language, deletion_requested_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.deletion_requested_at) {
    return NextResponse.json({
      error: 'Deletion already requested',
      deletion_requested_at: profile.deletion_requested_at,
    }, { status: 409 });
  }

  // Mark deletion requested
  const now = new Date().toISOString();
  await adminClient
    .from('profiles')
    .update({ deletion_requested_at: now })
    .eq('id', user.id);

  // Calculate deletion date (30 days from now)
  const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isDE = profile.language === 'de' || !profile.language;

  // Send confirmation email
  const html = baseTemplate({
    title: isDE ? 'Löschung beantragt' : 'Запрос на удаление',
    preheader: isDE ? 'Dein Konto wird in 30 Tagen gelöscht' : 'Ваш аккаунт будет удалён через 30 дней',
    content: [
      heading(isDE ? 'Löschung beantragt' : 'Запрос на удаление'),
      paragraph(isDE
        ? `Hallo ${profile.full_name ?? ''},<br/><br/>dein Antrag auf Kontolöschung wurde erhalten. Dein Konto und alle zugehörigen Daten werden am <strong>${deletionDate.toLocaleDateString('de-DE')}</strong> unwiderruflich gelöscht.`
        : `Здравствуйте, ${profile.full_name ?? ''},<br/><br/>ваш запрос на удаление аккаунта получен. Ваш аккаунт и все связанные данные будут безвозвратно удалены <strong>${deletionDate.toLocaleDateString('ru-RU')}</strong>.`
      ),
      paragraph(isDE
        ? 'Falls du es dir anders überlegst, kannst du die Löschung innerhalb dieser 30 Tage in deinen Kontoeinstellungen rückgängig machen.'
        : 'Если вы передумаете, вы можете отменить удаление в течение 30 дней в настройках аккаунта.'
      ),
      paragraph(isDE
        ? 'Nach Ablauf der Frist werden alle mit deinem Konto verknüpften Daten unwiderruflich gelöscht.'
        : 'По истечении срока все данные, связанные с вашим аккаунтом, будут безвозвратно удалены.'
      ),
    ].join(''),
  });

  await sendEmail({
    to: profile.email,
    subject: isDE ? 'Dein Konto wird in 30 Tagen gelöscht' : 'Ваш аккаунт будет удалён через 30 дней',
    html,
    template: 'deletion-request',
    profileId: profile.id,
  });

  return NextResponse.json({
    success: true,
    deletion_date: deletionDate.toISOString(),
    message: isDE
      ? 'Löschung beantragt. Du hast 30 Tage, um den Vorgang rückgängig zu machen.'
      : 'Запрос на удаление принят. У вас есть 30 дней для отмены.',
  });
}

// Cancel deletion request
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await rateLimit(`deletion:${user.id}`, { preset: 'strict' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('deletion_requested_at')
    .eq('id', user.id)
    .single();

  if (!profile?.deletion_requested_at) {
    return NextResponse.json({ error: 'No pending deletion' }, { status: 404 });
  }

  await adminClient
    .from('profiles')
    .update({ deletion_requested_at: null })
    .eq('id', user.id);

  return NextResponse.json({ success: true, message: 'Deletion cancelled' });
}
