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

  // Auto-focus on mount for registration desk speed
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
    <div className="space-y-3">
      <label
        htmlFor="student-id-input"
        className="block text-xs font-semibold text-[#041128] uppercase tracking-wider"
      >
        Student Roll Number / ID
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
            'flex-1 input-clean font-mono text-lg font-medium',
            (disabled || loading) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Enter student ID"
        />
        <button
          onClick={handleSearch}
          disabled={!studentId.trim() || loading || disabled}
          className="px-7 py-3 rounded-xl bg-[#041128] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#112244] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-sm"
          aria-label="Search student"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-[#848C9B]">
        Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[rgba(4,17,40,0.15)] text-[#041128] font-mono">Enter</kbd> to search student registry
      </p>
    </div>
  );
}

export type { StudentInfo };
