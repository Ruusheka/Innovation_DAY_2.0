'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Home', href: '/#hero' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'projects', label: 'Projects', href: '/#projects' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scrollspy observer for active section detection on the landing page
  useEffect(() => {
    if (pathname !== '/') return;

    const sections = ['hero', 'about', 'projects'];
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Handle smooth in-page scrolling or routing
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    setMobileOpen(false);

    if (pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(item.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(item.id);
        window.history.pushState(null, '', `#${item.id}`);
      }
    }
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[min(1100px,calc(100%-48px))] z-[9999] pointer-events-none">
      {/* ── FLOATING GLASS PILL CONTAINER (68px height) ── */}
      <div
        className={cn(
          'w-full h-[68px] rounded-full px-5 sm:px-7 flex items-center justify-between pointer-events-auto transition-all duration-300',
          'bg-white/70 backdrop-blur-[20px] border border-white/80',
          scrolled
            ? 'shadow-[0_14px_40px_-6px_rgba(4,17,40,0.12)]'
            : 'shadow-[0_10px_35px_rgba(4,17,40,0.08)]'
        )}
      >
        {/* 1. Left: Build Club Logo */}
        <Link
          href="/#hero"
          onClick={(e) => handleNavClick(e, { id: 'hero', label: 'Home', href: '/#hero' })}
          className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90 pl-1 shrink-0"
        >
          <div className="relative w-[160px] sm:w-[185px] h-9 sm:h-10">
            <Image
              src="/logo.png"
              alt="BUILD CLUB — SSN I FOUND"
              fill
              priority
              className="object-contain object-left"
              sizes="185px"
            />
          </div>
        </Link>

        {/* 2. Center/Right: In-Page Single-Page Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#FAF9F5]/75 border border-[rgba(4,17,40,0.06)]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === '/' && activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  'relative px-5 py-2 rounded-full text-[14.5px] font-primary transition-all duration-200 cursor-pointer select-none',
                  'text-[#041128] hover:text-[#041128]',
                  isActive
                    ? 'font-bold'
                    : 'font-normal hover:bg-[rgba(145,169,201,0.16)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill-active"
                    className="absolute inset-0 bg-[#E8EFF7] border border-[#91A9C9]/40 rounded-full -z-10 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#5277A8] rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* 3. Mobile Hamburger Button Only (Admin Login removed from public nav) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 rounded-full text-[#041128] hover:bg-[rgba(145,169,201,0.16)] transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── MOBILE GLASS DROPDOWN ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2.5 w-full rounded-[24px] bg-white/90 backdrop-blur-[20px] p-3 shadow-xl md:hidden pointer-events-auto border border-white/80"
          >
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === '/' && activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-base font-primary transition-colors',
                      'text-[#041128]',
                      isActive
                        ? 'bg-[#E8EFF7] font-bold border border-[#91A9C9]/40'
                        : 'hover:bg-[rgba(145,169,201,0.16)] font-normal'
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight size={16} className={isActive ? 'text-[#5277A8]' : 'text-[#848C9B]'} />
                  </a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
