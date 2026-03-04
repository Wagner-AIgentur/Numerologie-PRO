import { Metadata } from 'next';

const BASE_URL = 'https://numerologie-pro.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const routePath = '/impressum';
  const title =
    locale === 'ru'
      ? 'Импрессум'
      : 'Impressum';
  const description =
    locale === 'ru'
      ? 'Импрессум Numerologie PRO — Светлана Вагнер, Berliner Straße 3, 51545 Waldbröl. Контакт: info@numerologie-pro.com.'
      : 'Impressum von Numerologie PRO — Swetlana Wagner, Berliner Straße 3, 51545 Waldbröl. Kontakt: info@numerologie-pro.com.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}${routePath}`,
      languages: {
        de: `${BASE_URL}/de${routePath}`,
        ru: `${BASE_URL}/ru${routePath}`,
        uk: `${BASE_URL}/ru${routePath}`,
        'x-default': `${BASE_URL}/de${routePath}`,
      },
    },
  };
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container max-w-3xl">
        <h1 className="heading-gold mb-8">Impressum</h1>

        <div className="card-premium p-8 space-y-6">
          {/* eRecht24 Basis */}
          <div>
            <p className="text-white/90 leading-relaxed">
              Swetlana Wagner
              <br />
              Pers&ouml;nliche Beratungen Online und vor Ort f&uuml;r Numerologie Analysen
              <br />
              Berliner Stra&szlig;e 3
              <br />
              51545 Waldbr&ouml;l
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gold mb-2">Kontakt</h2>
            <p className="text-white/90 leading-relaxed">
              Telefon: +49 1515 1668273
              <br />
              E-Mail: info@numerologie-pro.com
            </p>
            <p className="text-white/90 leading-relaxed mt-2">
              Umsatzsteuer: Steuerbefreit gem&auml;&szlig; &sect;19 UStG.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gold mb-2">
              Verantwortlich f&uuml;r den Inhalt
            </h2>
            <p className="text-white/90 leading-relaxed">
              Inhaltlich verantwortlich gem&auml;&szlig; &sect;18 Abs. 2 MStV:
              <br />
              Swetlana Wagner, Berliner Stra&szlig;e 3, 51545 Waldbr&ouml;l
            </p>
          </div>


          {/* eRecht24 */}
          <div>
            <h2 className="text-xl font-semibold text-gold mb-2">
              Verbraucher&shy;streit&shy;beilegung / Universal&shy;schlichtungs&shy;stelle
            </h2>
            <p className="text-white/90 leading-relaxed">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
              vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          {/* eRecht24 — Sprachen korrigiert: Russisch statt Englisch, Verordnungsnummer korrigiert */}
          <div>
            <h2 className="text-xl font-semibold text-gold mb-2">
              Zentrale Kontaktstelle nach dem Digital Services Act &ndash; DSA (Verordnung (EU) 2022/2065)
            </h2>
            <p className="text-white/90 leading-relaxed">
              Unsere zentrale Kontaktstelle f&uuml;r Nutzer und Beh&ouml;rden nach Art. 11, 12 DSA
              erreichen Sie wie folgt:
            </p>
            <p className="text-white/90 leading-relaxed mt-2">
              E-Mail: info@numerologie-pro.com
              <br />
              Telefon: +49 1515 1668273
            </p>
            <p className="text-white/90 leading-relaxed mt-2">
              Die f&uuml;r den Kontakt zur Verf&uuml;gung stehenden Sprachen sind: Deutsch, Russisch.
            </p>
          </div>

          {/* Ergänzung: Haftungsausschluss — wichtig für Numerologie-Beratung */}
          <div>
            <h2 className="text-xl font-semibold text-gold mb-2">
              Haftungsausschluss
            </h2>
            <p className="text-white/90 leading-relaxed">
              Die Inhalte dieser Seiten wurden mit gr&ouml;&szlig;ter Sorgfalt erstellt. F&uuml;r
              die Richtigkeit, Vollst&auml;ndigkeit und Aktualit&auml;t der Inhalte k&ouml;nnen
              wir jedoch keine Gew&auml;hr &uuml;bernehmen. Die Numerologie-Beratung
              ersetzt keine medizinische, psychologische oder juristische
              Beratung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
