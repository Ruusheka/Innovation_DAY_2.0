'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function HeroSection() {
  const scrollToExplore = () => {
    const el = document.getElementById('departments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-[110px] sm:pt-[130px] pb-16 sm:pb-24 overflow-hidden bg-[#FAF9F5]">
      {/* Decorative vertical typography on far right (desktop only) */}
      <div className="hidden xl:flex flex-col items-center absolute right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="w-8 h-[1px] bg-[#91A9C9]/50 mb-6" />
        <div className="[writing-mode:vertical-lr] text-[11px] tracking-[0.35em] text-[#848C9B] uppercase font-medium space-y-4">
          <span>IDEAS</span>
          <span className="text-[#91A9C9]">•</span>
          <span>CODE</span>
          <span className="text-[#91A9C9]">•</span>
          <span>SOLUTIONS</span>
          <span className="text-[#91A9C9]">•</span>
          <span>TOMORROW</span>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[520px] sm:min-h-[580px]">
          
          {/* ── LEFT COLUMN (~50%) ── */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-5 h-[1.5px] bg-[#91A9C9]" />
              <span className="text-[12px] sm:text-[13px] tracking-[0.28em] text-[#41516B] font-semibold uppercase">
                INNOVATION &nbsp;/&nbsp; COLLABORATION &nbsp;/&nbsp; IMPACT
              </span>
            </motion.div>

            {/* Main Editorial Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
            >
              <h1 className="text-[54px] sm:text-[72px] lg:text-[86px] font-semibold text-[#041128] tracking-[-0.03em] leading-[0.95]">
                BUILD CLUB
              </h1>
              <div className="text-[54px] sm:text-[72px] lg:text-[86px] font-semibold text-[#041128] tracking-[-0.03em] leading-[0.95] mt-1">
                SSN I FOUND
              </div>
            </motion.div>

            {/* Hero Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
              className="mt-4 sm:mt-5"
            >
              <h2 className="text-[28px] sm:text-[38px] lg:text-[44px] font-normal text-[#91A9C9] tracking-tight leading-tight">
                PROJECT EXHIBITION
              </h2>
            </motion.div>

            {/* Hero Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
              className="mt-6 text-[16px] sm:text-[17.5px] leading-[1.65] text-[#41516B] max-w-[480px]"
            >
              Explore the innovative projects built by talented students at{' '}
              <span className="text-[#041128] font-medium">SSN College of Engineering</span>.
            </motion.p>

            {/* CTA + Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38, ease: 'easeOut' }}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              {/* Primary Pill Button */}
              <Link
                href="/projects"
                className="group btn-navy-pill w-[240px] sm:w-[250px]"
              >
                <span>Explore Projects</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              {/* Scroll down indicator */}
              <button
                onClick={scrollToExplore}
                className="group inline-flex items-center gap-3 text-sm font-medium text-[#41516B] hover:text-[#041128] transition-colors cursor-pointer py-2"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.18)] group-hover:border-[#91A9C9] flex items-center justify-center transition-colors bg-white/60">
                  <ArrowDown
                    size={15}
                    className="text-[#041128] transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#848C9B] group-hover:text-[#041128]">
                  Scroll to explore
                </span>
              </button>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (~50%) — Layered Composition ── */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-[500px] lg:max-w-[530px]"
            >
              {/* Backdrop: Soft blue circular/elliptical shape */}
              <div className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-[#91A9C9]/20 blur-2xl pointer-events-none" />

              {/* Geometric thin line frame */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-[22px] border border-[#91A9C9]/40 pointer-events-none hidden sm:block" />

              {/* Main Showcase Image Container */}
              <div className="relative z-10 w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-white shadow-[0_12px_40px_rgba(4,17,40,0.08)] border border-[rgba(4,17,40,0.08)] group">
                {/* Image or Exhibition Visual */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#EBF1F8] via-[#FFFFFF] to-[#E3EBF5] flex flex-col items-center justify-center p-8">
                  {/* Decorative technical grid background */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(145,169,201,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(145,169,201,0.2) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* SSN / Build Club central artwork showcase */}
                  <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="relative w-44 h-24 sm:w-56 sm:h-28 mb-4 transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src="/logo.png"
                        alt="BUILD CLUB Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#041128] text-white text-xs tracking-wider uppercase font-medium">
                      Innovation Day Exhibition
                    </div>
                    <p className="text-xs text-[#848C9B] mt-2 max-w-[260px]">
                      Featuring student engineering prototypes across CSE, ECE, EEE, MECH & CIVIL
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Build Club Glass Card (Upper Right) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="absolute -top-6 -right-3 sm:-top-8 sm:-right-6 z-20 glass-floating rounded-[18px] p-4 sm:p-5 max-w-[220px] sm:max-w-[240px] shadow-xl"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="relative w-7 h-7 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="BC"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[#041128] font-bold text-xs tracking-wide">BUILD CLUB</div>
                    <div className="text-[#91A9C9] text-[10px] font-semibold tracking-wider">SSN I FOUND</div>
                  </div>
                </div>
                <div className="text-[11.5px] font-medium text-[#41516B] leading-snug">
                  Student Projects.
                  <br />
                  <span className="text-[#041128] font-semibold">Real Impact.</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
