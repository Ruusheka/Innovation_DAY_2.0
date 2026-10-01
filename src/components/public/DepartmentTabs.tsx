'use client';

import { Cpu, Radio, Zap, Cog, Building2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Department } from '@/types';

interface DepartmentTabsProps {
  departments: Department[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}

// Exactly 5 valid engineering departments
const VALID_DEPT_CODES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

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
    default:
      return Layers;
  }
}

export function DepartmentTabs({ departments, activeId, onChange }: DepartmentTabsProps) {
  // Filter out any invalid departments (e.g. IT if not wanted) and preserve clean order
  const validDepartments = departments.filter((d) =>
    VALID_DEPT_CODES.includes(d.code.toUpperCase())
  );

  return (
    <div className="w-full">
      {/* 
        ONE ROW DESKTOP GRID:
        1 "ALL" card + 5 Department cards = 6 columns (lg:grid-cols-6).
        Equal width, equal height (70px), zero awkward wrapping.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* ALL Card */}
        <button
          onClick={() => onChange(null)}
          className={cn(
            'group relative h-[70px] px-3.5 rounded-[16px] border flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer font-sans text-left',
            activeId === null
              ? 'bg-[#EDF4FC] border-[#91A9C9] shadow-sm'
              : 'bg-white border-[#DDE5EE] hover:bg-[#F3F7FB] hover:border-[#91A9C9]/60 hover:-translate-y-0.5'
          )}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
              activeId === null
                ? 'bg-[#041128] text-white'
                : 'bg-[#EDF4FC] text-[#041128] group-hover:bg-[#041128] group-hover:text-white'
            )}
          >
            <Layers size={17} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[13.5px] font-semibold text-[#041128]">ALL</div>
            <div className="text-[11px] text-[#848C9B] truncate">Overview</div>
          </div>
        </button>

        {/* 5 Department Cards */}
        {validDepartments.map((dept) => {
          const Icon = getDeptIcon(dept.code);
          const isActive = activeId === dept.id;

          return (
            <button
              key={dept.id}
              onClick={() => onChange(isActive ? null : dept.id)}
              className={cn(
                'group relative h-[70px] px-3.5 rounded-[16px] border flex items-center justify-start gap-3 transition-all duration-200 cursor-pointer font-sans text-left',
                isActive
                  ? 'bg-[#EDF4FC] border-[#91A9C9] shadow-sm'
                  : 'bg-white border-[#DDE5EE] hover:bg-[#F3F7FB] hover:border-[#91A9C9]/60 hover:-translate-y-0.5'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
                  isActive
                    ? 'bg-[#041128] text-white'
                    : 'bg-[#EDF4FC] text-[#041128] group-hover:bg-[#041128] group-hover:text-white'
                )}
              >
                <Icon size={17} />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[13.5px] font-semibold text-[#041128] tracking-wide">
                  {dept.code}
                </div>
                <div className="text-[11px] text-[#848C9B] truncate max-w-[85px]">
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
