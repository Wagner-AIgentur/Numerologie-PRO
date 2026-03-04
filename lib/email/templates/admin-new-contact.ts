import { baseTemplate, heading, paragraph, infoBox } from './base';

export function adminNewContactEmail({
  name,
  email,
  phone,
  topic,
  message,
  language,
}: {
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  message: string;
  language: string;
}): { subject: string; html: string } {
  const subject = `Neue Kontaktanfrage von ${name}`;

  const topicMap: Record<string, string> = {
    beziehungsmatrix: 'Beziehungsmatrix — Partnerschaft & Kompatibilität',
    lebensbestimmung: 'Lebensbestimmung — Berufung & Potenzial',
    wachstumsplan: 'Wachstumsplan — Persönliche Entwicklung',
    mein_kind: 'Mein Kind — Erziehung & Talente',
    geldkanal: 'Geldkanal — Finanzen & Wohlstand',
    jahresprognose: 'Jahresprognose — Planung & Ausblick',
    lebenskarte: 'Lebenskarte — Basisanalyse',
    pdf_analyse: 'PDF-Analyse — Psychomatrix',
    free_consultation: 'Kostenlose Erstberatung',
    other: 'Sonstiges',
  };

  const content = `
    ${heading('Neue Anfrage eingegangen')}
    ${paragraph('Eine neue Kontaktanfrage wurde über die Website übermittelt.')}
    ${infoBox(`
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">Name</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#e8e4d9; padding-bottom:16px; font-weight:500;">${name}</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">E-Mail</td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;">
            <a href="mailto:${email}" style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#D4AF37; text-decoration:none;">${email}</a>
          </td>
        </tr>
        ${phone ? `
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">Telefon</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#e8e4d9; padding-bottom:16px;">${phone}</td>
        </tr>
        ` : ''}
        ${topic ? `
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">Thema</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#e8e4d9; padding-bottom:16px;">${topicMap[topic] ?? topic}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">Sprache</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#e8e4d9; padding-bottom:16px;">${language === 'de' ? 'Deutsch' : 'Russisch'}</td>
        </tr>
      </table>
    `)}
    <div style="background:#0b2730; border:1px solid #1a3a2e; border-radius:12px; padding:20px 24px; margin:20px 0;">
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; margin:0 0 8px; text-transform:uppercase; letter-spacing:1px;">Nachricht</p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#e8e4d9; line-height:1.7; margin:0; white-space:pre-wrap;">${message}</p>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px auto;">
      <tr>
        <td align="center" style="background:#D4AF37; border-radius:50px; padding:0;">
          <a href="mailto:${email}" style="display:inline-block; padding:12px 28px; font-family:'Montserrat',Arial,sans-serif; font-size:13px; font-weight:600; color:#051a24; text-decoration:none; letter-spacing:1px; text-transform:uppercase; border-radius:50px;">
            Antworten
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `${name} hat eine Anfrage gestellt — ${email}`,
      content,
    }),
  };
}
