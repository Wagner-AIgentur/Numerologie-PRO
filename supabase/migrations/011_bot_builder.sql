-- Migration 011: Bot Builder — Admin-managed commands, FAQ rules, and bot settings
-- Enables admin to configure Telegram bot responses without touching code.

-- 1. Bot Commands — editable text responses for commands
CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command TEXT NOT NULL UNIQUE,             -- e.g. 'hilfe', 'info', 'promo' (without leading /)
  type TEXT NOT NULL DEFAULT 'custom'
    CHECK (type IN ('builtin', 'custom')),
  response_de TEXT NOT NULL DEFAULT '',
  response_ru TEXT NOT NULL DEFAULT '',
  buttons JSONB DEFAULT '[]'::jsonb,        -- [{text_de, text_ru, url?, callback_data?}]
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_editable BOOLEAN NOT NULL DEFAULT true,
  description_de TEXT,
  description_ru TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_commands_enabled ON public.bot_commands(is_enabled);
CREATE INDEX IF NOT EXISTS idx_bot_commands_command ON public.bot_commands(command);

-- 2. FAQ Rules — keyword-based auto-responses (replaces hardcoded faq.ts)
CREATE TABLE IF NOT EXISTS public.bot_faq_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  response_de TEXT NOT NULL DEFAULT '',
  response_ru TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_faq_rules_enabled
  ON public.bot_faq_rules(is_enabled, priority DESC);

-- 3. Bot Settings — key-value store for bot configuration
CREATE TABLE IF NOT EXISTS public.bot_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS — admin-only access via service role
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_faq_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- 5. Seed builtin commands (references — most are not editable)
INSERT INTO public.bot_commands (command, type, is_editable, description_de, description_ru, sort_order) VALUES
  ('start',      'builtin', false, 'Begrüßung & Konto-Verknüpfung',     'Приветствие и привязка аккаунта',     1),
  ('analyse',    'builtin', false, 'Kostenlose Mini-Analyse',             'Бесплатный мини-анализ',               2),
  ('kompatibel', 'builtin', false, 'Kompatibilitäts-Check',               'Проверка совместимости',               3),
  ('heute',      'builtin', false, 'Persönliche Tageszahl',               'Личное число дня',                     4),
  ('meinepdfs',  'builtin', false, 'Gekaufte PDFs erneut senden',         'Отправить купленные PDF',             5),
  ('termin',     'builtin', false, 'Nächsten Termin anzeigen',             'Показать следующую сессию',           6),
  ('empfehlen',  'builtin', false, 'Empfehlungs-Link',                     'Реферальная ссылка',                   7),
  ('pakete',     'builtin', false, 'Pakete mit Preisen',                   'Пакеты с ценами',                     8),
  ('hilfe',      'builtin', true,  'Hilfemenü mit allen Befehlen',         'Справка со всеми командами',           9)
ON CONFLICT (command) DO NOTHING;

-- 6. Seed FAQ rules (from hardcoded faq.ts)
INSERT INTO public.bot_faq_rules (keywords, response_de, response_ru, priority) VALUES
  (ARRAY['stornieren','cancel','storno','widerruf','отмена','отменить','возврат'],
   '📋 Für Stornierungen kontaktiere bitte info@numerologie-pro.com oder nutze den Widerruf-Link in deiner Bestätigungs-E-Mail.',
   '📋 Для отмены напиши на info@numerologie-pro.com или используй ссылку отмены в письме-подтверждении.',
   100),
  (ARRAY['preis','kosten','price','цена','стоимость','сколько стоит'],
   '💰 Alle Preise und Pakete findest du unter /pakete oder auf unserer Website:\nhttps://numerologie-pro.com/de/pakete',
   '💰 Все цены и пакеты ты найдёшь через /pakete или на нашем сайте:\nhttps://numerologie-pro.com/ru/pakete',
   90),
  (ARRAY['termin','buchen','booking','appointment','запись','записаться'],
   '📅 Nutze /termin um deinen nächsten Termin zu sehen, oder /pakete um eine Beratung zu buchen.',
   '📅 Используй /termin чтобы увидеть следующую сессию, или /pakete чтобы записаться.',
   80),
  (ARRAY['kontakt','swetlana','contact','контакт','светлана'],
   E'📞 Kontakt:\n📧 info@numerologie-pro.com\n🌐 https://numerologie-pro.com\n\nSwetlana Wagner — Numerologie PRO',
   E'📞 Контакт:\n📧 info@numerologie-pro.com\n🌐 https://numerologie-pro.com\n\nСветлана Вагнер — Нумерология PRO',
   70),
  (ARRAY['datenschutz','privacy','dsgvo','конфиденциальность','приватность'],
   '🔒 Datenschutz: https://numerologie-pro.com/de/datenschutz',
   '🔒 Конфиденциальность: https://numerologie-pro.com/ru/datenschutz',
   60),
  (ARRAY['pdf','download','herunterladen','скачать'],
   '📂 Nutze /meinepdfs um deine gekauften PDFs erneut zu erhalten.',
   '📂 Используй /meinepdfs чтобы получить твои купленные PDF.',
   50),
  (ARRAY['hallo','hello','hi','hey','привет','здравствуйте'],
   '👋 Hallo! Nutze /hilfe um alle Befehle zu sehen, oder schreib mir einfach deine Frage.',
   '👋 Привет! Используй /hilfe чтобы увидеть все команды, или просто напиши свой вопрос.',
   10);

-- 7. Seed default settings
INSERT INTO public.bot_settings (key, value) VALUES
  ('fallback_behavior', '"forward_to_admin"'::jsonb),
  ('fallback_message_de', '"📨 Ich habe deine Frage an Swetlana weitergeleitet. Sie meldet sich bei dir!"'::jsonb),
  ('fallback_message_ru', '"📨 Я передал(а) твой вопрос Светлане. Она свяжется с тобой!"'::jsonb),
  ('admin_notifications', '{"new_messages": true, "unknown_commands": true}'::jsonb),
  ('welcome_new_de', '"🌟 Willkommen bei Numerologie PRO!\n\nIch bin dein persönlicher Numerologie-Assistent. Was möchtest du tun?"'::jsonb),
  ('welcome_new_ru', '"🌟 Добро пожаловать в Нумерология PRO!\n\nЯ твой личный ассистент по нумерологии. Что хочешь сделать?"'::jsonb),
  ('welcome_returning_de', '"Willkommen zurück, {name}! 🌟\nDein Konto ist verbunden. Was möchtest du tun?"'::jsonb),
  ('welcome_returning_ru', '"С возвращением, {name}! 🌟\nТвой аккаунт привязан. Что хочешь сделать?"'::jsonb),
  ('welcome_buttons', '[{"text_de":"🔮 Kostenlose Analyse","text_ru":"🔮 Бесплатный анализ","callback_data":"cmd_analyse"},{"text_de":"🛍️ Pakete ansehen","text_ru":"🛍️ Посмотреть пакеты","callback_data":"cmd_pakete"},{"text_de":"🔗 Konto verbinden","text_ru":"🔗 Привязать аккаунт","url_template":"https://numerologie-pro.com/{locale}/dashboard"}]'::jsonb)
ON CONFLICT (key) DO NOTHING;
