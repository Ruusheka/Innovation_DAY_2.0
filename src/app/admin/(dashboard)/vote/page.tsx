'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentSearch, type StudentInfo } from '@/components/voting/StudentSearch';
import { StudentDetails } from '@/components/voting/StudentDetails';
import { VoteForm } from '@/components/voting/VoteForm';
import { VoteSuccess } from '@/components/voting/VoteSuccess';

type Stage = 'search' | 'details' | 'success';

interface SearchResult {
  student: StudentInfo;
  hasVoted: boolean;
}

export default function AdminVotePage() {
  const [stage, setStage] = useState<Stage>('search');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [recordedProject, setRecordedProject] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchResult = useCallback(
    (data: { student: StudentInfo; hasVoted: boolean } | null, error: string | null) => {
      setSearchError(error);
      if (data) {
        setResult(data);
        setStage('details');
      }
    },
    []
  );

  const handleVoteSuccess = useCallback((_studentName: string, projectName: string) => {
    setRecordedProject(projectName);
    setStage('success');
  }, []);

  const handleNextStudent = useCallback(() => {
    setResult(null);
    setSearchError(null);
    setRecordedProject('');
    setStage('search');
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#041128] tracking-tight">
          CAST A VOTE
        </h1>
        <p className="text-[#41516B] text-base mt-1.5">
          Verify the student and record their project choice.
        </p>
      </div>

      {/* ── Main Operations Card ── */}
      <div className="bg-white rounded-[24px] border border-[rgba(4,17,40,0.08)] p-7 sm:p-10 shadow-[0_8px_30px_rgba(4,17,40,0.04)]">
        <AnimatePresence mode="wait">
          {/* ── 1. SEARCH STAGE ── */}
          {stage === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <StudentSearch
                onResult={handleSearchResult}
                loading={searchLoading}
                setLoading={setSearchLoading}
              />

              {searchError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                >
                  {searchError}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── 2. DETAILS & CAST VOTE STAGE ── */}
          {stage === 'details' && result && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <StudentDetails student={result.student} hasVoted={result.hasVoted} />

              {!result.hasVoted && (
                <VoteForm
                  student={result.student}
                  onSuccess={handleVoteSuccess}
                />
              )}

              {result.hasVoted && (
                <button
                  onClick={handleNextStudent}
                  className="w-full py-3.5 rounded-xl border border-[rgba(4,17,40,0.15)] text-[#041128] hover:bg-[#FAF9F5] text-sm font-semibold transition-all cursor-pointer"
                >
                  Search Another Student
                </button>
              )}
            </motion.div>
          )}

          {/* ── 3. SUCCESS STAGE ── */}
          {stage === 'success' && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <VoteSuccess
                studentName={result.student.name}
                projectName={recordedProject}
                onNextStudent={handleNextStudent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2.5 mt-6">
        {(['search', 'details', 'success'] as Stage[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              stage === s
                ? 'w-8 bg-[#041128]'
                : i < (['search', 'details', 'success'] as Stage[]).indexOf(stage)
                ? 'w-4 bg-[#91A9C9]'
                : 'w-4 bg-[rgba(4,17,40,0.1)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
