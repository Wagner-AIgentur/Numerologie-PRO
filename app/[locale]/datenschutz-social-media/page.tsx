import { Metadata } from 'next';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export const metadata: Metadata = {
  title: 'Datenschutz Social Media | Numerologie PRO',
  robots: { index: false, follow: false },
};

export default function DatenschutzSocialMediaPage() {
  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Datenschutzerklärung für Social-Media-Auftritte
          </h1>

          <div className="prose-custom space-y-6 text-white/70 text-sm leading-relaxed">
            <p>
              <strong className="text-white/90">Verantwortliche:</strong><br />
              Swetlana Wagner<br />
              Berliner Straße 3<br />
              51545 Waldbröl<br />
              E-Mail: info@numerologie-pro.com<br />
              Telefon: +49 1515 1668273
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">1. Umfang der Datenverarbeitung</h2>
            <p>
              Wir betreiben Social-Media-Seiten auf den folgenden Plattformen, um mit Kunden, Interessenten und Nutzern zu kommunizieren und über unsere Leistungen zu informieren:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white/90">Instagram:</strong> <a href="https://www.instagram.com/numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">@numerologie_pro</a></li>
              <li><strong className="text-white/90">TikTok:</strong> <a href="https://www.tiktok.com/@numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">@numerologie_pro</a></li>
              <li><strong className="text-white/90">YouTube:</strong> <a href="https://youtube.com/@numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">@numerologie_pro</a></li>
              <li><strong className="text-white/90">Telegram:</strong> <a href="https://t.me/numerologie_pro" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">@numerologie_pro</a></li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8">2. Datenverarbeitung durch die sozialen Netzwerke</h2>
            <p>
              Wir haben keinen Einfluss auf die Datenverarbeitung durch die Betreiber der sozialen Netzwerke. Grundsätzlich verarbeiten die Netzwerke Ihre Daten zu Marktforschungs- und Werbezwecken. Die Netzwerke erstellen Nutzungsprofile, die unter anderem für die Platzierung von Werbung innerhalb und außerhalb der Netzwerke genutzt werden.
            </p>
            <p>
              Für weitere Informationen verweisen wir auf die Datenschutzerklärungen der jeweiligen Plattformen:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><a href="https://privacycenter.instagram.com/policy" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">Instagram/Meta Datenschutzrichtlinie</a></li>
              <li><a href="https://www.tiktok.com/legal/privacy-policy-eea" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">TikTok Datenschutzrichtlinie</a></li>
              <li><a href="https://policies.google.com/privacy" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">YouTube/Google Datenschutzrichtlinie</a></li>
              <li><a href="https://telegram.org/privacy" className="text-gold hover:text-gold-light transition-colors" target="_blank" rel="noopener noreferrer">Telegram Datenschutzrichtlinie</a></li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8">3. Rechtsgrundlage</h2>
            <p>
              Die Datenverarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer effektiven Information und Kommunikation gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">4. Unsere Datenverarbeitung</h2>
            <p>
              Wenn Sie auf unseren Social-Media-Seiten einen Beitrag kommentieren, eine Nachricht senden oder anderweitig mit uns interagieren, verarbeiten wir die dabei anfallenden Daten (z.B. Ihren Nutzernamen, ggf. Kommentarinhalt, Profilbild) zur Beantwortung Ihres Anliegens.
            </p>
            <p>
              Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">5. Ihre Rechte</h2>
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über die bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8">6. Beschwerderecht</h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8">7. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz auf unseren Social-Media-Auftritten wenden Sie sich bitte an:<br />
              Swetlana Wagner<br />
              E-Mail: <a href="mailto:info@numerologie-pro.com" className="text-gold hover:text-gold-light transition-colors">info@numerologie-pro.com</a><br />
              Telefon: +49 1515 1668273
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
