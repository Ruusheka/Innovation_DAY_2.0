'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface VoteSuccessProps {
  studentName: string;
  onNextStudent: () => void;
}

export function VoteSuccess({ studentName, onNextStudent }: VoteSuccessProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-focus the next student button for keyboard flow
    const t = setTimeout(() => btnRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    onNextStudent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="py-10 flex flex-col items-center text-center gap-6"
    >
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
      >
        <CheckCircle2 size={40} className="text-green-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white">Vote Recorded</h2>
        <p className="text-[#848C9B] mt-2 text-sm">
          {studentName}&apos;s vote has been successfully recorded.
        </p>
      </motion.div>

      <motion.button
        ref={btnRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        onClick={handleNext}
        onKeyDown={handleKeyDown}
        className="mt-2 flex items-center gap-2 px-8 py-4 bg-[#91A9C9] text-[#040411] font-bold rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#91A9C9]/20 text-base"
      >
        Next Student
        <ArrowRight size={18} />
      </motion.button>

      <p className="text-[#848C9B]/50 text-xs">
        Press Enter to continue
      </p>
    </motion.div>
  );
}
