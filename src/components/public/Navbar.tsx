'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Departments', href: '/projects#departments' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass border-b border-white/10 py-3'
            : 'py-5 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#91A9C9]/10 border border-[#91A9C9]/20 flex items-center justify-center group-hover:bg-[#91A9C9]/20 transition-colors">
                  <span className="text-[#91A9C9] font-bold text-sm font-mono">BC</span>
                </div>
              </div>
              <div className="leading-none">
                <div className="text-white font-semibold text-sm tracking-wide">BUILD CLUB</div>
                <div className="text-[#91A9C9] text-xs tracking-[0.15em] font-medium">SSN I FOUND</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href
                      ? 'text-[#91A9C9] bg-[#91A9C9]/10'
                      : 'text-[#848C9B] hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Subtle admin link */}
              <Link
                href="/admin/login"
                className="ml-4 text-[#848C9B]/50 hover:text-[#848C9B] text-xs transition-colors"
                title="Admin Portal"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-[#848C9B] hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-white/10 py-4 px-4 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-[#B2B4AB] hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.label}
                  <ChevronRight size={14} className="text-[#848C9B]" />
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
