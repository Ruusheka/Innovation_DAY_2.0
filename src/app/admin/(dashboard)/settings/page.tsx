'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ShieldAlert, ShieldCheck, Power, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SettingsData {
  id?: string;
  event_name?: string;
  voting_enabled: boolean;
  isSuperAdmin: boolean;
  canToggleVoting?: boolean;
  adminEmail?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (res.ok && json.data) {
        setSettings(json.data);
      } else {
        toast.error(json.error || 'Failed to fetch settings');
      }
    } catch {
      toast.error('Network error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleClick = (targetState: boolean) => {
    if (!settings?.canToggleVoting) {
      toast.error('Only the designated Superadmin (ruushekas@gmail.com) can modify polling status.');
      return;
    }
    setPendingState(targetState);
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingState === null) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voting_enabled: pendingState }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to update polling status');
      } else {
        setSettings((prev) => (prev ? { ...prev, voting_enabled: pendingState } : prev));
        toast.success(
          pendingState ? '✓ Polling opened successfully.' : '✓ Polling closed successfully.'
        );
      }
    } catch {
      toast.error('Network error updating polling status');
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
      setPendingState(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      {/* ── Page Header ── */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-primary text-3xl sm:text-4xl lg:text-5xl text-[#041128] font-normal tracking-tight m-0">
          SYSTEM SETTINGS
        </h1>
        <p className="font-primary text-sm sm:text-base text-[#41516B] mt-2">
          Manage exhibition event controls, polling status, and desk voting authorization.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[26px] bg-white/75 backdrop-blur-md border border-[#D9E1EA] p-12 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-[#5277A8] border-t-transparent animate-spin mb-3" />
          <p className="font-primary text-sm text-[#41516B]">Loading event settings...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── CARD 1: POLLING CONTROL ── */}
          <div className="rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-7 sm:p-10 shadow-[0_12px_40px_rgba(4,17,40,0.06)] relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[rgba(4,17,40,0.06)] gap-4">
              <div>
                <span className="text-[11px] font-primary uppercase tracking-[0.25em] text-[#5277A8]">
                  EXHIBITION VOTING CONTROL
                </span>
                <h2 className="font-primary text-2xl sm:text-3xl text-[#041128] font-normal mt-1">
                  Polling Status
                </h2>
              </div>

              {/* Status Pill Badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-primary font-normal tracking-wider uppercase self-start sm:self-auto',
                  settings?.voting_enabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                )}
              >
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full animate-pulse',
                    settings?.voting_enabled ? 'bg-emerald-500' : 'bg-rose-500'
                  )}
                />
                <span>POLLING IS {settings?.voting_enabled ? 'OPEN' : 'CLOSED'}</span>
              </div>
            </div>

            {/* Description & State Details */}
            <div className="py-6 space-y-4">
              <p className="font-primary text-sm sm:text-base text-[#41516B] leading-relaxed max-w-2xl">
                When polling is <strong className="text-[#041128]">OPEN</strong>, physical registration desks can verify students and submit votes. When polling is <strong className="text-[#041128]">CLOSED</strong>, all vote submissions are immediately blocked across the system.
              </p>

              {/* SuperAdmin Authorization Notice */}
              {!settings?.isSuperAdmin ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-amber-900">
                  <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-primary text-sm font-normal">Superadmin Protected Control</div>
                    <div className="font-primary text-xs text-amber-800 mt-0.5">
                      Only Superadmins can access event controls. Polling modification is restricted to <code className="font-mono font-bold">ruushekas@gmail.com</code>.
                    </div>
                  </div>
                </div>
              ) : settings?.canToggleVoting ? (
                <div className="p-4 rounded-2xl bg-[#EDF4FC]/80 border border-[#91A9C9]/40 flex items-start gap-3.5 text-[#041128]">
                  <ShieldCheck size={20} className="text-[#5277A8] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-primary text-sm font-normal">Superadmin Authorized: ruushekas@gmail.com</div>
                    <div className="font-primary text-xs text-[#5277A8] mt-0.5">
                      You have full authority to open or close live exhibition polling.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EDF4FC]/80 border border-[#91A9C9]/40 flex items-start gap-3.5 text-[#041128]">
                  <ShieldCheck size={20} className="text-[#5277A8] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-primary text-sm font-normal">Superadmin Account: {settings?.adminEmail}</div>
                    <div className="font-primary text-xs text-[#5277A8] mt-0.5">
                      All superadmin permissions active. Polling open/close is assigned to <strong className="font-bold">ruushekas@gmail.com</strong>.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons for Superadmin */}
            <div className="pt-6 border-t border-[rgba(4,17,40,0.06)] flex flex-wrap items-center gap-4">
              {settings?.canToggleVoting ? (
                <>
                  {settings.voting_enabled ? (
                    <button
                      type="button"
                      onClick={() => handleToggleClick(false)}
                      disabled={updating}
                      className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-primary text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <Power size={17} />
                      <span>CLOSE POLLING</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleClick(true)}
                      disabled={updating}
                      className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-primary text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 size={17} />
                      <span>OPEN POLLING</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2.5 h-[48px] px-6 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-primary text-xs cursor-not-allowed"
                >
                  <Lock size={15} />
                  <span>Polling Control Assigned to ruushekas@gmail.com</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !updating && setShowConfirmModal(false)}
              className="absolute inset-0 bg-[#041128]/50 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-[28px] bg-white p-7 sm:p-9 shadow-2xl border border-[#D9E1EA] space-y-6 z-10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                    pendingState ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  )}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-primary text-2xl text-[#041128] font-normal">
                    {pendingState ? 'Open Exhibition Polling?' : 'Close Exhibition Polling?'}
                  </h3>
                  <p className="font-primary text-xs text-[#5277A8] mt-0.5">
                    Confirmation required for Superadmin action
                  </p>
                </div>
              </div>

              <p className="font-primary text-sm text-[#41516B] leading-relaxed">
                {pendingState
                  ? 'Opening polling will immediately allow all physical voting desk operators to verify students and record new votes.'
                  : 'Closing polling will immediately stop all voting desk submissions across the exhibition portal.'}
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={updating}
                  className="h-[46px] px-6 rounded-full border border-[#D9E1EA] bg-white text-[#041128] font-primary text-xs hover:bg-[rgba(145,169,201,0.18)] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmToggle}
                  disabled={updating}
                  className={cn(
                    'h-[46px] px-7 rounded-full text-white font-primary text-xs transition-all shadow-md',
                    pendingState
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  )}
                >
                  {updating ? 'Updating...' : pendingState ? 'Yes, Open Polling' : 'Yes, Close Polling'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
