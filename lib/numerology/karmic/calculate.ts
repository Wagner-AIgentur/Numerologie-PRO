/**
 * Karmic Numerology — Calculators
 *
 * 1. Birthday Code: day → arcana (day > 22 → day - 22)
 * 2. Self-Realization Code: full birthdate digit sum → arcana
 * 3. Karmic Knots Code: day arcana + month + year arcana → arcana
 * 4. Year Forecast: day + month + year digits → arcana
 */

import { getArcana, type ArcanaData } from './arcana-data';

// ─── Helpers ──────────────────────────────────────────────────────

function reduceTo22(n: number): number {
  while (n > 22) n -= 22;
  return n;
}

function digitSum(s: string): number {
  return s.split('').reduce((sum, ch) => {
    const d = parseInt(ch, 10);
    return isNaN(d) ? sum : sum + d;
  }, 0);
}

function parseBirthdate(birthdate: string): { day: number; month: number; year: number } {
  const parts = birthdate.split('.');
  if (parts.length !== 3) throw new Error('Invalid birthdate format. Expected DD.MM.YYYY');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) throw new Error('Invalid birthdate');
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    throw new Error('Birthdate values out of range');
  }
  return { day, month, year };
}

export interface BirthdayCodeResult {
  /** Original birth day (1-31) */
  day: number;
  /** Calculated arcana number (1-22) */
  arcanaNumber: number;
  /** Full arcana data */
  arcana: ArcanaData;
}

/**
 * Calculates the Birthday Code arcana from a birth day.
 *
 * @param day - Day of birth (1-31)
 * @param locale - 'de' or 'ru' (default 'ru')
 * @returns BirthdayCodeResult with arcana number and full data
 * @throws Error if day is out of valid range
 */
export function calculateBirthdayCode(
  day: number,
  locale: 'de' | 'ru' = 'ru'
): BirthdayCodeResult {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`Invalid birth day: ${day}. Must be between 1 and 31.`);
  }

  const arcanaNumber = day > 22 ? day - 22 : day;
  const arcana = getArcana(arcanaNumber, locale);

  return {
    day,
    arcanaNumber,
    arcana,
  };
}

// ─── Product 2: Self-Realization Code ─────────────────────────────

export interface SelfRealizationResult {
  birthdate: string;
  arcanaNumber: number;
  arcana: ArcanaData;
}

/**
 * Calculates the Self-Realization Code from a full birthdate.
 * Formula: sum all digits of DD.MM.YYYY, reduce to ≤ 22.
 *
 * @param birthdate - Full birthdate in DD.MM.YYYY format
 * @param locale - 'de' or 'ru'
 */
export function calculateSelfRealizationCode(
  birthdate: string,
  locale: 'de' | 'ru' = 'ru'
): SelfRealizationResult {
  const { day, month, year } = parseBirthdate(birthdate);
  const allDigits = `${day}${month}${year}`;
  const arcanaNumber = reduceTo22(digitSum(allDigits));
  const arcana = getArcana(arcanaNumber, locale);
  return { birthdate, arcanaNumber, arcana };
}

// ─── Product 3: Karmic Knots Code ────────────────────────────────

export interface KarmicKnotsResult {
  birthdate: string;
  arcanaNumber: number;
  arcana: ArcanaData;
  dayArcana: number;
  monthArcana: number;
  yearArcana: number;
}

/**
 * Calculates the Karmic Knots Code from a full birthdate.
 * Formula: day arcana + month + year digit sum → reduce to ≤ 22.
 *
 * @param birthdate - Full birthdate in DD.MM.YYYY format
 * @param locale - 'de' or 'ru'
 */
export function calculateKarmicKnotsCode(
  birthdate: string,
  locale: 'de' | 'ru' = 'ru'
): KarmicKnotsResult {
  const { day, month, year } = parseBirthdate(birthdate);
  const dayArcana = day > 22 ? day - 22 : day;
  const monthArcana = month;
  const yearArcana = reduceTo22(digitSum(String(year)));
  const arcanaNumber = reduceTo22(dayArcana + monthArcana + yearArcana);
  const arcana = getArcana(arcanaNumber, locale);
  return { birthdate, arcanaNumber, arcana, dayArcana, monthArcana, yearArcana };
}

// ─── Product 4: Year Forecast ────────────────────────────────────

export interface YearForecastResult {
  birthdate: string;
  year: number;
  arcanaNumber: number;
  arcana: ArcanaData;
}

/**
 * Calculates the Year Forecast arcana for a specific year.
 * Formula: sum all digits of (day + month + year), reduce to ≤ 22.
 *
 * @param birthdate - Full birthdate in DD.MM.YYYY format
 * @param year - The year to forecast (e.g. 2026)
 * @param locale - 'de' or 'ru'
 */
export function calculateYearForecast(
  birthdate: string,
  year: number,
  locale: 'de' | 'ru' = 'ru'
): YearForecastResult {
  const { day, month } = parseBirthdate(birthdate);
  const allDigits = `${day}${month}${year}`;
  const arcanaNumber = reduceTo22(digitSum(allDigits));
  const arcana = getArcana(arcanaNumber, locale);
  return { birthdate, year, arcanaNumber, arcana };
}
