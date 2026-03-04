import { Metadata } from 'next';

const BASE_URL = 'https://numerologie-pro.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const routePath = '/datenschutz';
  const title =
    locale === 'ru'
      ? 'Политика конфиденциальности | Numerologie PRO'
      : 'Datenschutzerklärung | Numerologie PRO';
  const description =
    locale === 'ru'
      ? 'Политика конфиденциальности Numerologie PRO — как мы обрабатываем ваши данные, файлы cookie, Google Analytics, Yandex.Metrica и права по GDPR.'
      : 'Datenschutzerklärung von Numerologie PRO — Informationen zu Cookies, Google Analytics, Yandex.Metrica, Stripe und Ihren DSGVO-Rechten.';

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

/* =============================================================================
   Datenschutzerklaerung — Numerologie PRO
   Basis: eRecht24 Premium Generator (Maerz 2026)
   Ergaenzungen: Yandex.Metrica, Cal.com, Supabase, Resend, Vercel Analytics,
                 Instagram, Matrix-Rechner, Zoom, Automatisierte Entscheidungsfindung,
                 Auftragsverarbeiter-Liste, Social-Media-Auftritte (Facebook, Instagram,
                 YouTube, TikTok inkl. Controller Addendum + DPF)
   Entfernt: All-Inkl (nur Domain-Registrar, kein Hoster)
   ============================================================================= */

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container max-w-3xl">
        <h1 className="heading-gold mb-4">Datenschutz&shy;erkl&auml;rung</h1>
        <p className="text-white/40 text-sm mb-8">Stand: M&auml;rz 2026</p>

        <div className="card-premium p-8 space-y-8">

          {/* ================================================================
              1. DATENSCHUTZ AUF EINEN BLICK — eRecht24 Basis
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              1. Datenschutz auf einen Blick
            </h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Allgemeine Hinweise</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Die folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
              sind alle Daten, mit denen Sie pers&ouml;nlich identifiziert werden k&ouml;nnen.
              Ausf&uuml;hrliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter
              diesem Text aufgef&uuml;hrten Datenschutzerkl&auml;rung.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Datenerfassung auf dieser Website</h3>

            <h4 className="font-medium text-white/80 mb-1">
              Wer ist verantwortlich f&uuml;r die Datenerfassung auf dieser Website?
            </h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
              Kontaktdaten k&ouml;nnen Sie dem Abschnitt &bdquo;Hinweis zur Verantwortlichen
              Stelle&ldquo; in dieser Datenschutzerkl&auml;rung entnehmen.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Wie erfassen wir Ihre Daten?</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann
              es sich z.&nbsp;B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website
              durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.&nbsp;B.
              Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser
              Daten erfolgt automatisch, sobald Sie diese Website betreten.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Wof&uuml;r nutzen wir Ihre Daten?</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
              gew&auml;hrleisten. Andere Daten k&ouml;nnen zur Analyse Ihres Nutzerverhaltens
              verwendet werden. Sofern &uuml;ber die Website Vertr&auml;ge geschlossen oder
              angebahnt werden k&ouml;nnen, werden die &uuml;bermittelten Daten auch f&uuml;r
              Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.
            </p>

            <h4 className="font-medium text-white/80 mb-1">
              Welche Rechte haben Sie bez&uuml;glich Ihrer Daten?
            </h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft &uuml;ber Herkunft,
              Empf&auml;nger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie
              haben au&szlig;erdem ein Recht, die Berichtigung oder L&ouml;schung dieser Daten zu
              verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, k&ouml;nnen
              Sie diese Einwilligung jederzeit f&uuml;r die Zukunft widerrufen. Au&szlig;erdem haben
              Sie das Recht, unter bestimmten Umst&auml;nden die Einschr&auml;nkung der Verarbeitung
              Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein
              Beschwerderecht bei der zust&auml;ndigen Aufsichtsbeh&ouml;rde zu.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Hierzu sowie zu weiteren Fragen zum Thema Datenschutz k&ouml;nnen Sie sich jederzeit
              an uns wenden.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">
              Analyse-Tools und Tools von Dritt&shy;anbietern
            </h3>
            <p className="text-white/90 leading-relaxed">
              Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das
              geschieht vor allem mit sogenannten Analyseprogrammen. Detaillierte Informationen zu
              diesen Analyseprogrammen finden Sie in der folgenden Datenschutzerkl&auml;rung.
            </p>
          </section>

          {/* ================================================================
              2. HOSTING — eRecht24 Basis (All-Inkl entfernt — nur Domain-Registrar)
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">2. Hosting</h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Externes Hosting</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website
              erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich
              v.&nbsp;a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten,
              Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die &uuml;ber
              eine Website generiert werden, handeln.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Das externe Hosting erfolgt zum Zwecke der Vertragserf&uuml;llung gegen&uuml;ber
              unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im
              Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres
              Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung
              ausschlie&szlig;lich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und &sect; 25
              Abs. 1 TDDDG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff
              auf Informationen im Endger&auml;t des Nutzers (z.&nbsp;B. Device-Fingerprinting) im
              Sinne des TDDDG umfasst. Die Einwilligung ist jederzeit widerrufbar.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erf&uuml;llung
              seiner Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese
              Daten befolgen.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Wir setzen folgenden Hoster ein:
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>
            <h4 className="font-medium text-white/80 mb-1">Auftragsverarbeitung</h4>
            <p className="text-white/90 leading-relaxed">
              Wir haben einen Vertrag &uuml;ber Auftragsverarbeitung (AVV) zur Nutzung des oben
              genannten Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich
              vorgeschriebenen Vertrag, der gew&auml;hrleistet, dass dieser die personenbezogenen
              Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der
              DSGVO verarbeitet.
            </p>
          </section>

          {/* ================================================================
              3. ALLGEMEINE HINWEISE UND PFLICHTINFORMATIONEN — eRecht24 Basis
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              3. Allgemeine Hinweise und Pflicht&shy;informationen
            </h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Datenschutz</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer pers&ouml;nlichen Daten sehr
              ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
              gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerkl&auml;rung.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir weisen darauf hin, dass die Daten&uuml;bertragung im Internet (z.&nbsp;B. bei der
              Kommunikation per E-Mail) Sicherheitsl&uuml;cken aufweisen kann. Ein l&uuml;ckenloser
              Schutz der Daten vor dem Zugriff durch Dritte ist nicht m&ouml;glich.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Hinweis zur verantwortlichen Stelle</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Die verantwortliche Stelle f&uuml;r die Datenverarbeitung auf dieser Website ist:
              <br /><br />
              Swetlana Wagner<br />
              Berliner Stra&szlig;e 3<br />
              51545 Waldbr&ouml;l
              <br /><br />
              Telefon: +49 1515 1668273<br />
              E-Mail: info@numerologie-pro.com
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Speicherdauer</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Soweit innerhalb dieser Datenschutzerkl&auml;rung keine speziellere Speicherdauer
              genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck f&uuml;r
              die Datenverarbeitung entf&auml;llt. Wenn Sie ein berechtigtes L&ouml;schersuchen
              geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre
              Daten gel&ouml;scht, sofern wir keine anderen rechtlich zul&auml;ssigen Gr&uuml;nde
              f&uuml;r die Speicherung haben (z.&nbsp;B. steuer- oder handelsrechtliche
              Aufbewahrungsfristen); im letztgenannten Fall erfolgt die L&ouml;schung nach Fortfall
              dieser Gr&uuml;nde.
            </p>
            <ul className="list-disc list-inside text-white/90 leading-relaxed mb-4 space-y-1">
              <li><strong className="text-white/90">Kontaktanfragen:</strong> 6 Monate nach Abschluss der Kommunikation</li>
              <li><strong className="text-white/90">Lead-Daten (nicht konvertiert):</strong> 24 Monate</li>
              <li><strong className="text-white/90">Bestelldaten:</strong> 10 Jahre (gesetzliche Aufbewahrungspflicht gem. HGB/AO)</li>
              <li><strong className="text-white/90">Nachrichten (Telegram, Instagram, WhatsApp):</strong> 24 Monate</li>
              <li><strong className="text-white/90">CRM-Notizen:</strong> Bis zur L&ouml;schung Ihres Kontos</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mb-1">Allgemeine Hinweise zu den Rechtsgrundlagen</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
              personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9
              Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO
              verarbeitet werden. Sofern Sie in die Speicherung von Cookies oder in den Zugriff auf
              Informationen in Ihr Endger&auml;t eingewilligt haben, erfolgt die Datenverarbeitung
              zus&auml;tzlich auf Grundlage von &sect; 25 Abs. 1 TDDDG. Die Einwilligung ist
              jederzeit widerrufbar. Sind Ihre Daten zur Vertragserf&uuml;llung oder zur
              Durchf&uuml;hrung vorvertraglicher Ma&szlig;nahmen erforderlich, verarbeiten wir Ihre
              Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Die Datenverarbeitung kann ferner
              auf Grundlage unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO
              erfolgen.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Hinweis zur Datenweitergabe in nicht sichere Drittstaaten</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir verwenden unter anderem Tools von Unternehmen mit Sitz in datenschutzrechtlich
              nicht sicheren Drittstaaten sowie US-Tools, deren Anbieter nicht nach dem EU-US-Data
              Privacy Framework (DPF) zertifiziert sind. Wenn diese Tools aktiv sind, k&ouml;nnen
              Ihre personenbezogene Daten in diese Staaten &uuml;bertragen und dort verarbeitet
              werden. Wir weisen darauf hin, dass die USA als sicherer Drittstaat grunds&auml;tzlich
              ein mit der EU vergleichbares Datenschutzniveau aufweisen, sofern der Empf&auml;nger
              eine DPF-Zertifizierung besitzt.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Viele Datenverarbeitungsvorg&auml;nge sind nur mit Ihrer ausdr&uuml;cklichen
              Einwilligung m&ouml;glich. Sie k&ouml;nnen eine bereits erteilte Einwilligung
              jederzeit widerrufen. Die Rechtm&auml;&szlig;igkeit der bis zum Widerruf erfolgten
              Datenverarbeitung bleibt vom Widerruf unber&uuml;hrt.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Widerspruchsrecht (Art. 21 DSGVO)</h3>
            <p className="text-white/90 leading-relaxed mb-3 font-bold uppercase text-sm">
              WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO
              ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GR&Uuml;NDEN, DIE SICH AUS IHRER
              BESONDEREN SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN
              WIDERSPRUCH EINZULEGEN; DIES GILT AUCH F&Uuml;R EIN AUF DIESE BESTIMMUNGEN
              GEST&Uuml;TZTES PROFILING.
            </p>
            <p className="text-white/90 leading-relaxed mb-4 font-bold uppercase text-sm">
              WERDEN IHRE PERSONENBEZOGENEN DATEN VERARBEITET, UM DIREKTWERBUNG ZU BETREIBEN, SO
              HABEN SIE DAS RECHT, JEDERZEIT WIDERSPRUCH GEGEN DIE VERARBEITUNG SIE BETREFFENDER
              PERSONENBEZOGENER DATEN ZUM ZWECKE DERARTIGER WERBUNG EINZULEGEN (WIDERSPRUCH NACH
              ART. 21 ABS. 2 DSGVO).
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Beschwerderecht bei der Aufsichtsbeh&ouml;rde</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Im Falle von Verst&ouml;&szlig;en gegen die DSGVO steht den Betroffenen ein
              Beschwerderecht bei einer Aufsichtsbeh&ouml;rde zu, insbesondere in dem Mitgliedstaat
              ihres gew&ouml;hnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des
              mutma&szlig;lichen Versto&szlig;es.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Recht auf Daten&uuml;bertragbarkeit</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in
              Erf&uuml;llung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten
              in einem g&auml;ngigen, maschinenlesbaren Format aush&auml;ndigen zu lassen.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Auskunft, Berichtigung und L&ouml;schung</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
              unentgeltliche Auskunft &uuml;ber Ihre gespeicherten personenbezogenen Daten, deren
              Herkunft und Empf&auml;nger und den Zweck der Datenverarbeitung und ggf. ein Recht auf
              Berichtigung oder L&ouml;schung dieser Daten.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Recht auf Einschr&auml;nkung der Verarbeitung</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Sie haben das Recht, die Einschr&auml;nkung der Verarbeitung Ihrer personenbezogenen
              Daten zu verlangen, wenn Sie die Richtigkeit bestreiten, die Verarbeitung
              unrechtm&auml;&szlig;ig ist, wir die Daten nicht mehr ben&ouml;tigen Sie sie aber zur
              Geltendmachung von Rechtsanspr&uuml;chen brauchen, oder Sie Widerspruch nach Art. 21
              Abs. 1 DSGVO eingelegt haben.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">SSL- bzw. TLS-Verschl&uuml;sselung</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Diese Seite nutzt aus Sicherheitsgr&uuml;nden und zum Schutz der &Uuml;bertragung
              vertraulicher Inhalte eine SSL- bzw. TLS-Verschl&uuml;sselung. Eine verschl&uuml;sselte
              Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von
              &bdquo;http://&ldquo; auf &bdquo;https://&ldquo; wechselt und an dem Schloss-Symbol
              in Ihrer Browserzeile.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Widerspruch gegen Werbe-E-Mails</h3>
            <p className="text-white/90 leading-relaxed">
              Der Nutzung von im Rahmen der Impressumspflicht ver&ouml;ffentlichten Kontaktdaten zur
              &Uuml;bersendung von nicht ausdr&uuml;cklich angeforderter Werbung und
              Informationsmaterialien wird hiermit widersprochen. Die Betreiber der Seiten behalten
              sich ausdr&uuml;cklich rechtliche Schritte im Falle der unverlangten Zusendung von
              Werbeinformationen, etwa durch Spam-E-Mails, vor.
            </p>
          </section>

          {/* ================================================================
              4. DATENERFASSUNG AUF DIESER WEBSITE — eRecht24 Basis + Ergaenzungen
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">4. Datenerfassung auf dieser Website</h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Cookies</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Unsere Internetseiten verwenden so genannte &bdquo;Cookies&ldquo;. Cookies sind kleine
              Datenpakete und richten auf Ihrem Endger&auml;t keinen Schaden an. Sie werden entweder
              vor&uuml;bergehend f&uuml;r die Dauer einer Sitzung (Session-Cookies) oder dauerhaft
              (permanente Cookies) auf Ihrem Endger&auml;t gespeichert.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Cookies, die zur Durchf&uuml;hrung des elektronischen Kommunikationsvorgangs oder zur
              Bereitstellung bestimmter von Ihnen erw&uuml;nschter Funktionen erforderlich sind
              (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert.
              Sofern eine Einwilligung abgefragt wurde, erfolgt die Verarbeitung auf Grundlage von
              Art. 6 Abs. 1 lit. a DSGVO und &sect; 25 Abs. 1 TDDDG; die Einwilligung ist jederzeit
              widerrufbar.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Beim ersten Besuch unserer Website werden Sie &uuml;ber ein Cookie-Banner um Ihre
              Einwilligung gebeten. Sie k&ouml;nnen zwischen folgenden Optionen w&auml;hlen:
            </p>
            <ul className="list-disc list-inside text-white/90 leading-relaxed mb-3 space-y-1">
              <li><strong className="text-white/90">Alle akzeptieren</strong> &ndash; Analyse- und Marketing-Cookies werden aktiviert.</li>
              <li><strong className="text-white/90">Nur essenzielle</strong> &ndash; Nur technisch notwendige Cookies.</li>
            </ul>
            <p className="text-white/90 leading-relaxed mb-4">
              Sie k&ouml;nnen Ihre Einwilligung jederzeit widerrufen, indem Sie im Fu&szlig;bereich
              unserer Website auf &bdquo;Cookie-Einstellungen&ldquo; klicken.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Server-Log-Dateien</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
              Server-Log-Dateien, die Ihr Browser automatisch an uns &uuml;bermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside text-white/90 leading-relaxed mb-3 space-y-1">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p className="text-white/90 leading-relaxed mb-4">
              Eine Zusammenf&uuml;hrung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Kontaktformular</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
              Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
              Bearbeitung der Anfrage und f&uuml;r den Fall von Anschlussfragen bei uns gespeichert.
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO bzw. Art. 6
              Abs. 1 lit. f DSGVO.
            </p>

            {/* Ergaenzung — Matrix-Rechner */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Matrix-Rechner</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wenn Sie unseren Matrix-Rechner nutzen und Ihre E-Mail-Adresse eingeben, speichern wir
              Ihre E-Mail-Adresse und Ihr Geburtsdatum, um Ihnen Ihre vollst&auml;ndige Analyse
              zuzusenden. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
            </p>

            {/* eRecht24 Basis — Einsatz von KI */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Einsatz von KI auf der Website</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Auf unserer Website wird eine KI-gest&uuml;tzte Sprachassistentin
              (&quot;Lisa&quot;) eingesetzt, die auf der Technologie von ElevenLabs (ElevenLabs
              Inc., USA) basiert. Nutzer k&ouml;nnen per Sprachdialog Informationen zu unseren
              Numerologie-Beratungspaketen, Preisen und Terminbuchungen erhalten. Dabei werden
              Audiodaten (Spracheingabe) an ElevenLabs-Server in den USA &uuml;bertragen und dort
              verarbeitet. Die Nutzung ist freiwillig und erfordert eine aktive Aktivierung durch
              den Nutzer.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              <strong className="text-white/90">KI-Kennzeichnung (Art. 50 EU AI Act):</strong>{' '}
              Gem&auml;&szlig; Art. 50 Abs. 1 der EU-KI-Verordnung (Verordnung (EU) 2024/1689)
              weisen wir Sie darauf hin, dass es sich bei &bdquo;Lisa&ldquo; um ein KI-System
              handelt. Sie interagieren mit einer k&uuml;nstlichen Intelligenz, nicht mit einem
              Menschen.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Falls eine
              Einwilligung erforderlich ist, erfolgt die Verarbeitung auf Grundlage von Art. 6
              Abs. 1 lit. a DSGVO und &sect; 25 Abs. 1 TDDDG; widerrufbar.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">KI zur Beantwortung von Kundenanfragen</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Wir setzen KI-gest&uuml;tzte Software zur Bearbeitung und Beantwortung von
              Kundenanfragen ein. Die Verwendung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f
              DSGVO.
            </p>
            <h4 className="font-medium text-white/80 mb-1">ElevenLabs</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter ist ElevenLabs Inc., 1545 Broadway, Suite 400, New York, NY 10036, USA. Ihre
              Anfragen k&ouml;nnen inklusive Metadaten an die Server dieses Anbieters &uuml;bertragen
              und dort verarbeitet werden.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              <strong className="text-white/80">Auftragsverarbeitung:</strong> Wir haben einen AVV
              zur Nutzung dieses Dienstes geschlossen, der gew&auml;hrleistet, dass die
              personenbezogenen Daten nur nach unseren Weisungen und unter Einhaltung der DSGVO
              verarbeitet werden.
            </p>

            {/* eRecht24 Basis — E-Mail, Telefon */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Anfrage per E-Mail, Telefon oder Telefax</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive
              aller daraus hervorgehenden personenbezogenen Daten zum Zwecke der Bearbeitung bei uns
              gespeichert. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              bzw. Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            {/* eRecht24 Basis — WhatsApp */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Kommunikation via WhatsApp</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              F&uuml;r die Kommunikation mit unseren Kunden nutzen wir WhatsApp. Anbieter ist die
              WhatsApp Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland. Die Kommunikation
              erfolgt &uuml;ber eine Ende-zu-Ende-Verschl&uuml;sselung. WhatsApp erh&auml;lt
              Zugriff auf Metadaten (Absender, Empf&auml;nger, Zeitpunkt). Weitere Details:{' '}
              <a href="https://www.whatsapp.com/legal/#privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">whatsapp.com/legal/privacy-policy</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Einsatz auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Das Unternehmen verf&uuml;gt
              &uuml;ber eine DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/7735" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/7735</a>.
              Wir nutzen WhatsApp Business. Daten&uuml;bertragung in die USA auf Basis der
              Standardvertragsklauseln:{' '}
              <a href="https://www.whatsapp.com/legal/business-data-transfer-addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">whatsapp.com/legal/business-data-transfer-addendum</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Kein automatischer Datenabgleich mit dem Adressbuch. Wir haben einen AVV mit dem
              Anbieter geschlossen.
            </p>

            {/* eRecht24 Basis — Telegram */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Kommunikation via Telegram</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Anbieter ist die Telegram Messenger LLP, London, UK. Verschl&uuml;sselung zwischen
              Endger&auml;t und Server; Ende-zu-Ende nur bei geheimen Chats. Einsatz auf Grundlage
              von Art. 6 Abs. 1 lit. f DSGVO. Details:{' '}
              <a href="https://telegram.org/privacy/de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">telegram.org/privacy/de</a>.
            </p>

            {/* Ergaenzung — Instagram */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Kommunikation via Instagram</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir empfangen und beantworten Direktnachrichten &uuml;ber Instagram (Meta Platforms
              Ireland Limited). Ihre Nachrichten, Nutzername und Sender-ID werden gespeichert.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Speicherdauer: max. 24 Monate.
            </p>

            {/* eRecht24 Basis — Chatbots / ManyChat */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Einsatz von Chatbots</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Wir setzen Chatbots ein, um mit Ihnen zu kommunizieren. Chatbots analysieren neben
              Ihren Eingaben weitere Daten (Namen, E-Mail-Adressen, Chatverl&auml;ufe, IP-Adresse,
              Logdateien). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO bzw. Art. 6 Abs. 1 lit. f
              DSGVO.
            </p>
            <h4 className="font-medium text-white/80 mb-1">ManyChat</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: ManyChat, Inc., 535 Everett Ave, Palo Alto, CA 94301, USA. ManyChat
              verarbeitet u.&nbsp;a. Social-Media-Profilinformationen, Chatverl&auml;ufe und
              Logdaten. Datenschutzerkl&auml;rung:{' '}
              <a href="https://manychat.com/privacy.html" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">manychat.com/privacy.html</a>.
              Daten&uuml;bertragung in die USA auf Basis der Standardvertragsklauseln.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              <strong className="text-white/80">Auftragsverarbeitung:</strong> Wir haben einen AVV
              mit ManyChat geschlossen.
            </p>

            {/* eRecht24 Basis — Registrierung */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Registrierung auf dieser Website</h3>
            <p className="text-white/90 leading-relaxed">
              Sie k&ouml;nnen sich auf dieser Website registrieren, um zus&auml;tzliche Funktionen
              zu nutzen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Die
              Daten werden gespeichert, solange Sie registriert sind und anschlie&szlig;end
              gel&ouml;scht. Gesetzliche Aufbewahrungsfristen bleiben unber&uuml;hrt.
            </p>
          </section>

          {/* ================================================================
              5. ANALYSE-TOOLS UND WERBUNG — eRecht24 Basis + Ergaenzungen
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">5. Analyse-Tools und Werbung</h2>

            {/* eRecht24 Basis — Google Analytics */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Google Analytics</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Diese Website nutzt Google Analytics. Anbieter: Google Ireland Limited, Gordon House,
              Barrow Street, Dublin 4, Irland. Google Analytics verwendet Technologien zur
              Wiedererkennung des Nutzers (z.&nbsp;B. Cookies oder Device-Fingerprinting). Die von
              Google erfassten Informationen werden in der Regel an einen Server von Google in den USA
              &uuml;bertragen.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              <strong className="text-white/90">Einwilligung:</strong> Die Nutzung erfolgt auf
              Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und &sect; 25 Abs. 1
              TDDDG. Die Einwilligung ist jederzeit widerrufbar.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Daten&uuml;bertragung in die USA auf Basis der Standardvertragsklauseln:{' '}
              <a href="https://business.safety.google/adscontrollerterms/sccs/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">business.safety.google/adscontrollerterms/sccs/</a>.
              DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/5780" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/5780</a>.
            </p>

            <h4 className="font-medium text-white/80 mb-1">IP Anonymisierung</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Die Google Analytics IP-Anonymisierung ist aktiviert. Ihre IP-Adresse wird vor der
              &Uuml;bermittlung in die USA gek&uuml;rzt und nicht mit anderen Daten von Google
              zusammengef&uuml;hrt.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Browser Plugin</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Sie k&ouml;nnen die Erfassung durch Google verhindern:{' '}
              <a href="https://tools.google.com/dlpage/gaoptout?hl=de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">tools.google.com/dlpage/gaoptout</a>.
              Mehr Informationen:{' '}
              <a href="https://support.google.com/analytics/answer/6004245?hl=de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">support.google.com/analytics/answer/6004245</a>.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Google-Signale</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Wir nutzen Google-Signale. Dabei erfasst Google Analytics u.&nbsp;a. Ihren Standort,
              Suchverlauf und YouTube-Verlauf sowie demografische Daten. Wenn Sie &uuml;ber ein
              Google-Konto verf&uuml;gen, werden die Besucherdaten mit Ihrem Google-Konto
              verkn&uuml;pft und f&uuml;r personalisierte Werbebotschaften verwendet.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Auftragsverarbeitung</h4>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir haben mit Google einen Vertrag zur Auftragsverarbeitung abgeschlossen und setzen die
              strengen Vorgaben der deutschen Datenschutzbeh&ouml;rden vollst&auml;ndig um.
            </p>

            {/* eRecht24 Basis — Meta-Pixel */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Meta-Pixel (ehemals Facebook Pixel)</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Meta Platforms Ireland Limited, Merrion Road Dublin 4, D04 X2K5, Irland. Die
              Nutzung erfolgt auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und
              &sect; 25 Abs. 1 TDDDG. Wir nutzen den erweiterten Abgleich (gehashte E-Mail-Adressen,
              Namen, Telefonnummern).
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Gemeinsame Verantwortlichkeit (Art. 26 DSGVO):{' '}
              <a href="https://www.facebook.com/legal/controller_addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/legal/controller_addendum</a>.
              Daten&uuml;bertragung:{' '}
              <a href="https://www.facebook.com/legal/EU_data_transfer_addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/legal/EU_data_transfer_addendum</a>.
              DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/4452" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/4452</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Datenschutzhinweise von Meta:{' '}
              <a href="https://de-de.facebook.com/about/privacy/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/about/privacy</a>.
              Custom Audiences deaktivieren:{' '}
              <a href="https://www.facebook.com/ads/preferences/?entry_product=ad_settings_screen" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/ads/preferences</a>.
            </p>

            {/* eRecht24 Basis — Meta Conversion API */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Meta Conversion API</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Meta Platforms Ireland Limited, Dublin, Irland. Die Meta Conversion API
              erm&ouml;glicht es uns, Konversionsereignisse serverseitig an Meta zu &uuml;bermitteln.
              Dabei werden gehashte (SHA-256 verschl&uuml;sselte) Versionen Ihrer E-Mail-Adresse,
              Telefonnummer und/oder Ihres Namens &uuml;bermittelt.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Die Nutzung erfolgt auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO
              und &sect; 25 Abs. 1 TDDDG. Gemeinsame Verantwortlichkeit gem&auml;&szlig; Art. 26
              DSGVO. DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/4452" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/4452</a>.
            </p>

            {/* Ergaenzung — Yandex.Metrica */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Yandex.Metrica (nur russische Website)</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Auf der russischsprachigen Version (numerologie-pro.com/ru) nutzen wir Yandex.Metrica
              (Yandex LLC, Moskau, Russland). Die erhobenen Informationen werden an Server in
              Russland &uuml;bertragen.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              <strong className="text-white/90">Drittlandtransfer:</strong> Russland verf&uuml;gt
              &uuml;ber keinen Angemessenheitsbeschluss der EU-Kommission. Die &Uuml;bertragung
              erfolgt auf Grundlage Ihrer ausdr&uuml;cklichen Einwilligung gem. Art. 49 Abs. 1
              lit. a DSGVO, die Sie &uuml;ber unser Cookie-Banner erteilen.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              <strong className="text-white/90">Einwilligung:</strong> Nur geladen bei Zustimmung
              zur Kategorie &bdquo;Analyse&ldquo;. Session Replay (Webvisor) ist deaktiviert. Auf
              der deutschsprachigen Version wird Yandex.Metrica nicht eingesetzt.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Weitere Informationen:{' '}
              <a href="https://yandex.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">yandex.com/legal/privacy</a>.
              Wir haben einen AVV mit Yandex abgeschlossen.
            </p>

            {/* Ergaenzung — Vercel Analytics */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Vercel Analytics &amp; Speed Insights</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Anonymisierte Performance-Analyse. Es werden keine personenbezogenen Daten
              &uuml;bermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Details:{' '}
              <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">vercel.com/docs/analytics/privacy-policy</a>.
            </p>

            {/* Ergaenzung — Instagram Lead Ads */}
            <h3 className="text-lg font-medium text-white/90 mb-1">Instagram Lead Ads</h3>
            <p className="text-white/90 leading-relaxed">
              Wir nutzen Instagram/Facebook Lead Ads. Ihre eingegebenen Daten (Name, E-Mail,
              Telefon) werden in unserem CRM-System gespeichert. Rechtsgrundlage: Ihre Einwilligung
              (Art. 6 Abs. 1 lit. a DSGVO).
            </p>
          </section>

          {/* ================================================================
              6. eCOMMERCE UND ZAHLUNGSANBIETER
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">6. eCommerce und Zahlungsanbieter</h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Verarbeiten von Kunden- und Vertragsdaten</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir erheben, verarbeiten und nutzen personenbezogene Kunden- und Vertragsdaten zur
              Begr&uuml;ndung, inhaltlichen Ausgestaltung und &Auml;nderung unserer
              Vertragsbeziehungen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Stripe</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin, Irland.
              Ihre Zahlungsdaten werden direkt an Stripe &uuml;bermittelt. Stripe ist PCI-DSS Level
              1 zertifiziert.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/6389" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/6389</a>.
              Datenschutzerkl&auml;rung:{' '}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">stripe.com/de/privacy</a>.
            </p>
            <p className="text-white/90 leading-relaxed">
              <strong className="text-white/80">Auftragsverarbeitung:</strong> Wir haben einen AVV
              mit Stripe geschlossen.
            </p>
          </section>

          {/* ================================================================
              7. PLUGINS UND TOOLS
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">7. Plugins und Tools</h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Google Fonts (lokales Hosting)</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Diese Seite nutzt Google Fonts. Die Google Fonts sind lokal installiert. Eine
              Verbindung zu Servern von Google findet dabei nicht statt.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Terminbuchung &uuml;ber Cal.com</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Anbieter: Cal.com, Inc. Beim Buchen werden Name, E-Mail-Adresse und gew&auml;hlter
              Termin &uuml;bermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
              (vorvertragliche Ma&szlig;nahmen).
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">TikTok</h3>
            <p className="text-white/90 leading-relaxed">
              Wir verlinken lediglich auf unser TikTok-Profil. Es werden keine TikTok-Plugins oder
              Tracking-Pixel eingebunden. Beim Klick auf den Link gelten die
              Datenschutzbestimmungen von TikTok:{' '}
              <a href="https://www.tiktok.com/legal/privacy-policy-eea" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">tiktok.com/legal/privacy-policy-eea</a>.
            </p>
          </section>

          {/* ================================================================
              8. AUDIO- UND VIDEOKONFERENZEN
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">8. Audio- und Videokonferenzen</h2>
            <h3 className="text-lg font-medium text-white/90 mb-1">Zoom</h3>
            <p className="text-white/90 leading-relaxed">
              Anbieter: Zoom Communications Inc., San Jose, CA, USA. Details:{' '}
              <a href="https://www.zoom.com/de/trust/privacy/privacy-statement/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">zoom.com/de/trust/privacy</a>.
            </p>
          </section>

          {/* ================================================================
              9. WEITERE DIENSTE
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">9. Weitere Dienste</h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">Supabase</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              F&uuml;r Datenbank, Authentifizierung und Dateispeicherung nutzen wir Supabase
              (Supabase, Inc., San Francisco, USA). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
              Wir haben einen AVV mit Supabase geschlossen. Weitere Informationen:{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">supabase.com/privacy</a>.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">E-Mail-Versand &uuml;ber Resend</h3>
            <p className="text-white/90 leading-relaxed">
              Anbieter: Resend, Inc., San Francisco, USA. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
              DSGVO (Vertragserf&uuml;llung) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung bei
              Marketing-E-Mails). Jede Marketing-E-Mail enth&auml;lt einen Abmelde-Link.
            </p>
          </section>

          {/* ================================================================
              10. SOCIAL-MEDIA-AUFTRITTE
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              10. Unsere Social-Media-Auftritte
            </h2>

            <h3 className="text-lg font-medium text-white/90 mb-1">
              Diese Datenschutzerkl&auml;rung gilt f&uuml;r folgende Social-Media-Auftritte
            </h3>
            <ul className="list-disc list-inside text-white/90 leading-relaxed space-y-1 mb-4">
              <li><a href="https://www.facebook.com/share/16PkPB2YiR/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com &ndash; Numerologie PRO</a></li>
              <li><a href="https://www.instagram.com/numerologie_pro" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">instagram.com/numerologie_pro</a></li>
              <li><a href="https://youtube.com/@numerologie_pro" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">youtube.com/@numerologie_pro</a></li>
              <li><a href="https://www.tiktok.com/@numerologie_pro" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">tiktok.com/@numerologie_pro</a></li>
            </ul>

            <h3 className="text-lg font-medium text-white/90 mb-1">Datenverarbeitung durch soziale Netzwerke</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Wir unterhalten &ouml;ffentlich zug&auml;ngliche Profile in sozialen Netzwerken.
              Soziale Netzwerke wie Facebook, Instagram etc. k&ouml;nnen Ihr Nutzerverhalten in der Regel
              umfassend analysieren, wenn Sie deren Website oder eine Website mit integrierten
              Social-Media-Inhalten (z.&nbsp;B. Like-Buttons oder Werbebannern) besuchen. Durch den Besuch
              unserer Social-Media-Pr&auml;senzen werden zahlreiche datenschutzrelevante
              Verarbeitungsvorg&auml;nge ausgel&ouml;st.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Wenn Sie in Ihrem Social-Media-Account eingeloggt sind und unsere Social-Media-Pr&auml;senz
              besuchen, kann der Betreiber des Social-Media-Portals diesen Besuch Ihrem Benutzerkonto
              zuordnen. Ihre personenbezogenen Daten k&ouml;nnen unter Umst&auml;nden aber auch dann
              erfasst werden, wenn Sie nicht eingeloggt sind oder keinen Account beim jeweiligen
              Social-Media-Portal besitzen. Diese Datenerfassung erfolgt in diesem Fall beispielsweise
              &uuml;ber Cookies, die auf Ihrem Endger&auml;t gespeichert werden oder durch Erfassung Ihrer
              IP-Adresse.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              Mit Hilfe der so erfassten Daten k&ouml;nnen die Betreiber der Social-Media-Portale
              Nutzerprofile erstellen, in denen Ihre Pr&auml;ferenzen und Interessen hinterlegt sind.
              Auf diese Weise kann Ihnen interessenbezogene Werbung in- und au&szlig;erhalb der jeweiligen
              Social-Media-Pr&auml;senz angezeigt werden.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Bitte beachten Sie au&szlig;erdem, dass wir nicht alle Verarbeitungsprozesse auf den
              Social-Media-Portalen nachvollziehen k&ouml;nnen. Je nach Anbieter k&ouml;nnen daher ggf.
              weitere Verarbeitungsvorg&auml;nge von den Betreibern der Social-Media-Portale
              durchgef&uuml;hrt werden. Details hierzu entnehmen Sie den Nutzungsbedingungen und
              Datenschutzbestimmungen der jeweiligen Social-Media-Portale.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Rechtsgrundlage</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Unsere Social-Media-Auftritte sollen eine m&ouml;glichst umfassende Pr&auml;senz im Internet
              gew&auml;hrleisten. Hierbei handelt es sich um ein berechtigtes Interesse im Sinne von
              Art. 6 Abs. 1 lit. f DSGVO. Die von den sozialen Netzwerken initiierten Analyseprozesse
              beruhen ggf. auf abweichenden Rechtsgrundlagen, die von den Betreibern der sozialen
              Netzwerke anzugeben sind (z.&nbsp;B. Einwilligung im Sinne des Art. 6 Abs. 1 lit. a DSGVO).
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Verantwortlicher und Geltendmachung von Rechten</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              Wenn Sie einen unserer Social-Media-Auftritte (z.&nbsp;B. Facebook) besuchen, sind wir
              gemeinsam mit dem Betreiber der Social-Media-Plattform f&uuml;r die bei diesem Besuch
              ausgel&ouml;sten Datenverarbeitungsvorg&auml;nge verantwortlich. Sie k&ouml;nnen Ihre Rechte
              (Auskunft, Berichtigung, L&ouml;schung, Einschr&auml;nkung der Verarbeitung,
              Daten&uuml;bertragbarkeit und Beschwerde) grunds&auml;tzlich sowohl gegen&uuml;ber uns als
              auch gegen&uuml;ber dem Betreiber des jeweiligen Social-Media-Portals geltend machen.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Bitte beachten Sie, dass wir trotz der gemeinsamen Verantwortlichkeit mit den
              Social-Media-Portal-Betreibern nicht vollumf&auml;nglich Einfluss auf die
              Datenverarbeitungsvorg&auml;nge der Social-Media-Portale haben. Unsere M&ouml;glichkeiten
              richten sich ma&szlig;geblich nach der Unternehmenspolitik des jeweiligen Anbieters.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Speicherdauer</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Die unmittelbar von uns &uuml;ber die Social-Media-Pr&auml;senz erfassten Daten werden von
              unseren Systemen gel&ouml;scht, sobald Sie uns zur L&ouml;schung auffordern, Ihre
              Einwilligung zur Speicherung widerrufen oder der Zweck f&uuml;r die Datenspeicherung
              entf&auml;llt. Gespeicherte Cookies verbleiben auf Ihrem Endger&auml;t, bis Sie sie
              l&ouml;schen. Auf die Speicherdauer Ihrer Daten, die von den Betreibern der sozialen
              Netzwerke zu eigenen Zwecken gespeichert werden, haben wir keinen Einfluss.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Soziale Netzwerke im Einzelnen</h3>

            <h4 className="font-medium text-white/80 mb-1 mt-4">Facebook</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland.
              Wir haben mit Meta eine Vereinbarung &uuml;ber gemeinsame Verarbeitung (Controller Addendum)
              geschlossen:{' '}
              <a href="https://www.facebook.com/legal/terms/page_controller_addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/legal/terms/page_controller_addendum</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-3">
              <strong className="text-white/90">Werbeeinstellungen:</strong>{' '}
              <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/settings?tab=ads</a>.
              Daten&uuml;bertragung USA:{' '}
              <a href="https://www.facebook.com/legal/EU_data_transfer_addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">EU Data Transfer Addendum</a>.
              Datenschutzerkl&auml;rung:{' '}
              <a href="https://www.facebook.com/about/privacy/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">facebook.com/about/privacy</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Meta verf&uuml;gt &uuml;ber eine Zertifizierung nach dem &bdquo;EU-US Data Privacy
              Framework&ldquo; (DPF):{' '}
              <a href="https://www.dataprivacyframework.gov/participant/4452" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/4452</a>.
            </p>

            <h4 className="font-medium text-white/80 mb-1">Instagram</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland.
              Daten&uuml;bertragung USA:{' '}
              <a href="https://www.facebook.com/legal/EU_data_transfer_addendum" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">EU Data Transfer Addendum</a>.
              Datenschutzerkl&auml;rung:{' '}
              <a href="https://privacycenter.instagram.com/policy/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">privacycenter.instagram.com/policy</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/4452" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/4452</a>.
            </p>

            <h4 className="font-medium text-white/80 mb-1">YouTube</h4>
            <p className="text-white/90 leading-relaxed mb-3">
              Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
              Datenschutzerkl&auml;rung:{' '}
              <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">policies.google.com/privacy</a>.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              DPF-Zertifizierung:{' '}
              <a href="https://www.dataprivacyframework.gov/participant/5780" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">dataprivacyframework.gov/participant/5780</a>.
            </p>

            <h4 className="font-medium text-white/80 mb-1">TikTok</h4>
            <p className="text-white/90 leading-relaxed">
              Anbieter: TikTok Technology Limited, 10 Earlsfort Terrace, Dublin, D02 T380, Irland.
              Die Daten&uuml;bertragung in nicht sichere Drittstaaten wird auf die
              Standardvertragsklauseln der EU-Kommission gest&uuml;tzt.
              Datenschutzerkl&auml;rung:{' '}
              <a href="https://www.tiktok.com/legal/privacy-policy?lang=de" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">tiktok.com/legal/privacy-policy</a>.
            </p>
          </section>

          {/* ================================================================
              11. AUTOMATISIERTE ENTSCHEIDUNGSFINDUNG
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              11. Automatisierte Entscheidungsfindung (Art. 22 DSGVO)
            </h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir setzen automatisierte Verarbeitungsprozesse ein, die keine rechtsverbindlichen
              Entscheidungen treffen, aber die Art der Kommunikation beeinflussen k&ouml;nnen.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Lead-Scoring</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Automatische Bewertung anhand objektiver Kriterien (z.&nbsp;B. Bestellungen,
              Aktivit&auml;t). Keine sensiblen Daten. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Marketing-Automatisierung</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              Automatisierungsregeln reagieren auf Ereignisse (z.&nbsp;B. Bestellung,
              Kontaktanfrage) mit E-Mails oder Statusaktualisierungen. Rechtsgrundlage: Art. 6
              Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">KI-gest&uuml;tzte Inhaltserstellung (EU AI Act Art. 50)</h3>
            <p className="text-white/90 leading-relaxed mb-3">
              F&uuml;r Newsletter-Inhalte nutzen wir KI-Sprachmodelle. Die Inhalte werden vor dem
              Versand von einem Menschen &uuml;berpr&uuml;ft. Es werden keine personenbezogenen
              Daten an die KI-Dienste &uuml;bermittelt.
            </p>
            <p className="text-white/90 leading-relaxed mb-4">
              Gem&auml;&szlig; Art. 50 Abs. 2 der EU-KI-Verordnung (Verordnung (EU) 2024/1689)
              kennzeichnen wir KI-generierte Inhalte. E-Mails mit KI-Texten enthalten einen Hinweis
              im Fu&szlig;bereich.
            </p>

            <h3 className="text-lg font-medium text-white/90 mb-1">Ihre Rechte</h3>
            <p className="text-white/90 leading-relaxed">
              Sie haben das Recht, der automatisierten Verarbeitung zu widersprechen und eine
              &Uuml;berpr&uuml;fung durch einen Menschen zu verlangen. Kontaktieren Sie uns unter
              info@numerologie-pro.com.
            </p>
          </section>

          {/* ================================================================
              12. AUFTRAGSVERARBEITER
              ================================================================ */}
          <section>
            <h2 className="text-xl font-semibold text-gold mb-3">
              12. Auftragsverarbeiter (Art. 28 DSGVO)
            </h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Wir setzen folgende Auftragsverarbeiter ein, mit denen entsprechende AVV abgeschlossen
              wurden oder deren Standardvertragsklauseln gelten:
            </p>
            <ul className="list-disc list-inside text-white/90 leading-relaxed space-y-2">
              <li><strong className="text-white/90">Vercel Inc.</strong> (USA) &ndash; Website-Hosting, Analytics, Edge Functions</li>
              <li><strong className="text-white/90">Supabase Inc.</strong> (USA) &ndash; Datenbank, Authentifizierung, Dateispeicher</li>
              <li><strong className="text-white/90">Stripe Payments Europe, Ltd.</strong> (Irland) &ndash; Zahlungsabwicklung</li>
              <li><strong className="text-white/90">Resend, Inc.</strong> (USA) &ndash; E-Mail-Versand</li>
              <li><strong className="text-white/90">Cal.com, Inc.</strong> (USA) &ndash; Terminbuchung</li>
              <li><strong className="text-white/90">Meta Platforms Ireland Limited</strong> (Irland) &ndash; Meta Pixel, Conversions API, Instagram</li>
              <li><strong className="text-white/90">Google Ireland Limited</strong> (Irland) &ndash; Google Analytics</li>
              <li><strong className="text-white/90">ManyChat, Inc.</strong> (USA) &ndash; Chatbot-Automatisierung</li>
              <li><strong className="text-white/90">Telegram Messenger LLP</strong> (UK) &ndash; Messaging</li>
              <li><strong className="text-white/90">WhatsApp Ireland Limited</strong> (Irland / Meta) &ndash; Messaging</li>
              <li><strong className="text-white/90">Zoom Communications Inc.</strong> (USA) &ndash; Videokonferenzen</li>
              <li><strong className="text-white/90">ElevenLabs, Inc.</strong> (USA) &ndash; KI-Sprachassistent (&bdquo;Lisa&ldquo;)</li>
              <li><strong className="text-white/90">Upstash, Inc.</strong> (USA) &ndash; Serverless Redis (Rate-Limiting, Caching)</li>
              <li><strong className="text-white/90">Yandex LLC</strong> (Russland) &ndash; Webanalyse (nur /ru/, Art. 49 Abs. 1 lit. a DSGVO)</li>
            </ul>
            <p className="text-white/90 leading-relaxed mt-4">
              Bei der &Uuml;bermittlung von Daten in die USA st&uuml;tzen wir uns auf
              EU-Standardvertragsklauseln oder das EU-US Data Privacy Framework, soweit der
              jeweilige Anbieter zertifiziert ist.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
