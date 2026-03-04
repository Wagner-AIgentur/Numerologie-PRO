/**
 * Data Retention Cron Job (Art. 5 Abs. 1 lit. e DSGVO)
 *
 * Runs daily at 4:00 AM.
 * Automatically deletes personal data that exceeds defined retention periods.
 *
 * Retention Policy:
 *   - contact_submissions:      6 months
 *   - automation_logs:          6 months
 *   - meta_capi_events:         6 months
 *   - broadcast_recipients:     12 months (sent/failed only)
 *   - activity_feed:            24 months
 *   - email_log:                24 months
 *   - telegram_messages:        24 months
 *   - instagram_messages:       24 months
 *   - whatsapp_messages:        24 months
 *   - sessions:                 24 months
 *
 * Additional cleanup (not rule-based):
 *   - leads (unconverted):          24 months → delete
 *   - orders (anonymized):          10 years (§ 147 AO) → delete
 *
 * NOT deleted here (separate legal basis):
 *   - orders (active):   via Art. 17 → anonymized by purge-deleted-accounts
 *   - profiles:          only via Art. 17 deletion request
 *   - crm_notes:         until profile deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { safeCompare } from '@/lib/rate-limit';

interface RetentionRule {
  table: string;
  column: string;
  months: number;
  extraFilter?: { column: string; op: 'in'; values: string[] };
}

const RETENTION_RULES: RetentionRule[] = [
  // 6-month retention
  { table: 'contact_submissions', column: 'created_at', months: 6 },
  { table: 'automation_logs', column: 'created_at', months: 6 },
  { table: 'meta_capi_events', column: 'created_at', months: 6 },

  // 12-month retention
  {
    table: 'broadcast_recipients',
    column: 'sent_at',
    months: 12,
    extraFilter: { column: 'status', op: 'in', values: ['sent', 'failed'] },
  },

  // 24-month retention
  { table: 'activity_feed', column: 'created_at', months: 24 },
  { table: 'email_log', column: 'created_at', months: 24 },
  { table: 'telegram_messages', column: 'created_at', months: 24 },
  { table: 'instagram_messages', column: 'created_at', months: 24 },
  { table: 'whatsapp_messages', column: 'created_at', months: 24 },
  { table: 'sessions', column: 'created_at', months: 24 },
];

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, number> = {};
  const errors: string[] = [];

  for (const rule of RETENTION_RULES) {
    try {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - rule.months);
      const cutoffISO = cutoff.toISOString();

      let query = (adminClient
        .from(rule.table as any) as any)
        .delete({ count: 'exact' })
        .lt(rule.column, cutoffISO);

      // Apply extra filter (e.g. only sent/failed broadcast recipients)
      if (rule.extraFilter) {
        query = query.in(rule.extraFilter.column, rule.extraFilter.values);
      }

      const { count, error } = await query;

      if (error) {
        errors.push(`${rule.table}: ${error.message}`);
      } else {
        results[rule.table] = count ?? 0;
      }
    } catch (err) {
      const msg = `${rule.table}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
    }
  }

  // --- Non-rule-based cleanup ---

  // Delete unconverted leads older than 24 months
  try {
    const leadCutoff = new Date();
    leadCutoff.setMonth(leadCutoff.getMonth() - 24);
    const { count, error } = await adminClient
      .from('leads')
      .delete({ count: 'exact' })
      .eq('converted', false)
      .lt('created_at', leadCutoff.toISOString());
    if (error) errors.push(`leads_expired: ${error.message}`);
    else results['leads_expired'] = count ?? 0;
  } catch (err) {
    errors.push(`leads_expired: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Delete anonymized orders after 10 years (§ 147 AO fulfilled)
  try {
    const tenYearCutoff = new Date();
    tenYearCutoff.setFullYear(tenYearCutoff.getFullYear() - 10);
    const { count, error } = await adminClient
      .from('orders')
      .delete({ count: 'exact' })
      .is('profile_id', null)
      .eq('customer_email', 'geloescht@anonymisiert.local')
      .lt('created_at', tenYearCutoff.toISOString());
    if (error) errors.push(`orders_expired: ${error.message}`);
    else results['orders_expired'] = count ?? 0;
  } catch (err) {
    errors.push(`orders_expired: ${err instanceof Error ? err.message : String(err)}`);
  }

  const totalDeleted = Object.values(results).reduce((sum, n) => sum + n, 0);

  console.log(`[Data Retention] Purged ${totalDeleted} records across ${Object.keys(results).length} tables`);
  if (errors.length) console.error('[Data Retention] Errors:', errors);

  return NextResponse.json({
    purged_total: totalDeleted,
    per_table: results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
