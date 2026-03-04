import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, studioGenerateSchema } from '@/lib/validations/admin';
import { studioGenerate } from '@/lib/ai/content-studio';
import { buildGenerationContext, formatContextForPrompt } from '@/lib/intelligence/memory';

export async function POST(request: NextRequest) {
  if (!(await requirePermission('ai.use'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, studioGenerateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  try {
    // Auto-Recall: Build context from 3+1 Tier Memory (+ optional Knowledge)
    let intelligenceContext = '';
    let duplicateWarning: string | null = null;
    let knowledgeUsed = false;
    try {
      const ctx = await buildGenerationContext({
        topic: body.topic ?? '',
        contentType: body.template_id ?? undefined,
        funnelStage: body.funnel_stage ?? undefined,
        inspiredByIntelId: body.inspired_by_intel_id ?? undefined,
        useKnowledge: body.use_knowledge ?? false,
        knowledgeSource: body.knowledge_source,
      });
      intelligenceContext = formatContextForPrompt(ctx);
      duplicateWarning = ctx.duplicateWarning;
      knowledgeUsed = ctx.knowledge.length > 0;
    } catch {
      // Intelligence layer failure should not block generation
    }

    // Inject intelligence context into generation
    const enrichedBody = {
      ...body,
      language: body.language ?? 'de' as const,
      additional_context: intelligenceContext
        ? `${body.additional_context ?? ''}\n${intelligenceContext}`
        : body.additional_context,
    };

    const result = await studioGenerate(enrichedBody);
    return NextResponse.json({
      ...result,
      duplicate_warning: duplicateWarning,
      knowledge_used: knowledgeUsed,
    });
  } catch (err) {
    console.error('[Studio Generate] Error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
