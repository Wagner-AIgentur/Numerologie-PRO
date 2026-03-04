import { describe, it, expect } from 'vitest';
import {
  couponCreateSchema,
  dealCreateSchema,
  taskCreateSchema,
  sessionUpdateSchema,
  customerUpdateSchema,
  instagramSendSchema,
  zodErrorResponse,
} from '@/lib/validations/admin';

describe('couponCreateSchema', () => {
  it('accepts valid coupon', () => {
    const result = couponCreateSchema.safeParse({
      code: 'SUMMER2026',
      discount_type: 'percent',
      discount_value: 20,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty code', () => {
    const result = couponCreateSchema.safeParse({
      code: '',
      discount_type: 'percent',
      discount_value: 20,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid discount_type', () => {
    const result = couponCreateSchema.safeParse({
      code: 'TEST',
      discount_type: 'bogus',
      discount_value: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative discount_value', () => {
    const result = couponCreateSchema.safeParse({
      code: 'TEST',
      discount_type: 'fixed',
      discount_value: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe('dealCreateSchema', () => {
  it('accepts valid deal', () => {
    const result = dealCreateSchema.safeParse({
      profile_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Deal',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = dealCreateSchema.safeParse({
      profile_id: 'not-a-uuid',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('defaults stage to lead', () => {
    const result = dealCreateSchema.parse({
      profile_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
    });
    expect(result.stage).toBe('lead');
  });
});

describe('taskCreateSchema', () => {
  it('accepts minimal task', () => {
    const result = taskCreateSchema.safeParse({ title: 'Fix bug' });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = taskCreateSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('defaults priority to medium', () => {
    const data = taskCreateSchema.parse({ title: 'Test' });
    expect(data.priority).toBe('medium');
  });
});

describe('sessionUpdateSchema', () => {
  it('accepts valid update', () => {
    const result = sessionUpdateSchema.safeParse({
      status: 'completed',
      admin_notes: 'Went well',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = sessionUpdateSchema.safeParse({
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty object', () => {
    const result = sessionUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('customerUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = customerUpdateSchema.safeParse({
      full_name: 'Max Mustermann',
      language: 'de',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid language', () => {
    const result = customerUpdateSchema.safeParse({
      language: 'en',
    });
    expect(result.success).toBe(false);
  });
});

describe('instagramSendSchema', () => {
  it('accepts valid message', () => {
    const result = instagramSendSchema.safeParse({
      recipient_id: '12345',
      message: 'Hello!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = instagramSendSchema.safeParse({
      recipient_id: '12345',
      message: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('zodErrorResponse', () => {
  it('formats ZodError correctly', () => {
    const result = couponCreateSchema.safeParse({ code: '' });
    if (!result.success) {
      const formatted = zodErrorResponse(result.error);
      expect(formatted.error).toBe('Validation failed');
      expect(Array.isArray(formatted.details)).toBe(true);
      expect(formatted.details[0]).toHaveProperty('field');
      expect(formatted.details[0]).toHaveProperty('message');
    }
  });
});
