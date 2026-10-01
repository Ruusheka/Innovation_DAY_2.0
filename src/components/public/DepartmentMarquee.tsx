'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';

interface DepartmentMarqueeProps {
  projects: Array<Project & { department?: Department }>;
  departments: Department[];
}

const ORDERED_DEPT_CODES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

const DEPT_FULL_NAMES: Record<string, string> = {
  CSE: 'Computer Science & Engineering',
  ECE: 'Electronics & Communication Engineering',
  EEE: 'Electrical & Electronics Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  IT: 'Information Technology',
};

export function DepartmentMarquee({ projects, departments }: DepartmentMarqueeProps) {
  // Map departments by uppercase code
  const deptMap = new Map<string, Department>();
  departments.forEach((d) => deptMap.set(d.code.toUpperCase(), d));

  // Also include any departments present in database that match ORDERED_DEPT_CODES
  const activeCodes = ORDERED_DEPT_CODES.filter((code) => {
    return deptMap.has(code) || projects.some((p) => p.department?.code?.toUpperCase() === code);
  });

  // Fallback: if no active codes match, use all departments from db
  const displayCodes = activeCodes.length > 0 ? activeCodes : departments.map((d) => d.code.toUpperCase());

  return (
    <div className="space-y-16 sm:space-y-20">
      {displayCodes.map((deptCode, rowIndex) => {
        const deptObj = deptMap.get(deptCode);
        const deptName = deptObj?.name || DEPT_FULL_NAMES[deptCode] || deptCode;
        
        // Filter projects for this department
        const deptProjects = projects.filter(
          (p) =>
            p.department?.code?.toUpperCase() === deptCode ||
            p.department_id === deptObj?.id
        );

        // Alternating direction: even rows LTR, odd rows RTL
        const isLtr = rowIndex % 2 === 0;
        const animationClass = isLtr ? 'animate-marquee-ltr' : 'animate-marquee-rtl';

        // Prepare seamless repeating array for marquee
        // Ensure at least 6-8 items for smooth infinite loop
        let marqueeItems: Project[] = [];
        if (deptProjects.length > 0) {
          const repeatCount = Math.max(2, Math.ceil(8 / deptProjects.length));
          for (let r = 0; r < repeatCount; r++) {
            marqueeItems = marqueeItems.concat(deptProjects);
          }
        }

        return (
          <div key={deptCode} className="relative">
            {/* Department Section Header */}
            <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-[#041128] text-white text-xs font-mono font-bold tracking-wider">
                  {deptCode}
                </span>
                <div>
                  <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#041128] tracking-tight">
                    {deptName}
                  </h3>
                  <p className="text-xs font-sans text-[#5277A8] font-medium tracking-wide">
                    {deptProjects.length} {deptProjects.length === 1 ? 'Project Exhibition Entry' : 'Project Exhibition Entries'}
                  </p>
                </div>
              </div>

              {deptProjects.length > 0 && (
                <Link
                  href={`/projects?dept=${deptCode}`}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#5277A8] hover:text-[#041128] transition-colors"
                >
                  <span>Explore all {deptCode} projects</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {/* Infinite Horizontal Track Container */}
            <div className="group relative w-full overflow-hidden py-3">
              {/* Soft Gradient Masks on edges for seamless fade-in/out */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAF9F5] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAF9F5] to-transparent z-10" />

              {marqueeItems.length > 0 ? (
                /* Infinite animated track (Hovering pauses entire track) */
                <div className={cn(animationClass, 'group-hover:[animation-play-state:paused] flex items-center')}>
                  {marqueeItems.map((project, idx) => (
                    <ProjectMarqueeCard
                      key={`${project.id}-${idx}`}
                      project={project}
                      deptCode={deptCode}
                    />
                  ))}
                </div>
              ) : (
                /* Fallback when no projects exist in department yet */
                <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
                  <div className="rounded-2xl border border-dashed border-[#D9E1EA] bg-white/60 p-8 sm:p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-3">
                      <Layers size={20} />
                    </div>
                    <div className="text-sm font-sans font-bold text-[#041128]">
                      {deptCode} Exhibition Submissions In Review
                    </div>
                    <p className="text-xs text-[#41516B] max-w-md mt-1">
                      Student teams from {deptName} are currently staging their prototypes. Check back shortly for active entries.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── INDIVIDUAL MARQUEE CARD ──
// Scales smoothly to 1.06 on hover, elevates shadow, and reveals view project action
function ProjectMarqueeCard({
  project,
  deptCode,
}: {
  project: Project & { department?: Department };
  deptCode: string;
}) {
  return (
    <Link
      href={`/projects/${project.project_id}`}
      className="group/card block w-[310px] sm:w-[350px] md:w-[370px] shrink-0 mx-3 sm:mx-4 focus:outline-none select-none"
    >
      <div
        className={cn(
          'relative rounded-[22px] bg-white/90 backdrop-blur-md border border-[#D9E1EA] p-4 sm:p-5',
          'shadow-[0_4px_18px_rgba(4,17,40,0.04)] hover:shadow-[0_20px_44px_rgba(4,17,40,0.13)]',
          'hover:border-[#91A9C9] hover:bg-white',
          'transition-all duration-300 ease-out transform',
          'hover:scale-[1.05] sm:hover:scale-[1.06] hover:-translate-y-1'
        )}
      >
        {/* Project Thumbnail Image with Zoom Effect */}
        <div className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-[#FAF9F5] mb-4 border border-[rgba(4,17,40,0.06)]">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 310px, 370px"
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-108"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF4FC] to-[#FAF9F5] p-4 text-center">
              <Sparkles size={24} className="text-[#91A9C9] mb-2" />
              <span className="text-[11px] font-mono font-bold text-[#5277A8] uppercase tracking-wider">
                {deptCode} Prototype
              </span>
            </div>
          )}

          {/* Floating Department / Project ID Badge */}
          <div className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-[#041128]/85 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider shadow-sm">
            {project.project_id}
          </div>
        </div>

        {/* Project Card Content */}
        <div className="space-y-2">
          {/* Title */}
          <h4 className="font-sans font-bold text-[16px] sm:text-[17px] text-[#041128] leading-snug line-clamp-1 group-hover/card:text-[#0b1e42] transition-colors">
            {project.title}
          </h4>

          {/* Description (Truncated) */}
          <p className="font-sans text-xs text-[#41516B] line-clamp-2 leading-relaxed h-[36px]">
            {project.description || 'Student engineering innovation prototype developed for the SSN I FOUND project exhibition.'}
          </p>

          {/* Footer Metadata & CTA */}
          <div className="pt-3 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#5277A8] font-sans font-medium truncate max-w-[190px]">
              <User size={13} className="shrink-0" />
              <span className="truncate">{project.project_lead}</span>
            </div>

            <div className="inline-flex items-center gap-1 font-sans font-semibold text-[#041128] group-hover/card:text-[#5277A8] transition-colors shrink-0">
              <span>View</span>
              <ArrowRight size={13} className="transition-transform duration-200 group-hover/card:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
