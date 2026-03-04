'use client';

import { useScroll, useTransform, motion } from 'framer-motion';

export default function GlobalBackground() {
  const { scrollY } = useScroll();

  // Scroll parallax — mandala moves up slower than page (0.3x speed)
  const y = useTransform(scrollY, [0, 2000], [0, -600]);
  // Rotation driven by scroll — gentle spin effect
  const rotate = useTransform(scrollY, [0, 3000], [0, 180]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Blume Mandala — slow spin + scroll parallax */}
      <motion.div
        style={{ y, rotate }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.07]"
      >
        <img
          src="/images/blume.webp"
          alt=""
          className="w-full h-full object-contain"
          style={{ animation: 'spin 90s linear infinite' }}
        />
      </motion.div>

      {/* Subtle blue glow — atmosphere */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent" />

      {/* SVG Fractal Noise Texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.02]"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <filter id="noise-bg">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-bg)" />
      </svg>
    </div>
  );
}
