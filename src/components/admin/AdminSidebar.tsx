'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Vote, Trophy, FolderOpen, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Vote', href: '/admin/vote', icon: Vote },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[#D9E1EA] bg-white/80 backdrop-blur-[20px] fixed left-0 top-0 bottom-0 z-30 font-primary">
      {/* Brand & Logo — Visually Centered Flex Column (120px width) */}
      <div className="px-6 py-7 border-b border-[rgba(4,17,40,0.06)] flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="relative w-[56px] h-[42px] shrink-0">
            <Image
              src="/logo.png"
              alt="BUILD CLUB Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span aria-hidden="true" className="font-serif italic font-light text-[17px] text-[#E5A83B] select-none mx-0.5 opacity-90">×</span>
          <div className="relative w-[42px] h-[42px] shrink-0">
            <Image src="/LakLogo.png" alt="Lakshya" fill sizes="42px" className="object-contain" />
          </div>
        </div>
        <div className="text-[11.5px] font-primary font-normal text-[#5277A8] tracking-[0.2em] uppercase leading-snug text-center">
          REGISTRATION<br />DESK PORTAL
        </div>
      </div>

      {/* Nav Items — Exactly 4 Items */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14.5px] transition-all duration-200 group font-normal',
                isActive
                  ? 'bg-[#E8EFF7] text-[#041128] font-bold border border-[#91A9C9]/40 shadow-2xs'
                  : 'text-[#41516B] hover:text-[#041128] hover:bg-[rgba(145,169,201,0.18)]'
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
      <div className="px-6 py-4 border-t border-[rgba(4,17,40,0.06)] bg-white/40">
        <div className="text-xs font-normal text-[#041128]">SSN I FOUND</div>
        <div className="text-[11px] text-[#848C9B] mt-0.5">One Student = One Vote</div>
      </div>
    </aside>
  );
}

// Mobile bottom nav
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#D9E1EA] bg-white/90 backdrop-blur-[20px] shadow-lg font-primary">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors font-normal',
                isActive ? 'text-[#041128] bg-[#E8EFF7] font-bold' : 'text-[#41516B] hover:bg-[rgba(145,169,201,0.18)]'
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
