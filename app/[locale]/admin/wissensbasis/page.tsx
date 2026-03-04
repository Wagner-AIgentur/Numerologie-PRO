import { getAdminT } from '@/lib/i18n/admin';
import { adminClient } from '@/lib/supabase/admin';
import KnowledgeSearchShell from '@/components/admin/knowledge/KnowledgeSearchShell';

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // Load stats server-side
  const [
    { count: totalSources },
    { count: completedSources },
    { count: totalChunks },
    { data: breakdown },
  ] = await Promise.all([
    adminClient.from('knowledge_sources').select('*', { count: 'exact', head: true }).neq('status', 'skipped'),
    adminClient.from('knowledge_sources').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('knowledge_chunks').select('*', { count: 'exact', head: true }),
    adminClient
      .from('knowledge_sources')
      .select('source_name, chunk_count, status')
      .neq('status', 'skipped')
      .order('source_name'),
  ]);

  // Group by source_name
  const sourceGroups: Array<{ name: string; files: number; chunks: number }> = [];
  const grouped = new Map<string, { files: number; chunks: number }>();
  for (const row of breakdown ?? []) {
    const existing = grouped.get(row.source_name) ?? { files: 0, chunks: 0 };
    existing.files += 1;
    existing.chunks += row.chunk_count ?? 0;
    grouped.set(row.source_name, existing);
  }
  for (const [name, stats] of grouped) {
    sourceGroups.push({ name, ...stats });
  }

  return (
    <KnowledgeSearchShell
      locale={locale}
      stats={{
        totalSources: totalSources ?? 0,
        completedSources: completedSources ?? 0,
        totalChunks: totalChunks ?? 0,
        sourceGroups,
      }}
    />
  );
}
