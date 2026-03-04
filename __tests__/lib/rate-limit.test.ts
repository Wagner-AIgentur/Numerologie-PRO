import { describe, it, expect } from 'vitest';
import { safeCompare, getClientIp } from '@/lib/rate-limit';

describe('safeCompare', () => {
  it('returns true for matching strings', () => {
    expect(safeCompare('secret123', 'secret123')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(safeCompare('secret123', 'different')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(safeCompare('short', 'longer-string')).toBe(false);
  });

  it('returns false for empty vs non-empty', () => {
    expect(safeCompare('', 'notempty')).toBe(false);
  });

  it('returns true for empty vs empty', () => {
    expect(safeCompare('', '')).toBe(true);
  });
});

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '1.2.3.4, 5.6.7.8';
          return null;
        },
      },
    } as unknown as Request;

    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') return '10.0.0.1';
          return null;
        },
      },
    } as unknown as Request;

    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('returns unknown when no IP headers present', () => {
    const req = {
      headers: { get: () => null },
    } as unknown as Request;

    expect(getClientIp(req)).toBe('unknown');
  });
});
