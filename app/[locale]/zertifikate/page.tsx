'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export default function ZertifikatePage() {
  const t = useTranslations('certificates');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Read certificate images from i18n
  const CERT_IMAGES: Array<{ image: string; alt: string }> = [];
  for (let i = 0; i < 11; i++) {
    try {
      CERT_IMAGES.push({
        image: t(`items.${i}.image`),
        alt: t(`items.${i}.alt`),
      });
    } catch {
      break;
    }
  }

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % CERT_IMAGES.length);
  };
  const goPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + CERT_IMAGES.length) % CERT_IMAGES.length
    );
  };

  // Keyboard navigation - global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="inline-block rounded-pill border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold mb-4">
              {t('badge')}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
              {t('title')}
            </h1>
            <p className="mt-3 text-white/60 text-base max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Grid Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CERT_IMAGES.map((img, idx) => (
              <motion.button
                key={img.image}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-gold/30 transition-all duration-300 cursor-pointer bg-[rgba(15,48,63,0.2)]"
              >
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-modal bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[90vh] max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={CERT_IMAGES[lightboxIndex].image}
                alt={CERT_IMAGES[lightboxIndex].alt}
                width={1000}
                height={1400}
                className="rounded-lg object-contain max-h-[90vh] w-auto shadow-2xl"
                priority
              />
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
              {lightboxIndex + 1} / {CERT_IMAGES.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
