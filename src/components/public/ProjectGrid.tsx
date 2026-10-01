'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ProjectCard } from './ProjectCard';
import { DepartmentTabs } from './DepartmentTabs';
import type { Department, Project } from '@/types';

interface ProjectGridProps {
  projects: (Project & { department?: { id: string; name: string; code: string } })[];
  departments: Department[];
}

export function ProjectGrid({ projects, departments }: ProjectGridProps) {
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeDeptId) return projects;
    return projects.filter((p) => p.department_id === activeDeptId);
  }, [projects, activeDeptId]);

  return (
    <div>
      {/* Department filter */}
      <div className="mb-10">
        <DepartmentTabs
          departments={departments}
          activeId={activeDeptId}
          onChange={setActiveDeptId}
        />
      </div>

      {/* Projects count */}
      <div className="mb-6 text-[#848C9B] text-sm">
        {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        {activeDeptId &&
          departments.find((d) => d.id === activeDeptId)
            ? ` in ${departments.find((d) => d.id === activeDeptId)!.name}`
            : ''}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-[#848C9B] text-lg">No projects available yet.</p>
            <p className="text-[#848C9B]/50 text-sm mt-2">Check back soon.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeDeptId ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
