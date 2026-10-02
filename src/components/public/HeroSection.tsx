// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
// import { ArrowRight, ArrowDown } from 'lucide-react';
// import { PageContainer } from '@/components/ui/PageContainer';
// import { cn } from '@/lib/utils/cn';

// // Cinematic Slideshow using exact files: /img1.png, /img2.png, /img3.png
// const HERO_SLIDES = [
//   {
//     id: 1,
//     src: '/img1.png',
//     alt: 'Build Club × Lakshya — Engineering Prototyping & Innovation',
//     caption: 'Hardware Prototyping',
//   },
//   {
//     id: 2,
//     src: '/img2.png',
//     alt: 'Build Club × Lakshya — Autonomous Systems & Circuit Design',
//     caption: 'Embedded Intelligence',
//   },
//   {
//     id: 3,
//     src: '/img3.png',
//     alt: 'SSN College of Engineering Campus Building',
//     caption: 'SSN Innovation Center',
//   },
// ];

// export function HeroSection() {
//   const [slideIndex, setSlideIndex] = useState(0);
//   const [slideDirection, setSlideDirection] = useState<'right-to-left' | 'left-to-right'>('right-to-left');
//   const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
//   const prefersReducedMotion = useReducedMotion();

//   // Automatic slideshow loop: 4.8s visible, smooth crossfade transition inside stationary tilted frame
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setSlideIndex((prev) => {
//         const next = (prev + 1) % HERO_SLIDES.length;
//         setSlideDirection(next % 2 === 1 ? 'right-to-left' : 'left-to-right');
//         return next;
//       });
//     }, prefersReducedMotion ? 7000 : 4800);

//     return () => clearInterval(timer);
//   }, [prefersReducedMotion]);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     const { currentTarget, clientX, clientY } = e;
//     const rect = currentTarget.getBoundingClientRect();
//     const x = ((clientX - rect.left) / rect.width - 0.5) * 6;
//     const y = ((clientY - rect.top) / rect.height - 0.5) * 6;
//     setMouseOffset({ x, y });
//   };

//   const handleMouseLeave = () => {
//     setMouseOffset({ x: 0, y: 0 });
//   };

//   const scrollToExplore = () => {
//     const el = document.getElementById('projects');
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   const currentSlide = HERO_SLIDES[slideIndex];

//   return (
//     <section
//       id="hero"
//       className="relative pt-[115px] sm:pt-[128px] md:pt-[138px] pb-14 sm:pb-20 overflow-hidden bg-[#F8F7F3]"
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//     >
//       {/* Far Right Decorative Vertical Typography (Desktop Only - positioned safely within section) */}
//       <div className="hidden 2xl:flex flex-col items-center absolute right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none">
//         <div className="w-6 h-[1.5px] bg-[#91A9C9]/50 mb-6" />
//         <div className="[writing-mode:vertical-lr] text-[11px] tracking-[0.35em] text-[#848C9B] uppercase font-medium space-y-4">
//           <span>IDEAS</span>
//           <span className="text-[#FF9D00]">&bull;</span>
//           <span>CODE</span>
//           <span className="text-[#5277A8]">&bull;</span>
//           <span>SOLUTIONS</span>
//           <span className="text-[#FF6500]">&bull;</span>
//           <span>TOMORROW</span>
//         </div>
//       </div>

//       <PageContainer>
//         {/* Two-Column Master Grid: Left ~48-50%, Right ~50-52% */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center min-h-[500px] lg:min-h-[540px]">
          
//           {/* ── LEFT COLUMN (~45%) ── */}
//           <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center z-10 min-w-0">
//             {/* 1. Small Editorial Eyebrow */}
//             <motion.div
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, ease: 'easeOut' }}
//               className="flex items-center gap-3 mb-4 sm:mb-5"
//             >
//               <div className="w-5 h-[1.5px] bg-[#FF9D00] shrink-0" />
//               <span className="text-[11px] sm:text-[12.5px] tracking-[0.25em] text-[#5277A8] font-semibold uppercase">
//                 INNOVATION &nbsp;/&nbsp; COLLABORATION &nbsp;/&nbsp; IMPACT
//               </span>
//             </motion.div>

//             {/* 2. Main Hero Title: BUILD CLUB × LAKSHYA */}
//             <motion.div
//               initial={{ opacity: 0, y: 22 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
//             >
//               <div className="flex flex-col items-start">
//                 <h1
//                   className="font-primary font-normal text-[#041128] tracking-[-0.025em] leading-[0.92] m-0"
//                   style={{ fontSize: 'clamp(60px, 6.5vw, 104px)' }}
//                 >
//                   BUILD CLUB
//                 </h1>
                
//                 {/* Special Collaboration × & Lakshya with bright yellow -> orange -> red gradient */}
//                 <div className="flex items-center gap-2 sm:gap-3.5 mt-1 sm:mt-2 flex-wrap">
//                   <span
//                     aria-hidden="true"
//                     className="font-serif italic font-light text-[#E5A83B] select-none text-2xl sm:text-3xl lg:text-4xl leading-none opacity-95"
//                   >
//                     ×
//                   </span>
//                   <span
//                     className="font-primary font-normal tracking-[-0.02em] leading-[0.92] bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] via-[#FF6500] to-[#FF3D00] bg-clip-text text-transparent"
//                     style={{ fontSize: 'clamp(54px, 6vw, 98px)' }}
//                   >
//                     LAKSHYA
//                   </span>
//                 </div>

//                 {/* Subtle gold accent underline */}
//                 <div className="w-14 h-[2px] bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] to-transparent rounded-full mt-3.5" />
//               </div>
//             </motion.div>

//             {/* 3. Hero Subtitle */}
//             <motion.div
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
//               className="mt-4 sm:mt-5"
//             >
//               <h2
//                 className="font-primary font-normal text-[#5277A8] tracking-[-0.02em] leading-tight m-0"
//                 style={{ fontSize: 'clamp(26px, 3.2vw, 42px)' }}
//               >
//                 PROJECT EXHIBITION
//               </h2>
//             </motion.div>

//             {/* 4. Body Description */}
//             <motion.p
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.28, ease: 'easeOut' }}
//               className="mt-5 sm:mt-6 text-[16px] sm:text-[17px] leading-[1.62] text-[#3D5574] max-w-[480px] font-normal"
//             >
//               Explore the innovative projects built by talented students at{' '}
//               <span className="text-[#041128] font-semibold">SSN College of Engineering</span>.
//             </motion.p>

//             {/* 5. CTAs: Primary + Secondary on SAME row on desktop */}
//             <motion.div
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.38, ease: 'easeOut' }}
//               className="mt-8 sm:mt-10 flex flex-wrap items-center gap-5 sm:gap-6"
//             >
//               {/* Primary Pill Button */}
//               <a
//                 href="#projects"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
//                 }}
//                 className="group btn-navy-pill w-[240px] sm:w-[250px] !h-[58px] cursor-pointer"
//               >
//                 <span>Explore Projects</span>
//                 <ArrowRight
//                   size={18}
//                   className="transition-transform duration-250 ease-out group-hover:translate-x-1.5"
//                 />
//               </a>

//               {/* Secondary Circular Scroll-To-Explore */}
//               <button
//                 onClick={scrollToExplore}
//                 className="group inline-flex items-center gap-3 text-sm font-medium text-[#41516B] hover:text-[#041128] transition-colors cursor-pointer py-2"
//                 aria-label="Scroll down to explore projects by department"
//               >
//                 <div className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.18)] group-hover:border-[#FF9D00] flex items-center justify-center transition-colors bg-white/70 shadow-sm">
//                   <ArrowDown
//                     size={15}
//                     className="text-[#041128] transition-transform duration-300 group-hover:translate-y-0.5"
//                   />
//                 </div>
//                 <span className="text-[12px] uppercase tracking-wider text-[#848C9B] group-hover:text-[#041128] font-semibold">
//                   Scroll to explore
//                 </span>
//               </button>
//             </motion.div>
//           </div>

//           {/* ── RIGHT COLUMN (~55%) — Tilted Single-Frame Slideshow with Orbital Shapes Behind ── */}
//           <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end mt-6 lg:mt-0 w-full">
//             <div className="relative w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[780px] xl:max-w-[840px]">              
//               {/* ── LAYER 0: SHAPES & ORBITS SITTING BEHIND THE HERO IMAGE ── */}

//               {/* 1. Primary large warm orange radial glow — strong atmospheric bloom */}
//               <div
//                 className="absolute pointer-events-none z-0"
//                 style={{
//                   width: '640px',
//                   height: '640px',
//                   top: '-18%',
//                   left: '-12%',
//                   borderRadius: '50%',
//                   background:
//                     'radial-gradient(circle, rgba(255,157,0,0.22) 0%, rgba(255,90,0,0.12) 32%, rgba(255,210,26,0.06) 56%, transparent 74%)',
//                   transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
//                   transition: 'transform 0.25s ease-out',
//                 }}
//               />

//               {/* 2. Secondary warm peach/golden glow — bottom right balance */}
//               <div
//                 className="absolute pointer-events-none z-0"
//                 style={{
//                   width: '480px',
//                   height: '480px',
//                   bottom: '-14%',
//                   right: '-8%',
//                   borderRadius: '50%',
//                   background:
//                     'radial-gradient(circle, rgba(255,200,80,0.16) 0%, rgba(255,140,20,0.08) 40%, transparent 68%)',
//                   transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
//                   transition: 'transform 0.3s ease-out',
//                 }}
//               />

//               {/* 3. Thin large orange orbital ring — outermost */}
//               <div
//                 className="absolute pointer-events-none z-0 hidden sm:block"
//                 style={{
//                   width: '680px',
//                   height: '680px',
//                   top: '50%',
//                   left: '50%',
//                   transform: `translate(calc(-50% + ${mouseOffset.x * -0.25}px), calc(-50% + ${mouseOffset.y * -0.25}px))`,
//                   borderRadius: '50%',
//                   border: '1px solid rgba(255,157,0,0.22)',
//                   transition: 'transform 0.3s ease-out',
//                 }}
//               />

//               {/* 4. Smaller tighter orange orbital ring — mid layer */}
//               <div
//                 className="absolute pointer-events-none z-0 hidden sm:block"
//                 style={{
//                   width: '500px',
//                   height: '500px',
//                   top: '50%',
//                   left: '50%',
//                   transform: `translate(calc(-46% + ${mouseOffset.x * -0.3}px), calc(-52% + ${mouseOffset.y * -0.3}px))`,
//                   borderRadius: '50%',
//                   border: '1.2px solid rgba(255,157,0,0.28)',
//                   transition: 'transform 0.3s ease-out',
//                 }}
//               />

//               {/* 5. Pale blue architectural arc — lower right */}
//               <div
//                 className="absolute pointer-events-none z-0 hidden sm:block"
//                 style={{
//                   width: '440px',
//                   height: '440px',
//                   bottom: '-10%',
//                   right: '-5%',
//                   borderRadius: '50%',
//                   border: '1px solid rgba(145,169,201,0.25)',
//                   transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)`,
//                   transition: 'transform 0.3s ease-out',
//                 }}
//               />

//               {/* 6. SVG orbital path curves behind image */}
//               <svg
//                 className="absolute inset-[-14%] w-[128%] h-[128%] pointer-events-none z-0"
//                 viewBox="0 0 800 620"
//                 fill="none"
//                 aria-hidden="true"
//               >
//                 {/* Orange dashed orbital arc */}
//                 <path
//                   d="M36 468C156 118 536 28 766 194"
//                   stroke="#FF9D00"
//                   strokeOpacity="0.35"
//                   strokeWidth="1.4"
//                   strokeDasharray="6 4"
//                 />
//                 {/* Pale blue architectural curve */}
//                 <path
//                   d="M88 552C224 228 579 116 785 286"
//                   stroke="#91A9C9"
//                   strokeOpacity="0.30"
//                   strokeWidth="1"
//                 />
//                 {/* Warm orange-red lower sweep */}
//                 <path
//                   d="M20 362C248 554 570 550 766 380"
//                   stroke="#FF6500"
//                   strokeOpacity="0.28"
//                   strokeWidth="1.2"
//                 />
//                 {/* Extra golden accent arc */}
//                 <path
//                   d="M60 160C200 60 560 40 740 180"
//                   stroke="#FFD21A"
//                   strokeOpacity="0.20"
//                   strokeWidth="1"
//                 />
//               </svg>

//               {/* ── LAYER 10: HERO IMAGE WINDOW (STRAIGHT FRAME) ── */}
//               {/* Frame is perfectly straight — no rotation/tilt */}
//               <div
//                 className="relative z-10 w-full aspect-[4/3] rounded-[28px] sm:rounded-[34px] overflow-hidden bg-white shadow-[0_30px_75px_rgba(4,17,40,0.18)] ring-[7px] sm:ring-[9px] ring-white/65 border border-white/90 group"
//                 style={{
//                   transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
//                   transition: 'transform 0.25s ease-out',
//                 }}
//               >
//                 {/* Slideshow transitions smoothly INSIDE this single tilted window */}
//                 <AnimatePresence mode="popLayout" initial={false}>
//                   <motion.div
//                     key={currentSlide.id}
//                     initial={{
//                       opacity: 0,
//                       scale: 1.04,
//                       x: slideDirection === 'right-to-left' ? 40 : -40,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       scale: 1,
//                       x: 0,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       scale: 0.98,
//                       x: slideDirection === 'right-to-left' ? -40 : 40,
//                     }}
//                     transition={{
//                       duration: prefersReducedMotion ? 0.3 : 1.25,
//                       ease: [0.22, 1, 0.36, 1],
//                     }}
//                     className="absolute inset-0 w-full h-full overflow-hidden"
//                   >
//                     {/* Subtle continuous micro-motion while displayed */}
//                     <motion.div
//                       animate={{
//                         scale: prefersReducedMotion ? 1 : [1, 1.025, 1],
//                       }}
//                       transition={{
//                         duration: 8,
//                         repeat: prefersReducedMotion ? 0 : Infinity,
//                         ease: 'easeInOut',
//                       }}
//                       className="relative w-full h-full"
//                     >
//                       {/* Original photograph */}
//                       <Image
//                         src={currentSlide.src}
//                         alt={currentSlide.alt}
//                         fill
//                         priority
//                         sizes="(max-width: 768px) 95vw, 840px"
//                         className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
//                       />

//                       {/* WARM ORANGE / SUNSET PHOTOGRAPHIC TINT — layered for depth */}
//                       {/* Layer A: primary warm orange tint */}
//                       <div
//                         className="absolute inset-0 pointer-events-none"
//                         style={{
//                           background:
//                             'linear-gradient(135deg, rgba(255,101,0,0.16) 0%, rgba(255,157,0,0.13) 50%, transparent 100%)',
//                           mixBlendMode: 'multiply',
//                         }}
//                         aria-hidden="true"
//                       />

//                       {/* Layer B: warm golden highlight + bottom dark scrim */}
//                       <div
//                         className="absolute inset-0 pointer-events-none"
//                         style={{
//                           background:
//                             'linear-gradient(180deg, rgba(255,210,26,0.10) 0%, transparent 45%, rgba(4,17,40,0.32) 100%)',
//                         }}
//                         aria-hidden="true"
//                       />
//                     </motion.div>
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* Slideshow Progress Indicators */}
//                 <div className="absolute bottom-3.5 left-4 z-20 flex items-center gap-1.5 bg-[#041128]/60 backdrop-blur-md px-2.5 py-1 rounded-full">
//                   {HERO_SLIDES.map((slide, idx) => (
//                     <button
//                       key={slide.id}
//                       onClick={() => setSlideIndex(idx)}
//                       className={cn(
//                         'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
//                         idx === slideIndex
//                           ? 'w-5 bg-gradient-to-r from-[#FFD21A] to-[#FF9D00]'
//                           : 'bg-white/40 hover:bg-white/70'
//                       )}
//                       aria-label={`Go to slide ${idx + 1}`}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* ── LAYER 20: FOREGROUND ACCENT & COLLABORATION BADGE ── */}
              
//               {/* Golden sparkle at bottom corner */}
//               <span
//                 aria-hidden="true"
//                 className="hero-sparkle absolute -right-2 bottom-[10%] z-20 text-[#FFB800] text-xl font-serif select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(255,184,0,0.4)]"
//               >
//                 ✦
//               </span>

//               {/* Foreground delicate gold accent arc crossing near corner */}
//               <svg
//                 className="absolute inset-[-14%] w-[128%] h-[128%] pointer-events-none z-20 hidden sm:block"
//                 viewBox="0 0 800 620"
//                 fill="none"
//                 aria-hidden="true"
//               >
//                 <path
//                   d="M690 420C730 455 770 480 800 495"
//                   stroke="#FFD21A"
//                   strokeOpacity="0.38"
//                   strokeWidth="1.2"
//                 />
//               </svg>

//               {/* Floating Collaborative Glass Card with Build Club + Lakshya Logo
//               <motion.div
//                 initial={{ opacity: 0, y: 15, scale: 0.96 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.65, delay: 0.55, ease: 'easeOut' }}
//                 className="absolute -top-5 -right-3 sm:-top-6 sm:-right-5 z-20 rounded-[22px] bg-white/85 backdrop-blur-[20px] border border-white/90 p-4 sm:p-5 shadow-[0_16px_40px_rgba(4,17,40,0.12)] pointer-events-auto max-w-[240px] sm:max-w-[265px]"
//                 style={{
//                   transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
//                   transition: 'transform 0.18s ease-out',
//                 }}
//               >
//                 <div className="flex items-center gap-2 mb-2.5">
//                   <div className="relative w-8 h-8 shrink-0">
//                     <Image
//                       src="/logo.png"
//                       alt="Build Club"
//                       fill
//                       className="object-contain"
//                       sizes="32px"
//                     />
//                   </div>
//                   <span aria-hidden="true" className="font-serif italic font-light text-[14px] text-[#E5A83B] select-none opacity-90">×</span>
//                   <div className="relative w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] shrink-0">
//                     <Image
//                       src="/LakLogo.png"
//                       alt="Lakshya"
//                       fill
//                       className="object-contain"
//                       sizes="40px"
//                     />
//                   </div>
//                   <div className="leading-tight pl-0.5">
//                     <div className="text-[#041128] font-bold text-xs tracking-wide">BUILD CLUB</div>
//                     <div className="text-[10px] font-semibold bg-gradient-to-r from-[#FF9D00] to-[#FF3D00] bg-clip-text text-transparent uppercase tracking-wider">
//                       LAKSHYA
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-[12px] font-medium text-[#41516B] leading-snug border-t border-[rgba(4,17,40,0.06)] pt-2">
//                   Student Innovations.
//                   <br />
//                   <span className="text-[#041128] font-semibold">Excellence & Impact.</span>
//                 </div>
//               </motion.div> */}

//             </div>
//           </div>

//         </div>
//       </PageContainer>
//     </section>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { cn } from '@/lib/utils/cn';

/*
|--------------------------------------------------------------------------
| HERO SLIDES
|--------------------------------------------------------------------------
| ?v=2 is intentional.
| It forces the browser/Next image URL to recognize the newly replaced
| image instead of continuing to show an older cached image.
|
| Whenever you replace the images again, change v=2 -> v=3.
|--------------------------------------------------------------------------
*/

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

  const [slideDirection, setSlideDirection] = useState<
    'right-to-left' | 'left-to-right'
  >('right-to-left');

  const [mouseOffset, setMouseOffset] = useState({
    x: 0,
    y: 0,
  });

  const prefersReducedMotion = useReducedMotion();

  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC SLIDESHOW
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;

        setSlideDirection(
          next % 2 === 1 ? 'right-to-left' : 'left-to-right'
        );

        return next;
      });
    }, prefersReducedMotion ? 7000 : 4800);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  /*
  |--------------------------------------------------------------------------
  | MOUSE PARALLAX
  |--------------------------------------------------------------------------
  */

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const { currentTarget, clientX, clientY } = e;

    const rect = currentTarget.getBoundingClientRect();

    const x =
      ((clientX - rect.left) / rect.width - 0.5) * 5;

    const y =
      ((clientY - rect.top) / rect.height - 0.5) * 5;

    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({
      x: 0,
      y: 0,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | SCROLL
  |--------------------------------------------------------------------------
  */

  const scrollToExplore = () => {
    const el = document.getElementById('projects');

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const currentSlide = HERO_SLIDES[slideIndex];

  return (
    <section
      id="hero"
      className="
        relative
        overflow-hidden
        bg-[#F8F4EC]
        pt-[115px]
        pb-14
        sm:pt-[128px]
        sm:pb-20
        md:pt-[138px]
      "
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ================================================================
          GLOBAL HERO ATMOSPHERE
          ================================================================ */}

      {/* Large warm cream/orange bloom */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-[260px]
          top-[110px]
          h-[720px]
          w-[720px]
          rounded-full
        "
        style={{
          background:
            'radial-gradient(circle, rgba(255,191,105,0.22) 0%, rgba(255,166,64,0.12) 36%, rgba(255,145,30,0.05) 58%, transparent 76%)',
        }}
      />

      {/* Right warm atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-260px]
          top-[80px]
          h-[760px]
          w-[760px]
          rounded-full
        "
        style={{
          background:
            'radial-gradient(circle, rgba(255,184,92,0.30) 0%, rgba(255,142,36,0.17) 32%, rgba(255,98,0,0.08) 55%, transparent 74%)',
        }}
      />

      {/* Bottom peach glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-360px]
          left-[10%]
          h-[620px]
          w-[1100px]
          rounded-full
        "
        style={{
          background:
            'radial-gradient(ellipse, rgba(255,180,72,0.18) 0%, rgba(255,143,28,0.10) 40%, transparent 72%)',
        }}
      />

      {/* ================================================================
          FAR RIGHT EDITORIAL TYPOGRAPHY
          ================================================================ */}

      <div
        className="
          pointer-events-none
          absolute
          right-8
          top-1/2
          z-10
          hidden
          -translate-y-1/2
          2xl:flex
          flex-col
          items-center
          select-none
        "
      >
        <div className="mb-6 h-[1.5px] w-6 bg-[#FF9D00]/50" />

        <div
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.35em]
            text-[#6F7890]
            [writing-mode:vertical-lr]
          "
        >
          <span>IDEAS</span>
          <span className="mx-2 text-[#FF9D00]">/</span>
          <span>COLLABORATION</span>
          <span className="mx-2 text-[#FF6500]">/</span>
          <span>IMPACT</span>
        </div>
      </div>

      <PageContainer>
        {/* ================================================================
            MAIN HERO GRID
            ================================================================ */}

        <div
          className="
            grid
            min-h-[500px]
            grid-cols-1
            items-center
            gap-12
            lg:min-h-[570px]
            lg:grid-cols-12
            lg:gap-8
          "
        >
          {/* ==============================================================
              LEFT SIDE
              ============================================================== */}

          <div
            className="
              z-10
              flex
              min-w-0
              flex-col
              justify-center
              lg:col-span-5
              xl:col-span-5
            "
          >
            {/* EYEBROW */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
              }}
              className="
                mb-5
                flex
                items-center
                gap-3
              "
            >
              <div className="h-[1.5px] w-6 shrink-0 bg-[#FF9D00]" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#233D62]
                  sm:text-[11px]
                "
              >
                INNOVATION
                <span className="mx-2 text-[#7A8495]">/</span>
                COLLABORATION
                <span className="mx-2 text-[#7A8495]">/</span>
                <span className="text-[#F46A12]">
                  IMPACT
                </span>
              </span>

              <div className="h-[1.5px] w-5 bg-[#233D62]/60" />
            </motion.div>

            {/* ==========================================================
                MAIN TITLE
                ========================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h1
                className="
                  m-0
                  font-primary
                  font-normal
                  leading-[0.86]
                  tracking-[-0.035em]
                  text-[#07152F]
                "
                style={{
                  fontSize:
                    'clamp(58px, 6.1vw, 98px)',
                }}
              >
                BUILD CLUB
              </h1>

              {/* SSN × LAKSHYA */}

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-3
                  whitespace-nowrap
                "
              >
                <span
                  className="
                    font-serif
                    text-[24px]
                    font-light
                    italic
                    text-[#263D5E]
                    sm:text-[30px]
                  "
                >
                  SSN
                </span>

                <span className="h-[52px] w-px bg-[#263D5E]/45 sm:h-[62px]" />

                <span
                  className="
                    bg-gradient-to-r
                    from-[#FFD21A]
                    via-[#FF9D00]
                    via-[#FF6500]
                    to-[#EF2D00]
                    bg-clip-text
                    font-primary
                    font-normal
                    leading-[0.88]
                    tracking-[-0.035em]
                    text-transparent
                  "
                  style={{
                    fontSize:
                      'clamp(48px, 5.5vw, 88px)',
                  }}
                >
                  LAKSHYA
                </span>
              </div>

              {/* Accent line */}

              <div
                className="
                  mt-4
                  h-[2px]
                  w-20
                  rounded-full
                  bg-gradient-to-r
                  from-[#FFD21A]
                  via-[#FF9D00]
                  to-transparent
                "
              />
            </motion.div>

            {/* ==========================================================
                PROJECT EXHIBITION
                ========================================================== */}

            <motion.h2
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.18,
              }}
              className="
                mt-5
                m-0
                font-primary
                font-normal
                leading-none
                tracking-[-0.025em]
                text-[#5277A8]
              "
              style={{
                fontSize:
                  'clamp(25px, 2.8vw, 42px)',
              }}
            >
              PROJECT EXHIBITION
            </motion.h2>

            {/* ==========================================================
                DESCRIPTION
                ========================================================== */}

            <motion.p
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.27,
              }}
              className="
                mt-5
                max-w-[490px]
                text-[15px]
                leading-[1.65]
                text-[#48617F]
                sm:text-[16px]
              "
            >
              Explore the innovative projects built by talented
              students at{' '}
              <span className="font-semibold text-[#07152F]">
                SSN College of Engineering.
              </span>
            </motion.p>

            {/* ==========================================================
                BUTTONS
                ========================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.36,
              }}
              className="
                mt-8
                flex
                flex-wrap
                items-center
                gap-5
              "
            >
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();

                  document
                    .getElementById('projects')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    });
                }}
                className="
                  group
                  flex
                  h-[58px]
                  w-[240px]
                  items-center
                  justify-center
                  gap-4
                  rounded-full
                  bg-[#07152F]
                  px-7
                  text-[15px]
                  font-semibold
                  text-white
                  shadow-[0_16px_35px_rgba(7,21,47,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_20px_40px_rgba(7,21,47,0.24)]
                "
              >
                <span>Explore Projects</span>

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1.5
                  "
                />
              </a>

              <button
                onClick={scrollToExplore}
                className="
                  group
                  inline-flex
                  cursor-pointer
                  items-center
                  gap-3
                  py-2
                  text-sm
                  font-medium
                  text-[#41516B]
                  transition-colors
                  hover:text-[#07152F]
                "
                aria-label="Scroll down to explore projects"
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#07152F]/15
                    bg-white/70
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:border-[#FF9D00]
                    group-hover:bg-white
                  "
                >
                  <ArrowDown
                    size={16}
                    className="
                      text-[#07152F]
                      transition-transform
                      duration-300
                      group-hover:translate-y-1
                    "
                  />
                </div>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#7C8798]
                    group-hover:text-[#07152F]
                  "
                >
                  Scroll to explore
                </span>
              </button>
            </motion.div>
          </div>

          {/* ==============================================================
              RIGHT SIDE — IMAGE + ATMOSPHERE
              ============================================================== */}

          <div
            className="
              relative
              mt-4
              flex
              w-full
              justify-center
              lg:col-span-7
              lg:mt-0
              lg:justify-end
              xl:col-span-7
            "
          >
            <div
              className="
                relative
                w-full
                max-w-[850px]
              "
            >
              {/* ========================================================
                  MASSIVE ORANGE ATMOSPHERIC GLOW
                  ======================================================== */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[-16%]
                  top-[-18%]
                  z-0
                  h-[760px]
                  w-[760px]
                  rounded-full
                "
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(255,190,100,0.38) 0%, rgba(255,151,48,0.25) 28%, rgba(255,107,15,0.13) 50%, transparent 74%)',
                  transform: `translate(
                    ${mouseOffset.x * -0.45}px,
                    ${mouseOffset.y * -0.45}px
                  )`,
                  transition:
                    'transform 0.35s ease-out',
                }}
              />

              {/* Strong central peach glow */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[5%]
                  top-[0%]
                  z-0
                  h-[620px]
                  w-[620px]
                  rounded-full
                "
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,211,137,0.28) 0%, rgba(255,169,65,0.17) 34%, rgba(255,109,10,0.07) 56%, transparent 73%)',
                }}
              />

              {/* Bottom-right orange glow */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  bottom-[-25%]
                  right-[-12%]
                  z-0
                  h-[520px]
                  w-[520px]
                  rounded-full
                "
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,170,50,0.23) 0%, rgba(255,107,0,0.12) 40%, transparent 70%)',
                }}
              />

              {/* ========================================================
                  LARGE ORBITAL CIRCLES
                  ======================================================== */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-0
                  hidden
                  h-[760px]
                  w-[760px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-[#FF9D00]/30
                  sm:block
                "
                style={{
                  transform: `
                    translate(
                      calc(-50% + ${mouseOffset.x * -0.25}px),
                      calc(-50% + ${mouseOffset.y * -0.25}px)
                    )
                  `,
                  transition:
                    'transform 0.4s ease-out',
                }}
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-[48%]
                  top-[46%]
                  z-0
                  hidden
                  h-[570px]
                  w-[570px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  border
                  border-[#FF6500]/25
                  sm:block
                "
              />

              {/* ========================================================
                  ORBITAL SVG CURVES
                  ======================================================== */}

              <svg
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -inset-[17%]
                  z-0
                  hidden
                  h-[134%]
                  w-[134%]
                  sm:block
                "
                viewBox="0 0 900 650"
                fill="none"
              >
                {/* Large upper orange orbit */}
                <path
                  d="M40 475C135 135 530 35 880 185"
                  stroke="#FF9D00"
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />

                {/* Second orange orbit */}
                <path
                  d="M120 560C245 210 620 100 895 300"
                  stroke="#FF6500"
                  strokeWidth="1"
                  strokeOpacity="0.28"
                />

                {/* Gold upper sweep */}
                <path
                  d="M190 155C380 45 665 62 840 190"
                  stroke="#FFD21A"
                  strokeWidth="1.2"
                  strokeOpacity="0.42"
                />

                {/* Lower warm sweep */}
                <path
                  d="M45 380C265 570 650 580 885 385"
                  stroke="#FF9D00"
                  strokeWidth="1.1"
                  strokeOpacity="0.30"
                />

                {/* Thin orange outer curve */}
                <path
                  d="M530 10C720 50 830 140 900 275"
                  stroke="#F46A12"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
              </svg>

              {/* ========================================================
                  HERO IMAGE FRAME
                  ======================================================== */}

              <motion.div
                className="
                  relative
                  z-10
                  w-full
                  overflow-hidden
                  rounded-[27px]
                  border
                  border-white/90
                  bg-white
                  shadow-[0_35px_85px_rgba(7,21,47,0.20)]
                  ring-[8px]
                  ring-white/55
                  sm:rounded-[32px]
                  sm:ring-[9px]
                "
                style={{
                  aspectRatio: '1.43 / 1',
                  transform: `
                    translate(
                      ${mouseOffset.x}px,
                      ${mouseOffset.y}px
                    )
                  `,
                  transition:
                    'transform 0.3s ease-out',
                }}
              >
                {/* ======================================================
                    SLIDESHOW
                    ====================================================== */}

                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                >
                  <motion.div
                    key={currentSlide.id}
                    initial={{
                      opacity: 0,
                      scale: 1.035,
                      x:
                        slideDirection ===
                        'right-to-left'
                          ? 45
                          : -45,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.015,
                      x:
                        slideDirection ===
                        'right-to-left'
                          ? -45
                          : 45,
                    }}
                    transition={{
                      duration: prefersReducedMotion
                        ? 0.35
                        : 1.15,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                    "
                  >
                    <motion.div
                      className="
                        relative
                        h-full
                        w-full
                      "
                      animate={{
                        scale: prefersReducedMotion
                          ? 1
                          : [1, 1.018, 1],
                      }}
                      transition={{
                        duration: 9,
                        repeat: prefersReducedMotion
                          ? 0
                          : Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* =================================================
                          ACTUAL PHOTO
                          ================================================= */}

                      <Image
                        src={currentSlide.src}
                        alt={currentSlide.alt}
                        fill
                        priority={slideIndex === 0}
                        sizes="
                          (max-width: 768px) 94vw,
                          (max-width: 1280px) 58vw,
                          850px
                        "
                        className="
                          object-cover
                          object-center
                        "
                        style={{
                          filter:
                            'saturate(1.16) contrast(1.04) brightness(1.03)',
                        }}
                      />

                      {/* =================================================
                          STRONG WARM ORANGE PHOTO TREATMENT
                          ================================================= */}

                      {/* Golden wash */}

                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                        "
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,210,26,0.18) 0%, rgba(255,157,0,0.18) 35%, rgba(255,90,0,0.15) 68%, rgba(239,45,0,0.08) 100%)',
                          mixBlendMode: 'soft-light',
                        }}
                      />

                      {/* Orange atmosphere */}

                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                        "
                        style={{
                          background:
                            'linear-gradient(115deg, rgba(255,179,72,0.10) 0%, rgba(255,120,20,0.20) 48%, rgba(239,45,0,0.10) 100%)',
                          mixBlendMode: 'screen',
                        }}
                      />

                      {/* Sunset glow from upper/right */}

                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                        "
                        style={{
                          background:
                            'radial-gradient(ellipse at 68% 38%, rgba(255,191,91,0.27) 0%, rgba(255,130,20,0.13) 34%, transparent 67%)',
                          mixBlendMode: 'screen',
                        }}
                      />

                      {/* Bottom cinematic depth */}

                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                        "
                        style={{
                          background:
                            'linear-gradient(180deg, transparent 55%, rgba(7,21,47,0.25) 100%)',
                        }}
                      />

                      {/* Soft inner golden edge */}

                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          rounded-[27px]
                          ring-1
                          ring-inset
                          ring-[#FFD21A]/20
                          sm:rounded-[32px]
                        "
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* ======================================================
                    SLIDE INDICATORS
                    ====================================================== */}

                <div
                  className="
                    absolute
                    bottom-4
                    left-5
                    z-30
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-[#07152F]/55
                    px-3
                    py-1.5
                    backdrop-blur-md
                  "
                >
                  {HERO_SLIDES.map(
                    (slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => {
                          setSlideDirection(
                            index > slideIndex
                              ? 'right-to-left'
                              : 'left-to-right'
                          );

                          setSlideIndex(index);
                        }}
                        className={cn(
                          'h-2 w-2 rounded-full transition-all duration-300',
                          index === slideIndex
                            ? 'w-5 bg-gradient-to-r from-[#FFD21A] to-[#FF6500]'
                            : 'bg-white/50 hover:bg-white/80'
                        )}
                        aria-label={`Go to slide ${
                          index + 1
                        }`}
                      />
                    )
                  )}
                </div>
              </motion.div>

              {/* ========================================================
                  SMALL GOLD SPARKLE
                  ======================================================== */}

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  bottom-[7%]
                  right-[-8px]
                  z-20
                  select-none
                  text-2xl
                  text-[#FFB800]
                  drop-shadow-[0_2px_10px_rgba(255,184,0,0.55)]
                "
              >
                ✦
              </span>

              {/* ========================================================
                  SMALL ORANGE ARC IN FRONT
                  ======================================================== */}

              <svg
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -inset-[17%]
                  z-20
                  hidden
                  h-[134%]
                  w-[134%]
                  sm:block
                "
                viewBox="0 0 900 650"
                fill="none"
              >
                <path
                  d="M720 455C770 480 825 505 890 510"
                  stroke="#FFD21A"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />

                <circle
                  cx="716"
                  cy="455"
                  r="3"
                  fill="#FF9D00"
                  fillOpacity="0.8"
                />
              </svg>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}