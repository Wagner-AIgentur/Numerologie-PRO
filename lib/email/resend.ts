import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing via environment variables.');
}

export const resend = new Resend(apiKey || '');
