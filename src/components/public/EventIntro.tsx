// 'use client';

// import Image from 'next/image';
// import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
// import { useEffect, useState } from 'react';

// export function EventIntro() {
//   const [visible, setVisible] = useState(true);
//   const [entered, setEntered] = useState(false);
//   const reducedMotion = useReducedMotion();

//   useEffect(() => {
//     const frame = window.requestAnimationFrame(() => {
//       if (reducedMotion || window.sessionStorage.getItem('build-club-intro-seen')) {
//         setVisible(false);
//         return;
//       }
//     });
//     return () => {
//       window.cancelAnimationFrame(frame);
//     };
//   }, [reducedMotion]);

//   const dismiss = () => {
//     if (entered) return;
//     setEntered(true);
//     window.sessionStorage.setItem('build-club-intro-seen', '1');
//     // Slight delay so exit animation looks intentional
//     setTimeout(() => setVisible(false), 120);
//   };

//   useEffect(() => {
//     if (!visible) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Enter' || e.key === ' ') {
//         e.preventDefault();
//         dismiss();
//       }
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [visible, entered]);

//   return (
//     <AnimatePresence>
//       {visible && (
//         <motion.div
//           aria-hidden="true"
//           initial={{ opacity: 1 }}
//           exit={{ opacity: 0, y: -18, scale: 0.985 }}
//           transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
//           onClick={dismiss}
//           className="event-intro fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden cursor-pointer select-none"
//           style={{ background: '#07152F' }}
//         >
//           {/* ── DARK NAVY ATMOSPHERIC LAYERS ── */}

//           {/* Layer 1: Large warm orange radial glow — upper right */}
//           <div
//             className="absolute pointer-events-none"
//             style={{
//               width: '680px',
//               height: '680px',
//               top: '-15%',
//               right: '-8%',
//               borderRadius: '50%',
//               background:
//                 'radial-gradient(circle, rgba(255,157,0,0.18) 0%, rgba(255,90,0,0.10) 35%, rgba(255,210,26,0.04) 60%, transparent 75%)',
//             }}
//           />

//           {/* Layer 2: Warm gold glow — lower left */}
//           <div
//             className="absolute pointer-events-none"
//             style={{
//               width: '520px',
//               height: '520px',
//               bottom: '-12%',
//               left: '-6%',
//               borderRadius: '50%',
//               background:
//                 'radial-gradient(circle, rgba(255,210,26,0.14) 0%, rgba(255,130,0,0.08) 40%, transparent 70%)',
//             }}
//           />

//           {/* Layer 3: Very faint center bloom */}
//           <div
//             className="absolute pointer-events-none"
//             style={{
//               width: '400px',
//               height: '400px',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               borderRadius: '50%',
//               background:
//                 'radial-gradient(circle, rgba(255,170,30,0.09) 0%, transparent 65%)',
//             }}
//           />

//           {/* Thin orbital rings */}
//           <div
//             className="absolute rounded-full pointer-events-none hidden sm:block"
//             style={{
//               width: '520px',
//               height: '520px',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               border: '1px solid rgba(255,157,0,0.18)',
//             }}
//           />
//           <div
//             className="absolute rounded-full pointer-events-none hidden sm:block"
//             style={{
//               width: '680px',
//               height: '680px',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               border: '1px solid rgba(255,210,26,0.10)',
//             }}
//           />
//           {/* Thin pale blue outer arc */}
//           <div
//             className="absolute rounded-full pointer-events-none hidden lg:block"
//             style={{
//               width: '820px',
//               height: '820px',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               border: '1px solid rgba(145,169,201,0.12)',
//             }}
//           />

//           {/* SVG decorative arcs */}
//           <svg
//             className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
//             viewBox="0 0 1200 800"
//             fill="none"
//             aria-hidden="true"
//             preserveAspectRatio="xMidYMid slice"
//           >
//             <path
//               d="M100 650C320 200 780 120 1100 300"
//               stroke="#FF9D00"
//               strokeOpacity="0.20"
//               strokeWidth="1.2"
//               strokeDasharray="7 5"
//             />
//             <path
//               d="M150 700C380 260 820 170 1120 340"
//               stroke="#FFD21A"
//               strokeOpacity="0.12"
//               strokeWidth="1"
//             />
//             <path
//               d="M50 420C280 620 700 700 1100 540"
//               stroke="#FF6500"
//               strokeOpacity="0.16"
//               strokeWidth="1"
//             />
//           </svg>

//           {/* ── MAIN CONTENT ── */}
//           <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg">

//             {/* Logos Lockup */}
//             <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
//               <motion.div
//                 initial={{ opacity: 0, y: 12, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
//                 className="relative w-[76px] sm:w-[94px] h-[57px] sm:h-[70px] shrink-0"
//               >
//                 <Image
//                   src="/logo.png"
//                   alt="Build Club"
//                   fill
//                   priority
//                   sizes="100px"
//                   className="object-contain"
//                 />
//               </motion.div>

//               <motion.span
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.35, delay: 0.65, ease: 'easeOut' }}
//                 className="font-serif italic font-light text-2xl sm:text-3xl text-[#E5A83B] select-none mx-1 opacity-90 leading-none"
//               >
//                 ×
//               </motion.span>

//               <motion.div
//                 initial={{ opacity: 0, y: 12, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
//                 className="relative w-[68px] sm:w-[84px] h-[68px] sm:h-[84px] shrink-0"
//               >
//                 <Image
//                   src="/LakLogo.png"
//                   alt="Lakshya"
//                   fill
//                   priority
//                   sizes="90px"
//                   className="object-contain"
//                 />
//               </motion.div>
//             </div>

//             {/* Eyebrow */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.4, delay: 0.7 }}
//               className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-[#7EA4CC] mb-3"
//             >
//               BUILD CLUB{' '}
//               <span className="text-[#E5A83B] font-serif italic lowercase font-light">×</span>{' '}
//               <span className="bg-gradient-to-r from-[#FFD21A] via-[#FF9D00] to-[#FF3D00] bg-clip-text text-transparent">
//                 LAKSHYA
//               </span>
//             </motion.p>

//             {/* INNOVATION DAY */}
//             <motion.h1
//               initial={{ opacity: 0, y: 14 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
//               className="font-primary font-normal text-[#F5F0E8] tracking-tight leading-[0.95] m-0"
//               style={{ fontSize: 'clamp(42px, 7vw, 84px)' }}
//             >
//               INNOVATION DAY
//             </motion.h1>

//             {/* Orange divider rule */}
//             <motion.div
//               initial={{ width: 0, opacity: 0 }}
//               animate={{ width: 56, opacity: 1 }}
//               transition={{ duration: 0.5, delay: 1.0 }}
//               className="my-4 h-[1.5px] rounded-full mx-auto"
//               style={{
//                 background: 'linear-gradient(90deg, #FFD21A, #FF9D00, #FF5A00)',
//               }}
//             />

//             {/* 2026 */}
//             <motion.p
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.45, delay: 1.05 }}
//               className="font-primary text-3xl sm:text-5xl text-[#E8E0D0] m-0"
//             >
//               2026
//             </motion.p>

//             {/* 6TH — 7TH OCTOBER */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.45, delay: 1.25 }}
//               className="mt-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#7EA4CC]"
//             >
//               6th <span className="text-[#FF9D00]">—</span> 7th October
//             </motion.p>

//             {/* CLICK TO ENTER hint */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: entered ? 0 : 0.7 }}
//               transition={{ duration: 0.5, delay: 1.6 }}
//               className="mt-10 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-[#7EA4CC] font-semibold"
//             >
//               Click to Enter
//             </motion.p>

//             {/* Small golden sparkle */}
//             <motion.span
//               initial={{ opacity: 0, scale: 0 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.4, delay: 1.45 }}
//               className="absolute -right-4 top-1/2 text-sm text-[#FFB800] select-none"
//             >
              
//             </motion.span>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function EventIntro() {
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);

  // NOTHING automatically hides the intro.
  // It remains visible until the user explicitly interacts.

  const dismiss = () => {
    if (entered) return;

    setEntered(true);

    // Only after an actual user interaction:
    // allow the exit animation to play.
    window.setTimeout(() => {
      setVisible(false);
    }, 700);
  };

  // Enter / Space keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!visible || entered) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, entered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Enter Innovation Day"
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            overflow-hidden
            cursor-pointer
            select-none
            outline-none
          "
          style={{
            background:
              'linear-gradient(135deg, #FFFDF7 0%, #FFF9EA 50%, #FFFDF7 100%)',
          }}

          /* Initial state */
          initial={{
            opacity: 1,
            scale: 1,
          }}

          /* IMPORTANT:
            This happens ONLY after the user clicks/taps/presses Enter/Space */
          animate={{
            opacity: 1,
            scale: 1,
          }}

          /* Smooth premium disappearance */
          exit={{
            opacity: 0,
            scale: 1.035,
            y: -18,
            filter: 'blur(3px)',
          }}

          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}

          onClick={dismiss}

          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              dismiss();
            }
          }}
        >

          {/* ================================
              PALE YELLOW ATMOSPHERE
             ================================= */}

          <div
            className="absolute pointer-events-none"
            style={{
              width: '750px',
              height: '750px',
              top: '-25%',
              right: '-10%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,210,26,0.20) 0%, rgba(255,157,0,0.10) 40%, transparent 72%)',
            }}
          />

          <div
            className="absolute pointer-events-none"
            style={{
              width: '650px',
              height: '650px',
              bottom: '-25%',
              left: '-12%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,180,0,0.14) 0%, rgba(255,120,0,0.07) 45%, transparent 72%)',
            }}
          />

          {/* ================================
              ORBITAL CIRCLES
             ================================= */}

          <div
            className="absolute rounded-full pointer-events-none hidden sm:block"
            style={{
              width: '520px',
              height: '520px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(255,157,0,0.18)',
            }}
          />

          <div
            className="absolute rounded-full pointer-events-none hidden md:block"
            style={{
              width: '720px',
              height: '720px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(255,210,26,0.14)',
            }}
          />

          {/* ================================
              DECORATIVE CURVES
             ================================= */}

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 800"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M70 620C290 170 790 100 1130 300"
              stroke="#FF9D00"
              strokeOpacity="0.24"
              strokeWidth="1.2"
              strokeDasharray="7 5"
            />

            <path
              d="M120 700C390 260 820 170 1150 350"
              stroke="#FFD21A"
              strokeOpacity="0.18"
              strokeWidth="1"
            />

            <path
              d="M40 410C290 610 720 720 1150 530"
              stroke="#FF6500"
              strokeOpacity="0.13"
              strokeWidth="1"
            />
          </svg>

          {/* ================================
              MAIN CONTENT
             ================================= */}

          <div className="relative z-10 flex flex-col items-center text-center px-6">

            {/* LOGOS */}

            <div className="flex items-center justify-center gap-5 sm:gap-7 mb-8">

              <div
                className="
                  relative
                  w-[95px]
                  sm:w-[125px]
                  h-[72px]
                  sm:h-[92px]
                "
              >
                <Image
                  src="/logo.png"
                  alt="Build Club"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <span
                className="
                  text-3xl
                  sm:text-4xl
                  font-serif
                  italic
                  text-[#E29A16]
                "
              >
                ×
              </span>

              <div
                className="
                  relative
                  w-[110px]
                  sm:w-[150px]
                  h-[85px]
                  sm:h-[110px]
                "
              >
                <Image
                  src="/LakLogo.png"
                  alt="Lakshya"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

            </div>

            {/* BRAND */}

            <p
              className="
                text-[11px]
                sm:text-xs
                uppercase
                tracking-[0.32em]
                font-semibold
                text-[#07152F]
                mb-5
              "
            >
              BUILD CLUB{' '}
              <span className="text-[#E29A16]">×</span>{' '}
              <span
                className="
                  bg-gradient-to-r
                  from-[#FFD21A]
                  via-[#FF9D00]
                  to-[#EF3A00]
                  bg-clip-text
                  text-transparent
                "
              >
                LAKSHYA
              </span>
            </p>

            {/* INNOVATION DAY */}

            <h1
              className="
                font-primary
                font-normal
                text-[#07152F]
                tracking-tight
                leading-[0.95]
                m-0
              "
              style={{
                fontSize: 'clamp(42px, 8vw, 92px)',
              }}
            >
              INNOVATION DAY
            </h1>

            {/* DIVIDER */}

            <div
              className="my-5 h-[2px] w-[72px] rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #FFD21A, #FF9D00, #FF5A00)',
              }}
            />

            {/* YEAR */}

            <p
              className="
                font-primary
                text-4xl
                sm:text-6xl
                text-[#FF6500]
                m-0
              "
            >
              2026
            </p>

            {/* DATE */}

            <p
              className="
                mt-5
                text-[12px]
                sm:text-sm
                uppercase
                tracking-[0.28em]
                font-semibold
                text-[#07152F]
              "
            >
              6TH{' '}
              <span className="text-[#FF6500]">—</span>{' '}
              7TH OCTOBER
            </p>

            {/* ENTER INSTRUCTION */}

            <p
              className="
                mt-12
                text-[10px]
                sm:text-[11px]
                uppercase
                tracking-[0.4em]
                font-semibold
                text-[#07152F]
              "
            >
              CLICK / TAP TO ENTER
            </p>

            {/* GOLD SPARKLE */}

            <span
              className="
                absolute
                right-0
                top-1/2
                text-lg
                text-[#E8A317]
              "
              aria-hidden="true"
            >
              ✦
            </span>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}