'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          onClick={scrollTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-widget flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#d4af37] text-[#051a24] shadow-[0_0_20px_rgba(212,175,55,0.6)] hover:bg-[#e4bf47] hover:shadow-[0_0_30px_rgba(212,175,55,0.8)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
