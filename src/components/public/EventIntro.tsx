'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

export function EventIntro() {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (reducedMotion || window.sessionStorage.getItem('build-club-intro-seen')) {
        setVisible(false);
        return;
      }
      timer = window.setTimeout(() => {
        setVisible(false);
        window.sessionStorage.setItem('build-club-intro-seen', '1');
      }, 1950);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="event-intro fixed inset-0 z-[10000] flex items-center justify-center bg-[#F8F7F3]/92 backdrop-blur-[24px] pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle warm orange & gold atmospheric glow behind */}
          <div
            className="absolute w-[440px] sm:w-[560px] h-[440px] sm:h-[560px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 157, 0, 0.16) 0%, rgba(255, 210, 26, 0.08) 45%, transparent 72%)',
            }}
          />

          {/* Thin circular orbital lines matching hero design */}
          <div className="absolute w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full border border-[#FF9D00]/25 pointer-events-none" />
          <div className="absolute w-[440px] sm:w-[560px] h-[440px] sm:h-[560px] rounded-full border border-[#91A9C9]/20 pointer-events-none" />

          {/* Central Reveal Container */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg">
            
            {/* Logos Lockup: Build Club Logo × Lakshya Logo */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-7">
              {/* Build Club Logo: 300–600ms */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
                className="relative w-[76px] sm:w-[94px] h-[57px] sm:h-[70px] shrink-0"
              >
                <Image
                  src="/logo.png"
                  alt="Build Club"
                  fill
                  priority
                  sizes="100px"
                  className="object-contain"
                />
              </motion.div>

              {/* Special Collaboration × Mark: 700–900ms */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.65, ease: 'easeOut' }}
                className="font-serif italic font-light text-2xl sm:text-3xl text-[#E5A83B] select-none mx-1 opacity-90 leading-none"
              >
                ×
              </motion.span>

              {/* Lakshya Logo (clearly visible 70–84px): 500–800ms */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
                className="relative w-[68px] sm:w-[84px] h-[68px] sm:h-[84px] shrink-0"
              >
                <Image
                  src="/LakLogo.png"
                  alt="Lakshya"
                  fill
                  priority
                  sizes="90px"
                  className="object-contain"
                />
              </motion.div>
            </div>

            {/* Event Branding Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-[#5277A8] mb-2"
            >
              BUILD CLUB <span className="text-[#E5A83B] font-serif italic lowercase font-light">×</span>{' '}
              <span className="bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] to-[#FF3D00] bg-clip-text text-transparent">
                LAKSHYA
              </span>
            </motion.p>

            {/* INNOVATION DAY: 900–1200ms */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="font-primary text-4xl sm:text-6xl md:text-7xl leading-[0.98] tracking-tight text-[#041128] m-0"
            >
              INNOVATION DAY
            </motion.h1>

            {/* Subtle Divider Rule */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 56, opacity: 1 }}
              transition={{ duration: 0.45, delay: 1.0 }}
              className="my-4 h-[1.5px] bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] to-[#FF6500] rounded-full mx-auto"
            />

            {/* 2026: 1100–1400ms */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.05 }}
              className="font-primary text-3xl sm:text-5xl text-[#041128] m-0"
            >
              2026
            </motion.p>

            {/* 6TH — 7TH OCTOBER: 1300–1500ms */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 1.25 }}
              className="mt-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#5277A8]"
            >
              6th <span className="text-[#FF9D00]">—</span> 7th October
            </motion.p>

            {/* Tiny Golden Sparkle ✦ */}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.35 }}
              className="absolute -right-4 top-1/2 text-sm text-[#FFB800] select-none"
            >
              ✦
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
