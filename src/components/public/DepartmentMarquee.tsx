// // // 'use client';

// // // import React, { useEffect, useRef, useCallback, useState } from 'react';
// // // import Link from 'next/link';
// // // import { ArrowRight, User, Users, GraduationCap, Sparkles } from 'lucide-react';
// // // import { ProjectImage } from '@/components/ui/ProjectImage';
// // // import { getDepartmentMeta } from '@/lib/utils/departmentColors';
// // // import { cn } from '@/lib/utils/cn';
// // // import type { Department, Project } from '@/types';

// // // interface DepartmentMarqueeProps {
// // //   projects: Array<Project & { department?: Department; departments?: Department }>;
// // //   departments: Department[];
// // // }

// // // // Preferred presentation order for exhibition departments (includes GPP)
// // // const PREFERRED_ORDER = [
// // //   'CSE',
// // //   'IT',
// // //   // 'MTECHCSE',
// // //   // 'M.TECH CSE',
// // //   'ECE',
// // //   'EEE',
// // //   'MECH',
// // //   'CIVIL',
// // //   'CHEM',
// // //   'BME',
// // //   'GPP',
// // // ];

// // // function formatDeptCode(code: string): string {
// // //   const c = code.trim().toUpperCase();
// // //   if (c === 'MTECHCSE' || c === 'MTECH-CSE' || c === 'MTECH_CSE') {
// // //     return 'M.TECH CSE';
// // //   }
// // //   return c;
// // // }

// // // export function DepartmentMarquee({ projects, departments }: DepartmentMarqueeProps) {
// // //   // Sort departments dynamically from database according to standard exhibition presentation order
// // //   const sortedDepts = [...departments].sort((a, b) => {
// // //     const codeA = a.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';
// // //     const codeB = b.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';
// // //     const idxA = PREFERRED_ORDER.findIndex((p) => p.replace(/[^A-Z]/g, '') === codeA);
// // //     const idxB = PREFERRED_ORDER.findIndex((p) => p.replace(/[^A-Z]/g, '') === codeB);
// // //     if (idxA !== -1 && idxB !== -1) return idxA - idxB;
// // //     if (idxA !== -1) return -1;
// // //     if (idxB !== -1) return 1;
// // //     return a.name.localeCompare(b.name);
// // //   });

// // //   return (
// // //     <div className="space-y-12 sm:space-y-16 w-full max-w-[100vw] overflow-x-clip select-none font-primary">
// // //       {sortedDepts.map((dept, rowIndex) => {
// // //         // STRICT DATABASE ID MATCHING: project.department_id === dept.id
// // //         const deptProjects = projects.filter((project) => {
// // //           const pDeptId =
// // //             project.department_id ||
// // //             project.departments?.id ||
// // //             project.department?.id;
// // //           return pDeptId === dept.id;
// // //         });

// // //         const isLtr = rowIndex % 2 === 0;

// // //         return (
// // //           <DepartmentWaveSection
// // //             key={dept.id}
// // //             department={dept}
// // //             projects={deptProjects}
// // //             isLtr={isLtr}
// // //           />
// // //         );
// // //       })}
// // //     </div>
// // //   );
// // // }

// // // // ── DEPARTMENT WAVE SECTION WITH CONTINUOUS TRAVELLING SINE WAVE ──
// // // interface DepartmentWaveSectionProps {
// // //   department: Department;
// // //   projects: Array<Project & { department?: Department }>;
// // //   isLtr: boolean;
// // // }

// // // function DepartmentWaveSection({
// // //   department,
// // //   projects,
// // //   isLtr,
// // // }: DepartmentWaveSectionProps) {
// // //   const deptCode = formatDeptCode(department.code || '');
// // //   const deptName = department.name || deptCode;
// // //   const deptMeta = getDepartmentMeta(deptCode);

// // //   const trackRef = useRef<HTMLDivElement>(null);
// // //   const cardElementsRef = useRef<HTMLElement[]>([]);
// // //   const offsetRef = useRef(0);
// // //   const singleSetWidthRef = useRef(0);
// // //   const amplitudeRef = useRef(140);
// // //   const speedRef = useRef(0.85);

// // //   const isHovered = useRef(false);
// // //   const isDownRef = useRef(false);
// // //   const isDragging = useRef(false);
// // //   const dragStartX = useRef(0);
// // //   const dragStartY = useRef(0);
// // //   const dragStartOffset = useRef(0);
// // //   const dragDistanceX = useRef(0);
// // //   const hasDraggedRecently = useRef(false);

// // //   const loopCount = Math.max(4, Math.ceil(14 / (projects.length || 1)));
// // //   const direction = isLtr ? -1 : 1;

// // //   const updateResponsiveDimensions = useCallback(() => {
// // //     if (typeof window === 'undefined') return;
// // //     const w = window.innerWidth;
// // //     if (w >= 1024) {
// // //       amplitudeRef.current = 140;
// // //       speedRef.current = 0.85;
// // //     } else if (w >= 768) {
// // //       amplitudeRef.current = 90;
// // //       speedRef.current = 0.65;
// // //     } else {
// // //       amplitudeRef.current = 50;
// // //       speedRef.current = 0.50;
// // //     }
// // //   }, []);

// // //   const measure = useCallback(() => {
// // //     if (!trackRef.current) return;
// // //     updateResponsiveDimensions();
// // //     const totalScrollWidth = trackRef.current.scrollWidth;
// // //     if (totalScrollWidth > 0) {
// // //       const setWidth = totalScrollWidth / loopCount;
// // //       singleSetWidthRef.current = setWidth;
// // //       cardElementsRef.current = Array.from(trackRef.current.children) as HTMLElement[];

// // //       if (direction === 1 && offsetRef.current === 0) {
// // //         offsetRef.current = -setWidth;
// // //       }
// // //     }
// // //   }, [loopCount, direction, updateResponsiveDimensions]);

// // //   const applyTransforms = useCallback(() => {
// // //     if (!trackRef.current || singleSetWidthRef.current <= 0) return;

// // //     trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(2)}px, 0, 0)`;

// // //     const singleSet = singleSetWidthRef.current;
// // //     const cardPitch = singleSet / (projects.length || 1);
// // //     const wavelength = cardPitch * 2;
// // //     const amplitude = amplitudeRef.current;
// // //     const cards = cardElementsRef.current;

// // //     for (let i = 0; i < cards.length; i++) {
// // //       const cardEl = cards[i];
// // //       if (!cardEl) continue;
// // //       const cardX = offsetRef.current + i * cardPitch;
// // //       const phase = (cardX / wavelength) * 2 * Math.PI;
// // //       const y = (amplitude / 2) * (1 - Math.cos(phase));
// // //       cardEl.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
// // //     }
// // //   }, [projects.length]);

// // //   useEffect(() => {
// // //     if (projects.length < 4) return;

// // //     measure();
// // //     const handleResize = () => {
// // //       measure();
// // //       applyTransforms();
// // //     };
// // //     window.addEventListener('resize', handleResize, { passive: true });

// // //     const prefersReducedMotion =
// // //       typeof window !== 'undefined' &&
// // //       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// // //     if (prefersReducedMotion) {
// // //       applyTransforms();
// // //       return () => {
// // //         window.removeEventListener('resize', handleResize);
// // //       };
// // //     }

// // //     let isVisible = true;
// // //     let observer: IntersectionObserver | null = null;
// // //     if (typeof IntersectionObserver !== 'undefined' && trackRef.current) {
// // //       observer = new IntersectionObserver(
// // //         (entries) => {
// // //           for (const entry of entries) {
// // //             isVisible = entry.isIntersecting;
// // //           }
// // //         },
// // //         { rootMargin: '250px 0px' }
// // //       );
// // //       observer.observe(trackRef.current);
// // //     }

// // //     let animationFrameId: number;

// // //     const animate = () => {
// // //       const singleSet = singleSetWidthRef.current;
// // //       if (isVisible && !isDragging.current && !isDownRef.current && singleSet > 0) {
// // //         const currentSpeed = isHovered.current ? speedRef.current * 0.25 : speedRef.current;
// // //         offsetRef.current += currentSpeed * direction;

// // //         if (direction === -1) {
// // //           if (offsetRef.current <= -singleSet) {
// // //             offsetRef.current += singleSet;
// // //           }
// // //         } else {
// // //           if (offsetRef.current >= 0) {
// // //             offsetRef.current -= singleSet;
// // //           }
// // //         }

// // //         applyTransforms();
// // //       }

// // //       animationFrameId = requestAnimationFrame(animate);
// // //     };

// // //     animationFrameId = requestAnimationFrame(animate);

// // //     return () => {
// // //       cancelAnimationFrame(animationFrameId);
// // //       window.removeEventListener('resize', handleResize);
// // //       if (observer) {
// // //         observer.disconnect();
// // //       }
// // //     };
// // //   }, [projects.length, direction, measure, applyTransforms]);

// // //   const handlePointerDown = (e: React.PointerEvent) => {
// // //     if (e.button !== 0 && e.pointerType === 'mouse') return;
// // //     isDownRef.current = true;
// // //     dragStartX.current = e.clientX;
// // //     dragStartY.current = e.clientY;
// // //     dragStartOffset.current = offsetRef.current;
// // //     dragDistanceX.current = 0;
// // //     isDragging.current = false;
// // //   };

// // //   const handlePointerMove = (e: React.PointerEvent) => {
// // //     if (!isDownRef.current) return;
// // //     const deltaX = e.clientX - dragStartX.current;
// // //     const deltaY = e.clientY - dragStartY.current;
// // //     const absX = Math.abs(deltaX);
// // //     const absY = Math.abs(deltaY);

// // //     if (!isDragging.current) {
// // //       if (absY > 8 && absY > absX * 1.1) {
// // //         isDownRef.current = false;
// // //         return;
// // //       }
// // //       if (absX > 8 && absX > absY) {
// // //         isDragging.current = true;
// // //         dragStartOffset.current = offsetRef.current;
// // //         dragStartX.current = e.clientX;
// // //         try {
// // //           (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
// // //         } catch {}
// // //       }
// // //     }

// // //     if (isDragging.current) {
// // //       dragDistanceX.current = Math.abs(e.clientX - dragStartX.current);
// // //       const singleSet = singleSetWidthRef.current;
// // //       if (singleSet > 0) {
// // //         let newOffset = dragStartOffset.current + (e.clientX - dragStartX.current);

// // //         while (newOffset <= -singleSet * (loopCount - 1)) newOffset += singleSet;
// // //         while (newOffset > 0) newOffset -= singleSet;

// // //         offsetRef.current = newOffset;
// // //         applyTransforms();
// // //       }
// // //     }
// // //   };

// // //   const handlePointerUp = (e: React.PointerEvent) => {
// // //     if (e.pointerType === 'touch') {
// // //       isHovered.current = false;
// // //     }
// // //     if (!isDownRef.current) return;
// // //     isDownRef.current = false;

// // //     if (isDragging.current) {
// // //       isDragging.current = false;
// // //       if (dragDistanceX.current > 6) {
// // //         hasDraggedRecently.current = true;
// // //         setTimeout(() => {
// // //           hasDraggedRecently.current = false;
// // //         }, 150);
// // //       }
// // //     }

// // //     try {
// // //       if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
// // //         (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
// // //       }
// // //     } catch {}
// // //   };

// // //   return (
// // //     <div className="relative w-full">
// // //       {/* ── 1. CENTERED DEPARTMENT HEADING WITH DYNAMIC COLOR ACCENT ── */}
// // //       <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4 max-w-4xl mx-auto px-4 select-none">
// // //         <div
// // //           className="flex-1 h-[2px] rounded-full"
// // //           style={{
// // //             background: `linear-gradient(90deg, transparent, ${deptMeta.primary})`,
// // //           }}
// // //         />
// // //         <div className="text-center shrink-0">
// // //           <div className="font-primary text-2xl sm:text-3xl lg:text-[38px] text-[#041128] tracking-widest font-normal uppercase leading-tight">
// // //             {deptCode}
// // //           </div>
// // //           <div className="text-xs sm:text-[13px] font-primary text-[#5277A8] tracking-wider mt-0.5 font-normal">
// // //             {deptName}
// // //           </div>
// // //         </div>
// // //         <div
// // //           className="flex-1 h-[2px] rounded-full"
// // //           style={{
// // //             background: `linear-gradient(90deg, ${deptMeta.primary}, transparent)`,
// // //           }}
// // //         />
// // //       </div>

// // //       {/* ── 2. PROJECT WAVE TRACK / CASES ── */}
// // //       {projects.length === 0 ? (
// // //         <div className="max-w-[620px] mx-auto px-5 text-center pt-2 pb-8">
// // //           <div className="rounded-[26px] bg-white/70 backdrop-blur-[18px] border border-white/80 p-8 sm:p-10 shadow-[0_10px_35px_rgba(4,17,40,0.06)]">
// // //             <div className="w-12 h-12 rounded-full bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mx-auto mb-3.5">
// // //               <Sparkles size={20} />
// // //             </div>
// // //             <h4 className="font-primary text-xl text-[#041128] font-normal">
// // //               No projects registered yet.
// // //             </h4>
// // //             <p className="font-primary text-xs sm:text-sm text-[#41516B] mt-2 leading-relaxed font-normal">
// // //               Student engineering prototypes for {deptName} are currently in preparation.
// // //             </p>
// // //           </div>
// // //         </div>
// // //       ) : projects.length === 1 ? (
// // //         <div className="max-w-[380px] mx-auto px-4 pt-2 pb-8 flex justify-center">
// // //           <WaveProjectCard
// // //             project={projects[0]}
// // //             deptCode={deptCode}
// // //           />
// // //         </div>
// // //       ) : projects.length === 2 ? (
// // //         <div className="max-w-[850px] mx-auto px-4 pt-2 pb-44 lg:pb-52 flex flex-col sm:flex-row items-start justify-center gap-8 sm:gap-12">
// // //           <div className="translate-y-0">
// // //             <WaveProjectCard
// // //               project={projects[0]}
// // //               deptCode={deptCode}
// // //             />
// // //           </div>
// // //           <div className="translate-y-[50px] lg:translate-y-[130px]">
// // //             <WaveProjectCard
// // //               project={projects[1]}
// // //               deptCode={deptCode}
// // //             />
// // //           </div>
// // //         </div>
// // //       ) : projects.length === 3 ? (
// // //         <div className="max-w-[1240px] mx-auto px-4 pt-2 pb-44 lg:pb-52 flex flex-col lg:flex-row items-start justify-center gap-6 sm:gap-8">
// // //           <div className="translate-y-0">
// // //             <WaveProjectCard
// // //               project={projects[0]}
// // //               deptCode={deptCode}
// // //             />
// // //           </div>
// // //           <div className="translate-y-[50px] lg:translate-y-[130px]">
// // //             <WaveProjectCard
// // //               project={projects[1]}
// // //               deptCode={deptCode}
// // //             />
// // //           </div>
// // //           <div className="translate-y-0">
// // //             <WaveProjectCard
// // //               project={projects[2]}
// // //               deptCode={deptCode}
// // //             />
// // //           </div>
// // //         </div>
// // //       ) : (
// // //         <div
// // //           className="group/track relative w-full overflow-hidden pt-2 pb-44 lg:pb-52 touch-pan-y cursor-grab active:cursor-grabbing"
// // //           onPointerDown={handlePointerDown}
// // //           onPointerMove={handlePointerMove}
// // //           onPointerUp={handlePointerUp}
// // //           onPointerCancel={handlePointerUp}
// // //           onMouseEnter={() => {
// // //             isHovered.current = true;
// // //           }}
// // //           onMouseLeave={() => {
// // //             isHovered.current = false;
// // //           }}
// // //         >
// // //           {/* Lateral Translucent Edge Scrims */}
// // //           <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#F8F7F3] via-[#F8F7F3]/80 to-transparent z-20" />
// // //           <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#F8F7F3] via-[#F8F7F3]/80 to-transparent z-20" />

// // //           {/* Marquee Viewport & Track Container */}
// // //           <div className="w-full overflow-visible">
// // //             <div
// // //               ref={trackRef}
// // //               className="flex items-start will-change-transform select-none"
// // //             >
// // //               {Array.from({ length: loopCount }).flatMap((_, loopIdx) =>
// // //                 projects.map((project, itemIdx) => {
// // //                   const globalIdx = loopIdx * projects.length + itemIdx;

// // //                   return (
// // //                     <div
// // //                       key={`${project.id}-${globalIdx}`}
// // //                       className="px-2.5 sm:px-3.5 shrink-0 will-change-transform"
// // //                     >
// // //                       <WaveProjectCard
// // //                         project={project}
// // //                         deptCode={deptCode}
// // //                         hasDraggedRecently={hasDraggedRecently}
// // //                       />
// // //                     </div>
// // //                   );
// // //                 })
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // // ── LARGE IMAGE-DOMINANT WAVE PROJECT CARD ──
// // // function WaveProjectCard({
// // //   project,
// // //   deptCode,
// // //   hasDraggedRecently,
// // // }: {
// // //   project: Project & { department?: Department };
// // //   deptCode: string;
// // //   hasDraggedRecently?: React.MutableRefObject<boolean>;
// // // }) {
// // //   const deptMeta = getDepartmentMeta(deptCode);

// // //   const teamMembers = Array.isArray(project.team_members) ? project.team_members.filter(Boolean) : [];
// // //   const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
// // //   const supervisor = project.project_supervisor;

// // //   const handleClick = (e: React.MouseEvent) => {
// // //     if (hasDraggedRecently?.current) {
// // //       e.preventDefault();
// // //       e.stopPropagation();
// // //     }
// // //   };

// // //   return (
// // //     <Link
// // //       href={`/projects/${project.project_id}`}
// // //       onClick={handleClick}
// // //       draggable={false}
// // //       className="group/card block w-[290px] sm:w-[320px] md:w-[340px] lg:w-[360px] shrink-0 focus:outline-none select-none relative z-10 hover:z-30 transition-transform duration-300 touch-pan-y"
// // //     >
// // //       <div
// // //         className={cn(
// // //           'relative rounded-[26px] bg-white/95 backdrop-blur-[18px] border border-white/95 p-4 sm:p-5 touch-pan-y overflow-hidden',
// // //           'shadow-[0_15px_45px_rgba(4,17,40,0.08)] hover:shadow-[0_24px_55px_rgba(4,17,40,0.16)]',
// // //           'hover:border-[#91A9C9] hover:bg-white',
// // //           'transition-all duration-300 ease-out transform',
// // //           'hover:scale-[1.03]'
// // //         )}
// // //       >
// // //         {/* Department Top Line */}
// // //         <div
// // //           className="absolute top-0 left-0 right-0 h-1"
// // //           style={{ background: `linear-gradient(90deg, ${deptMeta.primary}, ${deptMeta.secondary})` }}
// // //         />

// // //         {/* 1. Large Project Image */}
// // //         <div className="relative w-full aspect-[16/11] rounded-[20px] overflow-hidden bg-[#FAF9F5] mb-3.5 border border-[rgba(4,17,40,0.06)] shadow-xs pointer-events-none mt-1">
// // //           <ProjectImage
// // //             src={project.image_url}
// // //             alt={`${project.title} - Build Club Innovation Day exhibition project`}
// // //             deptCode={deptCode}
// // //             deptName={project.department?.name}
// // //             projectId={project.project_id}
// // //             sizes="(max-width: 640px) 290px, 360px"
// // //             imageClassName="transition-transform duration-700 ease-out group-hover/card:scale-[1.06] pointer-events-none"
// // //           />

// // //           <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/70 via-[#041128]/15 to-transparent pointer-events-none" />

// // //           {/* Department / Project ID Pill Top-Right */}
// // //           <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-[#041128]/85 backdrop-blur-md text-white font-primary text-[11px] font-normal tracking-wider shadow-sm">
// // //             {project.project_id}
// // //           </div>
// // //         </div>

// // //         {/* 2. Card Information */}
// // //         <div className="space-y-2">
// // //           {/* Department Code Eyebrow */}
// // //           <div className="flex items-center justify-between text-[10.5px] font-primary uppercase tracking-[0.2em] font-normal">
// // //             <span style={{ color: deptMeta.primary }} className="font-semibold">
// // //               {deptCode} &bull; EXHIBITION
// // //             </span>
// // //             {tags.length > 0 && (
// // //               <span className="text-[10px] text-[#848C9B] lowercase tracking-normal">
// // //                 #{tags[0]}
// // //               </span>
// // //             )}
// // //           </div>

// // //           {/* Project Title */}
// // //           <h4 className="font-primary font-normal text-lg sm:text-[20px] text-[#041128] leading-tight line-clamp-1 group-hover/card:text-[#0b1e42] transition-colors">
// // //             {project.title}
// // //           </h4>

// // //           {/* Team Lead & Supervisor */}
// // //           <div className="space-y-1 text-xs font-primary pt-1 border-t border-[rgba(4,17,40,0.06)]">
// // //             <div className="flex items-center gap-1.5 truncate">
// // //               <User size={12} className="text-[#5277A8] shrink-0" />
// // //               <span className="text-[#848C9B] font-medium">Lead:</span>
// // //               <span className="text-[#041128] font-semibold truncate">
// // //                 {project.project_lead}
// // //               </span>
// // //             </div>

// // //             {teamMembers.length > 0 && (
// // //               <div className="flex items-center gap-1.5 truncate text-[#41516B]">
// // //                 <Users size={12} className="text-[#5277A8] shrink-0" />
// // //                 <span className="text-[#848C9B] font-medium">Team:</span>
// // //                 <span className="text-[#041128] truncate">
// // //                   {teamMembers.slice(0, 2).join(' · ')}
// // //                   {teamMembers.length > 2 && ` +${teamMembers.length - 2}`}
// // //                 </span>
// // //               </div>
// // //             )}

// // //             {supervisor && (
// // //               <div className="flex items-center gap-1.5 truncate text-[#059669]">
// // //                 <GraduationCap size={12} className="shrink-0" />
// // //                 <span className="text-[#848C9B] font-medium">Advisor:</span>
// // //                 <span className="text-[#041128] truncate">{supervisor}</span>
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Tags preview */}
// // //           {tags.length > 0 && (
// // //             <div className="flex flex-wrap gap-1 pt-1">
// // //               {tags.slice(0, 3).map((tag, tIdx) => (
// // //                 <span
// // //                   key={tIdx}
// // //                   className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDF4FC] text-[#041128] font-medium"
// // //                 >
// // //                   #{tag}
// // //                 </span>
// // //               ))}
// // //             </div>
// // //           )}

// // //           {/* View Project Link */}
// // //           <div className="pt-2 flex items-center justify-end">
// // //             <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-primary text-[#041128] group-hover/card:text-[#5277A8] transition-colors font-normal">
// // //               <span>View Project</span>
// // //               <ArrowRight
// // //                 size={13}
// // //                 className="transition-transform duration-250 ease-out group-hover/card:translate-x-1.5"
// // //               />
// // //             </span>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </Link>
// // //   );
// // // }
// // 'use client';

// // import React, { useEffect, useMemo, useState } from 'react';
// // import Link from 'next/link';
// // import {
// //   ArrowLeft,
// //   ArrowRight,
// //   User,
// //   Users,
// //   GraduationCap,
// // } from 'lucide-react';

// // import { ProjectImage } from '@/components/ui/ProjectImage';
// // import { getDepartmentMeta } from '@/lib/utils/departmentColors';
// // import type { Department, Project } from '@/types';

// // interface DepartmentMarqueeProps {
// //   projects: Array<
// //     Project & {
// //       department?: Department;
// //       departments?: Department;
// //     }
// //   >;
// //   departments: Department[];
// // }

// // /* =========================================================
// //    DEPARTMENT ORDER
// // ========================================================= */

// // const PREFERRED_ORDER = [
// //   'CSE',
// //   'IT',
// //   'MTECHCSE',
// //   'M.TECH CSE',
// //   'ECE',
// //   'EEE',
// //   'MECH',
// //   'CIVIL',
// //   'CHEM',
// //   'BME',
// //   'GPP',
// // ];

// // function formatDeptCode(code: string): string {
// //   const c = code.trim().toUpperCase();

// //   if (
// //     c === 'MTECHCSE' ||
// //     c === 'MTECH-CSE' ||
// //     c === 'MTECH_CSE'
// //   ) {
// //     return 'M.TECH CSE';
// //   }

// //   return c;
// // }

// // /* =========================================================
// //    MAIN DEPARTMENT CONTAINER
// // ========================================================= */

// // export function DepartmentMarquee({
// //   projects,
// //   departments,
// // }: DepartmentMarqueeProps) {
// //   const sortedDepts = useMemo(() => {
// //     return [...departments].sort((a, b) => {
// //       const codeA =
// //         a.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

// //       const codeB =
// //         b.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

// //       const idxA = PREFERRED_ORDER.findIndex(
// //         (p) => p.replace(/[^A-Z]/g, '') === codeA
// //       );

// //       const idxB = PREFERRED_ORDER.findIndex(
// //         (p) => p.replace(/[^A-Z]/g, '') === codeB
// //       );

// //       if (idxA !== -1 && idxB !== -1) {
// //         return idxA - idxB;
// //       }

// //       if (idxA !== -1) return -1;
// //       if (idxB !== -1) return 1;

// //       return a.name.localeCompare(b.name);
// //     });
// //   }, [departments]);

// //   return (
// //     <div className="w-full overflow-x-clip font-primary">
// //       <div className="space-y-24 sm:space-y-28 lg:space-y-32">
// //         {sortedDepts.map((dept) => {
// //           /*
// //            * IMPORTANT:
// //            * Department matching is ONLY done using the actual
// //            * department database ID.
// //            */
// //           const deptProjects = projects.filter((project) => {
// //             const projectDepartmentId =
// //               project.department_id ||
// //               project.departments?.id ||
// //               project.department?.id;

// //             return projectDepartmentId === dept.id;
// //           });

// //           return (
// //             <DepartmentCarouselSection
// //               key={dept.id}
// //               department={dept}
// //               projects={deptProjects}
// //             />
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    DEPARTMENT CAROUSEL
// // ========================================================= */

// // interface DepartmentCarouselSectionProps {
// //   department: Department;
// //   projects: Array<
// //     Project & {
// //       department?: Department;
// //       departments?: Department;
// //     }
// //   >;
// // }

// // function DepartmentCarouselSection({
// //   department,
// //   projects,
// // }: DepartmentCarouselSectionProps) {
// //   const deptCode = formatDeptCode(department.code || '');
// //   const deptName = department.name || deptCode;
// //   const deptMeta = getDepartmentMeta(deptCode);

// //   const [activeIndex, setActiveIndex] = useState(0);
// //   const [isPaused, setIsPaused] = useState(false);

// //   /*
// //    * Reset active project if the project list changes.
// //    */
// //   useEffect(() => {
// //     setActiveIndex(0);
// //   }, [projects.length]);

// //   /*
// //    * Automatic carousel movement.
// //    *
// //    * It is intentionally slow.
// //    * Users can still control it manually.
// //    */
// //   useEffect(() => {
// //     if (projects.length <= 1 || isPaused) return;

// //     const interval = window.setInterval(() => {
// //       setActiveIndex((current) => {
// //         return (current + 1) % projects.length;
// //       });
// //     }, 5500);

// //     return () => {
// //       window.clearInterval(interval);
// //     };
// //   }, [projects.length, isPaused]);

// //   const goNext = () => {
// //     if (projects.length <= 1) return;

// //     setActiveIndex((current) => {
// //       return (current + 1) % projects.length;
// //     });
// //   };

// //   const goPrevious = () => {
// //     if (projects.length <= 1) return;

// //     setActiveIndex((current) => {
// //       return (
// //         (current - 1 + projects.length) %
// //         projects.length
// //       );
// //     });
// //   };

// //   /*
// //    * If no projects exist.
// //    */
// //   if (projects.length === 0) {
// //     return (
// //       <section className="relative w-full">
// //         <DepartmentHeading
// //           deptCode={deptCode}
// //           deptName={deptName}
// //           color={deptMeta.primary}
// //         />

// //         <div className="max-w-[620px] mx-auto px-5">
// //           <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 p-10 text-center shadow-[0_15px_45px_rgba(4,17,40,0.06)]">
// //             <div
// //               className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
// //               style={{
// //                 backgroundColor: `${deptMeta.primary}12`,
// //                 color: deptMeta.primary,
// //               }}
// //             >
// //               <span className="text-lg">+</span>
// //             </div>

// //             <h3 className="text-xl text-[#041128]">
// //               No projects registered yet
// //             </h3>

// //             <p className="mt-2 text-sm text-[#5277A8]">
// //               Projects from {deptName} will appear here.
// //             </p>
// //           </div>
// //         </div>
// //       </section>
// //     );
// //   }

// //   return (
// //     <section
// //       className="relative w-full"
// //       onMouseEnter={() => setIsPaused(true)}
// //       onMouseLeave={() => setIsPaused(false)}
// //     >
// //       {/* =====================================================
// //           DEPARTMENT TITLE
// //       ===================================================== */}

// //       <DepartmentHeading
// //         deptCode={deptCode}
// //         deptName={deptName}
// //         color={deptMeta.primary}
// //       />

// //       {/* =====================================================
// //           CAROUSEL
// //       ===================================================== */}

// //       <div className="relative w-full mt-8 sm:mt-10">
// //         <div
// //           className="
// //             relative
// //             w-full
// //             h-[470px]
// //             sm:h-[520px]
// //             lg:h-[575px]
// //             overflow-hidden
// //           "
// //         >
// //           {projects.map((project, index) => {
// //             const position = getCircularPosition(
// //               index,
// //               activeIndex,
// //               projects.length
// //             );

// //             return (
// //               <CarouselProjectCard
// //                 key={project.id}
// //                 project={project}
// //                 deptCode={deptCode}
// //                 deptName={deptName}
// //                 color={deptMeta.primary}
// //                 position={position}
// //               />
// //             );
// //           })}
// //         </div>

// //         {/* ===================================================
// //             CONTROLS
// //         =================================================== */}

// //         {projects.length > 1 && (
// //           <div className="relative z-[100] flex items-center justify-center gap-4 -mt-1">
// //             <button
// //               type="button"
// //               onClick={goPrevious}
// //               aria-label={`Previous ${deptCode} project`}
// //               className="
// //                 w-11 h-11
// //                 sm:w-12 sm:h-12
// //                 rounded-full
// //                 bg-white
// //                 border border-[#D9E1EA]
// //                 shadow-[0_8px_25px_rgba(4,17,40,0.10)]
// //                 flex items-center justify-center
// //                 text-[#041128]
// //                 hover:bg-[#041128]
// //                 hover:text-white
// //                 hover:scale-105
// //                 transition-all duration-300
// //                 cursor-pointer
// //               "
// //             >
// //               <ArrowLeft size={18} />
// //             </button>

// //             <div className="min-w-[80px] text-center">
// //               <span className="text-xs tracking-[0.18em] text-[#5277A8]">
// //                 {String(activeIndex + 1).padStart(2, '0')}
// //               </span>

// //               <span className="text-xs text-[#A0A8B5] mx-1">
// //                 /
// //               </span>

// //               <span className="text-xs tracking-[0.18em] text-[#5277A8]">
// //                 {String(projects.length).padStart(2, '0')}
// //               </span>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={goNext}
// //               aria-label={`Next ${deptCode} project`}
// //               className="
// //                 w-11 h-11
// //                 sm:w-12 sm:h-12
// //                 rounded-full
// //                 bg-white
// //                 border border-[#D9E1EA]
// //                 shadow-[0_8px_25px_rgba(4,17,40,0.10)]
// //                 flex items-center justify-center
// //                 text-[#041128]
// //                 hover:bg-[#041128]
// //                 hover:text-white
// //                 hover:scale-105
// //                 transition-all duration-300
// //                 cursor-pointer
// //               "
// //             >
// //               <ArrowRight size={18} />
// //             </button>
// //           </div>
// //         )}

// //         {/* ===================================================
// //             PROGRESS LINE
// //         =================================================== */}

// //         {projects.length > 1 && (
// //           <div className="max-w-[420px] mx-auto mt-6 px-6">
// //             <div className="h-[2px] bg-[#DCE2E9] rounded-full overflow-hidden">
// //               <div
// //                 className="h-full rounded-full transition-all duration-700 ease-out"
// //                 style={{
// //                   width: `${
// //                     ((activeIndex + 1) / projects.length) * 100
// //                   }%`,
// //                   background: `linear-gradient(
// //                     90deg,
// //                     ${deptMeta.primary},
// //                     ${deptMeta.secondary}
// //                   )`,
// //                 }}
// //               />
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </section>
// //   );
// // }

// // /* =========================================================
// //    DEPARTMENT HEADING
// // ========================================================= */

// // function DepartmentHeading({
// //   deptCode,
// //   deptName,
// //   color,
// // }: {
// //   deptCode: string;
// //   deptName: string;
// //   color: string;
// // }) {
// //   return (
// //     <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-5xl mx-auto px-5">
// //       <div
// //         className="flex-1 h-[2px] rounded-full"
// //         style={{
// //           background: `linear-gradient(
// //             90deg,
// //             transparent,
// //             ${color}
// //           )`,
// //         }}
// //       />

// //       <div className="text-center shrink-0">
// //         <div className="text-[30px] sm:text-[38px] lg:text-[44px] leading-none tracking-[0.08em] text-[#041128] font-normal uppercase">
// //           {deptCode}
// //         </div>

// //         <div className="mt-2 text-xs sm:text-sm text-[#5277A8] tracking-[0.08em]">
// //           {deptName}
// //         </div>
// //       </div>

// //       <div
// //         className="flex-1 h-[2px] rounded-full"
// //         style={{
// //           background: `linear-gradient(
// //             90deg,
// //             ${color},
// //             transparent
// //           )`,
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    POSITION CALCULATION
// // =========================================================

// //    The carousel always tries to show:

// //                  CENTER
// //                    ↑
// //              LEFT       RIGHT
// //                 ↖       ↗
// //           FAR LEFT     FAR RIGHT

// //    Center = large + high
// //    Left/right = smaller + lower
// //    Far cards = faded + further away
// // ========================================================= */

// // type CarouselPosition =
// //   | 'center'
// //   | 'left'
// //   | 'right'
// //   | 'far-left'
// //   | 'far-right'
// //   | 'hidden';

// // function getCircularPosition(
// //   index: number,
// //   activeIndex: number,
// //   total: number
// // ): CarouselPosition {
// //   if (total === 1) {
// //     return index === activeIndex ? 'center' : 'hidden';
// //   }

// //   let difference = index - activeIndex;

// //   /*
// //    * Wrap around the array so the carousel is continuous.
// //    */
// //   if (difference > total / 2) {
// //     difference -= total;
// //   }

// //   if (difference < -total / 2) {
// //     difference += total;
// //   }

// //   if (difference === 0) return 'center';
// //   if (difference === -1) return 'left';
// //   if (difference === 1) return 'right';
// //   if (difference === -2) return 'far-left';
// //   if (difference === 2) return 'far-right';

// //   return 'hidden';
// // }

// // /* =========================================================
// //    PROJECT CARD
// // ========================================================= */

// // function CarouselProjectCard({
// //   project,
// //   deptCode,
// //   deptName,
// //   color,
// //   position,
// // }: {
// //   project: Project & {
// //     department?: Department;
// //     departments?: Department;
// //   };
// //   deptCode: string;
// //   deptName: string;
// //   color: string;
// //   position: CarouselPosition;
// // }) {
// //   const teamMembers = Array.isArray(project.team_members)
// //     ? project.team_members.filter(Boolean)
// //     : [];

// //   const tags = Array.isArray(project.tags)
// //     ? project.tags.filter(Boolean)
// //     : [];

// //   const supervisor = project.project_supervisor;

// //   /*
// //    * Each card directly links to its own project page.
// //    *
// //    * encodeURIComponent prevents project IDs containing spaces,
// //    * slashes, #, etc. from breaking the route.
// //    */
// //   const projectHref = `/projects/${encodeURIComponent(
// //     project.project_id
// //   )}`;

// //   /*
// //    * Position-specific styling.
// //    *
// //    * IMPORTANT:
// //    * There is NO purple overlay here.
// //    *
// //    * The image remains visible.
// //    */
// //   const positionStyles: Record<
// //     CarouselPosition,
// //     React.CSSProperties
// //   > = {
// //     center: {
// //       left: '50%',
// //       top: '8px',
// //       width: 'min(390px, 74vw)',
// //       height: '500px',
// //       opacity: 1,
// //       zIndex: 50,
// //       transform:
// //         'translateX(-50%) translateY(0) scale(1)',
// //       filter: 'none',
// //     },

// //     left: {
// //       left: '50%',
// //       top: '65px',
// //       width: 'min(350px, 66vw)',
// //       height: '455px',
// //       opacity: 0.82,
// //       zIndex: 35,
// //       transform:
// //         'translateX(calc(-50% - min(285px, 27vw))) translateY(55px) scale(0.91)',
// //       filter: 'none',
// //     },

// //     right: {
// //       left: '50%',
// //       top: '65px',
// //       width: 'min(350px, 66vw)',
// //       height: '455px',
// //       opacity: 0.82,
// //       zIndex: 35,
// //       transform:
// //         'translateX(calc(-50% + min(285px, 27vw))) translateY(55px) scale(0.91)',
// //       filter: 'none',
// //     },

// //     'far-left': {
// //       left: '50%',
// //       top: '90px',
// //       width: 'min(320px, 60vw)',
// //       height: '420px',
// //       opacity: 0.46,
// //       zIndex: 20,
// //       transform:
// //         'translateX(calc(-50% - min(500px, 47vw))) translateY(105px) scale(0.84)',
// //       filter: 'saturate(0.82)',
// //     },

// //     'far-right': {
// //       left: '50%',
// //       top: '90px',
// //       width: 'min(320px, 60vw)',
// //       height: '420px',
// //       opacity: 0.46,
// //       zIndex: 20,
// //       transform:
// //         'translateX(calc(-50% + min(500px, 47vw))) translateY(105px) scale(0.84)',
// //       filter: 'saturate(0.82)',
// //     },

// //     hidden: {
// //       left: '50%',
// //       top: '100px',
// //       width: '320px',
// //       height: '420px',
// //       opacity: 0,
// //       zIndex: 0,
// //       pointerEvents: 'none',
// //       transform:
// //         'translateX(-50%) translateY(120px) scale(0.75)',
// //       filter: 'blur(4px)',
// //     },
// //   };

// //   const isCenter = position === 'center';
// //   const isVisible = position !== 'hidden';

// //   if (!isVisible) {
// //     return (
// //       <div
// //         aria-hidden="true"
// //         className="absolute pointer-events-none"
// //         style={positionStyles[position]}
// //       />
// //     );
// //   }

// //   return (
// //     <Link
// //       href={projectHref}
// //       draggable={false}
// //       aria-label={`View project ${project.title}`}
// //       className={`
// //         absolute
// //         block
// //         rounded-[26px]
// //         sm:rounded-[30px]
// //         overflow-hidden
// //         select-none
// //         cursor-pointer
// //         transition-all
// //         duration-[750ms]
// //         ease-[cubic-bezier(0.22,1,0.36,1)]
// //         focus:outline-none
// //         focus-visible:ring-2
// //         focus-visible:ring-offset-4
// //         focus-visible:ring-[#041128]
// //         ${
// //           isCenter
// //             ? 'hover:scale-[1.015]'
// //             : 'hover:scale-[0.94]'
// //         }
// //       `}
// //       style={{
// //         ...positionStyles[position],
// //         border: `1px solid ${
// //           isCenter
// //             ? `${color}88`
// //             : 'rgba(4,17,40,0.10)'
// //         }`,
// //         boxShadow: isCenter
// //           ? '0 28px 70px rgba(4,17,40,0.22)'
// //           : '0 18px 45px rgba(4,17,40,0.12)',
// //         backgroundColor: '#EDEBE6',
// //       }}
// //     >
// //       {/* ===================================================
// //           IMAGE
// //       =================================================== */}

// //       <div className="absolute inset-0">
// //         <ProjectImage
// //           src={project.image_url}
// //           alt={`${project.title} - Innovation Day project`}
// //           deptCode={deptCode}
// //           deptName={deptName}
// //           projectId={project.project_id}
// //           sizes="
// //             (max-width: 640px) 74vw,
// //             (max-width: 1024px) 390px,
// //             390px
// //           "
// //           imageClassName={`
// //             w-full
// //             h-full
// //             object-cover
// //             ${
// //               isCenter
// //                 ? 'transition-transform duration-[1200ms] ease-out hover:scale-[1.035]'
// //                 : ''
// //             }
// //           `}
// //         />
// //       </div>

// //       {/* ===================================================
// //           VERY LIGHT DEPARTMENT TINT
          
// //           This is intentionally VERY subtle.
// //           It does NOT cover the image.
// //       =================================================== */}

// //       <div
// //         className="absolute inset-0 pointer-events-none"
// //         style={{
// //           background: `
// //             linear-gradient(
// //               180deg,
// //               rgba(4,17,40,0.00) 0%,
// //               rgba(4,17,40,0.00) 45%,
// //               rgba(4,17,40,0.10) 63%,
// //               rgba(4,17,40,0.76) 100%
// //             )
// //           `,
// //         }}
// //       />

// //       {/* ===================================================
// //           SMALL DEPARTMENT COLOR GLOW
          
// //           Only at the bottom.
// //       =================================================== */}

// //       <div
// //         className="absolute bottom-0 left-0 right-0 h-[34%] pointer-events-none"
// //         style={{
// //           background: `linear-gradient(
// //             180deg,
// //             transparent 0%,
// //             ${color}10 55%,
// //             ${color}28 100%
// //           )`,
// //         }}
// //       />

// //       {/* ===================================================
// //           TOP PROJECT ID
// //       =================================================== */}

// //       <div
// //         className={`
// //           absolute
// //           top-4
// //           left-4
// //           right-4
// //           flex
// //           items-center
// //           justify-between
// //           pointer-events-none
// //           transition-all duration-500
// //         `}
// //       >
// //         <span
// //           className="
// //             px-3
// //             py-1.5
// //             rounded-full
// //             bg-black/25
// //             backdrop-blur-[8px]
// //             border border-white/30
// //             text-white
// //             text-[10px]
// //             sm:text-[11px]
// //             tracking-[0.14em]
// //             uppercase
// //           "
// //         >
// //           {deptCode}
// //         </span>

// //         <span
// //           className="
// //             px-3
// //             py-1.5
// //             rounded-full
// //             bg-black/25
// //             backdrop-blur-[8px]
// //             border border-white/30
// //             text-white
// //             text-[10px]
// //             sm:text-[11px]
// //             tracking-[0.12em]
// //           "
// //         >
// //           {project.project_id}
// //         </span>
// //       </div>

// //       {/* ===================================================
// //           PROJECT INFORMATION
          
// //           Positioned only in bottom area.
// //           This keeps the image itself clear.
// //       =================================================== */}

// //       <div
// //         className={`
// //           absolute
// //           left-5
// //           right-5
// //           bottom-5
// //           sm:left-7
// //           sm:right-7
// //           sm:bottom-7
// //           text-white
// //           pointer-events-none
// //           ${
// //             isCenter
// //               ? 'opacity-100'
// //               : 'opacity-90'
// //           }
// //         `}
// //       >
// //         {/* Innovation Day label */}

// //         <div className="flex items-center gap-2 mb-2">
// //           <span
// //             className="w-7 h-[2px] rounded-full"
// //             style={{
// //               backgroundColor: color,
// //             }}
// //           />

// //           <span className="text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-white/85">
// //             Innovation Day
// //           </span>
// //         </div>

// //         {/* Title */}

// //         <h3
// //           className={`
// //             font-primary
// //             font-normal
// //             leading-[1.04]
// //             tracking-[-0.02em]
// //             drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]
// //             ${
// //               isCenter
// //                 ? 'text-[27px] sm:text-[32px]'
// //                 : 'text-[20px] sm:text-[23px]'
// //             }
// //             line-clamp-2
// //           `}
// //         >
// //           {project.title}
// //         </h3>

// //         {/* Lead */}

// //         <div className="mt-3 flex items-center gap-2 text-white/90">
// //           <User size={13} className="shrink-0" />

// //           <span className="text-[10px] sm:text-[11px]">
// //             Team Lead
// //           </span>

// //           <span className="text-white/60">·</span>

// //           <span className="text-[10px] sm:text-[11px] truncate">
// //             {project.project_lead}
// //           </span>
// //         </div>

// //         {/* Team / Advisor */}

// //         {isCenter && (
// //           <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/75">
// //             {teamMembers.length > 0 && (
// //               <div className="flex items-center gap-1.5">
// //                 <Users size={12} />

// //                 <span className="text-[10px]">
// //                   {teamMembers.length}{' '}
// //                   {teamMembers.length === 1
// //                     ? 'member'
// //                     : 'members'}
// //                 </span>
// //               </div>
// //             )}

// //             {supervisor && (
// //               <div className="flex items-center gap-1.5">
// //                 <GraduationCap size={12} />

// //                 <span className="text-[10px] truncate max-w-[180px]">
// //                   {supervisor}
// //                 </span>
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* Tags */}

// //         {isCenter && tags.length > 0 && (
// //           <div className="flex flex-wrap gap-1.5 mt-3">
// //             {tags.slice(0, 3).map((tag, index) => (
// //               <span
// //                 key={`${tag}-${index}`}
// //                 className="
// //                   px-2.5
// //                   py-1
// //                   rounded-full
// //                   bg-white/15
// //                   backdrop-blur-md
// //                   border border-white/20
// //                   text-[9px]
// //                   text-white/90
// //                 "
// //               >
// //                 #{tag}
// //               </span>
// //             ))}
// //           </div>
// //         )}

// //         {/* Explore */}

// //         <div
// //           className={`
// //             mt-4
// //             flex
// //             items-center
// //             gap-2
// //             text-white
// //             ${
// //               isCenter
// //                 ? 'text-[11px] tracking-[0.16em]'
// //                 : 'text-[9px] tracking-[0.12em]'
// //             }
// //             uppercase
// //           `}
// //         >
// //           <span>Explore Project</span>

// //           <ArrowRight
// //             size={isCenter ? 14 : 11}
// //             className="transition-transform duration-300 group-hover:translate-x-1"
// //           />
// //         </div>
// //       </div>

// //       {/* ===================================================
// //           CENTER CARD ACCENT
// //       =================================================== */}

// //       {isCenter && (
// //         <div
// //           className="absolute top-0 left-0 right-0 h-[3px]"
// //           style={{
// //             background: `linear-gradient(
// //               90deg,
// //               transparent,
// //               ${color},
// //               transparent
// //             )`,
// //           }}
// //         />
// //       )}
// //     </Link>
// //   );
// // }

// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   ArrowRight,
//   User,
//   Users,
//   GraduationCap,
// } from 'lucide-react';

// import { ProjectImage } from '@/components/ui/ProjectImage';
// import { getDepartmentMeta } from '@/lib/utils/departmentColors';
// import type { Department, Project } from '@/types';

// interface DepartmentMarqueeProps {
//   projects: Array<
//     Project & {
//       department?: Department;
//       departments?: Department;
//     }
//   >;
//   departments: Department[];
// }

// /* =========================================================
//    DEPARTMENT ORDER
// ========================================================= */

// const PREFERRED_ORDER = [
//   'CSE',
//   'IT',
//   'MTECHCSE',
//   'M.TECH CSE',
//   'ECE',
//   'EEE',
//   'MECH',
//   'CIVIL',
//   'CHEM',
//   'BME',
//   'GPP',
// ];

// function formatDeptCode(code: string): string {
//   const c = code.trim().toUpperCase();

//   if (
//     c === 'MTECHCSE' ||
//     c === 'MTECH-CSE' ||
//     c === 'MTECH_CSE'
//   ) {
//     return 'M.TECH CSE';
//   }

//   return c;
// }

// /* =========================================================
//    MAIN DEPARTMENT CONTAINER
// ========================================================= */

// export function DepartmentMarquee({
//   projects,
//   departments,
// }: DepartmentMarqueeProps) {
//   const sortedDepts = useMemo(() => {
//     return [...departments].sort((a, b) => {
//       const codeA =
//         a.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

//       const codeB =
//         b.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

//       const idxA = PREFERRED_ORDER.findIndex(
//         (p) => p.replace(/[^A-Z]/g, '') === codeA
//       );

//       const idxB = PREFERRED_ORDER.findIndex(
//         (p) => p.replace(/[^A-Z]/g, '') === codeB
//       );

//       if (idxA !== -1 && idxB !== -1) {
//         return idxA - idxB;
//       }

//       if (idxA !== -1) return -1;
//       if (idxB !== -1) return 1;

//       return a.name.localeCompare(b.name);
//     });
//   }, [departments]);

//   return (
//     <div className="w-full overflow-x-clip font-primary">
//       <div className="space-y-20 sm:space-y-24 lg:space-y-28">
//         {sortedDepts.map((dept) => {
//           /*
//            * STRICT DATABASE ID MATCHING
//            */
//           const deptProjects = projects.filter((project) => {
//             const projectDepartmentId =
//               project.department_id ||
//               project.departments?.id ||
//               project.department?.id;

//             return projectDepartmentId === dept.id;
//           });

//           return (
//             <DepartmentCarouselSection
//               key={dept.id}
//               department={dept}
//               projects={deptProjects}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* =========================================================
//    DEPARTMENT CAROUSEL
// ========================================================= */

// interface DepartmentCarouselSectionProps {
//   department: Department;
//   projects: Array<
//     Project & {
//       department?: Department;
//       departments?: Department;
//     }
//   >;
// }

// function DepartmentCarouselSection({
//   department,
//   projects,
// }: DepartmentCarouselSectionProps) {
//   const deptCode = formatDeptCode(department.code || '');
//   const deptName = department.name || deptCode;
//   const deptMeta = getDepartmentMeta(deptCode);

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);

//   /* Reset when projects change */
//   useEffect(() => {
//     setActiveIndex(0);
//   }, [projects.length]);

//   /* =======================================================
//      AUTO CAROUSEL
//   ======================================================= */

//   useEffect(() => {
//     if (projects.length <= 1 || isPaused) return;

//     const interval = window.setInterval(() => {
//       setActiveIndex((current) => {
//         return (current + 1) % projects.length;
//       });
//     }, 5500);

//     return () => {
//       window.clearInterval(interval);
//     };
//   }, [projects.length, isPaused]);

//   const goNext = () => {
//     if (projects.length <= 1) return;

//     setActiveIndex((current) => {
//       return (current + 1) % projects.length;
//     });
//   };

//   const goPrevious = () => {
//     if (projects.length <= 1) return;

//     setActiveIndex((current) => {
//       return (
//         (current - 1 + projects.length) %
//         projects.length
//       );
//     });
//   };

//   /* =======================================================
//      EMPTY DEPARTMENT
//   ======================================================= */

//   if (projects.length === 0) {
//     return (
//       <section className="relative w-full">
//         <DepartmentHeading
//           deptCode={deptCode}
//           deptName={deptName}
//           color={deptMeta.primary}
//         />

//         <div className="max-w-[620px] mx-auto px-5 mt-6">
//           <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 p-10 text-center shadow-[0_15px_45px_rgba(4,17,40,0.06)]">
//             <div
//               className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
//               style={{
//                 backgroundColor: `${deptMeta.primary}12`,
//                 color: deptMeta.primary,
//               }}
//             >
//               <span className="text-lg">+</span>
//             </div>

//             <h3 className="text-xl text-[#041128]">
//               No projects registered yet
//             </h3>

//             <p className="mt-2 text-sm text-[#5277A8]">
//               Projects from {deptName} will appear here.
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section
//       className="relative w-full"
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* =====================================================
//           DEPARTMENT TITLE
//       ===================================================== */}

//       <DepartmentHeading
//         deptCode={deptCode}
//         deptName={deptName}
//         color={deptMeta.primary}
//       />

//       {/* =====================================================
//           CAROUSEL
//       ===================================================== */}

//       <div className="relative w-full mt-6 sm:mt-8">
//         <div
//           className="
//             relative
//             w-full
//             h-[405px]
//             sm:h-[435px]
//             lg:h-[455px]
//             overflow-hidden
//           "
//         >
//           {projects.map((project, index) => {
//             const position = getCircularPosition(
//               index,
//               activeIndex,
//               projects.length
//             );

//             return (
//               <CarouselProjectCard
//                 key={project.id}
//                 project={project}
//                 deptCode={deptCode}
//                 deptName={deptName}
//                 color={deptMeta.primary}
//                 position={position}
//               />
//             );
//           })}
//         </div>

//         {/* ===================================================
//             CONTROLS
//         =================================================== */}

//         {projects.length > 1 && (
//           <div className="relative z-[100] flex items-center justify-center gap-4 -mt-1">
//             <button
//               type="button"
//               onClick={goPrevious}
//               aria-label={`Previous ${deptCode} project`}
//               className="
//                 w-10 h-10
//                 sm:w-11 sm:h-11
//                 rounded-full
//                 bg-white
//                 border border-[#D9E1EA]
//                 shadow-[0_8px_25px_rgba(4,17,40,0.10)]
//                 flex items-center justify-center
//                 text-[#041128]
//                 hover:bg-[#041128]
//                 hover:text-white
//                 hover:scale-105
//                 transition-all duration-300
//                 cursor-pointer
//               "
//             >
//               <ArrowLeft size={17} />
//             </button>

//             <div className="min-w-[70px] text-center">
//               <span className="text-xs tracking-[0.18em] text-[#5277A8]">
//                 {String(activeIndex + 1).padStart(2, '0')}
//               </span>

//               <span className="text-xs text-[#A0A8B5] mx-1">
//                 /
//               </span>

//               <span className="text-xs tracking-[0.18em] text-[#5277A8]">
//                 {String(projects.length).padStart(2, '0')}
//               </span>
//             </div>

//             <button
//               type="button"
//               onClick={goNext}
//               aria-label={`Next ${deptCode} project`}
//               className="
//                 w-10 h-10
//                 sm:w-11 sm:h-11
//                 rounded-full
//                 bg-white
//                 border border-[#D9E1EA]
//                 shadow-[0_8px_25px_rgba(4,17,40,0.10)]
//                 flex items-center justify-center
//                 text-[#041128]
//                 hover:bg-[#041128]
//                 hover:text-white
//                 hover:scale-105
//                 transition-all duration-300
//                 cursor-pointer
//               "
//             >
//               <ArrowRight size={17} />
//             </button>
//           </div>
//         )}

//         {/* ===================================================
//             PROGRESS LINE
//         =================================================== */}

//         {projects.length > 1 && (
//           <div className="max-w-[380px] mx-auto mt-5 px-6">
//             <div className="h-[2px] bg-[#DCE2E9] rounded-full overflow-hidden">
//               <div
//                 className="h-full rounded-full transition-all duration-700 ease-out"
//                 style={{
//                   width: `${
//                     ((activeIndex + 1) / projects.length) * 100
//                   }%`,
//                   background: `linear-gradient(
//                     90deg,
//                     ${deptMeta.primary},
//                     ${deptMeta.secondary}
//                   )`,
//                 }}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// /* =========================================================
//    DEPARTMENT HEADING
// ========================================================= */

// function DepartmentHeading({
//   deptCode,
//   deptName,
//   color,
// }: {
//   deptCode: string;
//   deptName: string;
//   color: string;
// }) {
//   return (
//     <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-5xl mx-auto px-5">
//       <div
//         className="flex-1 h-[2px] rounded-full"
//         style={{
//           background: `linear-gradient(
//             90deg,
//             transparent,
//             ${color}
//           )`,
//         }}
//       />

//       <div className="text-center shrink-0">
//         <div className="text-[30px] sm:text-[38px] lg:text-[44px] leading-none tracking-[0.08em] text-[#041128] font-normal uppercase">
//           {deptCode}
//         </div>

//         <div className="mt-2 text-xs sm:text-sm text-[#5277A8] tracking-[0.08em]">
//           {deptName}
//         </div>
//       </div>

//       <div
//         className="flex-1 h-[2px] rounded-full"
//         style={{
//           background: `linear-gradient(
//             90deg,
//             ${color},
//             transparent
//           )`,
//         }}
//       />
//     </div>
//   );
// }

// /* =========================================================
//    POSITION CALCULATION
// ========================================================= */

// type CarouselPosition =
//   | 'center'
//   | 'left'
//   | 'right'
//   | 'far-left'
//   | 'far-right'
//   | 'hidden';

// function getCircularPosition(
//   index: number,
//   activeIndex: number,
//   total: number
// ): CarouselPosition {
//   if (total === 1) {
//     return index === activeIndex ? 'center' : 'hidden';
//   }

//   let difference = index - activeIndex;

//   if (difference > total / 2) {
//     difference -= total;
//   }

//   if (difference < -total / 2) {
//     difference += total;
//   }

//   if (difference === 0) return 'center';
//   if (difference === -1) return 'left';
//   if (difference === 1) return 'right';
//   if (difference === -2) return 'far-left';
//   if (difference === 2) return 'far-right';

//   return 'hidden';
// }

// /* =========================================================
//    PROJECT CARD
// ========================================================= */

// function CarouselProjectCard({
//   project,
//   deptCode,
//   deptName,
//   color,
//   position,
// }: {
//   project: Project & {
//     department?: Department;
//     departments?: Department;
//   };
//   deptCode: string;
//   deptName: string;
//   color: string;
//   position: CarouselPosition;
// }) {
//   const teamMembers = Array.isArray(project.team_members)
//     ? project.team_members.filter(Boolean)
//     : [];

//   const tags = Array.isArray(project.tags)
//     ? project.tags.filter(Boolean)
//     : [];

//   const supervisor = project.project_supervisor;

//   const projectHref = `/projects/${encodeURIComponent(
//     project.project_id
//   )}`;

//   /* =======================================================
//      COMPACT CARD DIMENSIONS
     
//      Center:   410px
//      Side:     365px
//      Far:      335px
//   ======================================================= */

//   const positionStyles: Record<
//     CarouselPosition,
//     React.CSSProperties
//   > = {
//     center: {
//       left: '50%',
//       top: '4px',
//       width: 'min(370px, 74vw)',
//       height: '410px',
//       opacity: 1,
//       zIndex: 50,
//       transform:
//         'translateX(-50%) translateY(0) scale(1)',
//       filter: 'none',
//     },

//     left: {
//       left: '50%',
//       top: '48px',
//       width: 'min(340px, 66vw)',
//       height: '365px',
//       opacity: 0.82,
//       zIndex: 35,
//       transform:
//         'translateX(calc(-50% - min(270px, 27vw))) translateY(48px) scale(0.91)',
//       filter: 'none',
//     },

//     right: {
//       left: '50%',
//       top: '48px',
//       width: 'min(340px, 66vw)',
//       height: '365px',
//       opacity: 0.82,
//       zIndex: 35,
//       transform:
//         'translateX(calc(-50% + min(270px, 27vw))) translateY(48px) scale(0.91)',
//       filter: 'none',
//     },

//     'far-left': {
//       left: '50%',
//       top: '70px',
//       width: 'min(310px, 60vw)',
//       height: '335px',
//       opacity: 0.46,
//       zIndex: 20,
//       transform:
//         'translateX(calc(-50% - min(480px, 47vw))) translateY(88px) scale(0.84)',
//       filter: 'saturate(0.82)',
//     },

//     'far-right': {
//       left: '50%',
//       top: '70px',
//       width: 'min(310px, 60vw)',
//       height: '335px',
//       opacity: 0.46,
//       zIndex: 20,
//       transform:
//         'translateX(calc(-50% + min(480px, 47vw))) translateY(88px) scale(0.84)',
//       filter: 'saturate(0.82)',
//     },

//     hidden: {
//       left: '50%',
//       top: '80px',
//       width: '310px',
//       height: '335px',
//       opacity: 0,
//       zIndex: 0,
//       pointerEvents: 'none',
//       transform:
//         'translateX(-50%) translateY(105px) scale(0.75)',
//       filter: 'blur(4px)',
//     },
//   };

//   const isCenter = position === 'center';
//   const isVisible = position !== 'hidden';

//   if (!isVisible) {
//     return (
//       <div
//         aria-hidden="true"
//         className="absolute pointer-events-none"
//         style={positionStyles[position]}
//       />
//     );
//   }

//   return (
//     <Link
//       href={projectHref}
//       draggable={false}
//       aria-label={`View project ${project.title}`}
//       className={`
//         absolute
//         block
//         rounded-[24px]
//         sm:rounded-[28px]
//         overflow-hidden
//         select-none
//         cursor-pointer
//         transition-all
//         duration-[750ms]
//         ease-[cubic-bezier(0.22,1,0.36,1)]
//         focus:outline-none
//         focus-visible:ring-2
//         focus-visible:ring-offset-4
//         focus-visible:ring-[#041128]
//         ${
//           isCenter
//             ? 'hover:scale-[1.015]'
//             : 'hover:scale-[0.94]'
//         }
//       `}
//       style={{
//         ...positionStyles[position],

//         border: `1px solid ${
//           isCenter
//             ? `${color}88`
//             : 'rgba(4,17,40,0.10)'
//         }`,

//         boxShadow: isCenter
//           ? '0 24px 60px rgba(4,17,40,0.20)'
//           : '0 16px 38px rgba(4,17,40,0.11)',

//         backgroundColor: '#EDEBE6',
//       }}
//     >
//       {/* ===================================================
//           IMAGE
//       =================================================== */}

//       <div className="absolute inset-0">
//         <ProjectImage
//           src={project.image_url}
//           alt={`${project.title} - Innovation Day project`}
//           deptCode={deptCode}
//           deptName={deptName}
//           projectId={project.project_id}
//           sizes="
//             (max-width: 640px) 74vw,
//             (max-width: 1024px) 370px,
//             370px
//           "
//           imageClassName={`
//             w-full
//             h-full
//             object-cover
//             ${
//               isCenter
//                 ? 'transition-transform duration-[1200ms] ease-out hover:scale-[1.035]'
//                 : ''
//             }
//           `}
//         />
//       </div>

//       {/* ===================================================
//           LIGHT IMAGE READABILITY GRADIENT
          
//           Keeps image clear.
//           Only darkens the lower portion.
//       =================================================== */}

//       <div
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           background: `
//             linear-gradient(
//               180deg,
//               rgba(4,17,40,0.00) 0%,
//               rgba(4,17,40,0.00) 43%,
//               rgba(4,17,40,0.08) 60%,
//               rgba(4,17,40,0.72) 100%
//             )
//           `,
//         }}
//       />

//       {/* ===================================================
//           VERY SUBTLE DEPARTMENT COLOR
//       =================================================== */}

//       <div
//         className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none"
//         style={{
//           background: `linear-gradient(
//             180deg,
//             transparent 0%,
//             ${color}08 55%,
//             ${color}20 100%
//           )`,
//         }}
//       />

//       {/* ===================================================
//           TOP PROJECT ID
//       =================================================== */}

//       <div
//         className="
//           absolute
//           top-3.5
//           left-3.5
//           right-3.5
//           flex
//           items-center
//           justify-between
//           pointer-events-none
//         "
//       >
//         <span
//           className="
//             px-2.5
//             py-1
//             rounded-full
//             bg-black/25
//             backdrop-blur-[8px]
//             border border-white/30
//             text-white
//             text-[9px]
//             sm:text-[10px]
//             tracking-[0.14em]
//             uppercase
//           "
//         >
//           {deptCode}
//         </span>

//         <span
//           className="
//             px-2.5
//             py-1
//             rounded-full
//             bg-black/25
//             backdrop-blur-[8px]
//             border border-white/30
//             text-white
//             text-[9px]
//             sm:text-[10px]
//             tracking-[0.12em]
//           "
//         >
//           {project.project_id}
//         </span>
//       </div>

//       {/* ===================================================
//           PROJECT INFORMATION
//       =================================================== */}

//       <div
//         className={`
//           absolute
//           left-5
//           right-5
//           bottom-5
//           sm:left-6
//           sm:right-6
//           sm:bottom-6
//           text-white
//           pointer-events-none
//         `}
//       >
//         {/* Innovation Day label */}

//         <div className="flex items-center gap-2 mb-1.5">
//           <span
//             className="w-6 h-[2px] rounded-full"
//             style={{
//               backgroundColor: color,
//             }}
//           />

//           <span className="text-[8px] sm:text-[9px] tracking-[0.22em] uppercase text-white/85">
//             Innovation Day
//           </span>
//         </div>

//         {/* Title */}

//         <h3
//           className={`
//             font-primary
//             font-normal
//             leading-[1.05]
//             tracking-[-0.02em]
//             drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]
//             ${
//               isCenter
//                 ? 'text-[24px] sm:text-[28px]'
//                 : 'text-[18px] sm:text-[21px]'
//             }
//             line-clamp-2
//           `}
//         >
//           {project.title}
//         </h3>

//         {/* Lead */}

//         <div className="mt-2.5 flex items-center gap-1.5 text-white/90">
//           <User size={12} className="shrink-0" />

//           <span className="text-[9px] sm:text-[10px]">
//             Team Lead
//           </span>

//           <span className="text-white/60">·</span>

//           <span className="text-[9px] sm:text-[10px] truncate">
//             {project.project_lead}
//           </span>
//         </div>

//         {/* Team / Advisor */}

//         {isCenter && (
//           <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/75">
//             {teamMembers.length > 0 && (
//               <div className="flex items-center gap-1.5">
//                 <Users size={11} />

//                 <span className="text-[9px]">
//                   {teamMembers.length}{' '}
//                   {teamMembers.length === 1
//                     ? 'member'
//                     : 'members'}
//                 </span>
//               </div>
//             )}

//             {supervisor && (
//               <div className="flex items-center gap-1.5">
//                 <GraduationCap size={11} />

//                 <span className="text-[9px] truncate max-w-[160px]">
//                   {supervisor}
//                 </span>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Tags */}

//         {isCenter && tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-2">
//             {tags.slice(0, 3).map((tag, index) => (
//               <span
//                 key={`${tag}-${index}`}
//                 className="
//                   px-2
//                   py-0.5
//                   rounded-full
//                   bg-white/15
//                   backdrop-blur-md
//                   border border-white/20
//                   text-[8px]
//                   text-white/90
//                 "
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Explore */}

//         <div
//           className={`
//             mt-2.5
//             flex
//             items-center
//             gap-1.5
//             text-white
//             ${
//               isCenter
//                 ? 'text-[9px] tracking-[0.16em]'
//                 : 'text-[8px] tracking-[0.12em]'
//             }
//             uppercase
//           `}
//         >
//           <span>Explore Project</span>

//           <ArrowRight
//             size={isCenter ? 13 : 10}
//             className="transition-transform duration-300"
//           />
//         </div>
//       </div>

//       {/* ===================================================
//           CENTER CARD ACCENT
//       =================================================== */}

//       {isCenter && (
//         <div
//           className="absolute top-0 left-0 right-0 h-[3px]"
//           style={{
//             background: `linear-gradient(
//               90deg,
//               transparent,
//               ${color},
//               transparent
//             )`,
//           }}
//         />
//       )}
//     </Link>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  GraduationCap,
} from 'lucide-react';

import { ProjectImage } from '@/components/ui/ProjectImage';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import type { Department, Project } from '@/types';

interface DepartmentMarqueeProps {
  projects: Array<
    Project & {
      department?: Department;
      departments?: Department;
    }
  >;
  departments: Department[];
}

/* =========================================================
   DEPARTMENT ORDER
========================================================= */

const PREFERRED_ORDER = [
  'CSE',
  'IT',
  'MTECHCSE',
  'M.TECH CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'CHEM',
  'BME',
  'GPP',
];

function formatDeptCode(code: string): string {
  const c = code.trim().toUpperCase();

  if (
    c === 'MTECHCSE' ||
    c === 'MTECH-CSE' ||
    c === 'MTECH_CSE'
  ) {
    return 'M.TECH CSE';
  }

  return c;
}

/* =========================================================
   MAIN DEPARTMENT CONTAINER
========================================================= */

export function DepartmentMarquee({
  projects,
  departments,
}: DepartmentMarqueeProps) {
  const sortedDepts = useMemo(() => {
    return [...departments].sort((a, b) => {
      const codeA =
        a.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

      const codeB =
        b.code?.toUpperCase().replace(/[^A-Z]/g, '') || '';

      const idxA = PREFERRED_ORDER.findIndex(
        (p) => p.replace(/[^A-Z]/g, '') === codeA
      );

      const idxB = PREFERRED_ORDER.findIndex(
        (p) => p.replace(/[^A-Z]/g, '') === codeB
      );

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }

      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [departments]);

  return (
    <div className="w-full overflow-x-clip font-primary">
      <div className="space-y-20 sm:space-y-24 lg:space-y-28">
        {sortedDepts.map((dept) => {
          /*
           * STRICT DATABASE ID MATCHING
           */
          const deptProjects = projects.filter((project) => {
            const projectDepartmentId =
              project.department_id ||
              project.departments?.id ||
              project.department?.id;

            return projectDepartmentId === dept.id;
          });

          return (
            <DepartmentCarouselSection
              key={dept.id}
              department={dept}
              projects={deptProjects}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   DEPARTMENT CAROUSEL
========================================================= */

interface DepartmentCarouselSectionProps {
  department: Department;
  projects: Array<
    Project & {
      department?: Department;
      departments?: Department;
    }
  >;
}

function DepartmentCarouselSection({
  department,
  projects,
}: DepartmentCarouselSectionProps) {
  const deptCode = formatDeptCode(department.code || '');
  const deptName = department.name || deptCode;
  const deptMeta = getDepartmentMeta(deptCode);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* =======================================================
     RESET WHEN PROJECTS CHANGE
  ======================================================= */

  useEffect(() => {
    setActiveIndex(0);
  }, [projects.length]);

  /* =======================================================
     AUTO CAROUSEL
  ======================================================= */

  useEffect(() => {
    if (projects.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % projects.length;
      });
    }, 5500);

    return () => {
      window.clearInterval(interval);
    };
  }, [projects.length, isPaused]);

  const goNext = () => {
    if (projects.length <= 1) return;

    setActiveIndex((current) => {
      return (current + 1) % projects.length;
    });
  };

  const goPrevious = () => {
    if (projects.length <= 1) return;

    setActiveIndex((current) => {
      return (
        (current - 1 + projects.length) % projects.length
      );
    });
  };

  /* =======================================================
     EMPTY DEPARTMENT
  ======================================================= */

  if (projects.length === 0) {
    return (
      <section className="relative w-full">
        <DepartmentHeading
          deptCode={deptCode}
          deptName={deptName}
          color={deptMeta.primary}
        />

        <div className="max-w-[620px] mx-auto px-5 mt-6">
          <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 p-10 text-center shadow-[0_15px_45px_rgba(4,17,40,0.06)]">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: `${deptMeta.primary}12`,
                color: deptMeta.primary,
              }}
            >
              <span className="text-lg">+</span>
            </div>

            <h3 className="text-xl text-[#041128]">
              No projects registered yet
            </h3>

            <p className="mt-2 text-sm text-[#5277A8]">
              Projects from {deptName} will appear here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* =====================================================
          DEPARTMENT TITLE
      ===================================================== */}

      <DepartmentHeading
        deptCode={deptCode}
        deptName={deptName}
        color={deptMeta.primary}
      />

      {/* =====================================================
          CAROUSEL
      ===================================================== */}

      <div className="relative w-full mt-6 sm:mt-8">
        <div
          className="
            relative
            w-full
            h-[405px]
            sm:h-[435px]
            lg:h-[455px]
            overflow-hidden
          "
        >
          {projects.map((project, index) => {
            const position = getCircularPosition(
              index,
              activeIndex,
              projects.length
            );

            return (
              <CarouselProjectCard
                key={project.id}
                project={project}
                deptCode={deptCode}
                deptName={deptName}
                color={deptMeta.primary}
                position={position}
              />
            );
          })}
        </div>

        {/* ===================================================
            CONTROLS
        =================================================== */}

        {projects.length > 1 && (
          <div className="relative z-[100] flex items-center justify-center gap-4 -mt-1">
            <button
              type="button"
              onClick={goPrevious}
              aria-label={`Previous ${deptCode} project`}
              className="
                w-10 h-10
                sm:w-11 sm:h-11
                rounded-full
                bg-white
                border border-[#D9E1EA]
                shadow-[0_8px_25px_rgba(4,17,40,0.10)]
                flex items-center justify-center
                text-[#041128]
                hover:bg-[#041128]
                hover:text-white
                hover:scale-105
                transition-all duration-300
                cursor-pointer
              "
            >
              <ArrowLeft size={17} />
            </button>

            <div className="min-w-[70px] text-center">
              <span className="text-xs tracking-[0.18em] text-[#5277A8]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>

              <span className="text-xs text-[#A0A8B5] mx-1">
                /
              </span>

              <span className="text-xs tracking-[0.18em] text-[#5277A8]">
                {String(projects.length).padStart(2, '0')}
              </span>
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label={`Next ${deptCode} project`}
              className="
                w-10 h-10
                sm:w-11 sm:h-11
                rounded-full
                bg-white
                border border-[#D9E1EA]
                shadow-[0_8px_25px_rgba(4,17,40,0.10)]
                flex items-center justify-center
                text-[#041128]
                hover:bg-[#041128]
                hover:text-white
                hover:scale-105
                transition-all duration-300
                cursor-pointer
              "
            >
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* ===================================================
            PROGRESS LINE
        =================================================== */}

        {projects.length > 1 && (
          <div className="max-w-[380px] mx-auto mt-5 px-6">
            <div className="h-[2px] bg-[#DCE2E9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${
                    ((activeIndex + 1) / projects.length) * 100
                  }%`,
                  background: `linear-gradient(
                    90deg,
                    ${deptMeta.primary},
                    ${deptMeta.secondary}
                  )`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   DEPARTMENT HEADING
========================================================= */

function DepartmentHeading({
  deptCode,
  deptName,
  color,
}: {
  deptCode: string;
  deptName: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-5xl mx-auto px-5">
      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${color}
          )`,
        }}
      />

      <div className="text-center shrink-0 max-w-[75vw] sm:max-w-none">
        <div className="text-[34px] sm:text-[42px] lg:text-[48px] leading-none tracking-[0.08em] text-[#041128] font-medium uppercase">
          {deptCode}
        </div>

        <div className="mt-2.5 text-sm sm:text-base lg:text-lg text-[#041128] tracking-[0.06em] font-medium uppercase">
          {deptName}
        </div>
      </div>

      <div
        className="flex-1 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(
            90deg,
            ${color},
            transparent
          )`,
        }}
      />
    </div>
  );
}

/* =========================================================
   POSITION CALCULATION
========================================================= */

type CarouselPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'far-left'
  | 'far-right'
  | 'hidden';

function getCircularPosition(
  index: number,
  activeIndex: number,
  total: number
): CarouselPosition {
  if (total === 1) {
    return index === activeIndex ? 'center' : 'hidden';
  }

  let difference = index - activeIndex;

  if (difference > total / 2) {
    difference -= total;
  }

  if (difference < -total / 2) {
    difference += total;
  }

  if (difference === 0) return 'center';
  if (difference === -1) return 'left';
  if (difference === 1) return 'right';
  if (difference === -2) return 'far-left';
  if (difference === 2) return 'far-right';

  return 'hidden';
}

/* =========================================================
   PROJECT CARD
========================================================= */

function CarouselProjectCard({
  project,
  deptCode,
  deptName,
  color,
  position,
}: {
  project: Project & {
    department?: Department;
    departments?: Department;
  };
  deptCode: string;
  deptName: string;
  color: string;
  position: CarouselPosition;
}) {
  const teamMembers = Array.isArray(project.team_members)
    ? project.team_members.filter(Boolean)
    : [];

  const tags = Array.isArray(project.tags)
    ? project.tags.filter(Boolean)
    : [];

  const supervisor = project.project_supervisor;

  const projectHref = `/projects/${encodeURIComponent(
    project.project_id
  )}`;

  /* =======================================================
     CARD DIMENSIONS
  ======================================================= */

  const positionStyles: Record<
    CarouselPosition,
    React.CSSProperties
  > = {
    center: {
      left: '50%',
      top: '4px',
      width: 'min(450px, 82vw)',
      height: '410px',
      opacity: 1,
      zIndex: 50,
      transform:
        'translateX(-50%) translateY(0) scale(1)',
      filter: 'none',
      backgroundColor: color,
    },

    left: {
      left: '50%',
      top: '48px',
      width: 'min(390px, 74vw)',
      height: '365px',
      opacity: 0.96,
      zIndex: 35,
      transform:
        'translateX(calc(-50% - min(285px, 30vw))) translateY(48px) scale(0.91)',
      filter: 'none',
      backgroundColor: color,
    },

    right: {
      left: '50%',
      top: '48px',
      width: 'min(390px, 74vw)',
      height: '365px',
      opacity: 0.96,
      zIndex: 35,
      transform:
        'translateX(calc(-50% + min(285px, 30vw))) translateY(48px) scale(0.91)',
      filter: 'none',
      backgroundColor: color,
    },

    'far-left': {
      left: '50%',
      top: '70px',
      width: 'min(350px, 68vw)',
      height: '335px',
      opacity: 0.82,
      zIndex: 20,
      transform:
        'translateX(calc(-50% - min(500px, 49vw))) translateY(88px) scale(0.84)',
      filter: 'saturate(0.82)',
      backgroundColor: color,
    },

    'far-right': {
      left: '50%',
      top: '70px',
      width: 'min(350px, 68vw)',
      height: '335px',
      opacity: 0.82,
      zIndex: 20,
      transform:
        'translateX(calc(-50% + min(500px, 49vw))) translateY(88px) scale(0.84)',
      filter: 'saturate(0.82)',
      backgroundColor: color,
    },

    hidden: {
      left: '50%',
      top: '80px',
      width: '350px',
      height: '335px',
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none',
      transform:
        'translateX(-50%) translateY(105px) scale(0.75)',
      filter: 'blur(4px)',
    },
  };

  const isCenter = position === 'center';
  const isSide =
    position === 'left' || position === 'right';
  const isFar =
    position === 'far-left' ||
    position === 'far-right';

  const isVisible = position !== 'hidden';

  if (!isVisible) {
    return (
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={positionStyles[position]}
      />
    );
  }

  /* =======================================================
     COLOR COMBINATION

     CENTER
       Rich / dark / strong

     SIDE
       Medium / lighter

     FAR
       Lightest / faded

     The image remains visible through the colour treatment.
  ======================================================= */

  const colorOverlay = isCenter
    ? `linear-gradient(
        180deg,
        ${color}B8 0%,
        ${color}9C 38%,
        ${color}A8 62%,
        ${color}D0 100%
      )`
    : isSide
      ? `linear-gradient(
          180deg,
          ${color}88 0%,
          ${color}72 42%,
          ${color}8E 68%,
          ${color}B8 100%
        )`
      : `linear-gradient(
          180deg,
          ${color}5C 0%,
          ${color}50 42%,
          ${color}6C 68%,
          ${color}8C 100%
        )`;

  /* =======================================================
     IMAGE OPACITY

     Keeps the image visible while preserving the
     department colour as the main visual identity.
  ======================================================= */

  const imageOpacity = isCenter
    ? 0.72
    : isSide
      ? 0.78
      : 0.70;

  return (
    <Link
      href={projectHref}
      draggable={false}
      aria-label={`View project ${project.title}`}
      className={`
        absolute
        block
        rounded-[24px]
        sm:rounded-[28px]
        overflow-hidden
        select-none
        cursor-pointer
        transition-all
        duration-[750ms]
        ease-[cubic-bezier(0.22,1,0.36,1)]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-4
        focus-visible:ring-[#041128]
        ${
          isCenter
            ? 'hover:scale-[1.015]'
            : 'hover:scale-[0.94]'
        }
      `}
      style={{
        ...positionStyles[position],

        border: `1px solid ${
          isCenter
            ? `${color}FF`
            : `${color}AA`
        }`,

        boxShadow: isCenter
          ? `0 24px 60px ${color}55`
          : `0 16px 38px ${color}35`,

        backgroundColor: color,
      }}
    >
      {/* ===================================================
          FULL CARD IMAGE
      =================================================== */}

      <div
        className="absolute inset-0"
        style={{
          opacity: imageOpacity,
        }}
      >
        <ProjectImage
          src={project.image_url}
          alt={`${project.title} - Innovation Day project`}
          deptCode={deptCode}
          deptName={deptName}
          projectId={project.project_id}
          sizes="
            (max-width: 640px) 82vw,
            (max-width: 1024px) 450px,
            450px
          "
          imageClassName={`
            w-full
            h-full
            object-cover
            ${
              isCenter
                ? 'transition-transform duration-[1200ms] ease-out hover:scale-[1.035]'
                : ''
            }
          `}
        />
      </div>

      {/* ===================================================
          DEPARTMENT COLOUR

          The colour is strong enough to identify the
          department but transparent enough to preserve
          the project image.
      =================================================== */}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: colorOverlay,
        }}
      />

      {/* ===================================================
          TOP-TO-BOTTOM READABILITY GRADIENT

          Stronger at bottom where the project information
          is located.
      =================================================== */}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(4,17,40,0.04) 0%,
              rgba(4,17,40,0.00) 28%,
              rgba(4,17,40,0.10) 48%,
              rgba(4,17,40,0.48) 68%,
              rgba(4,17,40,0.90) 100%
            )
          `,
        }}
      />

      {/* ===================================================
          SUBTLE CENTER GLOW

          Makes the front card feel richer without creating
          a separate colour block.
      =================================================== */}

      {isCenter && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                circle at 50% 35%,
                rgba(255,255,255,0.10) 0%,
                rgba(255,255,255,0.03) 30%,
                transparent 62%
              )
            `,
          }}
        />
      )}

      {/* ===================================================
          TOP INFORMATION
      =================================================== */}

      <div
        className="
          absolute
          top-3.5
          left-3.5
          right-3.5
          flex
          items-start
          justify-between
          gap-2
          pointer-events-none
          z-20
        "
      >
        {/* FULL DEPARTMENT NAME */}

        <span
          className="
            max-w-[72%]
            px-3
            py-1.5
            rounded-full
            bg-[#041128]/60
            backdrop-blur-[10px]
            border border-white/35
            text-white
            text-[9px]
            sm:text-[10px]
            leading-[1.2]
            tracking-[0.08em]
            uppercase
            font-semibold
            shadow-[0_3px_14px_rgba(0,0,0,0.25)]
          "
        >
          {deptName}
        </span>

        {/* PROJECT ID */}

        <span
          className="
            shrink-0
            px-3
            py-1.5
            rounded-full
            bg-[#041128]/60
            backdrop-blur-[10px]
            border border-white/35
            text-white
            text-[9px]
            sm:text-[10px]
            tracking-[0.10em]
            font-semibold
            shadow-[0_3px_14px_rgba(0,0,0,0.25)]
          "
        >
          {project.project_id}
        </span>
      </div>

      {/* ===================================================
          PROJECT INFORMATION
      =================================================== */}

      <div
        className="
          absolute
          left-5
          right-5
          bottom-5
          sm:left-6
          sm:right-6
          sm:bottom-6
          text-white
          pointer-events-none
          z-20
        "
      >
        {/* =================================================
            TITLE

            Innovation Day label intentionally removed.
        ================================================= */}

        <h3
          className={`
            font-primary
            font-semibold
            leading-[1.04]
            tracking-[-0.025em]
            text-white
            drop-shadow-[0_3px_14px_rgba(0,0,0,0.85)]
            ${
              isCenter
                ? 'text-[26px] sm:text-[31px] lg:text-[32px]'
                : 'text-[18px] sm:text-[21px]'
            }
            line-clamp-2
          `}
        >
          {project.title}
        </h3>

        {/* =================================================
            LEAD
        ================================================= */}

        <div className="mt-3 flex items-center gap-1.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          <User
            size={isCenter ? 13 : 12}
            className="shrink-0"
          />

          <span
            className={
              isCenter
                ? 'text-[10px] sm:text-[11px] font-semibold'
                : 'text-[9px] sm:text-[10px] font-medium'
            }
          >
            Team Lead
          </span>

          <span className="text-white/70">·</span>

          <span
            className={
              isCenter
                ? 'text-[10px] sm:text-[11px] truncate'
                : 'text-[9px] sm:text-[10px] truncate'
            }
          >
            {project.project_lead}
          </span>
        </div>

        {/* =================================================
            TEAM / ADVISOR
        ================================================= */}

        {isCenter && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {teamMembers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users size={12} />

                <span className="text-[10px] font-medium">
                  {teamMembers.length}{' '}
                  {teamMembers.length === 1
                    ? 'member'
                    : 'members'}
                </span>
              </div>
            )}

            {supervisor && (
              <div className="flex items-center gap-1.5 min-w-0">
                <GraduationCap size={12} />

                <span className="text-[10px] font-medium truncate max-w-[180px]">
                  {supervisor}
                </span>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            TAGS
        ================================================= */}

        {isCenter && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="
                  px-2.5
                  py-1
                  rounded-full
                  bg-[#041128]/45
                  backdrop-blur-md
                  border border-white/30
                  text-[8px]
                  sm:text-[9px]
                  text-white
                  font-medium
                  shadow-[0_2px_8px_rgba(0,0,0,0.15)]
                "
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* =================================================
            EXPLORE PROJECT
        ================================================= */}

        <div
          className={`
            mt-3
            flex
            items-center
            gap-2
            text-white
            font-semibold
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
            ${
              isCenter
                ? 'text-[9px] sm:text-[10px] tracking-[0.16em]'
                : 'text-[8px] tracking-[0.12em]'
            }
            uppercase
          `}
        >
          <span>Explore Project</span>

          <ArrowRight
            size={isCenter ? 14 : 10}
            className="transition-transform duration-300"
          />
        </div>
      </div>

      {/* ===================================================
          CENTER CARD ACCENT
      =================================================== */}

      {isCenter && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-30"
          style={{
            background: `linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.95),
              transparent
            )`,
          }}
        />
      )}

      {/* ===================================================
          SOFT CARD EDGE
      =================================================== */}

      <div
        className="absolute inset-0 rounded-[24px] sm:rounded-[28px] pointer-events-none z-30"
        style={{
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.28),
            inset 0 -1px 0 rgba(0,0,0,0.12)
          `,
        }}
      />
    </Link>
  );
}