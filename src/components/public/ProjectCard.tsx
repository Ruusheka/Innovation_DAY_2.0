'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project & { department?: { id: string; name: string; code: string } };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06, ease: 'easeOut' }}
    >
      <Link href={`/projects/${project.project_id}`} className="block group">
        <div className="card-white rounded-[20px] overflow-hidden flex flex-col h-full bg-[#FFFFFF]">
          {/* Image Container (Dominant Visual, Aspect Ratio 16:10) */}
          <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#EDF4FC]">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              /* High-Quality Build Club Engineering Fallback */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF4FC] via-[#F5F8FC] to-[#DDE7F3] p-6 text-center relative overflow-hidden">
                {/* Subtle technical background grid */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#5277A8 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[#5277A8] font-mono font-bold text-2xl tracking-wider">
                    {project.project_id}
                  </span>
                  <span className="text-[11.5px] text-[#848C9B] font-sans font-medium mt-1">
                    {project.department?.name ?? 'SSN Engineering'}
                  </span>
                </div>
              </div>
            )}

            {/* Department Badge Top Right */}
            {project.department && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[rgba(4,17,40,0.08)] text-[11px] font-sans font-bold text-[#041128] shadow-sm">
                {project.department.code}
              </div>
            )}

            {/* Project ID Top Left */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041128]/88 backdrop-blur-md text-[11px] font-mono font-semibold text-white shadow-sm">
              {project.project_id}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
            <div>
              {/* Title */}
              <h3 className="text-[#041128] font-sans font-semibold text-[19px] sm:text-[20px] leading-snug group-hover:text-[#5277A8] transition-colors line-clamp-2">
                {project.title}
              </h3>

              {/* Description */}
              {project.description && (
                <p className="mt-2 text-[13.5px] font-sans text-[#848C9B] line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Footer / Meta */}
            <div className="mt-6 pt-4 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 text-[#848C9B]">
                <User size={13} className="text-[#5277A8]" />
                <span className="truncate max-w-[130px] sm:max-w-[170px] font-medium text-[#41516B]">
                  {project.project_lead}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 font-semibold text-[#041128] group-hover:text-[#5277A8] transition-colors">
                <span>View</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-250 ease-out group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
