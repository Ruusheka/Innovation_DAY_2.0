'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, User, Building2 } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project & { department?: { id: string; name: string; code: string } };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link href={`/projects/${project.project_id}`} className="block group">
        <div className="card-white rounded-[18px] overflow-hidden flex flex-col h-full bg-[#FFFFFF]">
          {/* Image Container (Dominant Visual) */}
          <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#EBF1F8]">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EBF1F8] to-[#DCE6F2] p-6 text-center">
                <span className="text-[#91A9C9] font-mono font-bold text-3xl tracking-wider">
                  {project.project_id}
                </span>
                <span className="text-xs text-[#848C9B] mt-1 font-medium">
                  {project.department?.name ?? 'SSN Engineering'}
                </span>
              </div>
            )}

            {/* Department Badge Top Right */}
            {project.department && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(4,17,40,0.08)] text-[11px] font-semibold text-[#041128] shadow-sm">
                {project.department.code}
              </div>
            )}

            {/* Project ID Top Left */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041128]/85 backdrop-blur-md text-[11px] font-mono font-semibold text-white shadow-sm">
              {project.project_id}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
            <div>
              {/* Title */}
              <h3 className="text-[#041128] font-semibold text-[19px] leading-snug group-hover:text-[#41516B] transition-colors line-clamp-2">
                {project.title}
              </h3>

              {/* Description */}
              {project.description && (
                <p className="mt-2 text-sm text-[#848C9B] line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Footer / Meta */}
            <div className="mt-6 pt-4 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#848C9B]">
                <User size={13} className="text-[#91A9C9]" />
                <span className="truncate max-w-[130px] sm:max-w-[160px] font-medium text-[#41516B]">
                  {project.project_lead}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 font-semibold text-[#041128] group-hover:text-[#41516B] transition-colors">
                <span>View</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
