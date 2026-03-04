import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Numerologie PRO — Pythagoras Psychomatrix Beratung';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #051a24 0%, #0a2533 50%, #051a24 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold accent circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top gold line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            display: 'flex',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.1)',
            marginBottom: 24,
          }}
        >
          <span style={{ color: '#D4AF37', fontSize: 16, fontWeight: 600 }}>
            Pythagoras Psychomatrix · 500+ Beratungen
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: -1,
            }}
          >
            Numerologie
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#D4AF37',
              letterSpacing: -1,
            }}
          >
            PRO
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 20,
            maxWidth: 700,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Entdecke deine Psychomatrix — Kostenloser Rechner + Professionelle Beratung
        </p>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 32px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #ECC558, #D4AF37)',
            marginTop: 32,
          }}
        >
          <span style={{ color: '#051a24', fontSize: 18, fontWeight: 700 }}>
            numerologie-pro.com
          </span>
        </div>

        {/* Author line */}
        <p
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          Swetlana Wagner · Zertifizierte Numerologin · Deutsch & Russisch
        </p>

        {/* Bottom gold line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
