'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Award, User, Users, GraduationCap, Building2, Radio } from 'lucide-react';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { createClient } from '@/lib/supabase/client';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardRow, Department } from '@/types';

interface ExtendedLeaderboardRow extends LeaderboardRow {
  image_url?: string | null;
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
      className="tabular-nums font-bold"
    >
      {displayed.toLocaleString()}
    </motion.span>
  );
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

      setRows((prev) => {
        const metaMap = new Map<string, { image_url?: string | null; team_members?: string[] | null; tags?: string[] | null; supervisor?: string | null }>();
        prev.forEach((r) => {
          metaMap.set(r.project_uuid, {
            image_url: r.image_url,
            team_members: r.team_members,
            tags: r.tags,
            supervisor: r.project_supervisor,
          });
        });

        return updatedRows.map((r) => {
          const cached = metaMap.get(r.project_uuid);
          return {
            ...r,
            image_url: r.image_url || cached?.image_url || undefined,
            team_members: r.team_members || cached?.team_members || [],
            tags: r.tags || cached?.tags || [],
            project_supervisor: r.project_supervisor || cached?.supervisor || null,
          };
        });
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

  // Authoritative deterministic sort:
  // 1. Highest valid vote count
  // 2. Tie-break: Numeric/alphanumeric project_id
  // 3. Tie-break: Project title
  const sorted = [...filtered].sort((a, b) => {
    if (b.vote_count !== a.vote_count) {
      return b.vote_count - a.vote_count;
    }
    const idComp = a.project_id.localeCompare(b.project_id, undefined, { numeric: true });
    if (idComp !== 0) return idComp;
    return a.title.localeCompare(b.title);
  });

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const remaining = sorted.slice(3);

  return (
    <div className="space-y-10 font-primary">
      {/* ── 1. Top Stat Cards (Glassmorphism) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-6 sm:p-7 border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
          <div className="text-xs uppercase tracking-wider text-[#5277A8] mb-1 font-semibold">
            Total Valid Votes Cast
          </div>
          <div className="text-[#041128] text-4xl sm:text-5xl font-bold tracking-tight">
            <AnimatedCount value={total} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-6 sm:p-7 border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
          <div className="text-xs uppercase tracking-wider text-[#5277A8] mb-1 font-semibold">
            Active Exhibitions
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
            <div className="text-[#041128] text-base font-semibold">
              {isLive ? 'Live Realtime Standings' : 'Authoritative Database Sync'}
            </div>
            <div className="text-xs text-[#5277A8] mt-0.5">
              Instant ranking updates upon vote submission
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Department Filter Chips (Includes GPP) ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDept(null)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border',
            !activeDept
              ? 'bg-[#041128] text-white border-[#041128] shadow-xs'
              : 'bg-white/80 text-[#041128] border-[#D9E1EA] hover:bg-[rgba(145,169,201,0.18)]'
          )}
        >
          All Departments ({rows.length})
        </button>
        {departments.map((d) => {
          const deptMeta = getDepartmentMeta(d.code);
          const count = rows.filter((r) => r.department_uuid === d.id).length;

          return (
            <button
              key={d.id}
              onClick={() => setActiveDept(activeDept === d.id ? null : d.id)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5',
                activeDept === d.id
                  ? 'bg-[#041128] text-white border-[#041128] shadow-xs'
                  : 'bg-white/80 text-[#041128] border-[#D9E1EA] hover:bg-[rgba(145,169,201,0.18)]'
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: deptMeta.primary }}
              />
              <span>{d.code}</span>
              <span className="text-[10.5px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. VISUAL PODIUM: TOP 3 EXHIBITION LEADERS ── */}
      {sorted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-[1.5px] bg-[#5277A8]" />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
              OFFICIAL EXHIBITION PODIUM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            
            {/* #2 SILVER PODIUM (Left) */}
            {top2 ? (
              <PodiumCard
                rank={2}
                row={top2}
                tier="silver"
                className="md:translate-y-4"
              />
            ) : (
              <div className="hidden md:block" />
            )}

            {/* #1 GOLD PODIUM (Center — Elevated & Prominent) */}
            {top1 ? (
              <PodiumCard
                rank={1}
                row={top1}
                tier="gold"
                className="md:-translate-y-2 z-10"
              />
            ) : null}

            {/* #3 BRONZE PODIUM (Right) */}
            {top3 ? (
              <PodiumCard
                rank={3}
                row={top3}
                tier="bronze"
                className="md:translate-y-4"
              />
            ) : (
              <div className="hidden md:block" />
            )}

          </div>
        </div>
      )}

      {/* ── 4. POSITIONS 4 ONWARD: FULL LEADERBOARD TABLE ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[1.5px] bg-[#5277A8]" />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
              {sorted.length > 3 ? 'ALL EXHIBITION STANDINGS' : 'EXHIBITION STANDINGS'}
            </span>
          </div>
          <span className="text-xs text-[#848C9B] font-medium">
            Showing {sorted.length} project{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] p-16 text-center border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
            <p className="text-[#041128] text-lg font-semibold">No votes recorded yet.</p>
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
                    <th className="px-5 py-4 font-semibold">Project Title &amp; Tags</th>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold hidden md:table-cell">Team &amp; Advisor</th>
                    <th className="px-6 py-4 font-semibold text-right">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1EA]/60 text-sm">
                  <AnimatePresence initial={false}>
                    {sorted.map((row, i) => {
                      const rank = i + 1;
                      const isTop3 = rank <= 3;
                      const deptMeta = getDepartmentMeta(row.department_code);

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

                          {/* Title & Tags */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-[#041128] text-[15px]">
                              {row.title}
                            </div>
                            {row.tags && row.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {row.tags.slice(0, 3).map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Department */}
                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                'text-xs px-2.5 py-0.5 rounded-full border font-semibold',
                                deptMeta.badgeBg,
                                deptMeta.badgeText
                              )}
                              style={{ borderColor: deptMeta.border }}
                            >
                              {row.department_code}
                            </span>
                          </td>

                          {/* Team & Advisor */}
                          <td className="px-5 py-4 hidden md:table-cell text-[#41516B] text-xs">
                            <div>
                              <span className="text-[#848C9B] font-medium">Lead:</span> {row.project_lead}
                            </div>
                            {row.team_members && row.team_members.length > 0 && (
                              <div className="text-[11px] text-[#5277A8] truncate max-w-[170px] mt-0.5">
                                <span className="text-[#848C9B]">Team:</span> {row.team_members.join(', ')}
                              </div>
                            )}
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

// ─── PREMIUM PODIUM CARD COMPONENT ──────────────────────────────────────────
interface PodiumCardProps {
  rank: 1 | 2 | 3;
  row: ExtendedLeaderboardRow;
  tier: 'gold' | 'silver' | 'bronze';
  className?: string;
}

function PodiumCard({ rank, row, tier, className }: PodiumCardProps) {
  const deptMeta = getDepartmentMeta(row.department_code);
  const teamMembers = Array.isArray(row.team_members) ? row.team_members.filter(Boolean) : [];
  const tags = Array.isArray(row.tags) ? row.tags.filter(Boolean) : [];

  const tierStyles = {
    gold: {
      border: 'border-[#D4AF37]',
      shadow: 'shadow-[0_20px_60px_rgba(212,175,55,0.25),0_4px_20px_rgba(212,175,55,0.12)]',
      badgeBg: 'bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
      badgeText: 'text-[#3d2800]',
      badgeBorder: 'border-[#D4AF37]/60',
      label: '#1 GOLD LEADER',
      icon: Trophy,
      cardBg: 'bg-white/95',
      paddings: 'p-7 sm:p-8',
    },
    silver: {
      border: 'border-[#A8A9AD]',
      shadow: 'shadow-[0_14px_45px_rgba(168,169,173,0.22)]',
      badgeBg: 'bg-gradient-to-r from-[#C0C0C0] via-[#F0F0F0] to-[#A8A9AD]',
      badgeText: 'text-[#2a2a2a]',
      badgeBorder: 'border-[#B0B0B0]',
      label: '#2 SILVER PLACE',
      icon: Medal,
      cardBg: 'bg-white/90',
      paddings: 'p-6 sm:p-7',
    },
    bronze: {
      border: 'border-[#CD7F32]',
      shadow: 'shadow-[0_14px_45px_rgba(205,127,50,0.2)]',
      badgeBg: 'bg-gradient-to-r from-[#CD7F32] via-[#F4D0B5] to-[#A0522D]',
      badgeText: 'text-[#301600]',
      badgeBorder: 'border-[#CD7F32]/60',
      label: '#3 BRONZE PLACE',
      icon: Award,
      cardBg: 'bg-white/90',
      paddings: 'p-6 sm:p-7',
    },
  }[tier];

  const Icon = tierStyles.icon;

  return (
    <div
      className={cn(
        'relative rounded-[28px] backdrop-blur-[24px] border-2 transition-transform duration-300',
        tierStyles.cardBg,
        tierStyles.border,
        tierStyles.shadow,
        tierStyles.paddings,
        className
      )}
    >
      {/* Metallic Top Header Pill */}
      <div
        className={cn(
          'absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-md flex items-center gap-1.5 border whitespace-nowrap',
          tierStyles.badgeBg,
          tierStyles.badgeText,
          tierStyles.badgeBorder
        )}
      >
        <Icon size={14} className="shrink-0" />
        <span>{tierStyles.label}</span>
      </div>

      {/* Project Image */}
      <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#FAF9F5] mb-4 border border-[rgba(4,17,40,0.06)] shadow-xs mt-1">
        <ProjectImage
          src={row.image_url}
          alt={row.title}
          deptCode={row.department_code}
          deptName={row.department_name}
          projectId={row.project_id}
          sizes="400px"
          priority={rank === 1}
        />
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#041128]/85 text-white text-[11px] font-mono font-semibold">
          {row.project_id}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Department Badge */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs px-2.5 py-0.5 rounded-full border font-semibold',
              deptMeta.badgeBg,
              deptMeta.badgeText
            )}
            style={{ borderColor: deptMeta.border }}
          >
            {row.department_name} ({row.department_code})
          </span>

          {tags.length > 0 && (
            <span className="text-[10.5px] text-[#848C9B]">
              #{tags[0]}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl text-[#041128] font-semibold line-clamp-1 leading-tight">
          {row.title}
        </h3>

        {/* Lead & Team */}
        <div className="text-xs text-[#41516B] space-y-0.5 pt-1 border-t border-[rgba(4,17,40,0.06)]">
          <div className="truncate">
            <span className="text-[#848C9B] font-medium">Lead:</span>{' '}
            <span className="font-semibold text-[#041128]">{row.project_lead}</span>
          </div>

          {teamMembers.length > 0 && (
            <div className="text-[11px] text-[#5277A8] truncate">
              <span className="text-[#848C9B]">Team:</span> {teamMembers.join(' · ')}
            </div>
          )}
        </div>

        {/* Vote Count Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(4,17,40,0.08)]">
          <span className="text-xs font-semibold text-[#5277A8] uppercase tracking-wider">
            Verified Votes
          </span>
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#041128]">
              <AnimatedCount value={row.vote_count} />
            </span>
            <span className="text-xs font-semibold text-[#5277A8] ml-1.5">votes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
