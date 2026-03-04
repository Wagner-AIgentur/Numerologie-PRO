export function baseTemplate({
  title,
  preheader,
  content,
  unsubscribeUrl,
  aiGenerated,
}: {
  title: string;
  preheader: string;
  content: string;
  unsubscribeUrl?: string;
  aiGenerated?: boolean;
}): string {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { background-color: #051a24 !important; font-family: 'Montserrat', Arial, sans-serif; color: #e8e4d9; }
    /* Gmail dark mode override */
    u + .body { background-color: #051a24 !important; }
    [data-ogsc] { background-color: #051a24 !important; }
  </style>
</head>
<body class="body" bgcolor="#051a24" style="background-color:#051a24; background:#051a24; margin:0; padding:0; -webkit-text-size-adjust:none; -ms-text-size-adjust:none;">

  <!-- Preheader (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:#051a24; line-height:1px;">
    ${preheader}&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#051a24" style="background-color:#051a24; background:#051a24; min-height:100vh; width:100%; margin:0; padding:0;">
    <tr>
      <td align="center" bgcolor="#051a24" style="background-color:#051a24; background:#051a24; padding:40px 16px;">

        <!-- Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a2533" style="max-width:600px; width:100%; background-color:#0a2533; background:#0a2533; border-radius:16px; border:1px solid #2a4a3a; overflow:hidden;">

          <!-- Gold Top Bar -->
          <tr>
            <td bgcolor="#D4AF37" style="background:#D4AF37; height:4px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td align="center" bgcolor="#0a2533" style="background-color:#0a2533; padding:36px 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo Text -->
                    <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:26px; font-weight:700; color:#D4AF37; letter-spacing:2px;">
                      NUMEROLOGIE <span style="color:#ECC558;">PRO</span>
                    </div>
                    <div style="margin-top:6px; width:60px; height:2px; background:#D4AF37; margin-left:auto; margin-right:auto;"></div>
                    <div style="margin-top:8px; font-family:'Montserrat', Arial, sans-serif; font-size:11px; font-weight:500; color:#8a8778; letter-spacing:3px; text-transform:uppercase;">
                      Swetlana Wagner
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td bgcolor="#0a2533" style="background-color:#0a2533; padding:0 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td bgcolor="#0a2533" style="background-color:#0a2533; padding:0 40px;">
              <div style="height:1px; background:#1a3a2e;"></div>
            </td>
          </tr>

          ${aiGenerated ? `<!-- AI Disclosure (AI Act Art. 50) -->
          <tr>
            <td align="center" bgcolor="#0a2533" style="background-color:#0a2533; padding:12px 40px 0;">
              <p style="font-family:'Montserrat', Arial, sans-serif; font-size:10px; color:#4a4840; line-height:1.5; text-align:center; font-style:italic;">
                &#9881; Dieser Inhalt wurde mit KI-Unterst&uuml;tzung erstellt. / Этот контент создан с помощью ИИ.
              </p>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#0a2533" style="background-color:#0a2533; padding:28px 40px 36px;">
              <p style="font-family:'Montserrat', Arial, sans-serif; font-size:12px; color:#5e5c54; line-height:1.6; text-align:center;">
                &copy; ${new Date().getFullYear()} Numerologie PRO &middot; Swetlana Wagner<br/>
                <a href="https://numerologie-pro.com" style="color:#D4AF37; text-decoration:none;">numerologie-pro.com</a>
                ${unsubscribeUrl ? `<br/><a href="${unsubscribeUrl}" style="color:#5e5c54; text-decoration:underline; font-size:11px;">E-Mail-Benachrichtigungen abbestellen / Отписаться от рассылки</a>` : ''}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function goldButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
    <tr>
      <td align="center" style="background:#D4AF37; border-radius:50px; padding:0;">
        <a href="${href}" style="display:inline-block; padding:14px 36px; font-family:'Montserrat',Arial,sans-serif; font-size:13px; font-weight:600; color:#051a24; text-decoration:none; letter-spacing:1.5px; text-transform:uppercase; border-radius:50px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function paragraph(text: string): string {
  return `<p style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#cdc9be; line-height:1.8; margin:0 0 16px;">${text}</p>`;
}

export function heading(text: string): string {
  return `<h2 style="font-family:'Cormorant Garamond',Georgia,serif; font-size:28px; font-weight:600; color:#D4AF37; letter-spacing:1px; margin:0 0 20px; line-height:1.3;">${text}</h2>`;
}

export function infoBox(content: string): string {
  return `<div style="background-color:#0e2935; background:#0e2935; border:1px solid #2a4a3a; border-radius:12px; padding:20px 24px; margin:20px 0;">
    ${content}
  </div>`;
}
