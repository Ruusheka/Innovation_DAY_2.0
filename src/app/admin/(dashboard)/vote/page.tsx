'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VoteForm } from '@/components/voting/VoteForm';
import { VoteSuccess } from '@/components/voting/VoteSuccess';

export default function AdminVotePage() {
  const [successData, setSuccessData] = useState<{ studentName: string; projectName: string } | null>(null);

  const handleVoteSuccess = (studentName: string, projectName: string) => {
    setSuccessData({ studentName, projectName });
  };

  const handleNextStudent = () => {
    setSuccessData(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-normal text-[#041128] tracking-tight m-0">
          CAST A VOTE
        </h1>
        <p className="font-sans text-[#41516B] text-base mt-2">
          Verify the student&apos;s physical college ID card and record their project choice.
        </p>
      </div>

      {/* ── Main Operations Card ── */}
      <AnimatePresence mode="wait">
        {successData ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[24px] border border-[#D9E1EA] p-7 sm:p-10 shadow-sm"
          >
            <VoteSuccess
              studentName={successData.studentName}
              projectName={successData.projectName}
              onNextStudent={handleNextStudent}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <VoteForm onSuccess={handleVoteSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
