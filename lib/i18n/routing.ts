import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'ru'],
  defaultLocale: 'ru',
});
