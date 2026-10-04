'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, User, Users, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project & {
    department?: { id: string; name: string; code: string; color?: string | null; accent_color?: string | null };
  };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const deptCode = project.department?.code || (project as any).departments?.code;
  const deptMeta = getDepartmentMeta(deptCode);

  const teamMembers = Array.isArray(project.team_members) ? project.team_members.filter(Boolean) : [];
  const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
  const supervisor = project.project_supervisor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06, ease: 'easeOut' }}
      className="h-full font-primary"
    >
      <div className="card-white rounded-[24px] overflow-hidden flex flex-col h-full bg-[#FFFFFF] border border-[#DDE5EE] shadow-[0_10px_35px_rgba(4,17,40,0.06)] hover:shadow-[0_18px_50px_rgba(4,17,40,0.12)] transition-all duration-300 group">
        {/* Top Department Accent Line */}
        <div
          className="w-full h-1"
          style={{
            background: `linear-gradient(90deg, ${deptMeta.primary}, ${deptMeta.secondary})`,
          }}
        />

        {/* Image Container (Aspect Ratio 16:10) */}
        <Link href={`/projects/${project.project_id}`} className="block relative w-full aspect-[16/10] overflow-hidden bg-[#EDF4FC]">
          <ProjectImage
            src={project.image_url}
            alt={project.title}
            deptCode={deptCode}
            deptName={project.department?.name}
            projectId={project.project_id}
            imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Department Badge Top Right */}
          {deptCode && (
            <div
              className={cn(
                'absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md border text-[11px] font-bold shadow-sm',
                deptMeta.badgeBg,
                deptMeta.badgeText
              )}
              style={{ borderColor: deptMeta.border }}
            >
              {deptCode}
            </div>
          )}

          {/* Project ID Top Left */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041128]/90 backdrop-blur-md text-[11px] font-mono font-semibold text-white shadow-sm">
            {project.project_id}
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-3">
            {/* Tags (if available) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10.5px] px-2.5 py-0.5 rounded-full font-medium bg-[#EDF4FC] text-[#041128] border border-[#91A9C9]/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <Link href={`/projects/${project.project_id}`} className="block">
              <h3 className="text-[#041128] font-semibold text-[18px] sm:text-[19px] leading-snug group-hover:text-[#5277A8] transition-colors line-clamp-2">
                {project.title}
              </h3>
            </Link>

            {/* Description */}
            {project.description && (
              <p className="text-[13px] text-[#41516B] line-clamp-2 leading-relaxed font-normal">
                {project.description}
              </p>
            )}

            {/* ── Team & Supervisor Section ── */}
            <div className="pt-2 border-t border-[rgba(4,17,40,0.06)] space-y-1.5 text-xs">
              {/* Lead */}
              <div className="flex items-center gap-2 text-[#41516B]">
                <User size={13} className="text-[#5277A8] shrink-0" />
                <span className="text-[#848C9B] font-medium">Lead:</span>
                <span className="font-semibold text-[#041128] truncate">{project.project_lead}</span>
              </div>

              {/* Team Members */}
              {teamMembers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[#41516B]">
                    <div className="flex items-center gap-2 truncate">
                      <Users size={13} className="text-[#5277A8] shrink-0" />
                      <span className="text-[#848C9B] font-medium">Team:</span>
                      <span className="text-[#041128] truncate">
                        {expanded ? teamMembers.join(' · ') : teamMembers.slice(0, 2).join(' · ')}
                        {!expanded && teamMembers.length > 2 && ` +${teamMembers.length - 2} more`}
                      </span>
                    </div>
                    {teamMembers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="text-[#5277A8] hover:text-[#041128] text-[11px] font-semibold flex items-center shrink-0 ml-1 cursor-pointer"
                      >
                        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Advisor / Supervisor */}
              {supervisor && (
                <div className="flex items-center gap-2 text-[#41516B]">
                  <GraduationCap size={13} className="text-[#059669] shrink-0" />
                  <span className="text-[#848C9B] font-medium">Advisor:</span>
                  <span className="text-[#041128] truncate font-medium">{supervisor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer / Meta Action */}
          <div className="pt-3 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs">
            <span className="text-[11.5px] font-mono text-[#848C9B]">
              {deptCode}
            </span>

            <Link
              href={`/projects/${project.project_id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#041128] group-hover:text-[#5277A8] transition-colors"
            >
              <span>View Project</span>
              <ArrowRight
                size={13}
                className="transition-transform duration-250 ease-out group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
