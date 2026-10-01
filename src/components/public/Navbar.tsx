'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Departments', href: '/#departments' },
  { label: 'About', href: '/#about' },
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
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[88px] sm:h-[96px] flex items-center',
          scrolled
            ? 'nav-glass'
            : 'bg-[#FAF9F5]/90 border-b border-[rgba(4,17,40,0.06)]'
        )}
      >
        <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Left: Build Club Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative h-12 w-[180px] sm:h-14 sm:w-[220px]">
                <Image
                  src="/logo.png"
                  alt="BUILD CLUB — SSN I FOUND"
                  fill
                  priority
                  className="object-contain object-left transition-opacity group-hover:opacity-90"
                />
              </div>
            </Link>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex items-center gap-10">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/projects'
                    ? pathname.startsWith('/projects')
                    : pathname === '/' && item.href === '/';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative py-2 text-[15px] font-medium tracking-wide transition-colors',
                      isActive ? 'text-[#041128]' : 'text-[#41516B] hover:text-[#041128]'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#91A9C9] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Admin Login Button */}
            <div className="hidden md:flex items-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[26px] bg-[#FFFFFF] border border-[rgba(4,17,40,0.14)] text-[#041128] text-sm font-medium hover:bg-[#EBF1F8] hover:border-[#91A9C9] transition-all shadow-sm"
              >
                <User size={15} className="text-[#41516B]" />
                <span>Admin Login</span>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-[#041128] hover:bg-black/5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[88px] left-0 right-0 z-40 bg-[#FAF9F5] border-b border-[rgba(4,17,40,0.1)] py-5 px-6 shadow-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[#041128] hover:bg-[#EBF1F8] transition-colors"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-[#848C9B]" />
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-[rgba(4,17,40,0.08)]">
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#041128] text-white font-medium text-sm"
                >
                  <User size={16} />
                  Admin Login
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
