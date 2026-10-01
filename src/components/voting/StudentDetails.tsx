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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-[18px] border border-[rgba(4,17,40,0.08)] bg-[#FAF9F5] overflow-hidden"
    >
      {/* Header status bar */}
      <div
        className={`px-6 py-3.5 flex items-center gap-2 text-sm font-semibold ${
          hasVoted
            ? 'bg-amber-50 border-b border-amber-200 text-amber-800'
            : 'bg-[#E8EFF7] border-b border-[#91A9C9]/50 text-[#041128]'
        }`}
      >
        {hasVoted ? (
          <>
            <AlertCircle size={17} className="text-amber-600" />
            <span>Student Record Found — Already Voted</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={17} className="text-[#2E7D32]" />
            <span>STUDENT VERIFIED ✓</span>
          </>
        )}
      </div>

      {/* Details Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-wider font-semibold mb-1">
            <Hash size={12} />
            Student ID
          </div>
          <div className="text-[#041128] font-mono font-bold text-base">
            {student.student_id}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-wider font-semibold mb-1">
            <User size={12} />
            Name
          </div>
          <div className="text-[#041128] font-semibold text-base">
            {student.name}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[#848C9B] text-xs uppercase tracking-wider font-semibold mb-1">
            <Building2 size={12} />
            Department
          </div>
          <div className="text-[#041128] font-semibold text-base">
            {student.departments?.name ?? student.departments?.code ?? '—'}
          </div>
        </div>
      </div>

      {/* Already voted warning message */}
      {hasVoted && (
        <div className="mx-6 mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-900 text-sm font-bold">
            ⚠ THIS STUDENT HAS ALREADY VOTED.
          </p>
          <p className="text-amber-800 text-xs mt-1">
            One student is permitted to cast exactly one vote. Please verify the physical ID card.
          </p>
        </div>
      )}
    </motion.div>
  );
}
