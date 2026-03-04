// Numerologie PRO — Service Packages
// These map to Stripe products and the products table in Supabase

export const PACKAGES = {
  beziehungsmatrix: {
    key: 'beziehungsmatrix',
    name_de: 'Beziehungsmatrix',
    name_ru: 'Матрица отношений',
    price_cents: 11900,
    currency: 'eur',
    duration_minutes: 90,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/карта-отношении',
  },
  lebensbestimmung: {
    key: 'lebensbestimmung',
    name_de: 'Lebensbestimmung',
    name_ru: 'Предназначение',
    price_cents: 14900,
    currency: 'eur',
    duration_minutes: 90,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/предназначение-и-реализация',
  },
  wachstumsplan: {
    key: 'wachstumsplan',
    name_de: 'Wachstumsplan',
    name_ru: 'План роста',
    price_cents: 9900,
    currency: 'eur',
    duration_minutes: 90,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/личностныи-рост-инструкция-к-самому-себе',
  },
  mein_kind: {
    key: 'mein_kind',
    name_de: 'Mein Kind',
    name_ru: 'Мой ребёнок',
    price_cents: 9900,
    currency: 'eur',
    duration_minutes: 90,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/мои-ребенок',
  },
  geldkanal: {
    key: 'geldkanal',
    name_de: 'Geldkanal',
    name_ru: 'Денежный канал',
    price_cents: 9900,
    currency: 'eur',
    duration_minutes: 90,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/денежныи-канал',
  },
  jahresprognose: {
    key: 'jahresprognose',
    name_de: 'Jahresprognose',
    name_ru: 'Прогноз на год',
    price_cents: 11900,
    currency: 'eur',
    duration_minutes: 120,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/прогноз-на-год',
  },
  jahresprognose_pdf: {
    key: 'jahresprognose_pdf',
    name_de: 'Jahresprognose + PDF',
    name_ru: 'Прогноз на год + PDF',
    price_cents: 17900,
    currency: 'eur',
    duration_minutes: 120,
    is_consultation: true,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/прогноз-на-год',
  },
  monatsprognose: {
    key: 'monatsprognose',
    name_de: 'Monatsprognose',
    name_ru: 'Прогноз на месяц',
    price_cents: 1900,
    currency: 'eur',
    duration_minutes: 0,
    is_consultation: false,
    cal_link: null,
  },
  tagesprognose: {
    key: 'tagesprognose',
    name_de: 'Tagesprognose',
    name_ru: 'Прогноз на день',
    price_cents: 1400,
    currency: 'eur',
    duration_minutes: 0,
    is_consultation: false,
    cal_link: null,
  },
  lebenskarte: {
    key: 'lebenskarte',
    name_de: 'Lebenskarte – Basisanalyse',
    name_ru: 'Карта жизни — базовый разбор',
    price_cents: 7900,
    currency: 'eur',
    duration_minutes: 120,
    is_consultation: false,
    cal_link: 'https://cal.com/swetlana-wagner-vn81pp/карта-жизни-базовыи-разбор',
  },
  pdf_analyse: {
    key: 'pdf_analyse',
    name_de: 'PDF-Analyse',
    name_ru: 'PDF-Анализ',
    price_cents: 999,
    currency: 'eur',
    duration_minutes: 0,
    is_consultation: false,
    cal_link: null,
  },
} as const;

export type PackageKey = keyof typeof PACKAGES;

// Free consultation Cal.com link (used across the site)
export const FREE_CONSULTATION_CAL_LINK =
  'https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация';

// Cal.com path for embed popup (without domain)
export const FREE_CONSULTATION_CAL_PATH =
  'swetlana-wagner-vn81pp/бесплатная-консультация';

// Resolves UI-facing package keys (camelCase) to canonical keys (snake_case)
// The packages page and homepage use different keys than the API
export const UI_KEY_TO_PACKAGE_KEY: Record<string, PackageKey> = {
  beziehungskarte: 'beziehungsmatrix',
  bestimmung: 'lebensbestimmung',
  wachstum: 'wachstumsplan',
  meinKind: 'mein_kind',
  geldkanal: 'geldkanal',
  jahresprognose: 'jahresprognose',
  monatsprognose: 'monatsprognose',
  tagesprognose: 'tagesprognose',
  lebenskarte: 'lebenskarte',
};
