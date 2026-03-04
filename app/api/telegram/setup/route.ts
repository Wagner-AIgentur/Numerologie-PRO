import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, deleteWebhook } from '@/lib/telegram/bot';

/**
 * POST /api/telegram/setup — Register the Telegram webhook
 * GET  /api/telegram/setup — Delete the webhook (for debugging)
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'TELEGRAM_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  try {
    const result = await setWebhook(webhookUrl, secret);
    return NextResponse.json({ ok: true, webhook: webhookUrl, result });
  } catch (err) {
    console.error('[Telegram Setup] Failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await deleteWebhook();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('[Telegram Setup] Delete failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
