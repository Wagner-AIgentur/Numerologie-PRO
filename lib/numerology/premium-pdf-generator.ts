import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { MatrixResult } from '@/lib/numerology/calculate';
import { getDateLocale } from '@/lib/i18n/admin';

/**
 * Generate Cover Page HTML as plain string (no React)
 */
function generateCoverPageHTML(
  birthdate: string,
  locale: 'de' | 'ru',
  customerName?: string
): string {
  const title = locale === 'de'
    ? 'Ihre persönliche Numerologie-Analyse'
    : 'Ваш личный нумерологический анализ';

  const subtitle = locale === 'de'
    ? 'Eine tiefgehende Interpretation Ihrer Psychomatrix'
    : 'Глубокая интерпретация вашей психоматрицы';

  const forLabel = locale === 'de' ? 'Für' : 'Для';
  const createdLabel = locale === 'de' ? 'Erstellt am' : 'Создано';
  const birthdateLabel = locale === 'de' ? 'Geburtsdatum' : 'Дата рождения';

  const displayName = customerName || (locale === 'de' ? 'Sie' : 'Вас');
  const today = new Date().toLocaleDateString(getDateLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return `
    <div class="relative min-h-[297mm] flex flex-col items-center justify-center bg-gradient-to-br from-[#051A24] via-[#0a2533] to-[#051A24] text-white p-16" style="page-break-after: always;">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold blur-3xl"></div>
      </div>

      <!-- Logo -->
      <div class="relative z-10 mb-12">
        <div class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-gold/10 backdrop-blur-sm">
          <span class="font-serif text-5xl font-bold text-gold">NP</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="relative z-10 font-serif text-5xl font-bold text-center mb-4 leading-tight">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-gold to-white">
          NUMEROLOGIE PRO
        </span>
      </h1>

      <!-- Subtitle -->
      <h2 class="relative z-10 font-sans text-2xl text-white/80 text-center mb-16 max-w-2xl">
        ${title}
      </h2>

      <!-- Divider -->
      <div class="relative z-10 flex items-center gap-4 mb-16">
        <div class="h-px w-24 bg-gradient-to-r from-transparent to-gold"></div>
        <div class="h-2 w-2 rounded-full bg-gold"></div>
        <div class="h-px w-24 bg-gradient-to-l from-transparent to-gold"></div>
      </div>

      <!-- For Name -->
      <div class="relative z-10 text-center mb-12">
        <p class="text-sm uppercase tracking-widest text-white/50 mb-2">${forLabel}</p>
        <p class="font-serif text-4xl font-bold text-gold">${displayName}</p>
      </div>

      <!-- Birthdate -->
      <div class="relative z-10 flex items-center justify-center gap-6 mb-24">
        <div class="text-center">
          <p class="text-xs uppercase tracking-widest text-white/50 mb-2">
            ${birthdateLabel}
          </p>
          <p class="font-mono text-2xl font-bold text-white">${birthdate}</p>
        </div>
      </div>

      <!-- Subtitle Text -->
      <p class="relative z-10 text-center text-white/60 max-w-lg text-sm leading-relaxed">
        ${subtitle}
      </p>

      <!-- Footer -->
      <div class="absolute bottom-12 left-0 right-0 z-10 text-center">
        <p class="text-xs text-white/40">
          ${createdLabel} ${today}
        </p>
        <p class="text-xs text-white/40 mt-2">
          numerologie-pro.de
        </p>
      </div>
    </div>
  `;
}

export async function generatePremiumPDF(
  result: MatrixResult,
  birthdate: string,
  locale: 'de' | 'ru' = 'de',
  customerName?: string
): Promise<Buffer> {
  // 1. Generate Cover Page HTML (no React)
  const coverPageHTML = generateCoverPageHTML(birthdate, locale, customerName);

  // 2. Generate inline Tailwind CSS (minimal for PDF)
  const tailwindCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .font-serif {
      font-family: 'Cormorant', Georgia, serif;
    }

    .font-sans {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .font-mono {
      font-family: 'Courier New', monospace;
    }

    /* Tailwind Utility Classes */
    .min-h-\\[297mm\\] { min-height: 297mm; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .text-center { text-align: center; }
    .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-\\[\\#051A24\\] { --tw-gradient-from: #051A24; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(5, 26, 36, 0)); }
    .via-\\[\\#0a2533\\] { --tw-gradient-stops: var(--tw-gradient-from), #0a2533, var(--tw-gradient-to, rgba(10, 37, 51, 0)); }
    .to-\\[\\#051A24\\] { --tw-gradient-to: #051A24; }
    .text-white { color: #ffffff; }
    .p-16 { padding: 4rem; }
    .mb-12 { margin-bottom: 3rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-16 { margin-bottom: 4rem; }
    .mb-24 { margin-bottom: 6rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .font-bold { font-weight: 700; }
    .uppercase { text-transform: uppercase; }
    .tracking-widest { letter-spacing: 0.1em; }
    .leading-tight { line-height: 1.25; }
    .leading-relaxed { line-height: 1.625; }
    .rounded-full { border-radius: 9999px; }
    .border-4 { border-width: 4px; }
    .border-gold { border-color: #d4af37; }
    .bg-gold\\/10 { background-color: rgba(212, 175, 55, 0.1); }
    .text-gold { color: #d4af37; }
    .text-white\\/80 { color: rgba(255, 255, 255, 0.8); }
    .text-white\\/60 { color: rgba(255, 255, 255, 0.6); }
    .text-white\\/50 { color: rgba(255, 255, 255, 0.5); }
    .text-white\\/40 { color: rgba(255, 255, 255, 0.4); }
    .bg-gold { background-color: #d4af37; }
    .opacity-5 { opacity: 0.05; }
    .blur-3xl { filter: blur(64px); }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .max-w-2xl { max-width: 42rem; }
    .max-w-lg { max-width: 32rem; }
    .h-32 { height: 8rem; }
    .w-32 { width: 8rem; }
    .h-2 { height: 0.5rem; }
    .w-2 { width: 0.5rem; }
    .h-px { height: 1px; }
    .w-24 { width: 6rem; }
    .w-96 { width: 24rem; }
    .h-96 { height: 24rem; }
    .absolute { position: absolute; }
    .relative { position: relative; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .z-10 { z-index: 10; }
    .bottom-12 { bottom: 3rem; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }
    .top-1\\/4 { top: 25%; }
    .left-1\\/4 { left: 25%; }
    .bottom-1\\/4 { bottom: 25%; }
    .right-1\\/4 { right: 25%; }
    .bg-clip-text { -webkit-background-clip: text; background-clip: text; }
    .text-transparent { color: transparent; }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .bg-gradient-to-l { background-image: linear-gradient(to left, var(--tw-gradient-stops)); }
    .from-transparent { --tw-gradient-from: transparent; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0, 0, 0, 0)); }
    .to-gold { --tw-gradient-to: #d4af37; }
    .from-white { --tw-gradient-from: #ffffff; }
    .from-gold { --tw-gradient-from: #d4af37; }
    .via-gold { --tw-gradient-stops: var(--tw-gradient-from), #d4af37, var(--tw-gradient-to, rgba(212, 175, 55, 0)); }
  `;

  // 3. Wrap in full HTML document
  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          ${tailwindCSS}
        </style>
      </head>
      <body>
        ${coverPageHTML}
      </body>
    </html>
  `;

  // 4. Launch Puppeteer (Vercel Serverless compatible)
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // 5. Set content & wait for fonts
    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

    // 6. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    await browser.close();
    throw error;
  }
}
