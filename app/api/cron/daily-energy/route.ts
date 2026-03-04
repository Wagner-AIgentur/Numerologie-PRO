import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';
import { searchKnowledge, formatKnowledgeForPrompt } from '@/lib/intelligence/knowledge';
import { loadCoreMemory } from '@/lib/intelligence/memory';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * GET /api/cron/daily-energy
 *
 * Generates a daily numerology energy post using the Knowledge Base + Brand Voice.
 * Called by n8n Workflow 01 (Tages-Energie Broadcast).
 *
 * Returns: { text: string, language: 'ru' }
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
  }

  // 1. Load brand context from Core Memory
  const core = await loadCoreMemory();

  // 2. Search Knowledge Base for daily energy / universal day number concepts
  let knowledgeBlock = '';
  try {
    const knowledgeResults = await searchKnowledge({
      query: 'универсальное число дня тагесэнергия вибрация числа нумерология прогноз',
      topK: 4,
      language: 'ru',
    });
    knowledgeBlock = formatKnowledgeForPrompt(knowledgeResults, 3000);
  } catch {
    // Knowledge Base may not be populated yet — continue without it
  }

  // 3. Calculate today's universal day number
  const today = new Date();
  const dayDigits = today.getDate();
  const monthDigits = today.getMonth() + 1;
  const yearDigits = today.getFullYear();
  const universalDay = reduceToSingle(dayDigits + monthDigits + yearDigits);
  const dateStr = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  // 4. Build prompt with lead guardrails
  const systemPrompt = [
    'Ты — нумеролог-эксперт, который пишет ежедневный пост об энергии дня для Telegram-канала.',
    '',
    `[Бренд]`,
    core.brand_voice || 'Numerologie PRO — премиальная нумерологическая платформа. Тональность: тёплая, профессиональная, мистическая но серьёзная.',
    '',
    '--- ПРАВИЛА LEAD-ГЕНЕРАЦИИ (ВАЖНО) ---',
    'Ты создаёшь ТИЗЕР — пробуди интерес, но НЕ раскрывай всё.',
    'НЕ давай полный расклад или подробное описание числа.',
    'Упомяни что персональный анализ даёт гораздо более глубокие инсайты.',
    'В конце добавь CTA: ссылка на бота @NumerologieProBot или сайт numerologie-pro.com.',
    'Задача: читатель должен захотеть узнать БОЛЬШЕ, а не получить всё бесплатно.',
    '--- КОНЕЦ ПРАВИЛ ---',
    '',
    knowledgeBlock,
    '',
    'Формат: Эмодзи + универсальное число дня + 3-4 предложения (тизер энергии). Максимум 280 символов.',
    'Используй HTML-теги для Telegram: <b>, <i>. Без Markdown.',
    'Пиши на русском языке. Обращайся на "ты".',
  ].join('\n');

  const userPrompt = `Напиши тизер энергии дня на ${dateStr}. Универсальное число дня: ${universalDay}.`;

  // 5. Generate via OpenRouter
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Daily Energy',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('[Daily Energy] OpenRouter error:', response.status, errBody);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 });
  }

  // 6. Save to content_posts for tracking
  adminClient
    .from('content_posts')
    .insert({
      title: `Энергия дня — ${dateStr}`,
      body: text,
      content_type: 'daily_tip',
      language: 'ru',
      funnel_stage: 'tofu',
      status: 'published',
      published_at: new Date().toISOString(),
      target_platforms: ['telegram'],
    })
    .then(() => {}, (err) => console.error('[Daily Energy] Save failed:', err));

  return NextResponse.json({ text, language: 'ru' });
}

function reduceToSingle(n: number): number {
  let sum = n;
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = sum.toString().split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}
