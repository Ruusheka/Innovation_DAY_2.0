'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';
import { DepartmentTabs } from './DepartmentTabs';
import { Search } from 'lucide-react';
import type { Department, Project } from '@/types';

interface ProjectGridProps {
  projects: (Project & { department?: { id: string; name: string; code: string; color?: string | null; accent_color?: string | null } })[];
  departments: Department[];
  showFiltersOnly?: boolean;
}

export function ProjectGrid({ projects, departments }: ProjectGridProps) {
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchDept = !activeDeptId || p.department_id === activeDeptId;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.project_id.toLowerCase().includes(q) ||
        p.project_lead.toLowerCase().includes(q) ||
        (p.project_supervisor && p.project_supervisor.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
        (p.team_members && p.team_members.some((m) => m.toLowerCase().includes(q))) ||
        (p.department?.name && p.department.name.toLowerCase().includes(q)) ||
        (p.department?.code && p.department.code.toLowerCase().includes(q));
      return matchDept && matchSearch;
    });
  }, [projects, activeDeptId, search]);

  const activeDeptObj = departments.find((d) => d.id === activeDeptId);

  return (
    <div className="w-full font-primary">
      {/* ── 1. DEPARTMENT FILTER ROW ── */}
      <div id="departments" className="mb-8 sm:mb-10">
        <DepartmentTabs
          departments={departments}
          activeId={activeDeptId}
          onChange={setActiveDeptId}
        />
      </div>

      {/* ── 2. SEARCH & COUNT BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
        <div className="text-[14.5px] font-medium text-[#41516B]">
          Showing <span className="text-[#041128] font-bold">{filtered.length}</span> project
          {filtered.length !== 1 ? 's' : ''}
          {activeDeptObj ? ` in ${activeDeptObj.name}` : ' across all departments'}
        </div>

        {/* Search input with clean rounded styling */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#848C9B]" />
          <input
            type="text"
            placeholder="Search projects, leads, tags, advisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full bg-white border border-[#D9E1EA] text-[#041128] placeholder-[#848C9B] focus:outline-none focus:border-[#041128] focus:ring-2 focus:ring-[#5277A8]/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ── 3. 3-COLUMN PROJECTS GRID ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-16 sm:py-20 text-center rounded-[24px] bg-white border border-[#DDE5EE] shadow-sm"
          >
            <p className="text-2xl text-[#041128] font-semibold">No Projects Found</p>
            <p className="text-[#848C9B] text-sm mt-2 max-w-sm mx-auto font-normal">
              {search
                ? 'No projects match your search criteria. Try searching with different keywords, team names, or tags.'
                : 'No active projects are registered under this department yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeDeptId ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
