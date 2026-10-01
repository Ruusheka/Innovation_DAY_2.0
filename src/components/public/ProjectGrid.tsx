'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';
import { DepartmentTabs } from './DepartmentTabs';
import { Search } from 'lucide-react';
import type { Department, Project } from '@/types';

interface ProjectGridProps {
  projects: (Project & { department?: { id: string; name: string; code: string } })[];
  departments: Department[];
  showFiltersOnly?: boolean;
}

export function ProjectGrid({ projects, departments }: ProjectGridProps) {
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchDept = !activeDeptId || p.department_id === activeDeptId;
      const matchSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.project_id.toLowerCase().includes(search.toLowerCase()) ||
        p.project_lead.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [projects, activeDeptId, search]);

  const activeDeptObj = departments.find((d) => d.id === activeDeptId);

  return (
    <div className="w-full">
      {/* ── DEPARTMENT SELECTION SECTION ── */}
      <div id="departments" className="mb-10">
        <DepartmentTabs
          departments={departments}
          activeId={activeDeptId}
          onChange={setActiveDeptId}
        />
      </div>

      {/* ── SEARCH & COUNT BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
        <div className="text-sm font-medium text-[#41516B]">
          Showing <span className="text-[#041128] font-semibold">{filtered.length}</span> project
          {filtered.length !== 1 ? 's' : ''}
          {activeDeptObj ? ` in ${activeDeptObj.name}` : ' across all departments'}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#848C9B]" />
          <input
            type="text"
            placeholder="Search projects or leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-white border border-[rgba(4,17,40,0.12)] text-[#041128] placeholder-[#848C9B] focus:outline-none focus:border-[#041128] transition-colors"
          />
        </div>
      </div>

      {/* ── PROJECTS GRID ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center rounded-[20px] bg-white border border-[rgba(4,17,40,0.06)]"
          >
            <p className="text-[#041128] font-semibold text-lg">No projects found</p>
            <p className="text-[#848C9B] text-sm mt-1">
              {search ? 'Try adjusting your search keywords.' : 'No projects are registered under this department yet.'}
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
