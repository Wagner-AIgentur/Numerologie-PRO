import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/telegram/bot';

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

/**
 * POST /api/telegram/broadcast
 *
 * Used by n8n to post messages to the Telegram channel.
 * Body: { text: string, parse_mode?: 'HTML' | 'Markdown' }
 *
 * Protected by CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!CHANNEL_ID) {
    return NextResponse.json({ error: 'TELEGRAM_CHANNEL_ID not configured' }, { status: 500 });
  }

  try {
    const { text, parse_mode } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const result = await sendMessage({
      chat_id: parseInt(CHANNEL_ID),
      text,
      parse_mode: parse_mode ?? 'HTML',
    });

    return NextResponse.json({ ok: true, message_id: result.message_id });
  } catch (err) {
    console.error('[Telegram Broadcast] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
