'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PageContainer } from '@/components/ui/PageContainer';

const NAV_ITEMS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Departments', href: '/departments' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
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
          'sticky top-0 z-[1000] w-full h-[88px] sm:h-[92px] transition-all duration-300',
          scrolled
            ? 'bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[rgba(4,17,40,0.08)] shadow-[0_4px_20px_rgba(4,17,40,0.03)]'
            : 'bg-[#FAF9F5]/88 backdrop-blur-sm border-b border-[rgba(4,17,40,0.05)]'
        )}
      >
        <PageContainer className="h-full">
          {/* Desktop 3-column Grid: auto (Logo) | 1fr (Centered Nav) | auto (Admin Login) */}
          <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center h-full gap-4">
            {/* 1. Left: Build Club Logo */}
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center group transition-opacity hover:opacity-90">
                <div className="relative w-[190px] sm:w-[210px] h-11 sm:h-12">
                  <Image
                    src="/logo.png"
                    alt="BUILD CLUB — SSN I FOUND"
                    fill
                    priority
                    className="object-contain object-left"
                    sizes="210px"
                  />
                </div>
              </Link>
            </div>

            {/* 2. Center: Navigation Links (Independently Centered) */}
            <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-11">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/projects'
                    ? pathname.startsWith('/projects')
                    : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative py-2 text-[15px] lg:text-[16px] font-medium tracking-normal transition-colors font-sans',
                      isActive ? 'text-[#041128] font-semibold' : 'text-[#41516B] hover:text-[#041128]'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5277A8] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right: Admin Login Button & Mobile Hamburger */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/login"
                className="hidden md:inline-flex btn-outline-pill group"
              >
                <User size={15} className="text-[#5277A8] transition-transform duration-200 group-hover:scale-110" />
                <span>Admin Login</span>
              </Link>

              {/* Mobile hamburger button */}
              <button
                className="md:hidden p-2.5 rounded-xl text-[#041128] hover:bg-black/5 transition-colors focus:outline-none"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed top-[88px] left-0 right-0 z-[999] bg-[#FAF9F5] border-b border-[rgba(4,17,40,0.1)] py-5 px-6 shadow-xl md:hidden"
          >
            <PageContainer>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[16px] font-medium text-[#041128] hover:bg-[#EDF4FC] transition-colors font-sans"
                  >
                    {item.label}
                    <ChevronRight size={18} className="text-[#848C9B]" />
                  </Link>
                ))}
                <div className="pt-3 mt-2 border-t border-[rgba(4,17,40,0.08)]">
                  <Link
                    href="/admin/login"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full bg-[#041128] text-white font-medium text-[15px] font-sans hover:bg-[#0b1e42] transition-colors"
                  >
                    <User size={16} />
                    <span>Admin Login</span>
                  </Link>
                </div>
              </nav>
            </PageContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
