import { Metadata } from 'next';

const BASE_URL = 'https://numerologie-pro.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const routePath = '/agb';
  const title =
    locale === 'ru'
      ? 'Общие условия (AGB)'
      : 'Allgemeine Geschäftsbedingungen';
  const description =
    locale === 'ru'
      ? 'Общие условия предоставления услуг Numerologie PRO — нумерологические консультации онлайн и очно от Светланы Вагнер.'
      : 'Allgemeine Geschäftsbedingungen für Numerologie-Beratungen von Numerologie PRO — Swetlana Wagner. Online und vor Ort.';

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

export default function AGBPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container max-w-3xl">
        <h1 className="heading-gold mb-8">Allgemeine Gesch&auml;ftsbedingungen</h1>

        <div className="card-premium p-8 space-y-8">
          <p className="text-white/90 leading-relaxed">
            f&uuml;r die Erbringung von Dienstleistungen von Numerologie PRO, Berliner Stra&szlig;e 3,
            51545 Waldbr&ouml;l, E-Mail: info@numerologie-pro.com (nachfolgend
            &bdquo;Auftragnehmer&ldquo;) gegen&uuml;ber seinen Kunden (nachfolgend
            &bdquo;Auftraggeber&ldquo;)
          </p>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">1. Allgemeines</h2>
            <p className="text-white/90 leading-relaxed mb-2">
              1.1 Diese Allgemeinen Gesch&auml;ftsbedingungen (AGB) f&uuml;r die Erbringung von
              Dienstleistungen gelten f&uuml;r Vertr&auml;ge, die zwischen dem Auftraggeber und dem
              Auftragnehmer unter Einbeziehung dieser AGB geschlossen werden.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              1.2 Soweit neben diesen AGB weitere Vertragsdokumente oder andere
              Gesch&auml;ftsbedingungen in Text- oder Schriftform Vertragsbestandteil geworden sind,
              gehen die Regelungen dieser weiteren Vertragsdokumente im Widerspruchsfalle den
              vorliegenden AGB vor.
            </p>
            <p className="text-white/90 leading-relaxed">
              1.3 Von diesen Gesch&auml;ftsbedingungen abweichende AGB, die durch den Auftraggeber
              verwendet werden, erkennt Auftragnehmer &ndash; vorbehaltlich einer ausdr&uuml;cklichen
              Zustimmung &ndash; nicht an.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              2. Vertragsgegenstand und Leistungsumfang
            </h2>
            <p className="text-white/90 leading-relaxed mb-2">
              2.1 Der Auftragnehmer erbringt als selbst&auml;ndiger Unternehmer folgende Leistungen
              gegen&uuml;ber dem Auftraggeber: Pers&ouml;nliche Beratungen Online und vor Ort f&uuml;r
              Numerologie Analysen.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              2.2 Der spezifische Leistungsumfang ist Gegenstand von Individualvereinbarungen
              zwischen Auftragnehmer und dem Auftraggeber.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              2.3 Der Auftragnehmer erbringt die vertragsgem&auml;&szlig;en Leistungen mit
              gr&ouml;&szlig;tm&ouml;glicher Sorgfalt und Gewissenhaftigkeit nach dem jeweils neuesten
              Stand, neuesten Regeln und Erkenntnissen.
            </p>
            <p className="text-white/90 leading-relaxed">
              2.4 Der Auftragnehmer ist zur Erbringung der vertragsgem&auml;&szlig; geschuldeten
              Leistungen verpflichtet. Bei der Durchf&uuml;hrung seiner T&auml;tigkeit ist er jedoch
              etwaigen Weisungen im Hinblick auf die Art der Erbringung seiner Leistungen, den Ort
              der Leistungserbringung ebenso wie die Zeit der Leistungserbringung nicht unterworfen.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              3. Mitwirkungspflichten des Auftraggebers
            </h2>
            <p className="text-white/90 leading-relaxed">
              Es obliegt dem Auftraggeber, die von ihm zum Zwecke der Leistungserf&uuml;llung zur
              Verf&uuml;gung zu stellenden Informationen, Daten und sonstigen Inhalte vollst&auml;ndig
              und korrekt mitzuteilen. F&uuml;r Verz&ouml;gerungen und Versp&auml;tungen bei der
              Leistungserbringung, die durch eine versp&auml;tete und notwendige Mit- bzw. Zuarbeit
              des Kunden entstehen, ist der Auftragnehmer gegen&uuml;ber dem Kunden in keinerlei
              Hinsicht verantwortlich.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">4. Verg&uuml;tung</h2>
            <p className="text-white/90 leading-relaxed mb-2">
              4.1 Die Verg&uuml;tung wird individualvertraglich vereinbart.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              4.2 Die Verg&uuml;tung ist nach der Leistung der Dienste zu entrichten. Ist die
              Verg&uuml;tung nach Zeitabschnitten bemessen, so ist sie nach dem Ablauf der einzelnen
              Zeitabschnitte zu entrichten (&sect; 614 BGB).
            </p>
            <p className="text-white/90 leading-relaxed">
              4.3 Der Auftragnehmer stellt dem Auftraggeber nach Erbringung der Leistungen eine
              Rechnung per Post oder per E-Mail (z.&thinsp;B. als PDF). Die Verg&uuml;tung ist
              innerhalb von 14 Tagen nach Zugang der Rechnung zur Zahlung f&auml;llig.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              5. Haftung / Freistellung
            </h2>
            <p className="text-white/90 leading-relaxed mb-2">
              5.1 Der Auftragnehmer haftet aus jedem Rechtsgrund uneingeschr&auml;nkt bei Vorsatz
              oder grober Fahrl&auml;ssigkeit, bei vors&auml;tzlicher oder fahrl&auml;ssiger Verletzung
              des Lebens, des K&ouml;rpers oder der Gesundheit, aufgrund eines Garantieversprechens,
              soweit diesbez&uuml;glich nichts anderes geregelt ist oder aufgrund zwingender Haftung.
              Verletzt der Auftragnehmer fahrl&auml;ssig eine wesentliche Vertragspflicht, ist die
              Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p className="text-white/90 leading-relaxed">
              5.2 Der Auftraggeber stellt den Auftragnehmer von jeglichen Anspr&uuml;chen Dritter
              frei, die gegen den Auftragnehmer aufgrund von Verst&ouml;&szlig;en des Kunden gegen
              diese Vertragsbedingungen oder gegen geltendes Recht geltend gemacht werden.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              6. Vertragsdauer und K&uuml;ndigung
            </h2>
            <p className="text-white/90 leading-relaxed mb-2">
              6.1 Die Vertragsdauer und die Fristen zur ordentlichen K&uuml;ndigung vereinbaren die
              Parteien individuell.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              6.2 Das Recht beider Parteien zur fristlosen K&uuml;ndigung aus wichtigem Grund bleibt
              unber&uuml;hrt.
            </p>
            <p className="text-white/90 leading-relaxed">
              6.3 Der Auftragnehmer hat alle ihm &uuml;berlassenen Unterlagen und sonstigen Inhalte
              nach Vertragsbeendigung unverz&uuml;glich nach Wahl des Kunden zur&uuml;ckzugeben oder
              zu vernichten.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              7. Vertraulichkeit und Datenschutz
            </h2>
            <p className="text-white/90 leading-relaxed mb-2">
              7.1 Der Auftragnehmer wird alle ihm im Zusammenhang mit dem Auftrag zur Kenntnis
              gelangenden Vorg&auml;nge streng vertraulich behandeln. Die Geheimhaltungspflicht gilt
              zeitlich unbegrenzt &uuml;ber die Dauer dieses Vertrages hinaus.
            </p>
            <p className="text-white/90 leading-relaxed">
              7.2 Der Auftragnehmer verpflichtet sich, bei der Durchf&uuml;hrung des Auftrags
              s&auml;mtliche datenschutzrechtlichen Vorschriften &ndash; insbesondere die Vorschriften
              der Datenschutzgrundverordnung und des Bundesdatenschutzgesetzes &ndash; einzuhalten.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              8. Schlussbestimmungen
            </h2>
            <p className="text-white/90 leading-relaxed mb-2">
              8.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des CISG.
              Vertragssprache ist Deutsch.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              8.2 Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, so wird die
              G&uuml;ltigkeit der AGB im &Uuml;brigen hiervon nicht ber&uuml;hrt.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              8.3 Der Auftraggeber wird den Auftragnehmer bei der Erbringung seiner
              vertragsgem&auml;&szlig;en Leistungen durch angemessene Mitwirkungshandlungen, soweit
              erforderlich, f&ouml;rdern. Der Auftraggeber wird insbesondere dem Auftragnehmer die
              zur Erf&uuml;llung des Auftrags erforderlichen Informationen und Daten zur
              Verf&uuml;gung stellen.
            </p>
            <p className="text-white/90 leading-relaxed mb-2">
              8.4 Sofern der Auftraggeber Kaufmann, juristische Person des &ouml;ffentlichen Rechts
              oder &ouml;ffentlich-rechtliches Sonderverm&ouml;gen ist oder keinen allgemeinen
              Gerichtsstand in Deutschland hat, vereinbaren die Parteien den Sitz des Auftragnehmers
              als Gerichtsstand f&uuml;r s&auml;mtliche Streitigkeiten aus diesem
              Vertragsverh&auml;ltnis; ausschlie&szlig;liche Gerichtsst&auml;nde bleiben hiervon
              unber&uuml;hrt.
            </p>
            <p className="text-white/90 leading-relaxed">
              8.5 Der Auftragnehmer ist berechtigt, diese AGB aus sachlich gerechtfertigten
              Gr&uuml;nden (z.&thinsp;B. &Auml;nderungen in der Rechtsprechung, Gesetzeslage,
              Marktgegebenheiten oder der Gesch&auml;fts- oder Unternehmensstrategie) und unter
              Einhaltung einer angemessenen Frist zu &auml;ndern. Bestandskunden werden
              hier&uuml;ber sp&auml;testens zwei Wochen vor Inkrafttreten der &Auml;nderung per
              E-Mail benachrichtigt. Sofern der Bestandskunde nicht innerhalb der in der
              &Auml;nderungsmitteilung gesetzten Frist widerspricht, gilt seine Zustimmung zur
              &Auml;nderung als erteilt. Widerspricht er, treten die &Auml;nderungen nicht in Kraft;
              der Auftragnehmer ist in diesem Fall berechtigt, den Vertrag zum Zeitpunkt des
              Inkrafttretens der &Auml;nderung au&szlig;erordentlich zu k&uuml;ndigen. Die
              Benachrichtigung &uuml;ber die beabsichtigte &Auml;nderung dieser AGB wird auf die
              Frist und die Folgen des Widerspruchs oder seines Ausbleibens hinweisen.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              9. Online-Streitbeilegung
            </h2>
            <p className="text-white/90 leading-relaxed">
              Die Europ&auml;ische Kommission stellt eine Plattform zur Online-Streitbeilegung
              (OS-Plattform) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <br /><br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
              <br /><br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
              vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
