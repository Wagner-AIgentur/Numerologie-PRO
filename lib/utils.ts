import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse JSON from a Request body.
 * Returns { data, error } to avoid unhandled exceptions from malformed JSON.
 */
export async function safeParseJSON<T = unknown>(
  request: Request
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const data = await request.json();
    return { data: data as T, error: null };
  } catch {
    return { data: null, error: 'Invalid JSON body' };
  }
}
