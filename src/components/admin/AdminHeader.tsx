'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { SuperAdminControls } from './SuperAdminControls';
import type { AdminUser, EventSettings } from '@/types';
import { cn } from '@/lib/utils/cn';


interface AdminHeaderProps {
  admin: AdminUser;
  title?: string;
  eventSettings?: EventSettings | null;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  ADMIN: 'text-[#91A9C9] bg-[#91A9C9]/10 border-[#91A9C9]/20',
  VIEWER: 'text-[#848C9B] bg-white/5 border-white/10',
};

export function AdminHeader({ admin, title, eventSettings }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Logged out successfully.');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out.');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#040411]/80 backdrop-blur-sm px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page title */}
        <div>
          {title && (
            <h1 className="text-white font-semibold text-lg">{title}</h1>
          )}
        </div>

        {/* Admin info + logout */}
        <div className="flex items-center gap-3">
          {/* Super Admin controls */}
          {admin.role === 'SUPER_ADMIN' && eventSettings && (
            <SuperAdminControls admin={admin} eventSettings={eventSettings} />
          )}

          {/* Role badge */}
          <span
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              ROLE_COLORS[admin.role] ?? ROLE_COLORS.ADMIN
            )}
          >
            <Shield size={10} />
            {ROLE_LABELS[admin.role] ?? admin.role}
          </span>

          {/* Name */}
          <div className="hidden sm:block text-right">
            <div className="text-white text-sm font-medium leading-none">{admin.name}</div>
            <div className="text-[#848C9B] text-xs mt-0.5">{admin.email}</div>
          </div>


          {/* Mobile: just show initials */}
          <div className="sm:hidden w-8 h-8 rounded-full bg-[#91A9C9]/10 border border-[#91A9C9]/20 flex items-center justify-center text-[#91A9C9] text-xs font-bold">
            {admin.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#848C9B] hover:text-red-400 hover:bg-red-400/5 border border-transparent hover:border-red-400/20 text-xs font-medium transition-all"
            title="Logout"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
