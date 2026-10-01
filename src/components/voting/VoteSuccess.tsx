'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface VoteSuccessProps {
  studentName: string;
  projectName?: string;
  onNextStudent: () => void;
}

export function VoteSuccess({ studentName, projectName, onNextStudent }: VoteSuccessProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => btnRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onNextStudent();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="py-12 flex flex-col items-center text-center gap-6"
    >
      {/* Subtle animated green check badge */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.4, type: 'spring', stiffness: 220 }}
        className="w-20 h-20 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] flex items-center justify-center shadow-sm"
      >
        <CheckCircle2 size={42} className="text-[#2E7D32]" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#041128] tracking-tight">
          VOTE RECORDED
        </h2>
        <div className="text-sm text-[#41516B] max-w-sm mx-auto space-y-1">
          <p>
            Student: <span className="font-semibold text-[#041128]">{studentName}</span>
          </p>
          {projectName && (
            <p>
              Project: <span className="font-semibold text-[#041128]">{projectName}</span>
            </p>
          )}
        </div>
      </div>

      <button
        ref={btnRef}
        onClick={onNextStudent}
        onKeyDown={handleKeyDown}
        className="mt-4 flex items-center gap-2 px-9 py-4 bg-[#041128] text-white font-bold rounded-full hover:bg-[#112244] transition-all shadow-md text-base cursor-pointer hover:shadow-lg"
      >
        <span>NEXT STUDENT</span>
        <ArrowRight size={18} />
      </button>

      <p className="text-[#848C9B] text-xs">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white border text-[#041128] font-mono">Enter</kbd> to proceed immediately
      </p>
    </motion.div>
  );
}
