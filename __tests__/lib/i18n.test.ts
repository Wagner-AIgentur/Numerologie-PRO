import { describe, it, expect } from 'vitest';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';

describe('getAdminT', () => {
  it('returns German translations for "de"', () => {
    const t = getAdminT('de');
    expect(t.dashboard).toBe('Dashboard');
    expect(t.logout).toBe('Abmelden');
  });

  it('returns Russian translations for "ru"', () => {
    const t = getAdminT('ru');
    expect(t.dashboard).toBe('Панель');
    expect(t.logout).toBe('Выйти');
  });

  it('falls back to German for unknown locale', () => {
    const t = getAdminT('en');
    expect(t.dashboard).toBe('Dashboard');
  });

  it('falls back to German for empty string', () => {
    const t = getAdminT('');
    expect(t.dashboard).toBe('Dashboard');
  });
});

describe('getDateLocale', () => {
  it('returns de-DE for German', () => {
    expect(getDateLocale('de')).toBe('de-DE');
  });

  it('returns ru-RU for Russian', () => {
    expect(getDateLocale('ru')).toBe('ru-RU');
  });

  it('returns ru-RU for any non-de locale', () => {
    expect(getDateLocale('en')).toBe('ru-RU');
  });
});
