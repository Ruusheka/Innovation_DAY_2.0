'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[rgba(4,17,40,0.08)] bg-white fixed left-0 top-0 bottom-0 z-30">
      {/* Brand & Logo */}
      <div className="px-6 py-6 border-b border-[rgba(4,17,40,0.06)]">
        <div className="relative h-10 w-44">
          <Image
            src="/logo.png"
            alt="BUILD CLUB Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <div className="text-[11px] font-semibold text-[#91A9C9] tracking-wider uppercase mt-2">
          Registration Desk Portal
        </div>
      </div>

      {/* Nav Items — Exactly 3 Primary Items */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-[#E8EFF7] text-[#041128]'
                  : 'text-[#41516B] hover:text-[#041128] hover:bg-[#FAF9F5]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#041128] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={isActive ? 'text-[#041128]' : 'text-[#848C9B] group-hover:text-[#041128]'}
              />
              <span className="flex-1 tracking-wide">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="text-[#041128]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-[rgba(4,17,40,0.06)] bg-[#FAF9F5]/60">
        <div className="text-xs font-semibold text-[#041128]">SSN I FOUND</div>
        <div className="text-[11px] text-[#848C9B] mt-0.5">One Student = One Vote</div>
      </div>
    </aside>
  );
}

// Mobile bottom nav
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(4,17,40,0.1)] bg-white/95 backdrop-blur-md shadow-lg">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors',
                isActive ? 'text-[#041128] bg-[#E8EFF7]' : 'text-[#848C9B]'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
