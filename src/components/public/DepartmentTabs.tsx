'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import type { Department } from '@/types';

interface DepartmentTabsProps {
  departments: Department[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}

export function DepartmentTabs({ departments, activeId, onChange }: DepartmentTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter by department"
    >
      {/* All tab */}
      <button
        role="tab"
        aria-selected={activeId === null}
        onClick={() => onChange(null)}
        className={cn(
          'relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
          activeId === null
            ? 'text-[#040411] bg-[#91A9C9]'
            : 'text-[#848C9B] glass border border-white/10 hover:border-[#91A9C9]/30 hover:text-white'
        )}
      >
        All
      </button>

      {departments.map((dept) => {
        const isActive = activeId === dept.id;
        return (
          <button
            key={dept.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(isActive ? null : dept.id)}
            className={cn(
              'relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                ? 'text-[#040411] bg-[#91A9C9]'
                : 'text-[#848C9B] glass border border-white/10 hover:border-[#91A9C9]/30 hover:text-white'
            )}
          >
            {dept.code}
          </button>
        );
      })}
    </div>
  );
}
