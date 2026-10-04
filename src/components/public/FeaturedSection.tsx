'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { PageContainer } from '@/components/ui/PageContainer';
import type { Project, Department } from '@/types';

interface FeaturedSectionProps {
  projects: (Project & { department?: Department })[];
}

export function FeaturedSection({ projects }: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 370;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
      <PageContainer>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                FEATURED PROJECTS
              </span>
            </div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl lg:text-[44px] text-[#041128] tracking-tight leading-tight m-0">
              Innovation in Action
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#041128] hover:text-[#5277A8] transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight size={15} />
            </Link>

            {/* Circular Carousel Controls */}
            <div className="hidden sm:flex items-center gap-2 ml-3">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-[#D9E1EA] bg-white hover:bg-[#EDF4FC] hover:border-[#5277A8] flex items-center justify-center text-[#041128] transition-colors cursor-pointer shadow-sm"
                aria-label="Previous featured projects"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-[#D9E1EA] bg-white hover:bg-[#EDF4FC] hover:border-[#5277A8] flex items-center justify-center text-[#041128] transition-colors cursor-pointer shadow-sm"
                aria-label="Next featured projects"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {projects.slice(0, 8).map((project) => (
            <div
              key={project.id}
              className="w-[290px] sm:w-[350px] shrink-0 snap-start"
            >
              <Link href={`/projects/${project.project_id}`} className="block group h-full">
                <div className="card-white rounded-[20px] overflow-hidden bg-white flex flex-col h-full">
                  {/* Dominant Image Aspect Ratio 16:10 */}
                  <div className="relative w-full aspect-[16/10] bg-[#EDF4FC] overflow-hidden">
                    <ProjectImage
                      src={project.image_url}
                      alt={project.title}
                      deptCode={project.department?.code}
                      deptName={project.department?.name}
                      projectId={project.project_id}
                      imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="350px"
                    />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#041128]/85 backdrop-blur-md text-white font-mono text-[11px] font-semibold">
                      {project.project_id}
                    </div>
                    {project.department && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#041128] font-sans text-[11px] font-bold border border-[rgba(4,17,40,0.08)]">
                        {project.department.code}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-sans text-[18px] font-semibold text-[#041128] group-hover:text-[#5277A8] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-2 text-xs font-sans text-[#848C9B] line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-1.5 text-[#848C9B]">
                        <User size={13} className="text-[#5277A8]" />
                        <span className="truncate max-w-[140px] text-[#41516B] font-medium">
                          {project.project_lead}
                        </span>
                      </div>
                      <span className="font-semibold text-[#041128] group-hover:text-[#5277A8]">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
