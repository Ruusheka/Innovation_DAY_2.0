'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Trophy, Sparkles, User, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardRow, Department } from '@/types';

interface ExtendedLeaderboardRow extends LeaderboardRow {
  image_url?: string;
}

interface LeaderboardTableProps {
  initialData: ExtendedLeaderboardRow[];
  totalVotes: number;
  departments: Department[];
}

function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;
    setDisplayed(value);
  }, [value]);

  return (
    <motion.span
      key={displayed}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="tabular-nums font-bold text-[#041128]"
    >
      {displayed.toLocaleString()}
    </motion.span>
  );
}

function getFallbackImage(projectId: string) {
  const fallbacks = ['/img1.png', '/img2.png', '/img3.png'];
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i);
    hash |= 0;
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
}

export function LeaderboardTable({
  initialData,
  totalVotes: initialTotal,
  departments,
}: LeaderboardTableProps) {
  const [rows, setRows] = useState<ExtendedLeaderboardRow[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leaderboard');
      if (!res.ok) return;
      const json = await res.json();
      const updatedRows: LeaderboardRow[] = json.data ?? [];
      
      // Preserve existing image_urls where available
      setRows((prev) => {
        const imageMap = new Map<string, string>();
        prev.forEach((r) => {
          if (r.image_url) imageMap.set(r.project_uuid, r.image_url);
        });
        return updatedRows.map((r) => ({
          ...r,
          image_url: imageMap.get(r.project_uuid),
        }));
      });
      setTotal(json.totalVotes ?? 0);
    } catch {
      // silent retry
    }
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-votes-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          refetch();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const filtered = activeDept
    ? rows.filter((r) => r.department_uuid === activeDept)
    : rows;

  // Global ranking sorted descending
  const sorted = [...filtered].sort((a, b) => b.vote_count - a.vote_count);

  // Split into Top 3 and positions 4+
  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const remaining = sorted.slice(3);

  return (
    <div className="space-y-10 font-primary">
      {/* ── 1. Top Stat Cards (Glassmorphism) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-6 sm:p-7 border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
          <div className="text-xs uppercase tracking-wider text-[#5277A8] mb-1 font-normal">
            Total Votes Cast
          </div>
          <div className="text-[#041128] text-4xl sm:text-5xl font-bold tracking-tight">
            <AnimatedCount value={total} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-6 sm:p-7 border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
          <div className="text-xs uppercase tracking-wider text-[#5277A8] mb-1 font-normal">
            Exhibition Projects
          </div>
          <div className="text-[#041128] text-4xl sm:text-5xl font-bold tracking-tight">
            {rows.length}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-6 sm:p-7 border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)] flex items-center gap-4">
          <div
            className={cn(
              'w-3.5 h-3.5 rounded-full shrink-0',
              isLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#91A9C9]'
            )}
          />
          <div>
            <div className="text-[#041128] text-base font-normal">
              {isLive ? 'Live Realtime Active' : 'Connecting Realtime...'}
            </div>
            <div className="text-xs text-[#5277A8] mt-0.5">
              Live updates as votes are submitted
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Department Filter Chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDept(null)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-normal transition-all cursor-pointer border',
            !activeDept
              ? 'bg-[#041128] text-white border-[#041128] shadow-xs'
              : 'bg-white/80 text-[#041128] border-[#D9E1EA] hover:bg-[rgba(145,169,201,0.18)]'
          )}
        >
          All Departments
        </button>
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDept(activeDept === d.id ? null : d.id)}
            className={cn(
              'px-5 py-2 rounded-full text-xs font-normal transition-all cursor-pointer border',
              activeDept === d.id
                ? 'bg-[#041128] text-white border-[#041128] shadow-xs'
                : 'bg-white/80 text-[#041128] border-[#D9E1EA] hover:bg-[rgba(145,169,201,0.18)]'
            )}
          >
            {d.code}
          </button>
        ))}
      </div>

      {/* ── 3. VISUAL PODIUM: TOP 3 PROJECTS HIGHLIGHT ── */}
      {sorted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-[1.5px] bg-[#5277A8]" />
            <span className="text-[11.5px] font-normal uppercase tracking-[0.25em] text-[#5277A8]">
              TOP 3 EXHIBITION LEADERS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            
            {/* #2 PODIUM (Left) */}
            {top2 ? (
              <div className="relative rounded-[26px] bg-white/85 backdrop-blur-[20px] border-2 border-[#A8A9AD] p-6 shadow-[0_12px_40px_rgba(168,169,173,0.22)] md:translate-y-4">
                <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#C0C0C0] via-[#E8E8E8] to-[#A8A9AD] text-[#2a2a2a] font-bold text-xs tracking-wider shadow-md border border-[#B0B0B0]">
                  #2 PLACE
                </div>

                <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#FAF9F5] mb-4 border border-[rgba(4,17,40,0.06)]">
                  <Image
                    src={top2.image_url || getFallbackImage(top2.project_id)}
                    alt={top2.title}
                    fill
                    className="object-cover"
                    sizes="350px"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#041128]/85 text-white text-[11px]">
                    {top2.project_id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-[#5277A8] uppercase tracking-wider">
                    {top2.department_code}
                  </div>
                  <h4 className="text-lg text-[#041128] font-normal line-clamp-1">
                    {top2.title}
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(4,17,40,0.06)]">
                    <span className="text-xs text-[#848C9B]">Lead: {top2.project_lead}</span>
                    <span className="text-2xl font-bold text-[#041128]">
                      <AnimatedCount value={top2.vote_count} /> <span className="text-xs font-semibold text-[#5277A8]">votes</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:block" />
            )}

            {/* #1 PODIUM (Center — Elevated & Taller) */}
            {top1 ? (
              <div className="relative rounded-[28px] bg-white/95 backdrop-blur-[24px] border-2 border-[#D4AF37] p-7 shadow-[0_20px_55px_rgba(212,175,55,0.28),0_4px_15px_rgba(212,175,55,0.15)] md:-translate-y-2 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#3d2800] font-bold text-xs tracking-widest shadow-md flex items-center gap-1.5 border border-[#D4AF37]/60">
                  <Trophy size={14} className="text-[#3d2800]" />
                  <span>#1 LEADER</span>
                </div>

                <div className="relative w-full aspect-[16/10] rounded-[22px] overflow-hidden bg-[#FAF9F5] mb-5 border border-[rgba(4,17,40,0.06)] shadow-xs">
                  <Image
                    src={top1.image_url || getFallbackImage(top1.project_id)}
                    alt={top1.title}
                    fill
                    className="object-cover"
                    sizes="420px"
                    priority
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#041128]/85 text-white text-xs">
                    {top1.project_id}
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-xs text-[#5277A8] uppercase tracking-wider font-semibold">
                    {top1.department_name} ({top1.department_code})
                  </div>
                  <h3 className="text-xl sm:text-2xl text-[#041128] font-normal line-clamp-1">
                    {top1.title}
                  </h3>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(4,17,40,0.08)]">
                    <span className="text-xs text-[#848C9B]">Lead: {top1.project_lead}</span>
                    <span className="text-3xl font-bold text-[#041128]">
                      <AnimatedCount value={top1.vote_count} /> <span className="text-xs font-semibold text-[#5277A8]">votes</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* #3 PODIUM (Right) */}
            {top3 ? (
              <div className="relative rounded-[26px] bg-white/85 backdrop-blur-[20px] border-2 border-[#CD7F32] p-6 shadow-[0_12px_40px_rgba(205,127,50,0.2)] md:translate-y-4">
                <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#CD7F32] via-[#E8B887] to-[#A0522D] text-white font-bold text-xs tracking-wider shadow-md border border-[#CD7F32]/60">
                  #3 PLACE
                </div>

                <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#FAF9F5] mb-4 border border-[rgba(4,17,40,0.06)]">
                  <Image
                    src={top3.image_url || getFallbackImage(top3.project_id)}
                    alt={top3.title}
                    fill
                    className="object-cover"
                    sizes="350px"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#041128]/85 text-white text-[11px]">
                    {top3.project_id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-[#5277A8] uppercase tracking-wider">
                    {top3.department_code}
                  </div>
                  <h4 className="text-lg text-[#041128] font-normal line-clamp-1">
                    {top3.title}
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(4,17,40,0.06)]">
                    <span className="text-xs text-[#848C9B]">Lead: {top3.project_lead}</span>
                    <span className="text-2xl font-bold text-[#041128]">
                      <AnimatedCount value={top3.vote_count} /> <span className="text-xs font-semibold text-[#5277A8]">votes</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:block" />
            )}

          </div>
        </div>
      )}

      {/* ── 4. POSITIONS 4 ONWARD: COMPACT GLASS RANKING TABLE ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[1.5px] bg-[#5277A8]" />
            <span className="text-[11.5px] font-normal uppercase tracking-[0.25em] text-[#5277A8]">
              {sorted.length > 3 ? 'ALL EXHIBITION STANDINGS' : 'EXHIBITION STANDINGS'}
            </span>
          </div>
          <span className="text-xs text-[#848C9B]">
            Showing {sorted.length} project{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-16 text-center border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
            <p className="text-[#041128] text-lg font-normal">No votes recorded yet.</p>
            <p className="text-xs text-[#848C9B] mt-1.5 font-normal">
              As registration desk operators record student votes, live rankings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] border border-white/85 overflow-hidden shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D9E1EA] bg-[#FAF9F5]/70 text-xs uppercase tracking-wider text-[#848C9B]">
                    <th className="px-6 py-4 font-semibold">Rank</th>
                    <th className="px-5 py-4 font-semibold">Project ID</th>
                    <th className="px-5 py-4 font-semibold">Project Title</th>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold hidden md:table-cell">Project Lead</th>
                    <th className="px-6 py-4 font-semibold text-right">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1EA]/60 text-sm">
                  <AnimatePresence initial={false}>
                    {sorted.map((row, i) => {
                      const rank = i + 1;
                      const isTop3 = rank <= 3;

                      return (
                        <motion.tr
                          key={row.project_uuid}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            'hover:bg-[#FAF9F5]/60 transition-colors',
                            isTop3 && 'bg-[#EDF4FC]/25'
                          )}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border shadow-2xs',
                                rank === 1 && 'bg-gradient-to-r from-[#BF953F] to-[#B38728] text-[#3d2800] border-[#D4AF37]',
                                rank === 2 && 'bg-gradient-to-r from-[#C0C0C0] to-[#A8A9AD] text-[#2a2a2a] border-[#A8A9AD]',
                                rank === 3 && 'bg-gradient-to-r from-[#CD7F32] to-[#A0522D] text-white border-[#CD7F32]',
                                rank > 3 && 'bg-[#EDF4FC] text-[#041128] border-[#D9E1EA] font-bold shadow-none'
                              )}
                            >
                              #{rank}
                            </span>
                          </td>

                          {/* Project ID */}
                          <td className="px-5 py-4">
                            <span className="font-bold text-xs text-[#041128] px-2.5 py-1 rounded-full bg-[#EDF4FC]">
                              {row.project_id}
                            </span>
                          </td>

                          {/* Title */}
                          <td className="px-5 py-4">
                            <span className="font-normal text-[#041128] text-[15px]">
                              {row.title}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="px-5 py-4">
                            <span className="text-[#5277A8] text-xs px-2.5 py-0.5 rounded-full bg-white border border-[#D9E1EA]">
                              {row.department_code}
                            </span>
                          </td>

                          {/* Lead */}
                          <td className="px-5 py-4 hidden md:table-cell text-[#41516B]">
                            {row.project_lead}
                          </td>

                          {/* Votes */}
                          <td className="px-6 py-4 text-right">
                            <span className="text-xl font-bold text-[#041128]">
                              <AnimatedCount value={row.vote_count} />
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
