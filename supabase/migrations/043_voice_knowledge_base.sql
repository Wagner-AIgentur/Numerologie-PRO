-- Voice Agent: Knowledge Base (Supabase RAG)
-- Full-text search powered knowledge base for the voice agent.
-- All agent knowledge lives here instead of in the system prompt,
-- reducing prompt size and improving answer quality + latency.

CREATE TABLE IF NOT EXISTS voice_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,          -- package, faq, about, service, calculator, account, payment, referral, telegram, contact, objection, recommendation
  subcategory TEXT,                -- e.g. 'beziehungsmatrix', 'login_issues', 'too_expensive'
  title_de TEXT NOT NULL,
  title_ru TEXT,
  content_de TEXT NOT NULL,
  content_ru TEXT,
  keywords TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,      -- Higher = shown first at equal relevance
  is_active BOOLEAN DEFAULT true,
  search_vector_de tsvector GENERATED ALWAYS AS (
    to_tsvector('german', coalesce(title_de, '') || ' ' || coalesce(content_de, ''))
  ) STORED,
  search_vector_ru tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title_ru, '') || ' ' || coalesce(content_ru, ''))
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GIN indexes for fast full-text search
CREATE INDEX idx_voice_knowledge_search_de ON voice_knowledge USING GIN (search_vector_de);
CREATE INDEX idx_voice_knowledge_search_ru ON voice_knowledge USING GIN (search_vector_ru);
CREATE INDEX idx_voice_knowledge_category ON voice_knowledge(category);
CREATE INDEX idx_voice_knowledge_active ON voice_knowledge(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE voice_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice knowledge"
  ON voice_knowledge FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );

-- Service role can read (for API routes)
CREATE POLICY "Service role can read voice knowledge"
  ON voice_knowledge FOR SELECT
  USING (true);

-- ============================================================
-- Search RPC Function
-- ============================================================
CREATE OR REPLACE FUNCTION search_voice_knowledge(
  query_text TEXT,
  query_language TEXT DEFAULT 'de',
  query_category TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  subcategory TEXT,
  title TEXT,
  content TEXT,
  keywords TEXT[],
  relevance FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF query_language = 'ru' THEN
    RETURN QUERY
    SELECT
      vk.id,
      vk.category,
      vk.subcategory,
      COALESCE(vk.title_ru, vk.title_de) AS title,
      COALESCE(vk.content_ru, vk.content_de) AS content,
      vk.keywords,
      (
        ts_rank(vk.search_vector_ru, to_tsquery('simple', regexp_replace(query_text, '\s+', ' & ', 'g')))
        + CASE WHEN vk.keywords && string_to_array(lower(query_text), ' ') THEN 0.5 ELSE 0.0 END
        + vk.priority::FLOAT / 100.0
      ) AS relevance
    FROM voice_knowledge vk
    WHERE vk.is_active = true
      AND (query_category IS NULL OR vk.category = query_category)
      AND (
        vk.search_vector_ru @@ to_tsquery('simple', regexp_replace(query_text, '\s+', ' & ', 'g'))
        OR vk.keywords && string_to_array(lower(query_text), ' ')
        OR vk.subcategory = lower(query_text)
      )
    ORDER BY relevance DESC
    LIMIT result_limit;
  ELSE
    RETURN QUERY
    SELECT
      vk.id,
      vk.category,
      vk.subcategory,
      vk.title_de AS title,
      vk.content_de AS content,
      vk.keywords,
      (
        ts_rank(vk.search_vector_de, to_tsquery('german', regexp_replace(query_text, '\s+', ' & ', 'g')))
        + CASE WHEN vk.keywords && string_to_array(lower(query_text), ' ') THEN 0.5 ELSE 0.0 END
        + vk.priority::FLOAT / 100.0
      ) AS relevance
    FROM voice_knowledge vk
    WHERE vk.is_active = true
      AND (query_category IS NULL OR vk.category = query_category)
      AND (
        vk.search_vector_de @@ to_tsquery('german', regexp_replace(query_text, '\s+', ' & ', 'g'))
        OR vk.keywords && string_to_array(lower(query_text), ' ')
        OR vk.subcategory = lower(query_text)
      )
    ORDER BY relevance DESC
    LIMIT result_limit;
  END IF;
END;
$$;

-- ============================================================
-- SEED DATA: All Voice Agent Knowledge
-- ============================================================

-- ===================== PACKAGES =====================

INSERT INTO voice_knowledge (category, subcategory, title_de, title_ru, content_de, content_ru, keywords, priority) VALUES

-- Consultation Packages
('package', 'lebenskarte', 'Lebenskarte - Basisanalyse', 'Карта жизни - базовый разбор',
 'Die Lebenskarte kostet 79 Euro und dauert 120 Minuten. Es ist eine grundlegende Persoenlichkeitsanalyse anhand Ihrer Psychomatrix nach Pythagoras. Ideal als Einstieg in die Numerologie fuer Neugierige, die zum ersten Mal eine Beratung machen. Die Sitzung findet per Zoom oder Telegram statt.',
 'Карта жизни стоит 79 евро и длится 120 минут. Это базовый анализ личности по Психоматрице Пифагора. Идеально как начало знакомства с нумерологией для тех, кто обращается впервые. Сессия проводится по Zoom или Telegram.',
 ARRAY['lebenskarte', 'basisanalyse', 'einstieg', 'anfang', 'erste', 'neugierig', '79', 'карта', 'жизни', 'базовый'], 10),

('package', 'beziehungsmatrix', 'Beziehungsmatrix', 'Матрица отношений',
 'Die Beziehungsmatrix kostet 119 Euro und dauert 90 Minuten. Analyse der Partnerschaft anhand beider Psychomatrizen. Swetlana zeigt Dynamiken, Staerken und Herausforderungen in der Beziehung. Ideal fuer Paare oder Menschen mit Beziehungsfragen.',
 'Матрица отношений стоит 119 евро и длится 90 минут. Анализ партнёрства на основе обеих Психоматриц. Светлана показывает динамику, сильные стороны и вызовы в отношениях. Идеально для пар или людей с вопросами об отношениях.',
 ARRAY['beziehungsmatrix', 'beziehung', 'partner', 'partnerschaft', 'ehe', 'liebe', 'paar', '119', 'матрица', 'отношения', 'партнёр'], 8),

('package', 'lebensbestimmung', 'Lebensbestimmung', 'Предназначение',
 'Die Lebensbestimmung kostet 149 Euro und dauert 90 Minuten. Tiefgehende Analyse Ihrer Lebensaufgabe und Berufung. Finden Sie heraus, wofuer Sie hier sind. Ideal fuer Menschen an einem Wendepunkt, die ihre Berufung suchen.',
 'Предназначение стоит 149 евро и длится 90 минут. Глубокий анализ жизненной задачи и призвания. Узнайте, для чего вы здесь. Идеально для людей на перепутье, ищущих своё призвание.',
 ARRAY['lebensbestimmung', 'bestimmung', 'berufung', 'sinn', 'zweck', 'wendepunkt', 'lebensaufgabe', '149', 'предназначение', 'призвание'], 8),

('package', 'wachstumsplan', 'Wachstumsplan', 'План роста',
 'Der Wachstumsplan kostet 99 Euro und dauert 90 Minuten. Ihr persoenlicher Entwicklungsplan basierend auf der Psychomatrix. Konkrete Schritte fuer persoenliches Wachstum. Ideal fuer Menschen, die an sich arbeiten und wachsen wollen.',
 'План роста стоит 99 евро и длится 90 минут. Персональный план развития на основе Психоматрицы. Конкретные шаги для личностного роста. Идеально для тех, кто хочет работать над собой.',
 ARRAY['wachstumsplan', 'wachstum', 'entwicklung', 'selbst', 'persoenlichkeit', '99', 'план', 'роста', 'развитие'], 7),

('package', 'mein_kind', 'Mein Kind', 'Мой ребёнок',
 'Das Paket Mein Kind kostet 99 Euro und dauert 90 Minuten. Verstehen Sie die Persoenlichkeit, Talente und Beduerfnisse Ihres Kindes anhand seiner Psychomatrix. Ideal fuer Eltern, die ihr Kind besser verstehen moechten.',
 'Пакет Мой ребёнок стоит 99 евро и длится 90 минут. Понимание личности, талантов и потребностей ребёнка через его Психоматрицу. Идеально для родителей, которые хотят лучше понять ребёнка.',
 ARRAY['mein_kind', 'kind', 'kinder', 'sohn', 'tochter', 'eltern', '99', 'ребёнок', 'дети', 'сын', 'дочь'], 7),

('package', 'geldkanal', 'Geldkanal', 'Денежный канал',
 'Der Geldkanal kostet 99 Euro und dauert 90 Minuten. Analyse Ihrer finanziellen Muster und Blockaden. Entdecken Sie Ihren persoenlichen Weg zu mehr Fuelle. Ideal fuer Menschen mit finanziellen Blockaden oder Fragen zur Karriere.',
 'Денежный канал стоит 99 евро и длится 90 минут. Анализ финансовых паттернов и блоков. Откройте свой личный путь к изобилию. Идеально для людей с финансовыми блоками или вопросами о карьере.',
 ARRAY['geldkanal', 'geld', 'finanzen', 'karriere', 'blockade', 'fuelle', '99', 'денежный', 'канал', 'финансы', 'карьера'], 7),

('package', 'jahresprognose', 'Jahresprognose', 'Прогноз на год',
 'Die Jahresprognose kostet 119 Euro und dauert 120 Minuten. Detaillierte Vorausschau auf die naechsten 12 Monate mit energetischen Zyklen, guenstigen Zeitraeumen und Herausforderungen. Fuer alle, die wissen wollen was das naechste Jahr bringt.',
 'Прогноз на год стоит 119 евро и длится 120 минут. Детальный прогноз на следующие 12 месяцев с энергетическими циклами, благоприятными периодами и вызовами. Для тех, кто хочет знать, что принесёт следующий год.',
 ARRAY['jahresprognose', 'prognose', 'jahr', 'zukunft', '2026', '2027', '119', 'прогноз', 'год', 'будущее'], 8),

('package', 'jahresprognose_pdf', 'Jahresprognose mit PDF', 'Прогноз на год с PDF',
 'Die Jahresprognose mit PDF kostet 179 Euro und dauert 120 Minuten. Jahresprognose-Beratung plus ausfuehrlicher schriftlicher Report als PDF zum Nachlesen. Fuer alle, die die Beratung plus einen schriftlichen Report moechten.',
 'Прогноз на год с PDF стоит 179 евро и длится 120 минут. Консультация по прогнозу плюс подробный письменный отчёт в формате PDF. Для тех, кто хочет консультацию плюс письменный отчёт.',
 ARRAY['jahresprognose_pdf', 'prognose', 'pdf', 'report', 'schriftlich', '179', 'прогноз', 'pdf', 'отчёт'], 7),

-- Digital Products
('package', 'pdf_analyse', 'PDF-Analyse', 'PDF-Анализ',
 'Die PDF-Analyse kostet nur 9,99 Euro. Schriftliche Persoenlichkeitsanalyse als PDF basierend auf Ihrem Geburtsdatum. Sofort per E-Mail. Kein Termin noetig. Der guenstigste und schnellste Einstieg in die Numerologie.',
 'PDF-Анализ стоит всего 9,99 евро. Письменный анализ личности в PDF на основе даты рождения. Мгновенная доставка по email. Без записи на консультацию. Самый доступный и быстрый способ познакомиться с нумерологией.',
 ARRAY['pdf_analyse', 'pdf', 'analyse', 'guenstig', 'einstieg', 'schnell', '9.99', 'pdf', 'анализ', 'доступный'], 9),

('package', 'monatsprognose', 'Monatsprognose', 'Прогноз на месяц',
 'Die Monatsprognose kostet 19 Euro. Energetische Vorausschau fuer den kommenden Monat als PDF. Sofort per E-Mail, kein Termin noetig.',
 'Прогноз на месяц стоит 19 евро. Энергетический прогноз на следующий месяц в формате PDF. Мгновенная доставка по email, без записи.',
 ARRAY['monatsprognose', 'monat', 'prognose', '19', 'прогноз', 'месяц'], 6),

('package', 'tagesprognose', 'Tagesprognose', 'Прогноз на день',
 'Die Tagesprognose kostet 14 Euro. Detaillierte Prognose fuer einen bestimmten Tag. Ideal fuer wichtige Termine oder Entscheidungen. Sofort per E-Mail.',
 'Прогноз на день стоит 14 евро. Детальный прогноз на определённый день. Идеально для важных встреч или решений. Мгновенная доставка по email.',
 ARRAY['tagesprognose', 'tag', 'prognose', '14', 'прогноз', 'день'], 5),

-- ===================== FREE CONSULTATION =====================
('service', 'free_consultation', 'Kostenloses Erstgespraech', 'Бесплатная вводная консультация',
 'Das kostenlose 15-Minuten Erstgespraech mit Swetlana Wagner ist voellig unverbindlich. Lernen Sie die Numerologie kennen und finden Sie heraus, welches Paket am besten zu Ihnen passt. Buchung ueber Cal.com unter dem Link: cal.com/swetlana-wagner-vn81pp/бесплатная-консультация',
 'Бесплатная 15-минутная вводная консультация со Светланой Вагнер абсолютно без обязательств. Познакомьтесь с нумерологией и узнайте, какой пакет подходит вам лучше всего. Запись через Cal.com по ссылке: cal.com/swetlana-wagner-vn81pp/бесплатная-консультация',
 ARRAY['kostenlos', 'erstgespraech', 'gratis', 'unverbindlich', 'frei', 'бесплатно', 'консультация', 'вводная'], 10),

-- ===================== ABOUT =====================
('about', 'swetlana', 'Ueber Swetlana Wagner', 'О Светлане Вагнер',
 'Swetlana Wagner ist zertifizierte Numerologin mit ueber 10 Jahren Erfahrung und mehr als 500 abgeschlossenen Beratungen. Sie ist auf die Pythagoras Psychomatrix spezialisiert und hat 11 Fachzertifikate. Die Beratungen finden per Zoom oder Telegram statt, auf Deutsch und Russisch.',
 'Светлана Вагнер — сертифицированный нумеролог с более чем 10-летним опытом и более 500 проведённых консультаций. Специализируется на Психоматрице Пифагора, имеет 11 профессиональных сертификатов. Консультации проводятся по Zoom или Telegram, на немецком и русском языках.',
 ARRAY['swetlana', 'wagner', 'numerologin', 'erfahrung', 'zertifiziert', 'светлана', 'вагнер', 'нумеролог', 'опыт'], 9),

('about', 'psychomatrix', 'Was ist die Psychomatrix', 'Что такое Психоматрица',
 'Die Psychomatrix nach Pythagoras analysiert 9 Positionen: Charakter, Energie, Kreativitaet, Gesundheit, Logik, Arbeit, Glueck, Pflicht und Intelligenz. Dazu 3 Zeilen (Zielstrebigkeit, Familie, Stabilitaet), 3 Spalten (Selbstwert, Arbeit und Geld, Talent) und 2 Diagonalen (Spiritualitaet, Temperament). Alles basierend auf Ihrem Geburtsdatum. Es ist keine Wahrsagerei, sondern eine systematische Persoenlichkeitsanalyse basierend auf mathematischen Mustern.',
 'Психоматрица Пифагора анализирует 9 позиций: Характер, Энергия, Творчество, Здоровье, Логика, Труд, Удача, Долг и Интеллект. Плюс 3 строки (Целеустремлённость, Семья, Стабильность), 3 столбца (Самооценка, Работа и Деньги, Талант) и 2 диагонали (Духовность, Темперамент). Всё на основе даты рождения. Это не гадание, а систематический анализ личности на основе математических паттернов.',
 ARRAY['psychomatrix', 'pythagoras', 'numerologie', 'matrix', 'geburtsdatum', 'analyse', 'психоматрица', 'пифагор', 'нумерология', 'матрица'], 9),

-- ===================== SERVICE INFO =====================
('service', 'how_it_works', 'Wie funktioniert eine Beratung', 'Как проходит консультация',
 'Die Beratung findet per Zoom oder Telegram Video statt. Sie dauert je nach Paket 90 bis 120 Minuten. Swetlana analysiert Ihre Psychomatrix anhand Ihres Geburtsdatums, erklaert alle Positionen und beantwortet Ihre persoenlichen Fragen. Sie brauchen kein Vorwissen, alles wird verstaendlich erklaert. Die Sitzung kann auf Wunsch aufgezeichnet werden.',
 'Консультация проводится по Zoom или Telegram видео. Длительность 90-120 минут в зависимости от пакета. Светлана анализирует Психоматрицу по дате рождения, объясняет все позиции и отвечает на личные вопросы. Предварительные знания не нужны, всё объясняется понятно. По желанию сессию можно записать.',
 ARRAY['beratung', 'ablauf', 'zoom', 'telegram', 'sitzung', 'wie', 'funktioniert', 'консультация', 'как', 'проходит'], 8),

('service', 'free_calculator', 'Kostenloser Psychomatrix-Rechner', 'Бесплатный калькулятор Психоматрицы',
 'Auf numerologie-pro.com/rechner koennen Sie kostenlos Ihre Psychomatrix berechnen lassen. Geben Sie einfach Ihr Geburtsdatum ein und erhalten sofort Ihre persoenliche Matrix mit Schicksalszahl. Die ersten 3 Positionen sind kostenlos sichtbar. Fuer die vollstaendige Analyse aller 9 Positionen erstellen Sie einfach ein kostenloses Konto.',
 'На numerologie-pro.com/rechner вы можете бесплатно рассчитать свою Психоматрицу. Просто введите дату рождения и получите свою персональную матрицу с числом судьбы. Первые 3 позиции видны бесплатно. Для полного анализа всех 9 позиций создайте бесплатный аккаунт.',
 ARRAY['rechner', 'calculator', 'kostenlos', 'gratis', 'berechnen', 'geburtsdatum', 'калькулятор', 'бесплатно', 'рассчитать'], 8),

('service', 'compatibility_calculator', 'Kompatibilitaetsrechner', 'Калькулятор совместимости',
 'Unter numerologie-pro.com/rechner/kompatibilitaet koennen Sie kostenlos die Kompatibilitaet zweier Personen berechnen. Geben Sie zwei Geburtsdaten ein und erhalten sofort einen Kompatibilitaets-Score mit detaillierter Analyse in 9 Dimensionen. Komplett kostenlos!',
 'На numerologie-pro.com/rechner/kompatibilitaet вы можете бесплатно рассчитать совместимость двух людей. Введите две даты рождения и получите оценку совместимости с детальным анализом по 9 параметрам. Совершенно бесплатно!',
 ARRAY['kompatibilitaet', 'kompatibilitaetsrechner', 'partner', 'vergleich', 'paar', 'совместимость', 'партнёр', 'пара'], 7),

-- ===================== ACCOUNT HELP =====================
('account', 'registration', 'Registrierung und Konto erstellen', 'Регистрация и создание аккаунта',
 'Sie koennen sich kostenlos auf numerologie-pro.com registrieren. Danach haben Sie Zugang zum vollstaendigen Rechner, Ihrem Dashboard mit Bestellungen, Sitzungen und PDFs.',
 'Вы можете бесплатно зарегистрироваться на numerologie-pro.com. После этого вы получите доступ к полному калькулятору, дашборду с заказами, сессиями и PDF.',
 ARRAY['registrierung', 'konto', 'anmelden', 'account', 'erstellen', 'регистрация', 'аккаунт', 'создать'], 7),

('account', 'login_issues', 'Login-Probleme und Passwort vergessen', 'Проблемы со входом и забытый пароль',
 'Wenn Sie sich nicht einloggen koennen, pruefen Sie bitte zuerst Ihre E-Mail und Ihr Passwort. Falls Sie Ihr Passwort vergessen haben, nutzen Sie die Passwort vergessen Funktion auf der Login-Seite. Bei weiteren Problemen schreiben Sie an info@numerologie-pro.com.',
 'Если вы не можете войти, сначала проверьте email и пароль. Если забыли пароль, используйте функцию Забыли пароль на странице входа. При других проблемах пишите на info@numerologie-pro.com.',
 ARRAY['login', 'passwort', 'vergessen', 'einloggen', 'anmelden', 'problem', 'вход', 'пароль', 'забыл', 'войти'], 7),

('account', 'dashboard', 'Dashboard-Funktionen', 'Функции дашборда',
 'Im Dashboard sehen Sie Ihre Bestellungen, gebuchte Sitzungen mit Meeting-Links, herunterladbare PDFs und Unterlagen, sowie Ihren persoenlichen Empfehlungscode fuer 15 Prozent Rabatt.',
 'В дашборде вы видите ваши заказы, забронированные сессии со ссылками на встречи, загружаемые PDF и материалы, а также ваш персональный код рекомендации на 15 процентов скидку.',
 ARRAY['dashboard', 'bestellungen', 'sitzungen', 'pdfs', 'дашборд', 'заказы', 'сессии'], 6),

-- ===================== PAYMENT =====================
('payment', 'methods', 'Zahlungsmethoden', 'Способы оплаты',
 'Wir akzeptieren alle gaengigen Zahlungsmethoden ueber Stripe: Kreditkarte, Debitkarte, Apple Pay, Google Pay. Die Zahlung ist SSL-verschluesselt und sicher.',
 'Мы принимаем все распространённые способы оплаты через Stripe: кредитные и дебетовые карты, Apple Pay, Google Pay. Оплата зашифрована SSL и безопасна.',
 ARRAY['zahlung', 'bezahlung', 'kreditkarte', 'apple', 'google', 'pay', 'stripe', 'оплата', 'карта'], 7),

('payment', 'cancellation', 'Stornierung und Widerruf', 'Отмена и возврат',
 'Bei digitalen Produkten wie PDFs gibt es kein Widerrufsrecht, da diese sofort geliefert werden. Beratungstermine koennen bis 24 Stunden vorher ueber Cal.com kostenlos storniert werden.',
 'Для цифровых продуктов (PDF) возврат невозможен, так как они доставляются мгновенно. Консультации можно отменить бесплатно за 24 часа через Cal.com.',
 ARRAY['stornierung', 'storno', 'widerruf', 'absagen', 'zurueck', 'отмена', 'возврат', 'отменить'], 7),

('payment', 'refund', 'Probleme mit Zahlungen', 'Проблемы с оплатой',
 'Wenn Sie Probleme mit einer Zahlung haben, wenden Sie sich bitte an info@numerologie-pro.com. Wir finden eine Loesung.',
 'Если у вас проблемы с оплатой, обратитесь по адресу info@numerologie-pro.com. Мы найдём решение.',
 ARRAY['problem', 'zahlung', 'fehler', 'rueckerstattung', 'проблема', 'оплата', 'ошибка'], 6),

-- ===================== REFERRAL =====================
('referral', 'program', 'Empfehlungsprogramm', 'Программа рекомендаций',
 'Mit unserem Empfehlungsprogramm erhalten Sie 15 Prozent Rabatt als Gutschein, wenn jemand ueber Ihren persoenlichen Link einen Kauf taetigt. Ihren Empfehlungslink finden Sie im Dashboard unter Empfehlungen. Sie koennen ihn per WhatsApp, Telegram oder E-Mail teilen. Die Anzahl der Empfehlungen ist unbegrenzt!',
 'С программой рекомендаций вы получаете купон на 15 процентов скидку, когда кто-то совершает покупку по вашей ссылке. Ссылку найдёте в дашборде в разделе Рекомендации. Можете поделиться через WhatsApp, Telegram или email. Количество не ограничено!',
 ARRAY['empfehlung', 'referral', 'rabatt', 'gutschein', '15', 'prozent', 'рекомендация', 'скидка', 'купон'], 7),

-- ===================== TELEGRAM =====================
('telegram', 'bot', 'Telegram-Bot', 'Telegram-бот',
 'Unser Telegram-Bot @NumerologieProBot bietet: kostenlose Tagesanalyse, Kompatibilitaets-Check, Zugang zu Ihren PDFs und Terminerinnerungen. Verbinden Sie Ihren Account im Dashboard unter Profil und dann Telegram.',
 'Наш Telegram-бот @NumerologieProBot предлагает: бесплатный анализ дня, проверку совместимости, доступ к PDF и напоминания о встречах. Свяжите аккаунт в дашборде: Профиль, затем Telegram.',
 ARRAY['telegram', 'bot', 'tagesanalyse', 'бот', 'телеграм', 'анализ'], 6),

-- ===================== CONTACT =====================
('contact', 'info', 'Kontaktdaten', 'Контактные данные',
 'E-Mail: info@numerologie-pro.com. Telefon: +49 1515 1668273. Website: numerologie-pro.com. Telegram: @NumerologieProBot. Adresse: Swetlana Wagner, Berliner Strasse 3, 51545 Waldbroel, Deutschland.',
 'Email: info@numerologie-pro.com. Телефон: +49 1515 1668273. Сайт: numerologie-pro.com. Telegram: @NumerologieProBot. Адрес: Swetlana Wagner, Berliner Strasse 3, 51545 Waldbroel, Deutschland.',
 ARRAY['kontakt', 'email', 'telefon', 'adresse', 'erreichen', 'контакт', 'телефон', 'адрес', 'связаться'], 8),

-- ===================== OBJECTION HANDLING =====================
('objection', 'too_expensive', 'Einwand: Zu teuer', 'Возражение: Слишком дорого',
 'Antwort bei Preiseinwand: Ich verstehe. Wissen Sie was, wir haben auch die PDF-Analyse fuer nur 9,99 Euro als guenstigen Einstieg. Oder Sie buchen erstmal das kostenlose 15-Minuten Erstgespraech mit Swetlana, ganz unverbindlich.',
 'Ответ на возражение о цене: Понимаю. Знаете что, у нас есть PDF-Анализ всего за 9,99 евро как доступное начало. Или запишитесь на бесплатную 15-минутную консультацию со Светланой, без обязательств.',
 ARRAY['teuer', 'preis', 'kosten', 'zu_viel', 'budget', 'дорого', 'цена', 'стоимость'], 8),

('objection', 'not_sure', 'Einwand: Unsicher', 'Возражение: Не уверен',
 'Antwort bei Unsicherheit: Das verstehe ich total. Genau dafuer gibt es das kostenlose Erstgespraech, 15 Minuten mit Swetlana, wo Sie alle Fragen stellen koennen. Ganz ohne Verpflichtung. Soll ich einen Termin buchen?',
 'Ответ на неуверенность: Полностью понимаю. Именно для этого есть бесплатная консультация, 15 минут со Светланой, где можно задать все вопросы. Без обязательств. Записать вас?',
 ARRAY['unsicher', 'weiss_nicht', 'vielleicht', 'ueberlegen', 'не_уверен', 'не_знаю', 'подумать'], 8),

('objection', 'no_time', 'Einwand: Keine Zeit', 'Возражение: Нет времени',
 'Antwort bei Zeitmangel: Kein Problem! Swetlana bietet auch Abend- und Wochenendtermine an. Wann wuerde es Ihnen am besten passen?',
 'Ответ на нехватку времени: Нет проблем! Светлана также проводит консультации по вечерам и в выходные. Когда вам было бы удобнее?',
 ARRAY['zeit', 'keine_zeit', 'busy', 'beschaeftigt', 'время', 'нет_времени', 'занят'], 8),

('objection', 'skeptical', 'Einwand: Skeptisch', 'Возражение: Скептицизм',
 'Antwort bei Skepsis: Das kann ich verstehen. Die Psychomatrix nach Pythagoras ist kein Hokuspokus, sondern eine systematische Persoenlichkeitsanalyse basierend auf mathematischen Mustern in Ihrem Geburtsdatum. Viele Kunden sind ueberrascht, wie treffend die Analyse ist. Probieren Sie die PDF-Analyse fuer 9,99 Euro, wenn es Sie nicht ueberzeugt, haben Sie kaum etwas riskiert.',
 'Ответ на скептицизм: Понимаю сомнения. Психоматрица Пифагора это не мистика, а систематический анализ на основе математических паттернов в дате рождения. Многие клиенты удивляются точности. Попробуйте PDF-Анализ за 9,99 евро, почти ничего не потеряете.',
 ARRAY['skeptisch', 'hokuspokus', 'glaube_nicht', 'unsinn', 'скептик', 'не_верю', 'ерунда'], 8),

-- ===================== FAQ =====================
('faq', 'scientific', 'Ist Numerologie wissenschaftlich?', 'Нумерология научна?',
 'Die Psychomatrix nach Pythagoras ist ein Werkzeug zur Selbstreflexion und Potenzialanalyse, basierend auf mathematischen Mustern. Es ist keine exakte Wissenschaft, aber viele Menschen sind ueberrascht, wie treffend die Beschreibungen sind.',
 'Психоматрица Пифагора — инструмент самопознания и анализа потенциала, основанный на математических паттернах. Это не точная наука, но многие люди удивляются, насколько точны описания.',
 ARRAY['wissenschaft', 'wissenschaftlich', 'beweis', 'serioes', 'наука', 'научно', 'доказательство'], 7),

('faq', 'future', 'Kann Numerologie die Zukunft vorhersagen?', 'Может ли нумерология предсказать будущее?',
 'Nein. Die Psychomatrix zeigt Ihr Potenzial und Ihre Persoenlichkeitsstruktur. Sie entscheiden selbst, was Sie damit machen. Es geht um Selbsterkenntnis, nicht um Prophezeiungen.',
 'Нет. Психоматрица показывает потенциал и структуру личности. Вы сами решаете, что с этим делать. Речь о самопознании, а не о предсказаниях.',
 ARRAY['zukunft', 'vorhersage', 'prophezeiung', 'hellsehen', 'будущее', 'предсказание', 'пророчество'], 7),

('faq', 'languages', 'In welcher Sprache finden Beratungen statt?', 'На каком языке проводятся консультации?',
 'Swetlana beraet auf Deutsch und Russisch. PDFs sind ebenfalls in beiden Sprachen verfuegbar.',
 'Светлана консультирует на немецком и русском. PDF также доступны на обоих языках.',
 ARRAY['sprache', 'deutsch', 'russisch', 'язык', 'немецкий', 'русский'], 6),

('faq', 'gift', 'Kann ich eine Beratung verschenken?', 'Можно ли подарить консультацию?',
 'Ja! Kontaktieren Sie uns unter info@numerologie-pro.com und wir erstellen einen personalisierten Geschenkgutschein.',
 'Да! Свяжитесь с нами по info@numerologie-pro.com, и мы создадим персонализированный подарочный сертификат.',
 ARRAY['geschenk', 'verschenken', 'gutschein', 'подарок', 'подарить', 'сертификат'], 6),

('faq', 'prerequisites', 'Brauche ich Vorkenntnisse?', 'Нужны ли предварительные знания?',
 'Nein, ueberhaupt nicht! Swetlana erklaert alles Schritt fuer Schritt. Die Beratung ist auch fuer komplette Anfaenger geeignet.',
 'Нет, совсем нет! Светлана объясняет всё пошагово. Консультация подходит и для полных новичков.',
 ARRAY['vorkenntnisse', 'anfaenger', 'wissen', 'voraussetzung', 'знания', 'новичок', 'начинающий'], 6),

-- ===================== RECOMMENDATION LOGIC =====================
('recommendation', 'relationship', 'Empfehlung bei Beziehungsfragen', 'Рекомендация при вопросах об отношениях',
 'Fuer Beziehungsfragen empfehle ich die Beziehungsmatrix fuer 119 Euro. In 90 Minuten analysiert Swetlana beide Psychomatrizen und zeigt die Dynamiken, Staerken und Herausforderungen der Partnerschaft.',
 'Для вопросов об отношениях рекомендую Матрицу отношений за 119 евро. За 90 минут Светлана проанализирует обе Психоматрицы и покажет динамику, сильные стороны и вызовы партнёрства.',
 ARRAY['beziehung', 'partner', 'ehe', 'liebe', 'partnerschaft', 'отношения', 'партнёр', 'любовь'], 9),

('recommendation', 'career', 'Empfehlung bei Beruf und Berufung', 'Рекомендация при вопросах о карьере',
 'Wenn Sie Ihre Berufung suchen, ist die Lebensbestimmung fuer 149 Euro genau richtig. Swetlana analysiert in 90 Minuten Ihre Lebensaufgabe und hilft, den wahren Weg zu finden.',
 'Если вы ищете своё призвание, Предназначение за 149 евро — именно то, что нужно. За 90 минут Светлана проанализирует жизненную задачу и поможет найти путь.',
 ARRAY['beruf', 'berufung', 'sinn', 'zweck', 'wendepunkt', 'карьера', 'призвание', 'смысл'], 9),

('recommendation', 'money', 'Empfehlung bei Finanzfragen', 'Рекомендация при финансовых вопросах',
 'Der Geldkanal fuer 99 Euro ist perfekt bei Finanzfragen. Swetlana analysiert in 90 Minuten Ihre finanziellen Muster und Blockaden und zeigt den Weg zu mehr Fuelle.',
 'Денежный канал за 99 евро идеально при финансовых вопросах. За 90 минут Светлана проанализирует финансовые паттерны и блоки и покажет путь к изобилию.',
 ARRAY['geld', 'finanzen', 'karriere', 'blockade', 'деньги', 'финансы', 'блок'], 9),

('recommendation', 'children', 'Empfehlung fuer Eltern', 'Рекомендация для родителей',
 'Fuer Eltern gibt es das Paket Mein Kind fuer 99 Euro. In 90 Minuten analysiert Swetlana die Psychomatrix des Kindes: Persoenlichkeit, Talente und Beduerfnisse.',
 'Для родителей есть пакет Мой ребёнок за 99 евро. За 90 минут Светлана проанализирует Психоматрицу ребёнка: личность, таланты и потребности.',
 ARRAY['kind', 'kinder', 'eltern', 'sohn', 'tochter', 'ребёнок', 'дети', 'родители'], 9),

('recommendation', 'forecast', 'Empfehlung fuer Zukunftsfragen', 'Рекомендация при вопросах о будущем',
 'Die Jahresprognose fuer 119 Euro gibt einen detaillierten Ausblick auf die naechsten 12 Monate mit guenstigen Zeitraeumen und Herausforderungen. Fuer 179 Euro gibt es sie auch mit einem ausfuehrlichen PDF-Report zum Nachlesen.',
 'Прогноз на год за 119 евро даёт детальный обзор следующих 12 месяцев с благоприятными периодами и вызовами. За 179 евро также получите подробный PDF-отчёт.',
 ARRAY['zukunft', 'prognose', 'jahr', '2026', '2027', 'будущее', 'прогноз', 'год'], 9),

('recommendation', 'growth', 'Empfehlung bei persoenlicher Entwicklung', 'Рекомендация для личностного роста',
 'Der Wachstumsplan fuer 99 Euro ist ideal fuer persoenliche Entwicklung. In 90 Minuten erstellt Swetlana den persoenlichen Entwicklungsplan mit konkreten Schritten.',
 'План роста за 99 евро идеально для личностного развития. За 90 минут Светлана составит персональный план развития с конкретными шагами.',
 ARRAY['wachstum', 'entwicklung', 'selbst', 'persoenlich', 'рост', 'развитие', 'самопознание'], 9),

('recommendation', 'beginner', 'Empfehlung fuer Einsteiger', 'Рекомендация для новичков',
 'Als Einstieg empfehle ich die Lebenskarte fuer 79 Euro, eine umfassende 2-Stunden Basisanalyse. Oder, wenn Sie erstmal reinschnuppern moechten, das kostenlose 15-Minuten Erstgespraech mit Swetlana. Fuer den allerguenstigsten Einstieg gibt es die PDF-Analyse fuer nur 9,99 Euro.',
 'Для начала рекомендую Карту жизни за 79 евро, комплексный 2-часовой базовый анализ. Или, если хотите сначала попробовать, бесплатную 15-минутную консультацию со Светланой. Для самого доступного начала есть PDF-Анализ за 9,99 евро.',
 ARRAY['anfang', 'einstieg', 'erste', 'neugierig', 'начало', 'впервые', 'новичок'], 9);
