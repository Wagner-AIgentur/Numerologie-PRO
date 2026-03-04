import { describe, it, expect } from 'vitest';
import { calculateMatrix } from '@/lib/numerology/calculate';

describe('calculateMatrix', () => {
  it('returns a grid with keys 1-9', () => {
    const result = calculateMatrix(15, 6, 1990);
    for (let i = 1; i <= 9; i++) {
      expect(result.grid).toHaveProperty(String(i));
      expect(Array.isArray(result.grid[i])).toBe(true);
    }
  });

  it('returns four working numbers', () => {
    const result = calculateMatrix(15, 6, 1990);
    expect(result.workingNumbers).toHaveLength(4);
    result.workingNumbers.forEach((wn) => {
      expect(typeof wn).toBe('number');
      expect(wn).toBeGreaterThanOrEqual(0);
    });
  });

  it('correctly calculates working numbers for 15.06.1990', () => {
    const result = calculateMatrix(15, 6, 1990);
    // Birthdate digits: 1,5,0,6,1,9,9,0 → sum = 31
    expect(result.workingNumbers[0]).toBe(31);
    // Digit sum of 31 → 4
    expect(result.workingNumbers[1]).toBe(4);
    // 31 - (1 * 2) = 29
    expect(result.workingNumbers[2]).toBe(29);
    // Digit sum of 29 → 11
    expect(result.workingNumbers[3]).toBe(11);
  });

  it('places only non-zero digits into the grid', () => {
    const result = calculateMatrix(10, 1, 2000);
    // Zero should never appear in any grid position
    for (let pos = 1; pos <= 9; pos++) {
      result.grid[pos].forEach((digit) => {
        expect(digit).toBeGreaterThanOrEqual(1);
        expect(digit).toBeLessThanOrEqual(9);
      });
    }
  });

  it('computes line counts consistently', () => {
    const result = calculateMatrix(25, 12, 1985);
    const { rows, columns } = result.lines;

    // Total digits in rows should equal total digits in columns
    const rowSum = rows[0] + rows[1] + rows[2];
    const colSum = columns[0] + columns[1] + columns[2];
    expect(rowSum).toBe(colSum);
    expect(rowSum).toBe(result.totalDigits);
  });

  it('handles single-digit day correctly', () => {
    const result = calculateMatrix(5, 3, 1991);
    expect(result.grid).toBeDefined();
    expect(result.totalDigits).toBeGreaterThan(0);
  });

  it('handles day starting with 0 (e.g. 01)', () => {
    const result = calculateMatrix(1, 1, 2000);
    // First non-zero digit of day "1" is 1
    // wn3 = wn1 - (1 * 2)
    const wn1 = result.workingNumbers[0];
    expect(result.workingNumbers[2]).toBe(Math.abs(wn1 - 2));
  });

  it('returns deterministic results for same input', () => {
    const r1 = calculateMatrix(15, 6, 1990);
    const r2 = calculateMatrix(15, 6, 1990);
    expect(r1).toEqual(r2);
  });
});
