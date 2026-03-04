import { Metadata } from 'next';

const BASE_URL = 'https://numerologie-pro.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const routePath = '/widerruf';
  const title =
    locale === 'ru'
      ? 'Право на отзыв'
      : 'Widerrufsbelehrung';
  const description =
    locale === 'ru'
      ? 'Информация о праве на отзыв для клиентов Numerologie PRO — 14 дней на возврат, условия для консультаций и PDF-анализов.'
      : 'Widerrufsbelehrung für Kunden von Numerologie PRO — 14 Tage Widerrufsrecht, Hinweise zu Beratungsleistungen und PDF-Analysen.';

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

export default function WiderrufPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container max-w-3xl">
        <h1 className="heading-gold mb-8">Widerrufsbelehrung</h1>

        <div className="card-premium p-8 space-y-8">
          {/* Widerrufsrecht */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Widerrufsrecht f&uuml;r Verbraucher
            </h2>
            <p className="text-white/90 leading-relaxed italic mb-4">
              Verbraucher ist jede nat&uuml;rliche Person, die ein Rechtsgesch&auml;ft zu Zwecken
              abschlie&szlig;t, die &uuml;berwiegend weder ihrer gewerblichen noch ihrer
              selbst&auml;ndigen beruflichen T&auml;tigkeit zugerechnet werden k&ouml;nnen.
            </p>
            <p className="text-white/90 leading-relaxed">
              Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gr&uuml;nden diesen Vertrag zu
              widerrufen. Die Widerrufsfrist betr&auml;gt 14 Tage ab dem Tag des
              Vertragsabschlusses.
            </p>
          </section>

          {/* Ausübung */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Aus&uuml;bung des Widerrufsrechts
            </h2>
            <p className="text-white/90 leading-relaxed">
              Um Ihr Widerrufsrecht auszu&uuml;ben, m&uuml;ssen Sie uns mittels einer eindeutigen
              Erkl&auml;rung (z.&thinsp;B. ein mit der Post versandter Brief oder eine E-Mail)
              &uuml;ber Ihren Entschluss, diesen Vertrag zu widerrufen, informieren:
              <br /><br />
              Numerologie PRO
              <br />
              Swetlana Wagner
              <br />
              Berliner Stra&szlig;e 3
              <br />
              51545 Waldbr&ouml;l
              <br />
              Telefon: +49 1515 1668273
              <br />
              E-Mail: info@numerologie-pro.com
              <br /><br />
              Sie k&ouml;nnen daf&uuml;r das unten stehende Muster-Widerrufsformular verwenden, das
              jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie
              die Mitteilung &uuml;ber die Aus&uuml;bung des Widerrufsrechts vor Ablauf der
              Widerrufsfrist absenden.
            </p>
          </section>

          {/* Folgen */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Folgen des Widerrufs
            </h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
              erhalten haben, einschlie&szlig;lich der Lieferkosten (mit Ausnahme der zus&auml;tzlichen
              Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns
              angebotene, g&uuml;nstigste Standardlieferung gew&auml;hlt haben), unverz&uuml;glich und
              sp&auml;testens binnen vierzehn Tagen ab dem Tag zur&uuml;ckzuzahlen, an dem die
              Mitteilung &uuml;ber Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              F&uuml;r diese R&uuml;ckzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
              urspr&uuml;nglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
              ausdr&uuml;cklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
              R&uuml;ckzahlung Entgelte berechnet.
            </p>
            <p className="text-white/90 leading-relaxed">
              Haben Sie verlangt, dass die Dienstleistung w&auml;hrend der Widerrufsfrist beginnen
              soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu
              dem Zeitpunkt, zu dem Sie uns von der Aus&uuml;bung des Widerrufsrechts hinsichtlich
              dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum
              Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
            </p>
          </section>

          {/* Besondere Hinweise für Beratungsleistungen */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Besondere Hinweise f&uuml;r Beratungsleistungen
            </h2>
            <p className="text-white/90 leading-relaxed mb-4">
              F&uuml;r unsere Beratungspakete (Zoom-/Telegram-Sitzungen) gilt:
              Ihr Widerrufsrecht erlischt vorzeitig, wenn Sie ausdr&uuml;cklich
              zugestimmt haben, dass wir mit der Ausf&uuml;hrung der Beratung
              vor Ablauf der Widerrufsfrist beginnen, und Sie best&auml;tigt haben,
              dass Sie durch diese Zustimmung Ihr Widerrufsrecht verlieren
              (&sect;&thinsp;356 Abs.&thinsp;4 BGB).
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              F&uuml;r PDF-Analysen (digitale Inhalte): Das Widerrufsrecht
              erlischt, wenn die Ausf&uuml;hrung mit Ihrer Zustimmung begonnen
              hat und Sie best&auml;tigt haben, dass Ihr Widerrufsrecht damit
              erlischt (&sect;&thinsp;356 Abs.&thinsp;5 BGB).
            </p>
            <p className="text-white/90 leading-relaxed">
              <strong>Stornierung vor Leistungsbeginn:</strong> Bis zum Beginn
              der Beratung (Zoom-Call) k&ouml;nnen Sie jederzeit kostenfrei
              stornieren. Kontaktieren Sie uns unter info@numerologie-pro.com
              oder +49&thinsp;1515&thinsp;1668273.
            </p>
          </section>

          {/* Hinweis zur Numerologie-Beratung */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Hinweis zur Numerologie-Beratung
            </h2>
            <p className="text-white/90 leading-relaxed">
              Die Numerologie-Beratung dient der Pers&ouml;nlichkeitsentwicklung
              und Selbstreflexion. Sie ersetzt keine medizinische, psychologische,
              therapeutische oder juristische Beratung. Es werden keine
              Heilversprechen gegeben.
            </p>
          </section>

          {/* Muster-Formular */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              Muster-Widerrufsformular
            </h2>
            <p className="text-white/90 leading-relaxed mb-4 italic">
              Wenn Sie den Vertrag widerrufen wollen, dann f&uuml;llen Sie bitte dieses Formular aus
              und senden Sie es zur&uuml;ck.
            </p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
              <p className="text-white/90 leading-relaxed">
                An:
                <br />
                Numerologie PRO
                <br />
                Berliner Stra&szlig;e 3
                <br />
                51545 Waldbr&ouml;l
                <br />
                E-Mail: info@numerologie-pro.com
              </p>
              <p className="text-white/90 leading-relaxed">
                Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag
                &uuml;ber die Erbringung der folgenden Dienstleistung:
              </p>
              <p className="text-white/90 leading-relaxed">
                _____________________________________________
              </p>
              <p className="text-white/90 leading-relaxed">
                Bestellt am (*) / Erhalten am (*): _______________
              </p>
              <p className="text-white/90 leading-relaxed">
                Name und Anschrift des/der Verbraucher(s): _______________
              </p>
              <p className="text-white/90 leading-relaxed">
                Datum: _______________
              </p>
              <p className="text-white/90 leading-relaxed">
                Unterschrift (nur bei schriftlichem Widerruf): _______________
              </p>
              <p className="text-white/90 leading-relaxed text-sm text-white/50 mt-4">
                (*) Unzutreffendes streichen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
