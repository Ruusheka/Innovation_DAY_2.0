'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Activity, Filter, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardRow, Department } from '@/types';

interface LeaderboardTableProps {
  initialData: LeaderboardRow[];
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
      className="tabular-nums"
    >
      {displayed.toLocaleString()}
    </motion.span>
  );
}

const RANK_BADGES: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', text: '#1' },
  2: { bg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold', text: '#2' },
  3: { bg: 'bg-orange-50 text-orange-800 border-orange-200 font-semibold', text: '#3' },
};

export function LeaderboardTable({
  initialData,
  totalVotes: initialTotal,
  departments,
}: LeaderboardTableProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leaderboard');
      if (!res.ok) return;
      const json = await res.json();
      setRows(json.data ?? []);
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

  // Group by department
  const byDept = filtered.reduce<Record<string, LeaderboardRow[]>>((acc, row) => {
    const key = row.department_code;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* ── Top Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-[20px] p-6 border border-[rgba(4,17,40,0.08)] shadow-[0_4px_20px_rgba(4,17,40,0.03)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#848C9B] mb-1">
            Total Votes Cast
          </div>
          <div className="text-[#041128] text-4xl font-bold tracking-tight">
            <AnimatedCount value={total} />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[rgba(4,17,40,0.08)] shadow-[0_4px_20px_rgba(4,17,40,0.03)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#848C9B] mb-1">
            Exhibition Projects
          </div>
          <div className="text-[#041128] text-4xl font-bold tracking-tight">
            {rows.length}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[rgba(4,17,40,0.08)] shadow-[0_4px_20px_rgba(4,17,40,0.03)] flex items-center gap-4">
          <div
            className={cn(
              'w-3.5 h-3.5 rounded-full shrink-0',
              isLive ? 'bg-green-500 animate-pulse' : 'bg-[#91A9C9]'
            )}
          />
          <div>
            <div className="text-[#041128] font-bold text-base">
              {isLive ? 'Live Realtime Active' : 'Connecting Realtime...'}
            </div>
            <div className="text-xs text-[#848C9B] mt-0.5">
              Live updates as votes are submitted
            </div>
          </div>
        </div>
      </div>

      {/* ── Department Filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDept(null)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border',
            !activeDept
              ? 'bg-[#041128] text-white border-[#041128]'
              : 'bg-white text-[#41516B] border-[rgba(4,17,40,0.12)] hover:bg-[#EBF1F8]'
          )}
        >
          All Departments
        </button>
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDept(activeDept === d.id ? null : d.id)}
            className={cn(
              'px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border',
              activeDept === d.id
                ? 'bg-[#041128] text-white border-[#041128]'
                : 'bg-white text-[#41516B] border-[rgba(4,17,40,0.12)] hover:bg-[#EBF1F8]'
            )}
          >
            {d.code}
          </button>
        ))}
      </div>

      {/* ── Leaderboard Tables Grouped by Department ── */}
      {Object.keys(byDept).length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center border border-[rgba(4,17,40,0.08)]">
          <p className="text-[#041128] font-semibold text-lg">No votes recorded yet.</p>
          <p className="text-sm text-[#848C9B] mt-1">
            As registration operators record votes, rankings will appear live.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDept).map(([deptCode, deptRows]) => {
            const sortedRows = [...deptRows].sort((a, b) => b.vote_count - a.vote_count);
            const deptTotal = sortedRows.reduce((acc, r) => acc + r.vote_count, 0);

            return (
              <div
                key={deptCode}
                className="bg-white rounded-[22px] border border-[rgba(4,17,40,0.08)] overflow-hidden shadow-[0_4px_20px_rgba(4,17,40,0.02)]"
              >
                {/* Dept header bar */}
                <div className="px-6 sm:px-8 py-4.5 bg-[#FAF9F5] border-b border-[rgba(4,17,40,0.06)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-[#041128]">
                      {sortedRows[0]?.department_name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFF7] text-[#041128] text-xs font-mono font-semibold">
                      {deptCode}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#41516B]">
                    {deptTotal} total vote{deptTotal !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[rgba(4,17,40,0.06)] bg-white text-xs uppercase tracking-wider text-[#848C9B]">
                        <th className="px-6 sm:px-8 py-3.5 font-semibold">Rank</th>
                        <th className="px-4 py-3.5 font-semibold">Project ID</th>
                        <th className="px-4 py-3.5 font-semibold">Project Title</th>
                        <th className="px-4 py-3.5 font-semibold hidden md:table-cell">Project Lead</th>
                        <th className="px-6 sm:px-8 py-3.5 font-semibold text-right">Votes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(4,17,40,0.04)] text-sm">
                      <AnimatePresence initial={false}>
                        {sortedRows.map((row, i) => {
                          const rank = i + 1;
                          const badge = RANK_BADGES[rank];

                          return (
                            <motion.tr
                              key={row.project_uuid}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-[#FAF9F5] transition-colors"
                            >
                              {/* Rank */}
                              <td className="px-6 sm:px-8 py-4">
                                {badge ? (
                                  <span className={cn('px-2.5 py-1 rounded-full text-xs border', badge.bg)}>
                                    {badge.text}
                                  </span>
                                ) : (
                                  <span className="text-[#848C9B] font-medium text-xs pl-2">
                                    #{rank}
                                  </span>
                                )}
                              </td>

                              {/* Project ID */}
                              <td className="px-4 py-4">
                                <span className="font-mono font-semibold text-[#041128] text-xs px-2 py-1 rounded bg-[#FAF9F5] border border-[rgba(4,17,40,0.08)]">
                                  {row.project_id}
                                </span>
                              </td>

                              {/* Project Title */}
                              <td className="px-4 py-4">
                                <span className="font-semibold text-[#041128]">
                                  {row.title}
                                </span>
                              </td>

                              {/* Project Lead */}
                              <td className="px-4 py-4 hidden md:table-cell text-[#41516B]">
                                {row.project_lead}
                              </td>

                              {/* Votes */}
                              <td className="px-6 sm:px-8 py-4 text-right">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
