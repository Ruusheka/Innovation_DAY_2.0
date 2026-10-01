'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Settings, Upload, Power, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { StudentImport } from './StudentImport';
import { cn } from '@/lib/utils/cn';
import type { AdminUser, EventSettings } from '@/types';

interface SuperAdminControlsProps {
  admin: AdminUser;
  eventSettings: EventSettings;
}

export function SuperAdminControls({ admin, eventSettings }: SuperAdminControlsProps) {
  const [showImport, setShowImport] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(eventSettings.voting_enabled);
  const [toggling, setToggling] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggleVoting = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voting_enabled: !votingEnabled }),
      });
      if (!res.ok) {
        toast.error('Failed to update voting status.');
        return;
      }
      const newValue = !votingEnabled;
      setVotingEnabled(newValue);
      toast.success(newValue ? 'Voting is now OPEN.' : 'Voting is now CLOSED.');
    } catch {
      toast.error('Network error.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#848C9B] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-medium transition-all"
          title="Super Admin Controls"
        >
          <Settings size={14} />
          <span className="hidden sm:inline">Controls</span>
        </button>

        {/* Dropdown panel */}
        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 top-10 z-40 w-64 glass border border-white/10 rounded-xl p-3 shadow-xl shadow-black/40 space-y-1">
                <div className="px-2 py-1 text-[#848C9B] text-xs font-medium uppercase tracking-widest mb-2">
                  Super Admin
                </div>

                {/* Toggle Voting */}
                <button
                  onClick={() => { handleToggleVoting(); setOpen(false); }}
                  disabled={toggling}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    votingEnabled
                      ? 'text-red-400 hover:bg-red-400/5'
                      : 'text-green-400 hover:bg-green-400/5'
                  )}
                >
                  <Power size={14} />
                  {votingEnabled ? 'Close Voting' : 'Open Voting'}
                  <span className={cn(
                    'ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium',
                    votingEnabled
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-red-400/10 text-red-400'
                  )}>
                    {votingEnabled ? 'OPEN' : 'CLOSED'}
                  </span>
                </button>

                {/* Import Students */}
                <button
                  onClick={() => { setShowImport(true); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#848C9B] hover:text-white hover:bg-white/5 transition-all"
                >
                  <Upload size={14} />
                  Import Students (CSV)
                </button>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Import modal */}
      <AnimatePresence>
        {showImport && <StudentImport onClose={() => setShowImport(false)} />}
      </AnimatePresence>
    </>
  );
}
