import { Metadata } from 'next';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export const metadata: Metadata = {
  title: 'Impressum Social Media | Numerologie PRO',
  robots: { index: false, follow: false },
};

export default function ImpressumSocialMediaPage() {
  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Impressum für Social-Media-Auftritte
          </h1>

          <div className="prose-custom space-y-6 text-white/70 text-sm leading-relaxed">
            <h2 className="text-xl font-semibold text-white">Angaben gemäß § 5 DDG / § 18 Abs. 2 MStV</h2>
            <p>
              <strong className="text-white/90">Swetlana Wagner</strong><br />
              Persönliche Beratungen Online und vor Ort für Numerologie Analysen
            </p>
            <p>
              Berliner Straße 3<br />
              51545 Waldbröl<br />
              Deutschland
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Kontakt</h2>
            <p>
              Telefon: +49 1515 1668273<br />
              E-Mail: <a href="mailto:info@numerologie-pro.com" className="text-gold hover:text-gold-light transition-colors">info@numerologie-pro.com</a><br />
              Sprachen: Deutsch, Englisch, Russisch
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Social-Media-Kanäle</h2>
            <p>Dieses Impressum gilt für folgende Social-Media-Auftritte:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><a href="https://www.instagram.com/numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">Instagram: @numerologie_pro</a></li>
              <li><a href="https://www.tiktok.com/@numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">TikTok: @numerologie_pro</a></li>
              <li><a href="https://youtube.com/@numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">YouTube: @numerologie_pro</a></li>
              <li><a href="https://t.me/numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">Telegram: @numerologie_pro</a></li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8">Zentrale Kontaktstelle (Digital Services Act)</h2>
            <p>
              Gemäß dem Digital Services Act (DSA) ist unsere zentrale Kontaktstelle für Nutzer und Behörden:<br />
              E-Mail: <a href="mailto:info@numerologie-pro.com" className="text-gold hover:text-gold-light transition-colors">info@numerologie-pro.com</a><br />
              Telefon: +49 1515 1668273<br />
              Verfügbare Sprachen: Deutsch, Englisch, Russisch
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Haftungsausschluss</h2>
            <p>
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links auf unseren Social-Media-Profilen. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Urheberrecht</h2>
            <p>
              Die durch uns erstellten Inhalte auf unseren Social-Media-Profilen unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Verbraucherstreitbeilegung</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">Datenschutz</h2>
            <p>
              Ausführliche Informationen zum Datenschutz unserer Social-Media-Auftritte finden Sie in unserer{' '}
              <a href="/datenschutz-social-media" className="text-gold hover:text-gold-light transition-colors">
                Datenschutzerklärung für Social-Media-Auftritte
              </a>.
            </p>

            <p className="text-white/40 text-xs mt-8">
              Stand: Februar 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
