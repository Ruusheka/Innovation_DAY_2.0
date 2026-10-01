'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const glowRef = useRef<HTMLDivElement>(null);

  // Subtle ambient cursor glow on hero
  useEffect(() => {
    const hero = glowRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--gx', `${x}px`);
      hero.style.setProperty('--gy', `${y}px`);
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={glowRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-ambient bg-grid"
      style={
        {
          '--gx': '50%',
          '--gy': '50%',
        } as React.CSSProperties
      }
    >
      {/* Ambient radial glow that follows cursor faintly */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(600px circle at var(--gx) var(--gy), rgba(145,169,201,0.04), transparent 60%)',
        }}
      />

      {/* Static large glow center */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#91A9C9]/5 blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-[#91A9C9]/20 mb-8"
        >
          <Sparkles size={12} className="text-[#91A9C9]" />
          <span className="text-[#91A9C9] text-xs font-medium tracking-widest uppercase">
            Project Exhibition
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
            BUILD
            <br />
            <span className="gradient-text">CLUB</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#91A9C9]/40" />
            <span className="text-[#91A9C9] text-sm font-medium tracking-[0.25em] uppercase">
              SSN I FOUND
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#91A9C9]/40" />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="mt-8 text-[#848C9B] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Explore innovative projects built by students of{' '}
          <span className="text-[#B2B4AB]">SSN College of Engineering</span>.
          Discover what the next generation of engineers, designers, and innovators are building.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#91A9C9] text-[#040411] font-semibold rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#91A9C9]/20"
          >
            Explore Projects
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/projects#departments"
            className="inline-flex items-center gap-2 px-8 py-4 glass rounded-xl text-[#B2B4AB] hover:text-white border-white/10 hover:border-[#91A9C9]/30 transition-all"
          >
            Browse Departments
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { label: 'Departments', value: '6' },
            { label: 'Projects', value: '30+' },
            { label: 'Innovators', value: '100+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#848C9B] mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#040411] to-transparent pointer-events-none" />
    </section>
  );
}
