'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { Project, Department } from '@/types';

interface FeaturedSectionProps {
  projects: (Project & { department?: Department })[];
}

export function FeaturedSection({ projects }: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 380;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-[1.5px] bg-[#91A9C9]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                FEATURED PROJECTS
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#041128] tracking-tight leading-tight">
              Innovation in Action
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#041128] hover:text-[#41516B] transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight size={15} />
            </Link>

            {/* Circular Carousel Arrow Controls */}
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.15)] bg-white hover:bg-[#EBF1F8] flex items-center justify-center text-[#041128] transition-colors cursor-pointer"
                aria-label="Previous projects"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-[rgba(4,17,40,0.15)] bg-white hover:bg-[#EBF1F8] flex items-center justify-center text-[#041128] transition-colors cursor-pointer"
                aria-label="Next projects"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel / Grid */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {projects.slice(0, 6).map((project, idx) => (
            <div
              key={project.id}
              className="w-[290px] sm:w-[340px] shrink-0 snap-start"
            >
              <Link href={`/projects/${project.project_id}`} className="block group">
                <div className="card-white rounded-[20px] overflow-hidden bg-white flex flex-col h-full">
                  {/* Dominant Image */}
                  <div className="relative w-full aspect-[16/10] bg-[#EBF1F8] overflow-hidden">
                    {project.image_url ? (
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="340px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EBF1F8] to-[#DCE6F2] p-6 text-center">
                        <span className="text-[#91A9C9] font-mono font-bold text-3xl">
                          {project.project_id}
                        </span>
                        <span className="text-xs text-[#848C9B] mt-1 font-medium">
                          {project.department?.name ?? 'SSN Engineering'}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041128]/85 text-white font-mono text-[11px] font-semibold">
                      {project.project_id}
                    </div>
                    {project.department && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#041128] text-[11px] font-semibold border border-[rgba(4,17,40,0.08)]">
                        {project.department.code}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#041128] group-hover:text-[#41516B] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-1.5 text-xs text-[#848C9B] line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#848C9B]">
                        <User size={12} className="text-[#91A9C9]" />
                        <span className="truncate max-w-[140px] text-[#41516B] font-medium">
                          {project.project_lead}
                        </span>
                      </div>
                      <span className="font-semibold text-[#041128] group-hover:text-[#41516B]">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
