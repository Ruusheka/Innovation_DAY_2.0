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
  ADMIN: 'Admin Operator',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'text-amber-800 bg-amber-50 border-amber-200',
  ADMIN: 'text-[#041128] bg-[#E8EFF7] border-[#91A9C9]/60',
  VIEWER: 'text-[#848C9B] bg-slate-50 border-slate-200',
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
    <header className="sticky top-0 z-20 border-b border-[rgba(4,17,40,0.06)] bg-white/90 backdrop-blur-md px-6 lg:px-10 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          {title && (
            <h1 className="text-[#041128] font-semibold text-lg sm:text-xl tracking-tight">
              {title}
            </h1>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Super Admin settings dropdown */}
          {admin.role === 'SUPER_ADMIN' && eventSettings && (
            <SuperAdminControls admin={admin} eventSettings={eventSettings} />
          )}

          {/* Role badge */}
          <span
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
              ROLE_COLORS[admin.role] ?? ROLE_COLORS.ADMIN
            )}
          >
            <Shield size={12} />
            {ROLE_LABELS[admin.role] ?? admin.role}
          </span>

          {/* Admin name */}
          <div className="hidden sm:block text-right">
            <div className="text-[#041128] text-sm font-semibold leading-tight">
              {admin.name}
            </div>
            <div className="text-[#848C9B] text-xs">{admin.email}</div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#848C9B] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
