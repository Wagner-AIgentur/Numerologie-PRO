'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { Instagram, Send, MessageCircle, Lock, CreditCard, Cookie } from 'lucide-react';

/* ─── Payment brand pill ─── */
function PaymentPill({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm ${
        wide ? 'px-4' : 'px-3'
      }`}
    >
      {children}
    </div>
  );
}

/* ─── Brand label (text-based logos) ─── */
function BrandLabel({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <span
      className={`text-[11px] leading-none tracking-wide ${
        bold ? 'font-extrabold' : 'font-semibold'
      }`}
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      {children}
    </span>
  );
}

/* ─── SVG payment icons ─── */

function VisaIcon() {
  return (
    <PaymentPill>
      <svg viewBox="0 0 750 471" className="h-[18px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M278.2 334.2l33.4-195.7h53.3l-33.4 195.7H278.2zm246.8-190.8c-10.5-4-27.1-8.3-47.7-8.3-52.6 0-89.7 26.5-89.9 64.4-.3 28 26.5 43.7 46.8 53 20.7 9.6 27.7 15.7 27.6 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.3 0-32.6-3-50.2-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.5 10.2 59.4 10.5 56 0 92.3-26.2 92.7-66.7.2-22.2-14-39.1-44.8-53.1-18.6-9-30-15.1-29.9-24.2 0-8.1 9.7-16.8 30.5-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.3 7.2-42.5zm138.2-4.9h-41.1c-12.8 0-22.3 3.5-27.9 16.2l-79.2 179.3h56l11.2-29.3h68.4l6.5 29.3h49.4l-43.3-195.5zm-65.8 126.2c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 57.1h-44.7v-.6zM247.8 138.5L196 271.4l-5.5-26.8c-9.7-31-39.8-64.6-73.5-81.4l47.7 170.8 56.4-.1 83.9-195.4h-57.2"
          fill="#ffffff"
          opacity="0.7"
        />
      </svg>
    </PaymentPill>
  );
}

function MastercardIcon() {
  return (
    <PaymentPill>
      <svg viewBox="0 0 152 100" className="h-[18px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="52" cy="50" r="38" fill="#EB001B" opacity="0.6" />
        <circle cx="100" cy="50" r="38" fill="#F79E1B" opacity="0.5" />
      </svg>
    </PaymentPill>
  );
}

function AmexIcon() {
  return (
    <PaymentPill>
      <span className="text-[10px] font-black tracking-wider leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
        AMEX
      </span>
    </PaymentPill>
  );
}

function PayPalIcon() {
  return (
    <PaymentPill wide>
      <svg viewBox="0 0 124 33" className="h-[14px] w-auto" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M46.2 11.1h-5.8c-.4 0-.7.3-.8.7l-2.4 14.8c0 .3.2.6.5.6h2.8c.4 0 .7-.3.8-.7l.6-4c.1-.4.4-.7.8-.7h1.8c3.7 0 5.9-1.8 6.4-5.3.3-1.5 0-2.7-.7-3.6-.8-.9-2.2-1.4-4-1.4zm.7 5.2c-.3 2-.2 2-2.3 2H43l.6-3.7c0-.2.2-.4.5-.4h.7c.7 0 1.4 0 1.7.4.2.2.3.6.3 1.1v.6z"
          fill="#ffffff"
          opacity="0.55"
        />
        <path
          d="M68 11.1h-5.8c-.4 0-.7.3-.8.7l-2.3 14.8c0 .3.2.6.5.6h3c.3 0 .5-.2.5-.5l.7-4.2c.1-.4.4-.7.8-.7h1.8c3.7 0 5.9-1.8 6.4-5.3.3-1.5 0-2.7-.7-3.6-.8-.9-2.2-1.4-4.1-1.4zm.7 5.2c-.3 2-.2 2-2.3 2h-.6l.6-3.7c0-.2.3-.4.5-.4h.7c.7 0 1.4 0 1.7.4.2.2.3.6.2 1.1v.6z"
          fill="#ffffff"
          opacity="0.45"
        />
        <path
          d="M83.6 16.2h-2.8c-.2 0-.5.1-.5.4l-.1.8-.2-.3c-.6-.9-2-1.2-3.4-1.2-3.2 0-5.9 2.4-6.4 5.8-.3 1.7.1 3.3 1.1 4.4.9 1 2.2 1.4 3.8 1.4 2.7 0 4.1-1.7 4.1-1.7l-.1.8c0 .3.2.6.5.6h2.5c.4 0 .7-.3.8-.7l1.5-9.5c0-.4-.2-.6-.5-.6h.1zm-4.2 5.6c-.3 1.6-1.5 2.7-3.2 2.7-.8 0-1.5-.3-1.9-.7-.4-.5-.6-1.2-.5-1.9.2-1.6 1.6-2.7 3.1-2.7.8 0 1.5.3 1.9.7.5.5.6 1.2.6 1.9z"
          fill="#ffffff"
          opacity="0.55"
        />
        <path
          d="M99.8 16.2H97c-.3 0-.5.1-.7.3l-3.8 5.6-1.6-5.4c-.1-.3-.4-.5-.8-.5h-2.8c-.4 0-.6.3-.5.7l3.1 9-2.9 4.1c-.2.3 0 .8.4.8h2.8c.3 0 .5-.1.7-.3l9.2-13.3c.2-.4 0-.8-.4-.8l.1-.2z"
          fill="#ffffff"
          opacity="0.55"
        />
      </svg>
    </PaymentPill>
  );
}

function KlarnaIcon() {
  return (
    <PaymentPill>
      <span className="text-[11px] font-black tracking-tight leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
        klarna.
      </span>
    </PaymentPill>
  );
}

function LinkIcon() {
  return (
    <PaymentPill>
      <svg viewBox="0 0 24 24" className="h-[14px] w-auto mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 17L17 7M17 7H8M17 7V16" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <BrandLabel>Link</BrandLabel>
    </PaymentPill>
  );
}

function AmazonPayIcon() {
  return (
    <PaymentPill wide>
      <span className="text-[10px] font-bold tracking-tight leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
        amazon<span className="font-normal"> pay</span>
      </span>
    </PaymentPill>
  );
}

function RevolutIcon() {
  return (
    <PaymentPill wide>
      <span className="text-[10px] font-bold tracking-wide leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Revolut
      </span>
    </PaymentPill>
  );
}

function BancontactIcon() {
  return (
    <PaymentPill wide>
      <BrandLabel>Bancontact</BrandLabel>
    </PaymentPill>
  );
}

function EpsIcon() {
  return (
    <PaymentPill>
      <span className="text-[11px] font-black tracking-wide leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
        eps
      </span>
    </PaymentPill>
  );
}

function BillieIcon() {
  return (
    <PaymentPill>
      <BrandLabel bold>Billie</BrandLabel>
    </PaymentPill>
  );
}

function SatispayIcon() {
  return (
    <PaymentPill>
      <BrandLabel bold>Satispay</BrandLabel>
    </PaymentPill>
  );
}

/* TikTok icon (not available in lucide-react) */
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.19 8.19 0 0 0 4.76 1.52V6.8a4.84 4.84 0 0 1-1-.11z" />
    </svg>
  );
}

const quickLinks = [
  { href: '/', key: 'home' },
  { href: '/rechner', key: 'calculator' },
  { href: '/pakete', key: 'packages' },
  { href: '/ueber-mich', key: 'about' },
  { href: '/zertifikate', key: 'certificates' },
] as const;

export default function Footer() {
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const pathname = usePathname();
  const locale = useLocale();

  // Hide footer on dashboard and admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative border-t border-gold/20">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Logo Banner + Tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-banner-ru.png"
                alt="Numerologie PRO — Swetlana Wagner"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {tFooter('tagline')}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
              {tFooter('quickLinks')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
              {tFooter('legal')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('imprint')}
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/widerruf"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('cancellation')}
                </Link>
              </li>
              <li>
                <Link
                  href="/impressum-social-media"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('imprintSocial')}
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz-social-media"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  {tFooter('privacySocial')}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem('numerologie-cookie-consent');
                    window.location.reload();
                  }}
                  className="flex items-center gap-1.5 text-sm text-white/60 hover:text-gold transition-colors duration-200"
                >
                  <Cookie className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {tFooter('cookieSettings')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Social */}
          <div>
            <h4 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
              Social
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/numerologie_pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://t.me/numerologie_pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-all duration-200"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
              <a
                href="https://wa.me/4915151668273"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@numerologie_pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-all duration-200"
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods strip */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col items-center gap-6">
          {/* Secure payment label */}
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              {tFooter('securePayment')}
            </span>
          </div>

          {/* Payment icons — 2 rows on mobile, wrapped */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PayPalIcon />
            <KlarnaIcon />
            <LinkIcon />
            <AmazonPayIcon />
            <RevolutIcon />
            <BancontactIcon />
            <EpsIcon />
            <SatispayIcon />
            <BillieIcon />
          </div>

          {/* Powered by Stripe */}
          <div className="flex items-center gap-2 text-white/30">
            <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Powered by Stripe</span>
          </div>

          {/* Copyright */}
          <div className="w-full border-t border-white/5 pt-4">
            <p className="text-xs text-white/40 text-center">
              © {new Date().getFullYear()} Numerologie PRO. {tFooter('copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
