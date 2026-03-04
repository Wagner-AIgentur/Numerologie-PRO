/**
 * Email Unsubscribe API
 *
 * Token-based one-click unsubscribe (RFC 8058 / DSGVO Art. 21).
 * GET  /api/email/unsubscribe?token=xxx  → Renders confirmation page
 * POST /api/email/unsubscribe             → Processes unsubscribe { token }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await rateLimit(`unsubscribe:${ip}`, { preset: 'default' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse(renderPage('error', 'de'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Look up token in profiles first, then leads
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, email, email_unsubscribed, language')
    .eq('unsubscribe_token', token)
    .single();

  const { data: lead } = !profile
    ? await adminClient
        .from('leads')
        .select('id, email, email_unsubscribed, language')
        .eq('unsubscribe_token', token)
        .single()
    : { data: null };

  const record = profile ?? lead;

  if (!record) {
    // Always return 200 to prevent token enumeration
    return new NextResponse(renderPage('error', 'de'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (record.email_unsubscribed) {
    return new NextResponse(renderPage('already', record.language ?? 'de'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // GET only renders confirmation page — actual unsubscribe happens via POST
  // This prevents link scanners / email previewers from auto-unsubscribing users
  return new NextResponse(renderPage('confirm', record.language ?? 'de', token), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// POST handler for List-Unsubscribe-Post header (RFC 8058 one-click) and browser form submission
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await rateLimit(`unsubscribe:${ip}`, { preset: 'default' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Try profiles first
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, language')
      .eq('unsubscribe_token', token)
      .single();

    if (profile) {
      await adminClient
        .from('profiles')
        .update({ email_unsubscribed: true })
        .eq('unsubscribe_token', token);
      // Check if browser form or RFC 8058 mail client
      const contentType = req.headers.get('content-type') ?? '';
      if (contentType.includes('form')) {
        return new NextResponse(renderPage('success', profile.language ?? 'de'), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Try leads
    const { data: lead } = await adminClient
      .from('leads')
      .select('id, language')
      .eq('unsubscribe_token', token)
      .single();

    if (lead) {
      await adminClient
        .from('leads')
        .update({ email_unsubscribed: true })
        .eq('unsubscribe_token', token);
      const contentType = req.headers.get('content-type') ?? '';
      if (contentType.includes('form')) {
        return new NextResponse(renderPage('success', lead.language ?? 'de'), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Always return 200 to prevent token enumeration
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function renderPage(status: 'success' | 'already' | 'error' | 'confirm', locale: string, token?: string): string {
  const isDE = locale === 'de';

  const titles: Record<string, string> = {
    confirm: isDE ? 'Abmeldung bestätigen' : 'Подтверждение отписки',
    success: isDE ? 'Erfolgreich abgemeldet' : 'Вы отписались',
    already: isDE ? 'Bereits abgemeldet' : 'Вы уже отписаны',
    error: isDE ? 'Fehler' : 'Ошибка',
  };

  const messages: Record<string, string> = {
    confirm: isDE
      ? 'Möchtest du dich wirklich von unseren Marketing-E-Mails abmelden?'
      : 'Вы действительно хотите отписаться от наших маркетинговых рассылок?',
    success: isDE
      ? 'Du wurdest erfolgreich von unseren Marketing-E-Mails abgemeldet. Du erhältst weiterhin wichtige Transaktions-E-Mails (Bestellbestätigungen, Passwort-Resets etc.).'
      : 'Вы успешно отписались от наших маркетинговых рассылок. Вы по-прежнему будете получать важные транзакционные письма (подтверждения заказов, сброс пароля и т.д.).',
    already: isDE
      ? 'Du bist bereits von unseren Marketing-E-Mails abgemeldet.'
      : 'Вы уже отписаны от наших маркетинговых рассылок.',
    error: isDE
      ? 'Der Abmelde-Link ist ungültig oder abgelaufen. Bitte kontaktiere uns unter info@numerologie-pro.com.'
      : 'Ссылка для отписки недействительна или устарела. Пожалуйста, свяжитесь с нами по адресу info@numerologie-pro.com.',
  };

  const confirmButton = status === 'confirm'
    ? `<form method="POST" action="/api/email/unsubscribe?token=${encodeURIComponent(token ?? '')}">
        <input type="hidden" name="List-Unsubscribe" value="One-Click" />
        <button type="submit" style="background:#D4AF37;color:#051a24;border:none;padding:12px 32px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;margin-bottom:16px;">${isDE ? 'Ja, abmelden' : 'Да, отписаться'}</button>
      </form>`
    : '';

  const icons: Record<string, string> = { confirm: '📧', success: '✓', already: 'ℹ', error: '⚠' };

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titles[status]}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #051a24; color: #e8e4d9; font-family: 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { max-width: 480px; background: #0a2533; border: 1px solid #2a4a3a; border-radius: 16px; padding: 48px 40px; text-align: center; }
    h1 { color: #D4AF37; font-size: 24px; margin-bottom: 16px; }
    p { color: #cdc9be; font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
    a { color: #D4AF37; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icons[status]}</div>
    <h1>${titles[status]}</h1>
    <p>${messages[status]}</p>
    ${confirmButton}
    <a href="${SITE_URL}">${isDE ? 'Zurück zur Startseite' : 'На главную'}</a>
  </div>
</body>
</html>`;
}
