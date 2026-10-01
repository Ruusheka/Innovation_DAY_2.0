'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';

export function HeroSection() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Subtle parallax calculation on desktop (limited to max 4px movement)
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((clientY - rect.top) / rect.height - 0.5) * 6;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const scrollToExplore = () => {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-[115px] sm:pt-[128px] md:pt-[138px] pb-14 sm:pb-20 overflow-hidden bg-[#FAF9F5]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Far Right Decorative Vertical Typography (Desktop Only - positioned safely within section) */}
      <div className="hidden 2xl:flex flex-col items-center absolute right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none">
        <div className="w-6 h-[1.5px] bg-[#91A9C9]/50 mb-6" />
        <div className="[writing-mode:vertical-lr] text-[11px] tracking-[0.35em] text-[#848C9B] uppercase font-sans font-medium space-y-4">
          <span>IDEAS</span>
          <span className="text-[#5277A8]">•</span>
          <span>CODE</span>
          <span className="text-[#5277A8]">•</span>
          <span>SOLUTIONS</span>
          <span className="text-[#5277A8]">•</span>
          <span>TOMORROW</span>
        </div>
      </div>

      <PageContainer>
        {/* Two-Column Master Grid: Left ~48-50%, Right ~50-52% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center min-h-[500px] lg:min-h-[540px]">
          
          {/* ── LEFT COLUMN (~48%) ── */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center z-10 min-w-0">
            {/* 1. Small Editorial Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-4 sm:mb-5"
            >
              <div className="w-5 h-[1.5px] bg-[#5277A8] shrink-0" />
              <span className="text-[11px] sm:text-[12.5px] tracking-[0.25em] text-[#5277A8] font-sans font-semibold uppercase">
                INNOVATION &nbsp;/&nbsp; COLLABORATION &nbsp;/&nbsp; IMPACT
              </span>
            </motion.div>

            {/* 2. Main Hero Title (DM Serif Display) */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
            >
              <h1
                className="font-display font-normal text-[#041128] tracking-[-0.025em] leading-[0.93] m-0"
                style={{ fontSize: 'clamp(56px, 5.8vw, 92px)' }}
              >
                BUILD CLUB
              </h1>
              <div
                className="font-display font-normal text-[#041128] tracking-[-0.025em] leading-[0.93] mt-1 sm:mt-2"
                style={{ fontSize: 'clamp(56px, 5.8vw, 92px)' }}
              >
                SSN I FOUND
              </div>
            </motion.div>

            {/* 3. Hero Subtitle (Manrope) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
              className="mt-3 sm:mt-4"
            >
              <h2
                className="font-sans font-normal text-[#5277A8] tracking-[-0.02em] leading-tight m-0"
                style={{ fontSize: 'clamp(26px, 3.2vw, 44px)' }}
              >
                PROJECT EXHIBITION
              </h2>
            </motion.div>

            {/* 4. Body Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
              className="mt-5 sm:mt-6 text-[16px] sm:text-[17px] leading-[1.62] text-[#3D5574] max-w-[480px] font-sans font-normal"
            >
              Explore the innovative projects built by talented students at{' '}
              <span className="text-[#041128] font-semibold">SSN College of Engineering</span>.
            </motion.p>

            {/* 5. CTAs: Primary + Secondary on SAME row on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38, ease: 'easeOut' }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-5 sm:gap-6"
            >
              {/* Primary Pill Button */}
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group btn-navy-pill w-[240px] sm:w-[250px] !h-[58px] cursor-pointer"
              >
                <span>Explore Projects</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-250 ease-out group-hover:translate-x-1.5"
                />
              </a>

              {/* Secondary Circular Scroll-To-Explore */}
              <button
                onClick={scrollToExplore}
                className="group inline-flex items-center gap-3 text-sm font-sans font-medium text-[#41516B] hover:text-[#041128] transition-colors cursor-pointer py-2"
                aria-label="Scroll down to explore projects by department"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.18)] group-hover:border-[#5277A8] flex items-center justify-center transition-colors bg-white/70 shadow-sm">
                  <ArrowDown
                    size={15}
                    className="text-[#041128] transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </div>
                <span className="text-[12px] uppercase tracking-wider text-[#848C9B] group-hover:text-[#041128] font-semibold">
                  Scroll to explore
                </span>
              </button>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (~52%) — Layered Hero Composition ── */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative w-full max-w-[490px] lg:max-w-[540px]">
              
              {/* 1. Behind: Soft blue circular shape (pulsing subtly) */}
              <div
                className="absolute -top-10 -left-10 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-[#C9DCF5]/40 blur-3xl pointer-events-none animate-soft-pulse"
                style={{
                  transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
                  transition: 'transform 0.2s ease-out',
                }}
              />

              {/* 2. Behind: Thin geometric outline frame */}
              <div
                className="absolute -top-3.5 -right-3.5 w-full h-full rounded-[22px] border border-[#91A9C9]/50 pointer-events-none hidden sm:block"
                style={{
                  transform: `rotate(-2deg) translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
                  transition: 'transform 0.2s ease-out',
                }}
              />

              {/* 3. Main Showcase Building Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: -2 }}
                transition={{ duration: 0.85, delay: 0.22, ease: 'easeOut' }}
                className="relative z-10 w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-white shadow-[0_16px_48px_rgba(4,17,40,0.11)] border border-[rgba(4,17,40,0.08)] group"
                style={{
                  transform: `rotate(-2deg) translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                {/* Floating motion wrapper */}
                <div className="relative w-full h-full animate-gentle-float">
                  <Image
                    src="/ssn-building.png"
                    alt="SSN College of Engineering Campus Building"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 540px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  {/* Subtle editorial scrim gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* 4. Floating Glass Card (Restrained, Upper-Right of Image, Never Overlapping Navbar) */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.55, ease: 'easeOut' }}
                className="absolute -top-5 -right-3 sm:-top-6 sm:-right-5 z-20 glass-floating rounded-[18px] p-4 sm:p-5 max-w-[215px] sm:max-w-[235px] shadow-xl pointer-events-auto"
                style={{
                  transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
                  transition: 'transform 0.18s ease-out',
                }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="relative w-7 h-7 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Build Club Icon"
                      fill
                      className="object-contain"
                      sizes="28px"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[#041128] font-sans font-bold text-xs tracking-wide">BUILD CLUB</div>
                    <div className="text-[#5277A8] font-sans text-[10px] font-semibold tracking-wider">SSN I FOUND</div>
                  </div>
                </div>
                <div className="text-[12px] font-sans font-medium text-[#41516B] leading-snug">
                  Student Projects.
                  <br />
                  <span className="text-[#041128] font-bold">Real Impact.</span>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </PageContainer>
    </section>
  );
}
