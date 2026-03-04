import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { calculateMatrix } from '@/lib/numerology/calculate';
import { generateMatrixPDFBuffer } from '@/lib/numerology/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    // Upload PDF to Supabase Storage and save deliverable for dashboard
    const safeBirthdate = birthdate.replace(/\./g, '-');
    const filename = `psychomatrix-${safeBirthdate}.pdf`;
    const storagePath = `pdf/${user.id}/${filename}`;

    try {
      await adminClient.storage
        .from('deliverables')
        .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

      const { data: publicUrlData } = adminClient.storage
        .from('deliverables')
        .getPublicUrl(storagePath);

      await adminClient.from('deliverables').upsert({
        profile_id: user.id,
        file_type: 'pdf',
        title: locale === 'de' ? `Psychomatrix PDF — ${birthdate}` : `PDF Психоматрицы — ${birthdate}`,
        file_url: publicUrlData?.publicUrl ?? storagePath,
      }, { onConflict: 'profile_id,file_url', ignoreDuplicates: true });
    } catch (e) {
      console.error('[PDF Download] Deliverable save failed:', e);
      // Continue — still return the PDF to the user even if storage fails
    }

    // Return PDF as download (RFC 5987 safe filename)
    const safeName = `psychomatrix-${birthdate.replace(/[^0-9]/g, '-')}.pdf`;
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      },
    });
  } catch (error) {
    console.error('[PDF Download] Error:', error);
    console.error('[PDF Download] Stack:', (error as Error).stack);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
