'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StudentSearchProps {
  onResult: (data: { student: StudentInfo; hasVoted: boolean } | null, error: string | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  disabled?: boolean;
}

interface StudentInfo {
  id: string;
  student_id: string;
  name: string;
  is_active: boolean;
  department_id: string | null;
  departments: { id: string; name: string; code: string } | null;
}

export function StudentSearch({ onResult, loading, setLoading, disabled }: StudentSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [studentId, setStudentId] = useState('');

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    const id = studentId.trim();
    if (!id) return;

    setLoading(true);
    onResult(null, null);

    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(id)}`);
      const json = await res.json();

      if (!res.ok) {
        onResult(null, json.error ?? 'Student not found.');
      } else {
        onResult(json.data, null);
      }
    } catch {
      onResult(null, 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [studentId, onResult, setLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="student-id-input"
          className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-2"
        >
          Student ID
        </label>
        <div className="flex gap-3">
          <input
            id="student-id-input"
            ref={inputRef}
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 3122245001127"
            disabled={disabled || loading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className={cn(
              'flex-1 input-base text-white font-mono text-lg',
              (disabled || loading) && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Enter student ID"
          />
          <button
            onClick={handleSearch}
            disabled={!studentId.trim() || loading || disabled}
            className={cn(
              'px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all',
              'bg-[#91A9C9] text-[#040411] hover:opacity-90',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            aria-label="Search student"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-[#848C9B]/60 text-xs">
          Press Enter or click Search
        </p>
      </div>
    </div>
  );
}

// Export the type for use by parent
export type { StudentInfo };
