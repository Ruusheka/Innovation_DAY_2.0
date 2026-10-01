'use client';

import { motion } from 'motion/react';
import { Cpu, Radio, Zap, Cog, Building2, Laptop, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Department } from '@/types';

interface DepartmentTabsProps {
  departments: Department[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}

// Icon mapping per department code
function getDeptIcon(code: string) {
  const upper = code.toUpperCase();
  switch (upper) {
    case 'CSE':
      return Cpu;
    case 'ECE':
      return Radio;
    case 'EEE':
      return Zap;
    case 'MECH':
      return Cog;
    case 'CIVIL':
      return Building2;
    case 'IT':
      return Laptop;
    default:
      return Layers;
  }
}

export function DepartmentTabs({ departments, activeId, onChange }: DepartmentTabsProps) {
  return (
    <div className="w-full">
      {/* 5-6 Large horizontal rectangular department cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* All Departments Button */}
        <button
          onClick={() => onChange(null)}
          className={cn(
            'group relative h-[68px] px-4 rounded-[16px] border flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer text-left',
            activeId === null
              ? 'bg-[#E8EFF7] border-[#91A9C9] shadow-sm'
              : 'bg-[#FFFFFF] border-[rgba(4,17,40,0.1)] hover:bg-[#F3F7FB] hover:border-[#91A9C9]/50'
          )}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
              activeId === null
                ? 'bg-[#041128] text-white'
                : 'bg-[#EBF1F8] text-[#041128] group-hover:bg-[#041128] group-hover:text-white'
            )}
          >
            <Layers size={18} />
          </div>
          <div className="leading-tight">
            <div className={cn('text-sm font-semibold', activeId === null ? 'text-[#041128]' : 'text-[#041128]')}>
              ALL
            </div>
            <div className="text-[11px] text-[#848C9B] hidden sm:block">Overview</div>
          </div>
        </button>

        {/* Individual Department Cards */}
        {departments.map((dept) => {
          const Icon = getDeptIcon(dept.code);
          const isActive = activeId === dept.id;

          return (
            <button
              key={dept.id}
              onClick={() => onChange(isActive ? null : dept.id)}
              className={cn(
                'group relative h-[68px] px-4 rounded-[16px] border flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer text-left',
                isActive
                  ? 'bg-[#E8EFF7] border-[#91A9C9] shadow-sm'
                  : 'bg-[#FFFFFF] border-[rgba(4,17,40,0.1)] hover:bg-[#F3F7FB] hover:border-[#91A9C9]/50'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
                  isActive
                    ? 'bg-[#041128] text-white'
                    : 'bg-[#EBF1F8] text-[#041128] group-hover:bg-[#041128] group-hover:text-white'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-[#041128] tracking-wide">
                  {dept.code}
                </div>
                <div className="text-[11px] text-[#848C9B] hidden sm:block truncate max-w-[80px]">
                  {dept.name.split(' ')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
