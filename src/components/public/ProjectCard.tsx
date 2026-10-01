'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project & { department?: { name: string; code: string } };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link href={`/projects/${project.project_id}`}>
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'relative group rounded-2xl overflow-hidden cursor-pointer',
            'glass glass-hover',
            'transition-all duration-300',
            isHovered && 'shadow-xl shadow-[#91A9C9]/10 -translate-y-1'
          )}
        >
          {/* Spotlight effect */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
              style={{
                background: `radial-gradient(200px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(145,169,201,0.08), transparent 70%)`,
              }}
            />
          )}

          {/* Project image */}
          {project.image_url ? (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041128] via-[#041128]/20 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-48 bg-[#041128] flex items-center justify-center">
              <div className="text-[#91A9C9]/20 font-mono font-bold text-4xl">
                {project.project_id}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Project ID + Department */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#91A9C9] text-xs font-mono font-medium tracking-widest uppercase">
                {project.project_id}
              </span>
              {project.department && (
                <span className="text-xs text-[#848C9B] px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  {project.department.code}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-lg leading-snug mb-2 group-hover:text-[#91A9C9] transition-colors">
              {project.title}
            </h3>

            {/* Description */}
            {project.description && (
              <p className="text-[#848C9B] text-sm leading-relaxed line-clamp-2 mb-4">
                {project.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <User size={12} className="text-[#848C9B]" />
                <span className="text-[#848C9B] text-xs">{project.project_lead}</span>
              </div>
              <div className="flex items-center gap-1 text-[#91A9C9] text-xs font-medium">
                View
                <ArrowRight
                  size={12}
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
