'use client';

import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, User, Building2, Hash } from 'lucide-react';
import type { StudentInfo } from './StudentSearch';

interface StudentDetailsProps {
  student: StudentInfo;
  hasVoted: boolean;
}

export function StudentDetails({ student, hasVoted }: StudentDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-xl border border-white/10 bg-[#041128]/60 overflow-hidden"
    >
      {/* Header status bar */}
      <div
        className={`px-5 py-3 flex items-center gap-2 text-sm font-medium ${
          hasVoted
            ? 'bg-amber-400/10 border-b border-amber-400/20 text-amber-400'
            : 'bg-[#91A9C9]/10 border-b border-[#91A9C9]/20 text-[#91A9C9]'
        }`}
      >
        {hasVoted ? (
          <>
            <AlertCircle size={15} />
            Student Found — Already Voted
          </>
        ) : (
          <>
            <CheckCircle2 size={15} />
            Student Verified ✓
          </>
        )}
      </div>

      {/* Details */}
      <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-widest mb-1">
            <Hash size={10} />
            Student ID
          </div>
          <div className="text-white font-mono font-medium text-base">
            {student.student_id}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-widest mb-1">
            <User size={10} />
            Name
          </div>
          <div className="text-white font-medium text-base">{student.name}</div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-widest mb-1">
            <Building2 size={10} />
            Department
          </div>
          <div className="text-white font-medium text-base">
            {student.departments?.code ?? '—'}
          </div>
        </div>
      </div>

      {/* Already voted warning */}
      {hasVoted && (
        <div className="mx-5 mb-5 px-4 py-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
          <p className="text-amber-400 text-sm font-medium">
            ⚠ THIS STUDENT HAS ALREADY VOTED.
          </p>
          <p className="text-amber-400/70 text-xs mt-1">
            Please verify the student ID with their ID card and contact a supervisor if needed.
          </p>
        </div>
      )}
    </motion.div>
  );
}
