'use client';

import { useState, useCallback, useRef } from 'react';
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

  const handleVoteSuccess = useCallback(() => {
    setStage('success');
  }, []);

  const handleNextStudent = useCallback(() => {
    setResult(null);
    setSearchError(null);
    setStage('search');
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Register Vote</h1>
        <p className="text-[#848C9B] text-sm mt-1">
          Enter the student&apos;s ID, verify their identity, then cast their vote.
        </p>
      </div>

      <div className="glass border border-white/10 rounded-2xl p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {/* ── SEARCH STAGE ── */}
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

              {/* Search error */}
              {searchError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                >
                  <p className="text-red-400 text-sm font-medium">{searchError}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── DETAILS + VOTE STAGE ── */}
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
                <VoteForm student={result.student} onSuccess={handleVoteSuccess} />
              )}

              {/* If already voted — just show back button */}
              {result.hasVoted && (
                <button
                  onClick={handleNextStudent}
                  className="w-full py-3.5 rounded-xl border border-white/10 text-[#848C9B] hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                >
                  Search Another Student
                </button>
              )}
            </motion.div>
          )}

          {/* ── SUCCESS STAGE ── */}
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
                onNextStudent={handleNextStudent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {(['search', 'details', 'success'] as Stage[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              stage === s
                ? 'w-6 bg-[#91A9C9]'
                : i < (['search', 'details', 'success'] as Stage[]).indexOf(stage)
                ? 'w-4 bg-[#91A9C9]/40'
                : 'w-4 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
