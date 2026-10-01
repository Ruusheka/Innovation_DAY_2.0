'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Filter } from 'lucide-react';
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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="tabular-nums"
    >
      {displayed.toLocaleString()}
    </motion.span>
  );
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-400 font-bold',
  2: 'text-slate-300 font-semibold',
  3: 'text-amber-700 font-semibold',
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
      // silent — realtime will retry
    }
  }, []);

  // Supabase Realtime subscription on votes table
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('votes-changes')
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
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 border border-white/10">
          <div className="text-[#848C9B] text-xs uppercase tracking-widest mb-1">Total Votes</div>
          <div className="text-white text-3xl font-bold">
            <AnimatedCount value={total} />
          </div>
        </div>
        <div className="glass rounded-xl p-5 border border-white/10">
          <div className="text-[#848C9B] text-xs uppercase tracking-widest mb-1">Projects</div>
          <div className="text-white text-3xl font-bold">{rows.length}</div>
        </div>
        <div className="glass rounded-xl p-5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              isLive ? 'bg-green-400 animate-pulse' : 'bg-[#848C9B]'
            )}
          />
          <div>
            <div className="text-white text-sm font-medium">{isLive ? 'Live' : 'Connecting...'}</div>
            <div className="text-[#848C9B] text-xs">Real-time updates</div>
          </div>
        </div>
      </div>

      {/* Department filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveDept(null)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            !activeDept
              ? 'bg-[#91A9C9] text-[#040411]'
              : 'text-[#848C9B] glass border border-white/10 hover:border-[#91A9C9]/30'
          )}
        >
          All
        </button>
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDept(activeDept === d.id ? null : d.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              activeDept === d.id
                ? 'bg-[#91A9C9] text-[#040411]'
                : 'text-[#848C9B] glass border border-white/10 hover:border-[#91A9C9]/30'
            )}
          >
            {d.code}
          </button>
        ))}
      </div>

      {/* Leaderboard by department */}
      {Object.keys(byDept).length === 0 ? (
        <div className="py-20 text-center text-[#848C9B]">
          No votes have been recorded yet.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDept).map(([deptCode, deptRows]) => {
            const sortedRows = [...deptRows].sort((a, b) => b.vote_count - a.vote_count);
            return (
              <div key={deptCode} className="glass rounded-2xl border border-white/10 overflow-hidden">
                {/* Dept header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">
                    {sortedRows[0]?.department_name}
                    <span className="ml-2 text-[#91A9C9] font-mono text-xs">({deptCode})</span>
                  </h3>
                  <span className="text-[#848C9B] text-xs">
                    {sortedRows.reduce((s, r) => s + r.vote_count, 0)} votes
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-3 text-left text-[#848C9B] text-xs uppercase tracking-widest font-medium">Rank</th>
                        <th className="px-4 py-3 text-left text-[#848C9B] text-xs uppercase tracking-widest font-medium">ID</th>
                        <th className="px-4 py-3 text-left text-[#848C9B] text-xs uppercase tracking-widest font-medium">Project</th>
                        <th className="px-4 py-3 text-left text-[#848C9B] text-xs uppercase tracking-widest font-medium hidden sm:table-cell">Lead</th>
                        <th className="px-6 py-3 text-right text-[#848C9B] text-xs uppercase tracking-widest font-medium">Votes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {sortedRows.map((row, i) => {
                          const rank = i + 1;
                          return (
                            <motion.tr
                              key={row.project_uuid}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className={cn('text-sm', RANK_STYLES[rank] ?? 'text-[#848C9B]')}>
                                  #{rank}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-[#91A9C9] font-mono text-xs">{row.project_id}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-white text-sm">{row.title}</span>
                              </td>
                              <td className="px-4 py-4 hidden sm:table-cell">
                                <span className="text-[#848C9B] text-sm">{row.project_lead}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-white font-bold text-lg">
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
