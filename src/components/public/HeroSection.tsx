'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { cn } from '@/lib/utils/cn';

// Cinematic Slideshow using exact files: /img1.png, /img2.png, /img3.png
const HERO_SLIDES = [
  {
    id: 1,
    src: '/img1.png',
    alt: 'Build Club SSN — Engineering Prototyping & Innovation',
    caption: 'Hardware Prototyping',
    // Subtle composition parameters
    imageTransform: 'rotate-[-2deg] translate-x-0 translate-y-0',
    outlineTransform: 'rotate-[-2.5deg] translate-x-0 translate-y-0',
  },
  {
    id: 2,
    src: '/img2.png',
    alt: 'Build Club SSN — Autonomous Systems & Circuit Design',
    caption: 'Embedded Intelligence',
    // Slide 2: image shifts slightly toward center
    imageTransform: 'rotate-[1.8deg] -translate-x-3.5 translate-y-1',
    outlineTransform: 'rotate-[2.2deg] -translate-x-2 translate-y-1.5',
  },
  {
    id: 3,
    src: '/img3.png',
    alt: 'SSN College of Engineering Campus Building',
    caption: 'SSN Innovation Center',
    // Slide 3: image moves with slight vertical movement
    imageTransform: 'rotate-[-1deg] translate-x-3 -translate-y-2',
    outlineTransform: 'rotate-[-1.5deg] translate-x-3.5 -translate-y-2',
  },
];

export function HeroSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right-to-left' | 'left-to-right'>('right-to-left');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Automatic slideshow loop: 3.5s visible, 1.0s smooth transition, alternating direction
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        // Alternating transition directions:
        // Slide 0 -> 1: right to left
        // Slide 1 -> 2: left to right
        // Slide 2 -> 0: right to left
        setSlideDirection(next % 2 === 1 ? 'right-to-left' : 'left-to-right');
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

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
          <span className="text-[#5277A8]">&bull;</span>
          <span>CODE</span>
          <span className="text-[#5277A8]">&bull;</span>
          <span>SOLUTIONS</span>
          <span className="text-[#5277A8]">&bull;</span>
          <span>TOMORROW</span>
        </div>
      </div>

      <PageContainer>
        {/* Two-Column Master Grid: Left ~48-50%, Right ~50-52% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center min-h-[500px] lg:min-h-[540px]">
          
          {/* ── LEFT COLUMN (~40%) ── */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center z-10 min-w-0">
            {/* 1. Small Editorial Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-3 mb-4 sm:mb-5"
            >
              <div className="w-5 h-[1.5px] bg-[#5277A8] shrink-0" />
              <span className="text-[11px] sm:text-[12.5px] tracking-[0.25em] text-[#5277A8] font-semibold uppercase">
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
                className="font-primary font-normal text-[#041128] tracking-[-0.025em] leading-[0.93] m-0"
                style={{ fontSize: 'clamp(56px, 5.8vw, 92px)' }}
              >
                BUILD CLUB
              </h1>
              <div
                className="font-primary font-normal text-[#041128] tracking-[-0.025em] leading-[0.93] mt-1 sm:mt-2"
                style={{ fontSize: 'clamp(56px, 5.8vw, 92px)' }}
              >
                SSN I FOUND
              </div>
            </motion.div>

            {/* 3. Hero Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
              className="mt-3 sm:mt-4"
            >
              <h2
                className="font-primary font-normal text-[#5277A8] tracking-[-0.02em] leading-tight m-0"
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

          {/* ── RIGHT COLUMN (~55-60%) — Cinematic Hero Slideshow Composition ── */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end mt-6 lg:mt-0 w-full">
            <div className="relative w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[680px] xl:max-w-[720px]">
              
              {/* 1. Behind: Large Circular Pale-Blue Background Shape */}
              <div
                className="absolute -top-12 -left-10 sm:-top-16 sm:-left-14 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] rounded-full pointer-events-none animate-soft-pulse z-0 max-w-full overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, rgba(145,169,201,0.45) 0%, rgba(197,216,238,0.35) 60%, rgba(248,247,243,0) 80%)',
                  border: '1px solid rgba(145,169,201,0.30)',
                  transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
                  transition: 'transform 0.25s ease-out',
                }}
              />

              {/* 2. Behind: Thin geometric outline frame shifting per slide */}
              <div
                className={cn(
                  'absolute -top-3.5 -right-3.5 w-full h-full rounded-[28px] border border-[#91A9C9]/50 pointer-events-none hidden sm:block z-0 transition-transform duration-1000 ease-out',
                  currentSlide.outlineTransform
                )}
                style={{
                  transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
                }}
              />

              {/* 3. Main Showcase Slideshow Container */}
              <div
                className={cn(
                  'relative z-10 w-full aspect-[4/3] rounded-[28px] overflow-hidden bg-white shadow-[0_24px_55px_rgba(4,17,40,0.12)] border border-[rgba(4,17,40,0.08)] transition-transform duration-1000 ease-out group',
                  currentSlide.imageTransform
                )}
                style={{
                  transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                }}
              >
                {/* Cross-slide smooth transition (1.0s duration with alternating direction) */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentSlide.id}
                    initial={{
                      opacity: 0,
                      x: slideDirection === 'right-to-left' ? 75 : -75,
                      scale: 0.94,
                      rotate: slideDirection === 'right-to-left' ? 1.5 : -1.5,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      rotate: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: slideDirection === 'right-to-left' ? -65 : 65,
                      scale: 1.05,
                      rotate: slideDirection === 'right-to-left' ? -1.5 : 1.5,
                    }}
                    transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 w-full h-full overflow-hidden"
                  >
                    {/* Subtle continuous micro-motion while displayed */}
                    <motion.div
                      animate={{
                        scale: [1, 1.025, 1],
                        x: [0, 3, -3, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={currentSlide.src}
                        alt={currentSlide.alt}
                        fill
                        priority
                        sizes="(max-width: 768px) 95vw, 680px"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                      />
                      {/* Subtle editorial scrim gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/35 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Slideshow Progress Indicators */}
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5 bg-[#041128]/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setSlideIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
                        idx === slideIndex
                          ? 'w-5 bg-white'
                          : 'bg-white/40 hover:bg-white/70'
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* 4. Floating Glass Card (Restrained, Upper-Right of Image, Never Overlapping Navbar) */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.55, ease: 'easeOut' }}
                className="absolute -top-5 -right-3 sm:-top-6 sm:-right-5 z-20 glass-floating rounded-[20px] p-4 sm:p-5 max-w-[215px] sm:max-w-[235px] shadow-xl pointer-events-auto"
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
                    <div className="text-[#041128] font-bold text-xs tracking-wide">BUILD CLUB</div>
                    <div className="text-[#5277A8] text-[10px] font-semibold tracking-wider">SSN I FOUND</div>
                  </div>
                </div>
                <div className="text-[12px] font-medium text-[#41516B] leading-snug">
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
