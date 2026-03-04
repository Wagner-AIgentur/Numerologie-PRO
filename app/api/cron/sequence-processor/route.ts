import { NextRequest, NextResponse } from 'next/server';
import { processSequenceQueue } from '@/lib/sequences/processor';
import { safeCompare } from '@/lib/rate-limit';

/**
 * GET /api/cron/sequence-processor
 *
 * Cron job that processes due sequence enrollments.
 * Should be called every 15-60 minutes via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processSequenceQueue();
    console.log(`[Sequence Cron] Processed: ${result.processed}, Sent: ${result.sent}, Completed: ${result.completed}, Errors: ${result.errors}`);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Sequence Cron] Fatal error:', err);
    return NextResponse.json({ error: 'Processing failed', message: String(err) }, { status: 500 });
  }
}
