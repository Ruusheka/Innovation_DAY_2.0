'use client';

import { Cpu, Radio, Zap, Cog, Building2, Layers, Monitor, GraduationCap, FlaskConical, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Department } from '@/types';

interface DepartmentTabsProps {
  departments: Department[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}

function getDeptIcon(code: string) {
  const upper = code.toUpperCase().replace(/[\s.]/g, '');
  switch (upper) {
    case 'CSE':
      return Cpu;
    case 'IT':
      return Monitor;
    case 'MTECHCSE':
    case 'MTECH':
      return GraduationCap;
    case 'ECE':
      return Radio;
    case 'EEE':
      return Zap;
    case 'MECH':
      return Cog;
    case 'CIVIL':
      return Building2;
    case 'CHEM':
      return FlaskConical;
    case 'BME':
      return HeartPulse;
    default:
      return Layers;
  }
}

export function DepartmentTabs({ departments, activeId, onChange }: DepartmentTabsProps) {
  // Show all active departments from DB — no hardcoded filter
  const sortedDepartments = [...departments].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  return (
    <div className="w-full">
      {/*
        Responsive grid: 2 cols on mobile, 3 on sm, 5 on md, up to 10 on xl
        (1 "ALL" card + up to 9 department cards)
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-4">
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

        {/* All Department Cards from DB */}
        {sortedDepartments.map((dept) => {
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
