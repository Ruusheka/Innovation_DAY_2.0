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

// Mirrors the student_registry table schema
export interface StudentInfo {
  digital_id: string;
  name: string;
  batch: string;
  degree: string;
  dept: string;
  email: string | null;
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
      const res  = await fetch(`/api/admin/students/${encodeURIComponent(id)}`);
      const json = await res.json();

      if (!res.ok) {
        onResult(null, json.error ?? 'Student not found.');
        return;
      }

      // New API shape: { found, alreadyVoted, student?, message? }
      if (!json.found) {
        onResult(null, json.message ?? 'Digital ID not found in the official student registry.');
        return;
      }

      // Return student + hasVoted in the legacy shape this component's callers expect
      onResult(
        {
          student: json.student as StudentInfo,
          hasVoted: json.alreadyVoted ?? false,
        },
        null
      );
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
        Student Digital ID
      </label>
      <div className="flex gap-3">
        <input
          id="student-id-input"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 20))}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 3122245001127"
          disabled={disabled || loading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            'flex-1 input-clean font-mono text-lg font-medium',
            (disabled || loading) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Enter student Digital ID"
        />
        <button
          onClick={handleSearch}
          disabled={!studentId.trim() || loading || disabled}
          className="px-7 py-3 rounded-xl bg-[#041128] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#112244] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-sm"
          aria-label="Search student registry"
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
        Press{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[rgba(4,17,40,0.15)] text-[#041128] font-mono">
          Enter
        </kbd>{' '}
        to search the official student registry
      </p>
    </div>
  );
}
