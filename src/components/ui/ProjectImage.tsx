'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import { cn } from '@/lib/utils/cn';

export interface ProjectImagePlaceholderProps {
  deptCode?: string | null;
  deptName?: string | null;
  projectId?: string | null;
  className?: string;
}

/**
 * Premium editorial/glassmorphic department-based placeholder.
 * Used whenever a project has no uploaded photo or if image loading fails.
 */
export function ProjectImagePlaceholder({
  deptCode,
  deptName,
  projectId,
  className,
}: ProjectImagePlaceholderProps) {
  const meta = getDepartmentMeta(deptCode);
  const displayCode = deptCode?.trim() || meta.code || 'PROJECT';
  const displayName = deptName || meta.name;

  return (
    <div
      className={cn(
        'relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none p-4 text-center font-primary',
        className
      )}
      style={{
        background: `radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 60%, ${meta.border}35 100%)`,
      }}
    >
      {/* Background Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${meta.primary} 1.2px, transparent 1.2px)`,
          backgroundSize: '18px 18px',
        }}
      />

      {/* Subtle Orbital / Concentric Circles */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18]"
        viewBox="0 0 400 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="200" cy="125" r="140" stroke={meta.primary} strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="200" cy="125" r="95" stroke={meta.secondary} strokeWidth="1.2" />
        <circle cx="200" cy="125" r="55" stroke={meta.primary} strokeWidth="0.8" opacity="0.6" />
        <line x1="60" y1="125" x2="340" y2="125" stroke={meta.primary} strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>

      {/* Soft Glow Radial Accent in Center */}
      <div
        className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${meta.secondary} 0%, ${meta.primary} 100%)`,
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center max-w-[90%] transition-transform duration-300 group-hover:scale-[1.03]">
        {/* Top Mini Pill: Innovation Day / Project ID */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: meta.primary }}
          />
          <span
            className="text-[10px] sm:text-[10.5px] font-mono font-semibold tracking-[0.2em] uppercase"
            style={{ color: meta.primary }}
          >
            {projectId ? projectId : 'EXHIBITION'}
          </span>
        </div>

        {/* Large Prominent Department Code */}
        <div
          className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight leading-none drop-shadow-xs"
          style={{
            color: '#041128',
          }}
        >
          {displayCode}
        </div>

        {/* Subtitle / Department Name */}
        <p className="text-[11px] sm:text-[12px] text-[#5277A8] font-medium tracking-wide mt-1.5 line-clamp-1 max-w-[240px]">
          {displayName}
        </p>

        {/* Bottom Tag */}
        <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-md border border-[rgba(4,17,40,0.08)] shadow-2xs">
          <span className="text-[9.5px] sm:text-[10px] uppercase font-sans font-semibold tracking-[0.22em] text-[#848C9B]">
            PROJECT EXHIBITION
          </span>
        </div>
      </div>
    </div>
  );
}

export interface ProjectImageProps {
  src?: string | null;
  alt: string;
  deptCode?: string | null;
  deptName?: string | null;
  projectId?: string | null;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  placeholderClassName?: string;
}

/**
 * Universal Project Image Component.
 * - If `src` is present and valid, renders Next.js Image with `unoptimized` flag.
 * - If `src` is null/empty or triggers an `onError`, falls back immediately to `ProjectImagePlaceholder`.
 */
export function ProjectImage({
  src,
  alt,
  deptCode,
  deptName,
  projectId,
  fill = true,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  imageClassName,
  placeholderClassName,
}: ProjectImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  const cleanSrc = typeof src === 'string' ? src.trim() : '';
  const hasValidSrc = cleanSrc.length > 0 && !loadFailed;

  if (!hasValidSrc) {
    return (
      <ProjectImagePlaceholder
        deptCode={deptCode}
        deptName={deptName}
        projectId={projectId}
        className={cn(placeholderClassName, className)}
      />
    );
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt}
      fill={fill}
      unoptimized
      priority={priority}
      sizes={sizes}
      onError={() => setLoadFailed(true)}
      className={cn('object-cover', imageClassName, className)}
    />
  );
}
