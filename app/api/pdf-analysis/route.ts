import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { calculateMatrix } from '@/lib/numerology/calculate';
import { generateMatrixPDFBuffer } from '@/lib/numerology/pdf-generator';
import { sendEmail } from '@/lib/email/send';
import { pdfDeliveryEmail } from '@/lib/email/templates/pdf-delivery';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { birthdate, locale = 'de' } = body as {
      birthdate: string;
      locale: 'de' | 'ru';
    };

    if (!birthdate) {
      return NextResponse.json(
        { error: 'Missing birthdate' },
        { status: 400 }
      );
    }

    // Parse birthdate (format: DD.MM.YYYY)
    const parts = birthdate.split('.');
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid birthdate format. Expected DD.MM.YYYY' },
        { status: 400 }
      );
    }

    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid birthdate values' },
        { status: 400 }
      );
    }

    // Calculate matrix
    const result = calculateMatrix(day, month, year);

    // Generate PDF buffer with jsPDF (no browser needed, Vercel-safe)
    const pdfBuffer = generateMatrixPDFBuffer(result, birthdate, locale);

    // Upload PDF to Supabase Storage (deliverables bucket)
    const safeBirthdate = birthdate.replace(/\./g, '-');
    const filename = `psychomatrix-${safeBirthdate}.pdf`;
    const storagePath = `pdf/${user.id}/${filename}`;

    const { error: uploadError } = await adminClient.storage
      .from('deliverables')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[PDF Analysis] Storage upload failed:', uploadError);
    }

    // Get public URL and create deliverables entry for the dashboard
    const { data: publicUrlData } = adminClient.storage
      .from('deliverables')
      .getPublicUrl(storagePath);
    const fullUrl = publicUrlData?.publicUrl ?? storagePath;

    await adminClient.from('deliverables').upsert({
      profile_id: user.id,
      file_type: 'pdf',
      title: locale === 'de' ? `Psychomatrix PDF — ${birthdate}` : `PDF Психоматрицы — ${birthdate}`,
      file_url: fullUrl,
    }, { onConflict: 'profile_id,file_url', ignoreDuplicates: true });

    // Send email with PDF attachment
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://numerologie-pro.com'}/${locale}/dashboard/unterlagen`;
    const { subject, html } = pdfDeliveryEmail(locale, birthdate, dashboardUrl);

    await sendEmail({
      to: user.email,
      subject,
      html,
      template: 'pdf-delivery',
      profileId: user.id,
      attachments: [
        {
          filename: `psychomatrix-${birthdate.replace(/\./g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PDF Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
