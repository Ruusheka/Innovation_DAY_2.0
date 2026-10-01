'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Vote, Trophy, FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Vote', href: '/admin/vote', icon: Vote },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r border-white/5 bg-[#041128]/50 backdrop-blur-sm fixed left-0 top-0 bottom-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="text-[#91A9C9] font-bold text-xs tracking-[0.2em] uppercase">
          Build Club
        </div>
        <div className="text-white/40 text-xs tracking-widest mt-0.5">Admin Portal</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-[#91A9C9]/10 text-[#91A9C9] border border-[#91A9C9]/20'
                  : 'text-[#848C9B] hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#91A9C9] rounded-full"
                />
              )}
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={12} className="text-[#91A9C9]/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="text-[#848C9B]/40 text-xs">SSN I FOUND</div>
      </div>
    </aside>
  );
}

// Mobile bottom nav
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#041128]/90 backdrop-blur-md">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive ? 'text-[#91A9C9]' : 'text-[#848C9B]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
