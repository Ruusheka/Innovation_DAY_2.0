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

      const scrollPosition = window.scrollY + 160;

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
    handleScroll(); // run once on mount

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
    <header className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 w-[min(1120px,calc(100%-28px))] z-[1000] pointer-events-none">
      {/* ── FLOATING GLASS PILL CONTAINER ── */}
      <div
        className={cn(
          'w-full h-[64px] sm:h-[68px] rounded-full px-3.5 sm:px-5 flex items-center justify-between pointer-events-auto transition-all duration-300',
          'glass-pill-nav',
          scrolled ? 'shadow-[0_12px_36px_-6px_rgba(4,17,40,0.12)]' : 'shadow-[0_8px_28px_-6px_rgba(4,17,40,0.06)]'
        )}
      >
        {/* 1. Left: Build Club Logo */}
        <Link
          href="/#hero"
          onClick={(e) => handleNavClick(e, { id: 'hero', label: 'Home', href: '/#hero' })}
          className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90 pl-1 shrink-0"
        >
          <div className="relative w-[155px] sm:w-[178px] h-9 sm:h-10">
            <Image
              src="/logo.png"
              alt="BUILD CLUB — SSN I FOUND"
              fill
              priority
              className="object-contain object-left"
              sizes="180px"
            />
          </div>
        </Link>

        {/* 2. Center: In-Page Single-Page Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#FAF9F5]/70 border border-[rgba(4,17,40,0.05)]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === '/' && activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  'relative px-4 sm:px-5 py-2 rounded-full text-[14px] font-sans transition-all duration-200 cursor-pointer select-none',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#41516B] hover:text-[#041128] font-medium hover:bg-white/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill-active"
                    className="absolute inset-0 bg-[#041128] rounded-full -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* 3. Right: Admin Login Pill & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 pr-0.5 shrink-0">
          <Link
            href="/admin/login"
            className="hidden sm:inline-flex items-center gap-2 h-[42px] px-4 sm:px-5 rounded-full bg-white border border-[#D9E1EA] text-[#041128] text-xs font-sans font-semibold tracking-wide hover:bg-[#EDF4FC] hover:border-[#91A9C9] transition-all duration-200 shadow-sm group"
          >
            <User size={14} className="text-[#5277A8] transition-transform duration-200 group-hover:scale-110" />
            <span>Admin Login</span>
          </Link>

          {/* Mobile Admin Icon Button */}
          <Link
            href="/admin/login"
            className="sm:hidden p-2.5 rounded-full bg-white border border-[#D9E1EA] text-[#041128] hover:bg-[#EDF4FC] transition-colors"
            aria-label="Admin Login"
          >
            <User size={16} className="text-[#5277A8]" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-[#041128] hover:bg-black/5 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE GLASS DROPDOWN ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2 w-full rounded-2xl glass-pill-nav p-3 shadow-xl md:hidden pointer-events-auto border border-white/80"
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
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-sans font-medium transition-colors',
                      isActive
                        ? 'bg-[#041128] text-white font-semibold'
                        : 'text-[#041128] hover:bg-[#EDF4FC]'
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight size={15} className={isActive ? 'text-white/70' : 'text-[#848C9B]'} />
                  </a>
                );
              })}

              <div className="pt-2 mt-1 border-t border-[rgba(4,17,40,0.08)]">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#D9E1EA] text-xs font-sans font-semibold text-[#041128]"
                >
                  <User size={14} className="text-[#5277A8]" />
                  <span>Admin Voting & Dashboard Login</span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
