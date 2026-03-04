/**
 * Shared pagination utilities for admin API routes.
 */

import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

/**
 * Extract pagination params from request URL search params.
 * Supports both `page` + `limit` and `offset` + `limit` patterns.
 */
export function getPagination(req: NextRequest): PaginationParams {
  const url = req.nextUrl;
  const rawPage = parseInt(url.searchParams.get('page') ?? '1', 10);
  const rawLimit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const rawOffset = url.searchParams.get('offset');

  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const limit = Math.min(MAX_LIMIT, Math.max(1, isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit));
  const offset = rawOffset !== null ? Math.max(0, parseInt(rawOffset, 10) || 0) : (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build a standard paginated response envelope.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}
