'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';

interface DepartmentMarqueeProps {
  projects: Array<Project & { department?: Department }>;
  departments: Department[];
}

// Preferred presentation order for standard exhibition galleries
const PREFERRED_ORDER = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MTECHCSE', 'M.TECH CSE'];

// Deterministic image fallback: /img1.png, /img2.png, /img3.png
function getProjectThumbnail(project: Project & { department?: Department }) {
  if (project.image_url && project.image_url.trim().length > 0) {
    return project.image_url;
  }
  const fallbacks = ['/img1.png', '/img2.png', '/img3.png'];
  const key = project.project_id || project.id || 'BC';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
}

function formatDeptCode(code: string): string {
  const c = code.trim().toUpperCase();
  if (c === 'MTECHCSE' || c === 'MTECH-CSE' || c === 'MTECH_CSE') {
    return 'M.TECH CSE';
  }
  return c;
}

export function DepartmentMarquee({ projects, departments }: DepartmentMarqueeProps) {
  // Sort departments dynamically from database according to standard exhibition presentation order
  const sortedDepts = [...departments].sort((a, b) => {
    const codeA = a.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';
    const codeB = b.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';
    const idxA = PREFERRED_ORDER.findIndex((p) => p.replace(/[^A-Z]/g, '') === codeA);
    const idxB = PREFERRED_ORDER.findIndex((p) => p.replace(/[^A-Z]/g, '') === codeB);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-10 sm:space-y-14 w-full max-w-[100vw] overflow-x-clip select-none">
      {sortedDepts.map((dept, rowIndex) => {
        // STRICT DATABASE ID MATCHING: project.department_id === dept.id
        // Guarantees zero project mixing between departments.
        const deptProjects = projects.filter((project) => {
          const pDeptId =
            project.department_id ||
            (project as any).departments?.id ||
            (project as any).department?.id;
          return pDeptId === dept.id;
        });

        // Alternating directions across departments:
        // Row 0: Left (←), Row 1: Right (→), Row 2: Left (←), etc.
        const isLtr = rowIndex % 2 === 0;

        return (
          <DepartmentWaveSection
            key={dept.id}
            department={dept}
            projects={deptProjects}
            isLtr={isLtr}
          />
        );
      })}
    </div>
  );
}

// ── DEPARTMENT WAVE SECTION WITH CONTINUOUS TRAVELLING SINE WAVE ──
interface DepartmentWaveSectionProps {
  department: Department;
  projects: Array<Project & { department?: Department }>;
  isLtr: boolean;
}

function DepartmentWaveSection({
  department,
  projects,
  isLtr,
}: DepartmentWaveSectionProps) {
  const deptCode = formatDeptCode(department.code || '');
  const deptName = department.name || deptCode;

  // Track animation and interaction refs
  const trackRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<HTMLElement[]>([]);
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const amplitudeRef = useRef(160);
  const speedRef = useRef(0.85);

  const isHovered = useRef(false);
  const isDownRef = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);
  const dragDistanceX = useRef(0);
  const hasDraggedRecently = useRef(false);

  // Duplication count to ensure endless, gap-free infinite wrapping
  const loopCount = Math.max(4, Math.ceil(14 / (projects.length || 1)));

  // Direction: isLtr === true -> Marquee flows Left (direction = -1); isLtr === false -> flows Right (direction = 1)
  const direction = isLtr ? -1 : 1;

  // Responsive wave amplitude and speed based on viewport width
  const updateResponsiveDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w >= 1024) {
      amplitudeRef.current = 160; // Desktop: substantial 160px amplitude (140-200px range)
      speedRef.current = 0.85;    // ~51 px/sec (35-55 px/sec range)
    } else if (w >= 768) {
      amplitudeRef.current = 100; // Tablet: 100px amplitude (90-140px range)
      speedRef.current = 0.65;    // ~39 px/sec (30-45 px/sec range)
    } else {
      amplitudeRef.current = 60;  // Mobile: 60px amplitude (50-90px range)
      speedRef.current = 0.50;    // ~30 px/sec (25-40 px/sec range)
    }
  }, []);

  // Measure single set width for seamless modulo looping
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    updateResponsiveDimensions();
    const totalScrollWidth = trackRef.current.scrollWidth;
    if (totalScrollWidth > 0) {
      const setWidth = totalScrollWidth / loopCount;
      singleSetWidthRef.current = setWidth;

      // Cache child card wrapper elements for ultra-fast, zero-overhead per-frame transform updates
      cardElementsRef.current = Array.from(trackRef.current.children) as HTMLElement[];

      // When moving right, initialize one full set to the left to avoid initial visual snap
      if (direction === 1 && offsetRef.current === 0) {
        offsetRef.current = -setWidth;
      }
    }
  }, [loopCount, direction, updateResponsiveDimensions]);

  // Apply both horizontal marquee translate and simultaneous vertical travelling sine-wave to each card
  const applyTransforms = useCallback(() => {
    if (!trackRef.current || singleSetWidthRef.current <= 0) return;

    // A. Horizontal infinite marquee translation
    trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(2)}px, 0, 0)`;

    // B. Simultaneous travelling vertical sine wave for each card
    const singleSet = singleSetWidthRef.current;
    const cardPitch = singleSet / projects.length;
    // 2-card period: creates alternating peaks and troughs across the visible track
    const wavelength = cardPitch * 2;
    const amplitude = amplitudeRef.current;
    const cards = cardElementsRef.current;

    for (let i = 0; i < cards.length; i++) {
      const cardEl = cards[i];
      if (!cardEl) continue;
      // Physical horizontal position of card i relative to viewport
      const cardX = offsetRef.current + i * cardPitch;
      const phase = (cardX / wavelength) * 2 * Math.PI;
      // Wave function: 0 at crest, amplitude at trough (continuous floating undulation)
      const y = (amplitude / 2) * (1 - Math.cos(phase));
      cardEl.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    }
  }, [projects.length]);

  useEffect(() => {
    if (projects.length < 4) return;

    measure();
    const handleResize = () => {
      measure();
      applyTransforms();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      applyTransforms();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // IntersectionObserver: Pause RAF calculation when section is off-screen
    let isVisible = true;
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && trackRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isVisible = entry.isIntersecting;
          }
        },
        { rootMargin: '250px 0px' }
      );
      observer.observe(trackRef.current);
    }

    let animationFrameId: number;

    const animate = () => {
      const singleSet = singleSetWidthRef.current;
      if (isVisible && !isDragging.current && singleSet > 0) {
        // Slow down slightly on hover
        const currentSpeed = isHovered.current ? speedRef.current * 0.25 : speedRef.current;
        offsetRef.current += currentSpeed * direction;

        // Modulo wrapping for continuous, seamless infinite movement
        if (direction === -1) {
          if (offsetRef.current <= -singleSet) {
            offsetRef.current += singleSet;
          }
        } else {
          if (offsetRef.current >= 0) {
            offsetRef.current -= singleSet;
          }
        }

        applyTransforms();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [projects.length, direction, measure, applyTransforms]);

  // Pointer event handlers supporting both mouse drag and touch swipe with vertical scroll priority
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDownRef.current = true;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartOffset.current = offsetRef.current;
    dragDistanceX.current = 0;
    isDragging.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDownRef.current) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;

    // Mobile gesture detection: if user is primarily scrolling vertically, let the page scroll freely
    if (!isDragging.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        isDownRef.current = false;
        return;
      }
      if (Math.abs(deltaX) > 6) {
        isDragging.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {}
      }
    }

    if (isDragging.current) {
      dragDistanceX.current = Math.abs(deltaX);
      const singleSet = singleSetWidthRef.current;
      if (singleSet > 0) {
        let newOffset = dragStartOffset.current + deltaX;

        // Wrap continuously during user dragging
        while (newOffset <= -singleSet * (loopCount - 1)) newOffset += singleSet;
        while (newOffset > 0) newOffset -= singleSet;

        offsetRef.current = newOffset;
        applyTransforms();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;

    if (isDragging.current) {
      isDragging.current = false;
      // If dragged beyond threshold (6px), prevent accidental project card navigation
      if (dragDistanceX.current > 6) {
        hasDraggedRecently.current = true;
        setTimeout(() => {
          hasDraggedRecently.current = false;
        }, 150);
      }
    }

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div className="relative w-full">
      {/* ── 1. CENTERED COMPACT DEPARTMENT HEADING ── */}
      {/* Close vertical proximity: mb-2 sm:mb-3 eliminates excessive empty gaps */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-2 sm:mb-3 max-w-4xl mx-auto px-4 select-none">
        <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-[#91A9C9]/50 to-[#91A9C9]" />
        <div className="text-center shrink-0">
          <div className="font-primary text-2xl sm:text-3xl lg:text-[38px] text-[#041128] tracking-widest font-normal uppercase leading-tight">
            {deptCode}
          </div>
          <div className="text-xs sm:text-[13px] font-primary text-[#5277A8] tracking-wider mt-0.5 font-normal">
            {deptName}
          </div>
        </div>
        <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-[#91A9C9]/50 to-[#91A9C9]" />
      </div>

      {/* ── 2. PROJECT WAVE TRACK / CASES ── */}
      {projects.length === 0 ? (
        /* Case 0: No projects available yet */
        <div className="max-w-[620px] mx-auto px-5 text-center pt-2 pb-8">
          <div className="rounded-[26px] bg-white/70 backdrop-blur-[18px] border border-white/80 p-8 sm:p-10 shadow-[0_10px_35px_rgba(4,17,40,0.06)]">
            <div className="w-12 h-12 rounded-full bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mx-auto mb-3.5">
              <Sparkles size={20} />
            </div>
            <h4 className="font-primary text-xl text-[#041128] font-normal">
              No projects available yet.
            </h4>
            <p className="font-primary text-xs sm:text-sm text-[#41516B] mt-2 leading-relaxed font-normal">
              Student engineering prototypes for {deptName} are currently in preparation.
            </p>
          </div>
        </div>
      ) : projects.length === 1 ? (
        /* Case 1: Exactly 1 project (Centered) */
        <div className="max-w-[380px] mx-auto px-4 pt-2 pb-8 flex justify-center">
          <WaveProjectCard
            project={projects[0]}
            deptCode={deptCode}
          />
        </div>
      ) : projects.length === 2 ? (
        /* Case 2: Exactly 2 projects (Balanced Wave) */
        <div className="max-w-[850px] mx-auto px-4 pt-2 pb-44 lg:pb-52 flex flex-col sm:flex-row items-start justify-center gap-8 sm:gap-12">
          <div className="translate-y-0">
            <WaveProjectCard
              project={projects[0]}
              deptCode={deptCode}
            />
          </div>
          <div className="translate-y-[60px] lg:translate-y-[150px]">
            <WaveProjectCard
              project={projects[1]}
              deptCode={deptCode}
            />
          </div>
        </div>
      ) : projects.length === 3 ? (
        /* Case 3: Exactly 3 projects (3-Card Wave: Peak, Trough, Peak) */
        <div className="max-w-[1240px] mx-auto px-4 pt-2 pb-44 lg:pb-52 flex flex-col lg:flex-row items-start justify-center gap-6 sm:gap-8">
          <div className="translate-y-0">
            <WaveProjectCard
              project={projects[0]}
              deptCode={deptCode}
            />
          </div>
          <div className="translate-y-[60px] lg:translate-y-[150px]">
            <WaveProjectCard
              project={projects[1]}
              deptCode={deptCode}
            />
          </div>
          <div className="translate-y-0">
            <WaveProjectCard
              project={projects[2]}
              deptCode={deptCode}
            />
          </div>
        </div>
      ) : (
        /* Case 4+: 4+ Projects — Continuous Infinite Scroll + Dynamic Travelling Sine-Wave Marquee */
        <div
          className="group/track relative w-full overflow-hidden pt-2 pb-48 lg:pb-56 touch-pan-y cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => {
            isHovered.current = true;
          }}
          onMouseLeave={() => {
            isHovered.current = false;
          }}
        >
          {/* Lateral Translucent Edge Scrims */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#F8F7F3] via-[#F8F7F3]/80 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#F8F7F3] via-[#F8F7F3]/80 to-transparent z-20" />

          {/* Marquee Viewport & Track Container */}
          <div className="w-full overflow-visible">
            <div
              ref={trackRef}
              className="flex items-start will-change-transform select-none"
            >
              {/* Seamless Duplicated Sets */}
              {Array.from({ length: loopCount }).flatMap((_, loopIdx) =>
                projects.map((project, itemIdx) => {
                  const globalIdx = loopIdx * projects.length + itemIdx;

                  return (
                    <div
                      key={`${project.id}-${globalIdx}`}
                      className="px-2.5 sm:px-3.5 shrink-0 will-change-transform"
                    >
                      <WaveProjectCard
                        project={project}
                        deptCode={deptCode}
                        hasDraggedRecently={hasDraggedRecently}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LARGE IMAGE-DOMINANT WAVE PROJECT CARD ──
// Image dominates 60–70% of card visual area.
// Displays Project Title, clearly labeled Team Lead, Project ID, Description, and View Link.
// All four corners visible with rounded-[26px], z-index elevation on hover.
function WaveProjectCard({
  project,
  deptCode,
  hasDraggedRecently,
}: {
  project: Project & { department?: Department };
  deptCode: string;
  hasDraggedRecently?: React.MutableRefObject<boolean>;
}) {
  const imageUrl = getProjectThumbnail(project);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent accidental project navigation during mouse drag or touch swipe
    if (hasDraggedRecently?.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Link
      href={`/projects/${project.project_id}`}
      onClick={handleClick}
      draggable={false}
      className={cn(
        'group/card block w-[280px] sm:w-[310px] md:w-[330px] lg:w-[350px] shrink-0 focus:outline-none select-none relative z-10 hover:z-30 transition-transform duration-300'
      )}
    >
      <div
        className={cn(
          'relative rounded-[26px] bg-white/90 backdrop-blur-[18px] border border-white/95 p-4 sm:p-5',
          'shadow-[0_15px_45px_rgba(4,17,40,0.08)] hover:shadow-[0_24px_55px_rgba(4,17,40,0.16)]',
          'hover:border-[#91A9C9] hover:bg-white',
          'transition-all duration-300 ease-out transform',
          'hover:scale-[1.04]'
        )}
      >
        {/* 1. Large Project Image (60–70% of card visual area) */}
        <div className="relative w-full aspect-[16/11] rounded-[20px] overflow-hidden bg-[#FAF9F5] mb-3.5 border border-[rgba(4,17,40,0.06)] shadow-xs">
          <Image
            src={imageUrl}
            alt={`${project.title} - Build Club Innovation Day exhibition project`}
            fill
            draggable={false}
            sizes="(max-width: 640px) 280px, 350px"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.07] pointer-events-none"
          />

          {/* Bottom scrim gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/70 via-[#041128]/15 to-transparent pointer-events-none" />

          {/* Department / Project ID Pill Top-Right */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-[#041128]/85 backdrop-blur-md text-white font-primary text-[11px] font-normal tracking-wider shadow-sm">
            {project.project_id}
          </div>
        </div>

        {/* 2. Card Information Hierarchy: TITLE -> TEAM LEAD -> DESCRIPTION/TAGS -> VIEW */}
        <div className="space-y-2">
          {/* Department Code Eyebrow */}
          <div className="text-[10.5px] font-primary uppercase tracking-[0.2em] text-[#5277A8] font-normal">
            {deptCode} &bull; EXHIBITION ENTRY
          </div>

          {/* Animated Project Title: enters with independent translate from below/right */}
          <h4
            className={cn(
              'font-primary font-normal text-lg sm:text-[21px] text-[#041128] leading-tight line-clamp-1 group-hover/card:text-[#0b1e42] transition-all duration-500 ease-out group-hover/card:translate-x-0.5',
              mounted ? 'opacity-100 translate-y-0 translate-x-0 blur-none' : 'opacity-0 translate-y-3 translate-x-2 blur-xs'
            )}
          >
            {project.title}
          </h4>

          {/* Team Lead Section: clearly labeled with actual database value */}
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-primary pt-0.5 transition-all duration-500 ease-out delay-100',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            <span className="text-[#848C9B] font-medium">Team Lead:</span>
            <span className="text-[#041128] font-semibold truncate">
              {project.project_lead || 'Lead Researcher'}
            </span>
          </div>

          {/* Short Project Description / Tags */}
          <p
            className={cn(
              'font-primary font-normal text-xs text-[#41516B] line-clamp-2 leading-relaxed pt-1.5 border-t border-[rgba(4,17,40,0.06)] opacity-85 group-hover/card:opacity-100 transition-all duration-500 ease-out delay-200',
              mounted ? 'opacity-85 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            {project.description || 'Innovative student engineering project built for the SSN I FOUND Exhibition.'}
          </p>

          {/* View Project Link / Action */}
          <div className="pt-1 flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-primary text-[#041128] group-hover/card:text-[#5277A8] transition-colors font-normal">
              <span>View Project</span>
              <ArrowRight
                size={13}
                className="transition-transform duration-250 ease-out group-hover/card:translate-x-1.5"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
