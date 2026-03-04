/**
 * Shared PDF utilities V3 for all karmic numerology products.
 *
 * Design: Matches the Muster-PDF (Numerologie_SwetlanaWagner_GeburtstagsCode.pdf)
 * - Playfair Display (titles) + Poppins (body)
 * - Cover: Full-page photo background with overlaid text
 * - Content pages: Dark navy + teal gradient, gold accents
 * - ~10-12 pages per PDF, generous whitespace
 * - Arcana card images on description pages
 * - numerologie_pro watermark footer on every content page
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import {
  PDF_BACKGROUND,
  LOGO_FINAL,
  LOGO_CIRCLE,
  SWETLANA_PHOTO,
  SWETLANA_PORTRAIT,
  COVER_PHOTO,
  getArcanaImage,
} from './logo-base64';

export {
  PDF_BACKGROUND,
  LOGO_FINAL,
  LOGO_CIRCLE,
  SWETLANA_PHOTO,
  SWETLANA_PORTRAIT,
  COVER_PHOTO,
  getArcanaImage,
};

// ─── Color Palette ────────────────────────────────────────────────

export const COLORS = {
  gold: '#D4AF37',
  goldLight: 'rgba(212, 175, 55, 0.15)',
  white: '#ffffff',
  white90: 'rgba(255, 255, 255, 0.92)',
  white80: 'rgba(255, 255, 255, 0.85)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white10: 'rgba(255, 255, 255, 0.1)',
  darkNavy: '#051A24',
  darkOverlay: 'rgba(5, 26, 36, 0.75)',
  red: '#c0392b',
  redBg: 'rgba(192, 57, 43, 0.1)',
};

// ─── Helpers ──────────────────────────────────────────────────────

export function splitTraits(text: string): string[] {
  return text
    .split(/[.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

export type Locale = 'de' | 'ru';

// ─── SVG Icons (inline, no external deps) ─────────────────────────

export const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
export const ICON_TELEGRAM = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;
export const ICON_FACEBOOK = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
export const ICON_YOUTUBE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
export const ICON_WHATSAPP = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ─── V4 CSS Styles — matching reference PDF ───────────────────────
// Reference: Gilroy-Medium 19pt, line-height 23pt, paragraph gap 46pt
// Margins: left ~28mm, top ~56mm, bottom ~18mm
// Design: Simple white text on dark background, no decorative boxes

export function getStyles(bgDataUri: string): string {
  return `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      color: ${COLORS.white};
      background: ${COLORS.darkNavy};
      font-weight: 500;
      font-size: 16pt;
      line-height: 1.55;
    }

    /* ─── Content page with background image ─── */
    .page {
      position: relative;
      width: 210mm;
      height: 297mm;
      padding: 40mm 26mm 22mm 28mm;
      background-image: url('${bgDataUri}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      page-break-after: always;
      overflow: hidden;
    }

    /* ─── Thin border frame (subtle) ─── */
    .page-frame {
      display: none;
    }

    /* ═══════════════════════════════════════════
       COVER PAGE (photo background)
       ═══════════════════════════════════════════ */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40mm 28mm;
      background-size: cover;
      background-position: center;
    }
    .cover-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(
        180deg,
        rgba(5, 26, 36, 0.55) 0%,
        rgba(5, 26, 36, 0.35) 40%,
        rgba(5, 26, 36, 0.55) 100%
      );
      z-index: 0;
    }
    .cover > * { position: relative; z-index: 1; }

    .cover-logo {
      width: 130px; height: 130px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 28px;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }
    .cover-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 700;
      color: ${COLORS.white};
      margin-bottom: 12px;
      line-height: 1.15;
      letter-spacing: 4px;
      text-transform: uppercase;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
    }
    .cover-subtitle {
      font-size: 14px;
      color: ${COLORS.white70};
      margin-bottom: 36px;
      max-width: 420px;
      line-height: 1.6;
      letter-spacing: 1px;
    }
    .cover-divider {
      display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
    }
    .cover-divider-line {
      width: 60px; height: 1px;
      background: linear-gradient(to right, transparent, ${COLORS.white60});
    }
    .cover-divider-line.right {
      background: linear-gradient(to left, transparent, ${COLORS.white60});
    }
    .cover-divider-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${COLORS.white60};
    }
    .cover-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 30px; font-weight: 700;
      color: ${COLORS.white};
      margin-bottom: 6px;
      text-shadow: 0 1px 10px rgba(0, 0, 0, 0.4);
    }
    .cover-label {
      font-size: 11px; text-transform: uppercase;
      letter-spacing: 3px; color: ${COLORS.white50};
      margin-bottom: 4px;
    }
    .cover-birthdate {
      font-size: 20px; font-weight: 600;
      color: ${COLORS.white};
      margin-bottom: 24px;
    }
    .cover-arcana-badge {
      display: inline-block; padding: 12px 28px;
      border: 2px solid ${COLORS.white50};
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 30px;
    }
    .cover-arcana-badge span {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px; font-weight: 700;
      color: ${COLORS.white};
    }
    .cover-extra {
      font-size: 16px; color: ${COLORS.white70};
      margin-bottom: 22px;
    }
    .cover-year {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 60px; font-weight: 700;
      color: ${COLORS.white};
      margin-bottom: 20px;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
    }
    .cover-formula {
      font-size: 16px; color: ${COLORS.white70};
      margin-bottom: 36px;
    }
    .cover-footer {
      position: absolute; bottom: 22px; left: 0; right: 0;
      text-align: center; font-size: 11px;
      color: ${COLORS.white40}; z-index: 1;
    }

    /* ═══════════════════════════════════════════
       CONTENT PAGES
       ═══════════════════════════════════════════ */
    .page-header {
      display: none;
    }

    .content { position: relative; z-index: 1; }

    .section-title {
      font-weight: 600;
      font-size: 16pt;
      color: ${COLORS.white};
      margin-bottom: 18pt;
      line-height: 1.55;
    }

    .section-subtitle {
      font-weight: 600;
      font-size: 16pt;
      color: ${COLORS.white};
      margin-bottom: 12pt;
      line-height: 1.55;
    }

    .section-text {
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
      margin-bottom: 0;
    }
    .section-text p {
      margin-bottom: 18pt;
    }
    .section-text p:last-child { margin-bottom: 0; }

    /* ─── Trait lists (simple bullet style like reference) ─── */
    .trait-list {
      list-style: none;
      padding: 0;
      margin: 6pt 0 18pt 0;
    }
    .trait-list li {
      position: relative;
      padding: 1pt 0 1pt 20pt;
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
    }
    .trait-list li::before {
      content: '\\2022';
      position: absolute;
      left: 0;
      color: ${COLORS.white};
      font-size: 16pt;
    }
    .trait-list.negative li::before { color: ${COLORS.white}; }

    /* ─── Highlight box (simplified — just paragraph with emphasis) ─── */
    .highlight-box {
      margin: 18pt 0;
      padding: 0;
      background: none;
      border: none;
      border-radius: 0;
    }
    .highlight-box p {
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
      font-style: normal;
    }
    .highlight-box.warning {
      border: none;
      background: none;
    }

    /* ─── Calculation box (simplified) ─── */
    .calc-box {
      margin: 18pt 0;
      padding: 0;
      background: none;
      border: none;
      border-radius: 0;
    }
    .calc-box p {
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
      margin-bottom: 12pt;
    }
    .calc-box .calc-example {
      margin-top: 12pt;
      padding: 0;
      background: none;
      border-radius: 0;
      font-size: 16pt;
      color: ${COLORS.white};
      font-weight: 600;
    }

    /* ─── Profession tags (simplified to list) ─── */
    .profession-grid {
      display: flex; flex-wrap: wrap; gap: 6pt; margin: 8pt 0 18pt 0;
    }
    .profession-tag {
      display: inline-block; padding: 2pt 0;
      border: none; border-radius: 0;
      background: none;
      font-size: 16pt;
      color: ${COLORS.white};
    }
    .profession-tag::before { content: '\\2022  '; }

    /* ─── Arcana card image ─── */
    .arcana-card-wrapper {
      float: right; margin: 0 0 16pt 20pt;
    }
    .arcana-card {
      width: 130pt; height: auto;
      border-radius: 6px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .arcana-card-label {
      text-align: center; font-size: 10pt;
      color: ${COLORS.white50};
      margin-top: 4pt; font-style: italic;
    }

    /* ─── Cross-sell (simplified) ─── */
    .cross-sell-item {
      margin: 18pt 0;
      padding: 0;
      background: none;
      border: none;
      border-radius: 0;
    }
    .cross-sell-item h4 {
      font-weight: 700;
      font-size: 16pt;
      color: ${COLORS.white};
      margin-bottom: 4pt;
    }
    .cross-sell-item p {
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
    }

    /* ═══════════════════════════════════════════
       THANK YOU PAGE
       ═══════════════════════════════════════════ */
    .thank-you {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center;
      padding: 40mm 28mm;
    }
    .thank-you-photo {
      width: 160px; height: 160px; border-radius: 50%;
      object-fit: cover; object-position: center 15%;
      margin-bottom: 28px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    .thank-you-title {
      font-weight: 700;
      font-size: 18pt;
      color: ${COLORS.white};
      margin-bottom: 18pt;
      line-height: 1.4;
    }
    .thank-you-text {
      font-size: 16pt;
      line-height: 1.55;
      color: ${COLORS.white};
      max-width: 480px;
      margin-bottom: 28pt;
    }
    .thank-you-divider {
      display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
    }
    .thank-you-divider-line {
      width: 60px; height: 1px;
      background: linear-gradient(to right, transparent, ${COLORS.white60});
    }
    .thank-you-divider-line.right {
      background: linear-gradient(to left, transparent, ${COLORS.white60});
    }
    .thank-you-divider-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${COLORS.white60};
    }
    .social-title {
      font-weight: 600;
      font-size: 16pt;
      color: ${COLORS.white};
      margin-bottom: 16pt;
    }
    .social-links {
      display: flex; gap: 14px; margin-bottom: 24px;
      justify-content: center; flex-wrap: wrap;
    }
    .social-link {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 18px; border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.05);
      color: ${COLORS.white}; font-size: 12pt; font-weight: 500;
      text-decoration: none;
    }
    .social-link svg { width: 16px; height: 16px; fill: ${COLORS.white}; }
    .contact-info { margin-top: 8px; }
    .contact-info p {
      font-size: 12pt; line-height: 1.8; color: ${COLORS.white70};
    }
    .contact-info a {
      color: ${COLORS.white}; text-decoration: underline; font-weight: 500;
    }

    /* ─── Footers ─── */
    .page-footer {
      position: absolute; bottom: 14mm; left: 28mm; right: 26mm;
      display: flex; justify-content: space-between;
      font-size: 9pt; color: ${COLORS.white40}; z-index: 1;
    }
    .page-watermark {
      position: absolute; bottom: 14mm; left: 0; right: 0;
      text-align: center;
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 11pt; color: ${COLORS.white20}; z-index: 1;
      letter-spacing: 2px;
    }
  `;
}

// ─── Shared i18n for thank-you page ───────────────────────────────

const THANK_YOU_T = {
  de: {
    title: 'Vielen Dank!',
    text: 'Ich danke dir für dein Interesse an der Numerologie und an deinem inneren Code. Du kannst noch mehr über dich erfahren.',
    socialTitle: 'Ich lade dich in meine sozialen Netzwerke ein',
    socialClosing: 'Bis zum nächsten Mal und zur bewussten Entfaltung deines Codes',
    websiteLabel: 'Webseite',
    emailLabel: 'E-Mail',
  },
  ru: {
    title: 'Благодарю вас!',
    text: 'Благодарю вас за интерес к нумерологии и к своему внутреннему коду. Вы можете узнать о себе ещё больше.',
    socialTitle: 'Я приглашаю вас в мои социальные сети',
    socialClosing: 'До новых встреч и осознанного раскрытия вашего кода',
    websiteLabel: 'Сайт',
    emailLabel: 'Почта',
  },
};

// ─── Shared Thank-You Page Generator ──────────────────────────────

export function generateThankYouPage(locale: Locale): string {
  const t = THANK_YOU_T[locale];
  return `
    <div class="page thank-you">
      <div class="page-frame"></div>

      <img class="thank-you-photo" src="${SWETLANA_PORTRAIT}" alt="Swetlana Wagner" />

      <div class="thank-you-title">${t.title}</div>
      <div class="thank-you-text">${t.text}</div>

      <div class="thank-you-divider">
        <div class="thank-you-divider-line"></div>
        <div class="thank-you-divider-dot"></div>
        <div class="thank-you-divider-line right"></div>
      </div>

      <div class="social-title">${t.socialTitle}</div>

      <div class="social-links">
        <span class="social-link">${ICON_TELEGRAM} Telegram</span>
        <span class="social-link">${ICON_FACEBOOK} Facebook</span>
        <span class="social-link">${ICON_INSTAGRAM} Instagram</span>
        <span class="social-link">${ICON_YOUTUBE} YouTube</span>
      </div>

      <div class="contact-info" style="margin-bottom: 10px;">
        <p style="font-size: 13px; color: ${COLORS.white60};">@numerologie_pro</p>
      </div>

      <div class="contact-info">
        <p>${t.websiteLabel}: <a href="https://numerologie-pro.de">numerologie-pro.de</a></p>
        <p>${t.emailLabel}: <a href="mailto:info@numerologie-pro.de">info@numerologie-pro.de</a></p>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 14px; line-height: 1.7; font-style: italic; color: ${COLORS.white50};">
        <p>${t.socialClosing}</p>
      </div>

      <div class="cover-footer">&copy; ${new Date().getFullYear()} Numerologie PRO &nbsp;&middot;&nbsp; Swetlana Wagner</div>
    </div>
  `;
}

// ─── Shared HTML Snippets ─────────────────────────────────────────

export function pageFrame(): string {
  return '<div class="page-frame"></div>';
}

export function pageHeader(
  arcanaLabel: string,
  arcanaNumber: number,
  arcanaName: string
): string {
  return `
    <div class="page-header">
      <img class="page-header-logo" src="${LOGO_CIRCLE}" alt="" />
      <span class="page-header-arcana">${arcanaLabel} ${arcanaNumber} — ${arcanaName}</span>
    </div>
  `;
}

export function pageFooter(
  leftText: string,
  pageNum: number
): string {
  return `
    <div class="page-footer">
      <span>${leftText}</span>
      <span>${pageNum}</span>
    </div>
    <div class="page-watermark">numerologie_pro</div>
  `;
}

export function arcanaCardHtml(
  arcanaNumber: number,
  arcanaLabel: string
): string {
  const imageUri = getArcanaImage(arcanaNumber);
  return `
    <div class="arcana-card-wrapper">
      <img class="arcana-card" src="${imageUri}" alt="${arcanaLabel} ${arcanaNumber}" />
      <div class="arcana-card-label">${arcanaLabel} ${arcanaNumber}</div>
    </div>
  `;
}

export function coverPage(opts: {
  coverPhotoUri: string;
  title: string;
  subtitle: string;
  customerName: string;
  birthdate: string;
  arcanaLabel: string;
  arcanaNumber: number;
  arcanaName: string;
  preparedForLabel: string;
  birthdateLabel: string;
  createdOnLabel: string;
  todayFormatted: string;
  extraHtml?: string;
}): string {
  return `
    <div class="page cover" style="background-image: url('${opts.coverPhotoUri}');">
      <div class="cover-overlay"></div>
      <div class="page-frame" style="border-color: ${COLORS.white20};"></div>

      <img class="cover-logo" src="${LOGO_FINAL}" alt="Numerologie PRO" />

      <div class="cover-title">${opts.title}</div>
      <div class="cover-subtitle">${opts.subtitle}</div>

      <div class="cover-divider">
        <div class="cover-divider-line"></div>
        <div class="cover-divider-dot"></div>
        <div class="cover-divider-line right"></div>
      </div>

      <div class="cover-label">${opts.preparedForLabel}</div>
      <div class="cover-name">${opts.customerName}</div>

      <div class="cover-label" style="margin-top: 16px;">${opts.birthdateLabel}</div>
      <div class="cover-birthdate">${opts.birthdate}</div>

      ${opts.extraHtml || ''}

      <div class="cover-arcana-badge">
        <span>${opts.arcanaLabel} ${opts.arcanaNumber} — ${opts.arcanaName}</span>
      </div>

      <div class="cover-footer">${opts.createdOnLabel} ${opts.todayFormatted} &nbsp;&middot;&nbsp; numerologie-pro.de</div>
    </div>
  `;
}

// ─── Local Chrome Detection (Development) ────────────────────────

const LOCAL_CHROME_PATHS = [
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
    : '',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);

async function findLocalChrome(): Promise<string | null> {
  const fs = await import('fs');
  for (const p of LOCAL_CHROME_PATHS) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;
    } catch {
      // not found, try next
    }
  }
  return null;
}

// ─── PDF Renderer V3 ─────────────────────────────────────────────

export async function renderPdf(
  pages: string[],
  locale: Locale,
  execPath?: string
): Promise<Buffer> {
  const htmlLang = locale === 'de' ? 'de' : 'ru';
  const fullHTML = `
    <!DOCTYPE html>
    <html lang="${htmlLang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>${getStyles(PDF_BACKGROUND)}</style>
      </head>
      <body>${pages.join('\n')}</body>
    </html>
  `;

  if (process.env.NODE_ENV === 'development') {
    const fs = await import('fs');
    const pathMod = await import('path');
    const debugPath = pathMod.join(process.cwd(), 'debug-output.html');
    fs.writeFileSync(debugPath, fullHTML, 'utf-8');
    console.log(`[PDF] Debug HTML saved to: ${debugPath}`);
  }

  // Resolve Chromium executable: explicit path > local Chrome (dev) > @sparticuz/chromium (serverless)
  let executablePath: string;
  let isLocal = false;

  // Detect serverless: Vercel sets AWS_LAMBDA_FUNCTION_NAME, VERCEL, or VERCEL_ENV
  const isServerless = !!(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.VERCEL_ENV
  );

  if (execPath) {
    executablePath = execPath;
    isLocal = true;
  } else if (!isServerless) {
    // Local development — use system Chrome
    const localChrome = await findLocalChrome();
    if (!localChrome) {
      throw new Error(
        'No Chrome browser found. Install Google Chrome for local PDF generation.'
      );
    }
    executablePath = localChrome;
    isLocal = true;
  } else {
    // Serverless (Vercel/Lambda) — use @sparticuz/chromium
    executablePath = await chromium.executablePath();
  }

  const browser = await puppeteer.launch({
    args: isLocal
      ? [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--single-process',
        ]
      : [...chromium.args, '--disable-gpu', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1920, height: 1080 },
    executablePath,
    headless: isLocal ? true : (chromium.headless ?? true),
    timeout: 30_000,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHTML, { waitUntil: 'domcontentloaded' });
    // Wait for Google Fonts to fully load (with 8s timeout for serverless cold starts)
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, 8000)),
    ]);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
