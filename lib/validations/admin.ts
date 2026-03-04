/**
 * Zod validation schemas for admin API routes.
 * Import the specific schema where needed.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const uuid = z.string().uuid();
const optionalString = z.string().optional();
const optionalBool = z.boolean().optional();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Quick UUID format check for route [id] params */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const sessionUpdateSchema = z.object({
  recording_url: z.string().url().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']).optional(),
  meeting_link: z.string().url().optional(),
  admin_notes: optionalString,
});

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const couponCreateSchema = z.object({
  code: z.string().min(1).max(50),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive(),
  max_uses: z.number().int().positive().optional(),
  min_amount_cents: z.number().int().nonnegative().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
  package_keys: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  description: optionalString,
  purpose: z.enum(['general', 'marketing', 'affiliate', 'campaign', 'referral']).default('general'),
  affiliate_id: uuid.optional().nullable(),
  sync_to_stripe: z.boolean().default(false),
});

export const couponUpdateSchema = couponCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Affiliates
// ---------------------------------------------------------------------------

export const affiliateCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  commission_percent: z.number().min(0).max(100).default(10),
  discount_percent: z.number().min(0).max(100).default(10),
  notes: z.string().max(1000).optional(),
  sync_to_stripe: z.boolean().default(true),
});

export const affiliateUpdateSchema = affiliateCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export const dealCreateSchema = z.object({
  profile_id: uuid,
  title: z.string().min(1).max(200),
  value_cents: z.number().int().nonnegative().optional(),
  stage: z.enum(['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('lead'),
  notes: optionalString,
  expected_close_date: z.string().optional(),
});

export const dealUpdateSchema = dealCreateSchema.partial();

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: optionalString,
  profile_id: uuid.optional(),
  assigned_to: uuid.optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']).default('open'),
});

export const taskUpdateSchema = taskCreateSchema.partial();

// ---------------------------------------------------------------------------
// Tag Rules
// ---------------------------------------------------------------------------

export const tagRuleSchema = z.object({
  name: z.string().min(1).max(100),
  conditions: z.record(z.unknown()),
  tag: z.string().min(1),
  is_active: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------

export const automationSchema = z.object({
  name: z.string().min(1).max(200),
  trigger_type: z.string().min(1),
  trigger_config: z.record(z.unknown()).default({}),
  actions: z.array(z.object({
    type: z.string().min(1),
    config: z.record(z.unknown()).default({}),
  })).min(1),
  is_active: z.boolean().default(true),
});

export const automationUpdateSchema = automationSchema.partial();

// ---------------------------------------------------------------------------
// Sequences
// ---------------------------------------------------------------------------

export const sequenceCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: optionalString,
  trigger_type: z.string().optional(),
  is_active: z.boolean().default(false),
});

export const sequenceUpdateSchema = sequenceCreateSchema.partial();

export const sequenceStepSchema = z.object({
  step_order: z.number().int().nonnegative(),
  delay_days: z.number().int().nonnegative().optional(),
  delay_hours: z.number().int().nonnegative().optional(),
  subject: z.string().min(1),
  content_html: z.string().min(1),
  content_telegram: z.string().nullable().optional(),
  send_telegram: z.boolean().optional(),
  is_active: z.boolean().optional(),
  // Russian translations (nullable = optional translation)
  subject_ru: z.string().nullable().optional(),
  content_html_ru: z.string().nullable().optional(),
  content_telegram_ru: z.string().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Custom Fields
// ---------------------------------------------------------------------------

export const customFieldSchema = z.object({
  name: z.string().min(1).max(100),
  field_type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  is_required: optionalBool,
});

export const customFieldValueSchema = z.object({
  profile_id: uuid,
  field_id: uuid,
  value: z.string(),
});

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export const broadcastCreateSchema = z.object({
  title: z.string().min(1).max(200),
  channel: z.enum(['email', 'telegram', 'both']),
  audience: z.enum(['all', 'vip', 'clients', 'leads', 'custom']).default('all'),
  audience_tags: z.array(z.string()).optional(),
  email_subject: optionalString,
  email_body: optionalString,
  telegram_text: optionalString,
  status: z.enum(['draft', 'scheduled', 'sending', 'sent']).default('draft'),
  scheduled_at: z.string().datetime().optional(),
  language_filter: z.enum(['all', 'de', 'ru']).optional(),
});

export const broadcastUpdateSchema = broadcastCreateSchema.partial();

// ---------------------------------------------------------------------------
// Bot Builder
// ---------------------------------------------------------------------------

export const botCommandSchema = z.object({
  command: z.string().min(1).max(50).regex(/^\/?\w+$/),
  response_de: z.string().min(1),
  response_ru: optionalString,
  type: z.enum(['text', 'buttons', 'link']).default('text'),
  buttons: z.array(z.object({
    text: z.string(),
    url: z.string().url().optional(),
    callback_data: optionalString,
  })).optional(),
  is_active: z.boolean().default(true),
});

export const botFaqSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1),
  response_de: z.string().min(1),
  response_ru: optionalString,
  priority: z.number().int().min(0).max(100).default(50),
  is_active: z.boolean().default(true),
});

export const botSettingsSchema = z.object({
  welcome_new_de: optionalString,
  welcome_new_ru: optionalString,
  welcome_returning_de: optionalString,
  welcome_returning_ru: optionalString,
  fallback_behavior: z.enum(['forward_admin', 'auto_reply']).optional(),
  fallback_reply_de: optionalString,
  fallback_reply_ru: optionalString,
  notify_new_messages: optionalBool,
  notify_unknown_commands: optionalBool,
});

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const KNOWN_PERMISSIONS = [
  'dashboard.view', 'customers.view', 'customers.edit',
  'leads.manage', 'deals.view', 'deals.edit',
  'sessions.view', 'sessions.edit', 'content.edit',
  'sequences.edit', 'automations.edit', 'tags.edit',
  'tasks.view', 'tasks.edit', 'analytics.view',
  'ai.use', 'telegram.send', 'instagram.edit',
  'team.manage', 'calendar.view',
  'coupons.manage', 'affiliates.manage',
] as const;

export const teamRoleSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(KNOWN_PERMISSIONS)),
  description: optionalString,
});

export const teamMemberUpdateSchema = z.object({
  profile_id: uuid,
  role_id: uuid.nullable(),
});

// ---------------------------------------------------------------------------
// CRM Notes
// ---------------------------------------------------------------------------

export const crmNoteSchema = z.object({
  profile_id: uuid,
  content: z.string().min(1),
  type: z.enum(['note', 'call', 'email', 'meeting']).default('note'),
});

// ---------------------------------------------------------------------------
// Customer update
// ---------------------------------------------------------------------------

export const customerUpdateSchema = z.object({
  full_name: optionalString,
  phone: optionalString,
  tags: z.array(z.string()).optional(),
  crm_status: z.enum(['lead', 'client', 'vip', 'inactive']).optional(),
  language: z.enum(['de', 'ru']).optional(),
});

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

export const instagramSendSchema = z.object({
  recipient_id: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export const instagramLinkSchema = z.object({
  instagram_sender_id: z.string().min(1),
  profile_id: uuid,
});

// ---------------------------------------------------------------------------
// AI Generate
// ---------------------------------------------------------------------------

export const aiGenerateSchema = z.object({
  content_type: z.string().min(1),
  topic: z.string().min(1),
  language: z.enum(['de', 'ru']).default('de'),
  model: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Lead scoring
// ---------------------------------------------------------------------------

export const leadScoringRecalcSchema = z.object({
  profile_ids: z.array(uuid).optional(),
});

// ---------------------------------------------------------------------------
// Sequence enrollment
// ---------------------------------------------------------------------------

export const enrollmentCreateSchema = z.object({
  profile_id: uuid,
  sequence_id: uuid,
});

// ---------------------------------------------------------------------------
// Telegram send
// ---------------------------------------------------------------------------

export const telegramSendSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  message: z.string().min(1).max(4096),
});

// ---------------------------------------------------------------------------
// Click tracking (public endpoint)
// ---------------------------------------------------------------------------

const clickEventSchema = z.object({
  page_path: z.string().min(1).max(500),
  element_tag: z.string().max(50),
  element_text: z.string().max(100).nullable(),
  element_id: z.string().max(200).nullable(),
  element_href: z.string().max(2000).nullable(),
  section: z.string().max(100).nullable(),
  x_percent: z.number().int().min(0).max(100),
  y_percent: z.number().int().min(0).max(100),
  viewport_w: z.number().int().min(0).max(10000),
});

export const clickBatchSchema = z.object({
  session_id: z.string().min(1).max(100),
  events: z.array(clickEventSchema).min(1).max(50),
});

// ---------------------------------------------------------------------------
// Page view tracking (public endpoint)
// ---------------------------------------------------------------------------

const pageViewEventSchema = z.object({
  type: z.literal('view'),
  session_id: z.string().min(1).max(100),
  page_path: z.string().min(1).max(500),
  referrer: z.string().max(2000).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  screen_w: z.number().int().min(0).max(10000).optional(),
  screen_h: z.number().int().min(0).max(10000).optional(),
  viewport_w: z.number().int().min(0).max(10000).optional(),
  language: z.string().max(10).optional(),
});

const pageViewDurationSchema = z.object({
  type: z.literal('duration'),
  session_id: z.string().min(1).max(100),
  page_path: z.string().min(1).max(500),
  duration_ms: z.number().int().min(0).max(3600000),
});

export const pageViewSchema = z.discriminatedUnion('type', [
  pageViewEventSchema,
  pageViewDurationSchema,
]);

// ---------------------------------------------------------------------------
// Content Studio — Prompt Templates
// ---------------------------------------------------------------------------

export const promptTemplateCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: optionalString,
  icon: optionalString,
  category: z.enum(['social', 'video', 'longform', 'engagement']).default('social'),
  system_prompt: z.string().min(1),
  user_prompt_template: optionalString,
  variables: z.array(z.string()).optional(),
  default_model: optionalString,
  default_temperature: z.number().min(0).max(2).optional(),
  default_triggers: z.array(z.string()).optional(),
  default_funnel_stage: z.enum(['tofu', 'mofu', 'bofu', 'retention']).optional(),
  pipeline_type: z.enum(['single', 'script_then_caption', 'caption_only']).default('single'),
  caption_template_id: z.string().uuid().optional(),
  output_format: z.enum(['text', 'json']).default('text'),
  platform: optionalString,
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).optional(),
});

export const promptTemplateUpdateSchema = promptTemplateCreateSchema.partial();

// ---------------------------------------------------------------------------
// Content Studio — Generate
// ---------------------------------------------------------------------------

const funnelStage = z.enum(['tofu', 'mofu', 'bofu', 'retention']);

export const studioGenerateSchema = z.object({
  template_id: z.string().uuid().optional(),
  content_type: z.string().min(1),
  topic: z.string().min(1),
  language: z.enum(['de', 'ru', 'en']).default('de'),
  tone: optionalString,
  model: optionalString,
  temperature: z.number().min(0).max(2).optional(),
  funnel_stage: funnelStage.optional(),
  triggers: z.array(z.string()).optional(),
  additional_context: optionalString,
  word_count: z.number().int().min(50).max(10000).optional(),
  platform: optionalString,
  // ManyChat CTA mode
  manychat_cta: z.boolean().optional(),
  // Intel inspiration
  inspired_by_intel_id: z.string().uuid().optional(),
  // Pipeline step (for 2-step flows)
  pipeline_step: z.enum(['script', 'caption']).optional(),
  script_input: optionalString,
  // Knowledge Base integration
  use_knowledge: z.boolean().optional(),
  knowledge_source: z.string().optional(), // Filter by course name
});

// ---------------------------------------------------------------------------
// Content Studio — Posts
// ---------------------------------------------------------------------------

export const contentPostCreateSchema = z.object({
  title: z.string().min(1).max(500),
  body: optionalString,
  excerpt: optionalString,
  media_urls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  content_type: z.string().min(1).default('social_post'),
  target_platforms: z.array(z.string()).optional(),
  category: optionalString,
  tags: z.array(z.string()).optional(),
  language: z.enum(['de', 'ru', 'en']).default('de'),
  funnel_stage: funnelStage.default('tofu'),
  triggers_used: z.array(z.string()).optional(),
  value_ladder_stage: z.enum(['free', 'tripwire', 'core', 'premium']).optional(),
  status: z.enum(['idea', 'draft', 'review', 'approved', 'scheduled', 'published', 'archived']).default('draft'),
  scheduled_at: z.string().datetime().optional(),
  platform_variants: z.record(z.string(), z.any()).optional(),
  ai_model: optionalString,
  ai_prompt: optionalString,
  ai_template_id: z.string().uuid().optional(),
  generation_history: z.array(z.any()).optional(),
  // ManyChat
  manychat_enabled: z.boolean().default(false),
  manychat_keyword: optionalString,
  manychat_dm_text: optionalString,
  manychat_dm_link: z.string().url().optional(),
  manychat_flow_id: optionalString,
  manychat_platform: z.enum(['instagram', 'messenger', 'both']).default('instagram'),
  // Inspiration link
  inspired_by_intel_id: z.string().uuid().optional(),
});

export const contentPostUpdateSchema = contentPostCreateSchema.partial();

// ---------------------------------------------------------------------------
// Content Studio — Calendar
// ---------------------------------------------------------------------------

export const calendarEventCreateSchema = z.object({
  post_id: uuid,
  scheduled_date: z.string().min(1),
  scheduled_time: optionalString,
  platforms: z.array(z.string()).optional(),
  color: optionalString,
  notes: optionalString,
});

export const calendarEventUpdateSchema = calendarEventCreateSchema.partial();

// ---------------------------------------------------------------------------
// Content Studio — Competitors
// ---------------------------------------------------------------------------

export const competitorCreateSchema = z.object({
  name: z.string().min(1).max(200),
  website_url: z.string().url().optional(),
  social_accounts: z.record(z.string(), z.string()).optional(),
  scrape_config: z.record(z.string(), z.any()).optional(),
  scrape_frequency: z.enum(['manual', 'daily', 'weekly']).default('manual'),
  notes: optionalString,
});

export const competitorUpdateSchema = competitorCreateSchema.partial();

// ---------------------------------------------------------------------------
// Content Studio — Intel
// ---------------------------------------------------------------------------

export const intelUpdateSchema = z.object({
  is_bookmarked: optionalBool,
  is_used_as_inspiration: optionalBool,
});

// ---------------------------------------------------------------------------
// Content Studio — Core Memory
// ---------------------------------------------------------------------------

export const coreMemoryUpdateSchema = z.object({
  memory_value: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Helper: validate request body
// ---------------------------------------------------------------------------

export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: z.ZodError }> {
  try {
    const raw = await request.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      return { error: result.error };
    }
    return { data: result.data };
  } catch {
    return { error: new z.ZodError([{ code: 'custom', message: 'Invalid JSON body', path: [] }]) };
  }
}

/**
 * Format Zod errors into a clean API response body.
 */
export function zodErrorResponse(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    })),
  };
}
