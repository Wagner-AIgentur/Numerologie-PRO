import { describe, it, expect } from 'vitest';
import { getPagination, paginatedResponse } from '@/lib/pagination';

function makeReq(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/test');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return { nextUrl: url } as any;
}

describe('getPagination', () => {
  it('returns defaults when no params provided', () => {
    const p = getPagination(makeReq());
    expect(p.page).toBe(1);
    expect(p.limit).toBe(25);
    expect(p.offset).toBe(0);
  });

  it('calculates offset from page number', () => {
    const p = getPagination(makeReq({ page: '3', limit: '10' }));
    expect(p.page).toBe(3);
    expect(p.limit).toBe(10);
    expect(p.offset).toBe(20);
  });

  it('caps limit at 100', () => {
    const p = getPagination(makeReq({ limit: '500' }));
    expect(p.limit).toBe(100);
  });

  it('handles negative page gracefully', () => {
    const p = getPagination(makeReq({ page: '-5' }));
    expect(p.page).toBe(1);
    expect(p.offset).toBe(0);
  });

  it('uses explicit offset when provided', () => {
    const p = getPagination(makeReq({ offset: '50', limit: '10' }));
    expect(p.offset).toBe(50);
    expect(p.limit).toBe(10);
  });

  it('handles non-numeric params', () => {
    const p = getPagination(makeReq({ page: 'abc', limit: 'xyz' }));
    expect(p.page).toBe(1);
    expect(p.limit).toBe(25);
  });
});

describe('paginatedResponse', () => {
  it('builds correct envelope', () => {
    const items = ['a', 'b', 'c'];
    const result = paginatedResponse(items, 30, { page: 2, limit: 10, offset: 10 });

    expect(result.data).toEqual(items);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(30);
    expect(result.pagination.totalPages).toBe(3);
  });

  it('calculates totalPages correctly with remainder', () => {
    const result = paginatedResponse([], 31, { page: 1, limit: 10, offset: 0 });
    expect(result.pagination.totalPages).toBe(4);
  });

  it('handles empty data', () => {
    const result = paginatedResponse([], 0, { page: 1, limit: 25, offset: 0 });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });
});
