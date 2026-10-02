'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { cn } from '@/lib/utils/cn';

// Cinematic Slideshow using exact files: /img1.png, /img2.png, /img3.png
const HERO_SLIDES = [
  {
    id: 1,
    src: '/img1.png',
    alt: 'Build Club × Lakshya — Engineering Prototyping & Innovation',
    caption: 'Hardware Prototyping',
  },
  {
    id: 2,
    src: '/img2.png',
    alt: 'Build Club × Lakshya — Autonomous Systems & Circuit Design',
    caption: 'Embedded Intelligence',
  },
  {
    id: 3,
    src: '/img3.png',
    alt: 'SSN College of Engineering Campus Building',
    caption: 'SSN Innovation Center',
  },
];

export function HeroSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right-to-left' | 'left-to-right'>('right-to-left');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Automatic slideshow loop: 4.8s visible, smooth crossfade transition inside stationary tilted frame
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        setSlideDirection(next % 2 === 1 ? 'right-to-left' : 'left-to-right');
        return next;
      });
    }, prefersReducedMotion ? 7000 : 4800);

    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const currentSlide = HERO_SLIDES[slideIndex];

  return (
    <section
      id="hero"
      className="relative pt-[115px] sm:pt-[128px] md:pt-[138px] pb-14 sm:pb-20 overflow-hidden bg-[#F8F7F3]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Far Right Decorative Vertical Typography (Desktop Only - positioned safely within section) */}
      <div className="hidden 2xl:flex flex-col items-center absolute right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none">
        <div className="w-6 h-[1.5px] bg-[#91A9C9]/50 mb-6" />
        <div className="[writing-mode:vertical-lr] text-[11px] tracking-[0.35em] text-[#848C9B] uppercase font-medium space-y-4">
          <span>IDEAS</span>
          <span className="text-[#FF9D00]">&bull;</span>
          <span>CODE</span>
          <span className="text-[#5277A8]">&bull;</span>
          <span>SOLUTIONS</span>
          <span className="text-[#FF6500]">&bull;</span>
          <span>TOMORROW</span>
        </div>
      </div>

      <PageContainer>
        {/* Two-Column Master Grid: Left ~48-50%, Right ~50-52% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center min-h-[500px] lg:min-h-[540px]">
          
          {/* ── LEFT COLUMN (~45%) ── */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center z-10 min-w-0">
            {/* 1. Small Editorial Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-4 sm:mb-5"
            >
              <div className="w-5 h-[1.5px] bg-[#FF9D00] shrink-0" />
              <span className="text-[11px] sm:text-[12.5px] tracking-[0.25em] text-[#5277A8] font-semibold uppercase">
                INNOVATION &nbsp;/&nbsp; COLLABORATION &nbsp;/&nbsp; IMPACT
              </span>
            </motion.div>

            {/* 2. Main Hero Title: BUILD CLUB × LAKSHYA */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-start">
                <h1
                  className="font-primary font-normal text-[#041128] tracking-[-0.025em] leading-[0.92] m-0"
                  style={{ fontSize: 'clamp(52px, 5.6vw, 88px)' }}
                >
                  BUILD CLUB
                </h1>
                
                {/* Special Collaboration × & Lakshya with bright yellow -> orange -> red gradient */}
                <div className="flex items-center gap-2 sm:gap-3.5 mt-1 sm:mt-2 flex-wrap">
                  <span
                    aria-hidden="true"
                    className="font-serif italic font-light text-[#E5A83B] select-none text-2xl sm:text-3xl lg:text-4xl leading-none opacity-95"
                  >
                    ×
                  </span>
                  <span
                    className="font-primary font-normal tracking-[-0.02em] leading-[0.92] bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] via-[#FF6500] to-[#FF3D00] bg-clip-text text-transparent"
                    style={{ fontSize: 'clamp(46px, 5.2vw, 82px)' }}
                  >
                    LAKSHYA
                  </span>
                </div>

                {/* Subtle gold accent underline */}
                <div className="w-14 h-[2px] bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] to-transparent rounded-full mt-3.5" />
              </div>
            </motion.div>

            {/* 3. Hero Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
              className="mt-4 sm:mt-5"
            >
              <h2
                className="font-primary font-normal text-[#5277A8] tracking-[-0.02em] leading-tight m-0"
                style={{ fontSize: 'clamp(26px, 3.2vw, 42px)' }}
              >
                PROJECT EXHIBITION
              </h2>
            </motion.div>

            {/* 4. Body Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
              className="mt-5 sm:mt-6 text-[16px] sm:text-[17px] leading-[1.62] text-[#3D5574] max-w-[480px] font-normal"
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
                className="group inline-flex items-center gap-3 text-sm font-medium text-[#41516B] hover:text-[#041128] transition-colors cursor-pointer py-2"
                aria-label="Scroll down to explore projects by department"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.18)] group-hover:border-[#FF9D00] flex items-center justify-center transition-colors bg-white/70 shadow-sm">
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

          {/* ── RIGHT COLUMN (~55%) — Tilted Single-Frame Slideshow with Orbital Shapes Behind ── */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end mt-6 lg:mt-0 w-full">
            <div className="relative w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[680px] xl:max-w-[720px]">
              
              {/* ── LAYER 0: SHAPES & ORBITS SITTING BEHIND THE HERO IMAGE ── */}
              
              {/* 1. Large Pale Cream / Soft Orange Radial Glow Circle */}
              <div
                className="absolute -top-14 -left-10 sm:-top-20 sm:-left-16 w-[450px] sm:w-[540px] lg:w-[600px] h-[450px] sm:h-[540px] lg:h-[600px] rounded-full pointer-events-none z-0 max-w-full overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 157, 0, 0.14) 0%, rgba(255, 210, 26, 0.07) 45%, rgba(248, 247, 243, 0) 72%)',
                  transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
                  transition: 'transform 0.25s ease-out',
                }}
              />

              {/* 2. Thin Orange Orbital Circular Stroke Behind Image */}
              <div
                className="absolute -top-10 -left-6 sm:-top-14 sm:-left-10 w-[420px] sm:w-[500px] h-[420px] sm:h-[500px] rounded-full border border-[#FF9D00]/22 pointer-events-none z-0 hidden sm:block"
                style={{
                  transform: `translate(${mouseOffset.x * -0.3}px, ${mouseOffset.y * -0.3}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              />

              {/* 3. Secondary Pale Blue Architectural Orbital Arc Behind Image */}
              <div
                className="absolute -bottom-10 -right-6 sm:-bottom-14 sm:-right-8 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] rounded-full border border-[#91A9C9]/25 pointer-events-none z-0 hidden sm:block"
                style={{
                  transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              />

              {/* 4. Layered Orbital SVG Curves Travelling Around / Behind Image */}
              <svg
                className="absolute inset-[-14%] w-[128%] h-[128%] pointer-events-none z-0"
                viewBox="0 0 800 620"
                fill="none"
                aria-hidden="true"
              >
                {/* Thin orange orbital path */}
                <path
                  d="M36 468C156 118 536 28 766 194"
                  stroke="#FF9D00"
                  strokeOpacity="0.28"
                  strokeWidth="1.2"
                  strokeDasharray="6 4"
                />
                {/* Pale blue architectural curve */}
                <path
                  d="M88 552C224 228 579 116 785 286"
                  stroke="#91A9C9"
                  strokeOpacity="0.30"
                  strokeWidth="1"
                />
                {/* Warm orange-red lower orbital sweep */}
                <path
                  d="M20 362C248 554 570 550 766 380"
                  stroke="#FF6500"
                  strokeOpacity="0.22"
                  strokeWidth="1"
                />
              </svg>

              {/* ── LAYER 10: TILTED HERO IMAGE WINDOW (STATIONARY FRAME) ── */}
              {/* Entire frame itself is visibly tilted with rounded corners, soft shadow, ring */}
              <div
                className="relative z-10 w-full aspect-[4/3] rounded-[28px] sm:rounded-[34px] overflow-hidden bg-white shadow-[0_30px_75px_rgba(4,17,40,0.18)] ring-[7px] sm:ring-[9px] ring-white/65 border border-white/90 transform -rotate-[2.2deg] sm:-rotate-[2.6deg] transition-all duration-700 ease-out group"
                style={{
                  transform: `rotate(-2.5deg) translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                }}
              >
                {/* Slideshow transitions smoothly INSIDE this single tilted window */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentSlide.id}
                    initial={{
                      opacity: 0,
                      scale: 1.04,
                      x: slideDirection === 'right-to-left' ? 40 : -40,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      x: slideDirection === 'right-to-left' ? -40 : 40,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0.3 : 1.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full overflow-hidden"
                  >
                    {/* Subtle continuous micro-motion while displayed */}
                    <motion.div
                      animate={{
                        scale: prefersReducedMotion ? 1 : [1, 1.025, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative w-full h-full"
                    >
                      {/* Original photograph */}
                      <Image
                        src={currentSlide.src}
                        alt={currentSlide.alt}
                        fill
                        priority
                        sizes="(max-width: 768px) 95vw, 680px"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                      />

                      {/* SUBTLE WARM ORANGE / SUNSET ATMOSPHERIC PHOTOGRAPHIC TINT (~8-12% opacity) */}
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-[#FF6500]/[0.10] via-[#FF9D00]/[0.08] to-transparent pointer-events-none mix-blend-color"
                        aria-hidden="true"
                      />

                      {/* Golden highlight overlay + subtle bottom dark contrast scrim */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[#041128]/35 via-transparent to-[#FFD21A]/[0.08] pointer-events-none"
                        aria-hidden="true"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Slideshow Progress Indicators */}
                <div className="absolute bottom-3.5 left-4 z-20 flex items-center gap-1.5 bg-[#041128]/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setSlideIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
                        idx === slideIndex
                          ? 'w-5 bg-gradient-to-r from-[#FFD21A] to-[#FF9D00]'
                          : 'bg-white/40 hover:bg-white/70'
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* ── LAYER 20: FOREGROUND ACCENT & COLLABORATION BADGE ── */}
              
              {/* Golden sparkle at bottom corner */}
              <span
                aria-hidden="true"
                className="hero-sparkle absolute -right-2 bottom-[10%] z-20 text-[#FFB800] text-xl font-serif select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(255,184,0,0.4)]"
              >
                ✦
              </span>

              {/* Foreground delicate gold accent arc crossing near corner */}
              <svg
                className="absolute inset-[-14%] w-[128%] h-[128%] pointer-events-none z-20 hidden sm:block"
                viewBox="0 0 800 620"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M690 420C730 455 770 480 800 495"
                  stroke="#FFD21A"
                  strokeOpacity="0.38"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Floating Collaborative Glass Card with Build Club + Lakshya Logo */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.55, ease: 'easeOut' }}
                className="absolute -top-5 -right-3 sm:-top-6 sm:-right-5 z-20 rounded-[22px] bg-white/85 backdrop-blur-[20px] border border-white/90 p-4 sm:p-5 shadow-[0_16px_40px_rgba(4,17,40,0.12)] pointer-events-auto max-w-[240px] sm:max-w-[265px]"
                style={{
                  transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
                  transition: 'transform 0.18s ease-out',
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Build Club"
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                  <span aria-hidden="true" className="font-serif italic font-light text-[14px] text-[#E5A83B] select-none opacity-90">×</span>
                  <div className="relative w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] shrink-0">
                    <Image
                      src="/LakLogo.png"
                      alt="Lakshya"
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  </div>
                  <div className="leading-tight pl-0.5">
                    <div className="text-[#041128] font-bold text-xs tracking-wide">BUILD CLUB</div>
                    <div className="text-[10px] font-semibold bg-gradient-to-r from-[#FF9D00] to-[#FF3D00] bg-clip-text text-transparent uppercase tracking-wider">
                      LAKSHYA
                    </div>
                  </div>
                </div>
                <div className="text-[12px] font-medium text-[#41516B] leading-snug border-t border-[rgba(4,17,40,0.06)] pt-2">
                  Student Innovations.
                  <br />
                  <span className="text-[#041128] font-semibold">Excellence & Impact.</span>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </PageContainer>
    </section>
  );
}
