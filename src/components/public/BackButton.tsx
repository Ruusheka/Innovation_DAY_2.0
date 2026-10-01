'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackToProjectsButton() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Check if we can scroll directly or need navigation
    if (window.location.pathname === '/') {
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/#projects');
        return;
      }
    }

    // Navigate to landing page projects section
    router.push('/#projects');

    // Polling retry for smooth scroll to #projects once landing page mounts
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        clearInterval(interval);
      } else if (attempts > 20) {
        clearInterval(interval);
        window.location.href = '/#projects';
      }
    }, 50);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur-md border border-[#D9E1EA] text-sm font-primary font-normal text-[#41516B] hover:text-[#041128] hover:bg-[rgba(145,169,201,0.18)] hover:border-[#91A9C9] transition-all duration-200 shadow-2xs group cursor-pointer"
      aria-label="Back to Projects Showcase"
    >
      <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 text-[#5277A8]" />
      <span>Back to Projects</span>
    </button>
  );
}
