'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import { Settings, Power, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { canToggleVoting } from '@/lib/permissions';
import type { AdminUser, EventSettings } from '@/types';

interface SuperAdminControlsProps {
  admin: AdminUser;
  eventSettings: EventSettings;
}

export function SuperAdminControls({ admin, eventSettings }: SuperAdminControlsProps) {
  const [votingEnabled, setVotingEnabled] = useState(eventSettings.voting_enabled);
  const [toggling, setToggling] = useState(false);
  const [open, setOpen] = useState(false);

  // Exact permission guard: SUPER_ADMIN role + designated ruushekas@gmail.com
  const canToggle = canToggleVoting(admin.role, admin.email);

  const handleToggleVoting = async () => {
    if (!canToggle) {
      toast.error('Only the designated Superadmin (ruushekas@gmail.com) can toggle polling.');
      return;
    }

    setToggling(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voting_enabled: !votingEnabled }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to update voting status.');
        return;
      }
      const newValue = !votingEnabled;
      setVotingEnabled(newValue);
      toast.success(newValue ? '✓ Polling is now OPEN.' : '✓ Polling is now CLOSED.');
    } catch {
      toast.error('Network error.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="relative font-primary">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#D9E1EA] text-[#041128] hover:bg-[rgba(145,169,201,0.18)] hover:border-[#91A9C9] text-xs font-normal transition-all shadow-2xs"
        title="Super Admin Polling Controls"
      >
        <ShieldCheck size={14} className="text-[#5277A8]" />
        <span className="hidden sm:inline">Polling: {votingEnabled ? 'OPEN' : 'CLOSED'}</span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-11 z-40 w-72 bg-white/95 backdrop-blur-[20px] border border-[#D9E1EA] rounded-2xl p-4 shadow-xl space-y-2">
              <div className="px-2 py-1 text-[#5277A8] text-[11px] font-normal uppercase tracking-widest border-b border-[rgba(4,17,40,0.06)] pb-2">
                Super Admin Controls
              </div>

              {/* Toggle Voting */}
              {canToggle ? (
                <button
                  onClick={() => {
                    handleToggleVoting();
                    setOpen(false);
                  }}
                  disabled={toggling}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-normal transition-all cursor-pointer',
                    votingEnabled
                      ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Power size={14} />
                    <span>{votingEnabled ? 'Close Polling' : 'Open Polling'}</span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                      votingEnabled
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-emerald-200/80 text-emerald-900'
                    )}
                  >
                    {votingEnabled ? 'OPEN' : 'CLOSED'}
                  </span>
                </button>
              ) : (
                <div className="p-2.5 text-xs text-[#5277A8] bg-[#EDF4FC] rounded-xl leading-relaxed">
                  Polling open/close is restricted to <strong className="text-[#041128]">ruushekas@gmail.com</strong>.
                </div>
              )}

              {/* Link to full Settings Page */}
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-normal text-[#041128] hover:bg-[rgba(145,169,201,0.18)] transition-all"
              >
                <Settings size={14} className="text-[#5277A8]" />
                <span>Full System Settings &rarr;</span>
              </Link>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
