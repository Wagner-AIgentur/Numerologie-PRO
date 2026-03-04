import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { generateContent, AVAILABLE_MODELS } from '@/lib/ai/openrouter';
import type { ContentType } from '@/lib/ai/openrouter';
import { validateBody, zodErrorResponse, aiGenerateSchema } from '@/lib/validations/admin';

const VALID_TYPES: ContentType[] = ['newsletter', 'telegram_post', 'upsell', 'event', 'daily_tip'];

// GET: Return available models
export async function GET() {
  if (!(await requirePermission('ai.use'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ models: AVAILABLE_MODELS });
}

// POST: Generate content via OpenRouter
export async function POST(request: NextRequest) {
  if (!(await requirePermission('ai.use'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, aiGenerateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { content_type, language, topic, model } = body;

  if (!VALID_TYPES.includes(content_type as ContentType)) {
    return NextResponse.json(
      { error: `Invalid content_type. Must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  // Validate model if provided
  if (model && !AVAILABLE_MODELS.some((m) => m.id === model)) {
    return NextResponse.json(
      { error: `Invalid model. Available: ${AVAILABLE_MODELS.map((m) => m.id).join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const result = await generateContent({
      content_type: content_type as ContentType,
      language: language ?? 'de',
      topic,
      model,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[AI Generate] Error:', err);
    return NextResponse.json(
      { error: 'AI generation failed' },
      { status: 500 },
    );
  }
}
