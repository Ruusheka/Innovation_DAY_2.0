'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';
import type { StudentInfo } from './StudentSearch';

interface VoteFormProps {
  student: StudentInfo;
  onSuccess: () => void;
}

export function VoteForm({ student, onSuccess }: VoteFormProps) {
  const [idCardVerified, setIdCardVerified] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load departments on mount
  useEffect(() => {
    fetch('/api/public/departments')
      .then((r) => r.json())
      .then((json) => setDepartments(json.data ?? []))
      .catch(() => toast.error('Failed to load departments.'))
      .finally(() => setLoadingDepts(false));
  }, []);

  // Load projects when department changes
  useEffect(() => {
    if (!selectedDeptId) {
      setProjects([]);
      setSelectedProjectId('');
      return;
    }
    setLoadingProjects(true);
    setSelectedProjectId('');
    fetch(`/api/public/projects?department=${selectedDeptId}`)
      .then((r) => r.json())
      .then((json) => setProjects(json.data ?? []))
      .catch(() => toast.error('Failed to load projects.'))
      .finally(() => setLoadingProjects(false));
  }, [selectedDeptId]);

  const canSubmit =
    idCardVerified &&
    selectedDeptId &&
    selectedProjectId &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.student_id,
          projectUuid: selectedProjectId,
          departmentUuid: selectedDeptId,
          idCardVerified: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('THIS STUDENT HAS ALREADY VOTED.', {
            description: 'The vote was rejected by the system.',
          });
        } else {
          toast.error(json.error ?? 'Failed to record vote.');
        }
        return;
      }

      toast.success('Vote recorded successfully.');
      onSuccess();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ID Card Verification */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#041128]/40">
        <p className="text-[#848C9B] text-xs uppercase tracking-widest font-medium mb-4">
          ID Card Verification
        </p>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={idCardVerified}
              onChange={(e) => setIdCardVerified(e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                idCardVerified
                  ? 'bg-[#91A9C9] border-[#91A9C9]'
                  : 'border-white/20 bg-transparent group-hover:border-[#91A9C9]/50'
              )}
            >
              {idCardVerified && (
                <svg
                  viewBox="0 0 12 10"
                  className="w-3 h-3 fill-none stroke-[#040411] stroke-2"
                >
                  <polyline points="1 5 4.5 8.5 11 1" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <div className="text-white text-sm font-medium">
              I have verified the student&apos;s physical college ID card.
            </div>
            <div className="text-[#848C9B] text-xs mt-1">
              Student ID: <span className="font-mono text-[#B2B4AB]">{student.student_id}</span>
              {' — '}Name: <span className="text-[#B2B4AB]">{student.name}</span>
            </div>
          </div>
        </label>
      </div>

      {/* Department + Project Selectors */}
      <div className="space-y-4">
        {/* Department */}
        <div>
          <label
            htmlFor="dept-select"
            className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-2"
          >
            Vote For Department
          </label>
          <select
            id="dept-select"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            disabled={loadingDepts || !idCardVerified}
            className={cn(
              'input-base',
              (!idCardVerified || loadingDepts) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <option value="">
              {loadingDepts ? 'Loading departments...' : 'Select Department'}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div>
          <label
            htmlFor="project-select"
            className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-2"
          >
            Project
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={!selectedDeptId || loadingProjects || !idCardVerified}
            className={cn(
              'input-base',
              (!selectedDeptId || !idCardVerified) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <option value="">
              {loadingProjects
                ? 'Loading projects...'
                : !selectedDeptId
                ? 'Select a department first'
                : projects.length === 0
                ? 'No active projects in this department'
                : 'Select Project'}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_id} — {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          'w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all',
          'bg-[#91A9C9] text-[#040411]',
          canSubmit ? 'hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-[#91A9C9]/20' : 'opacity-30 cursor-not-allowed'
        )}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Recording Vote...
          </>
        ) : (
          'Cast Vote'
        )}
      </button>

      {!idCardVerified && (
        <p className="text-center text-[#848C9B]/60 text-xs">
          Verify the ID card above to enable voting.
        </p>
      )}
    </form>
  );
}
