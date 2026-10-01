'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';
import type { StudentInfo } from './StudentSearch';

interface VoteFormProps {
  student: StudentInfo;
  onSuccess: (studentName: string, projectName: string) => void;
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
            description: 'The database rejected the duplicate submission.',
          });
        } else {
          toast.error(json.error ?? 'Failed to record vote.');
        }
        return;
      }

      const selectedProj = projects.find((p) => p.id === selectedProjectId);
      toast.success('Vote recorded successfully.');
      onSuccess(student.name, selectedProj?.title ?? 'Project');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. ID CARD VERIFICATION ── */}
      <div className="p-5 rounded-[16px] border border-[rgba(4,17,40,0.1)] bg-[#FFFFFF]">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#041128] mb-3">
          ID Card Verification
        </div>
        <label className="flex items-start gap-3.5 cursor-pointer group select-none">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={idCardVerified}
              onChange={(e) => setIdCardVerified(e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                idCardVerified
                  ? 'bg-[#041128] border-[#041128]'
                  : 'border-[rgba(4,17,40,0.3)] bg-white group-hover:border-[#041128]'
              )}
            >
              {idCardVerified && <Check size={14} className="text-white stroke-[3]" />}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#041128]">
              I have verified the student&apos;s physical college ID card.
            </div>
            <div className="text-xs text-[#848C9B] mt-0.5">
              Confirming student identity for Roll No: <span className="font-mono text-[#041128] font-medium">{student.student_id}</span>
            </div>
          </div>
        </label>
      </div>

      {/* ── 2. DEPARTMENT & PROJECT SELECTORS ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Department */}
        <div>
          <label
            htmlFor="dept-select"
            className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-2"
          >
            Vote For Department
          </label>
          <select
            id="dept-select"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            disabled={loadingDepts || !idCardVerified}
            className={cn(
              'input-clean text-sm font-medium',
              (!idCardVerified || loadingDepts) && 'opacity-50 cursor-not-allowed bg-slate-50'
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
            className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-2"
          >
            Select Project
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={!selectedDeptId || loadingProjects || !idCardVerified}
            className={cn(
              'input-clean text-sm font-medium',
              (!selectedDeptId || !idCardVerified) && 'opacity-50 cursor-not-allowed bg-slate-50'
            )}
          >
            <option value="">
              {loadingProjects
                ? 'Loading projects...'
                : !selectedDeptId
                ? 'Select department first'
                : projects.length === 0
                ? 'No active projects in department'
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

      {/* ── 3. CAST VOTE CTA ── */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          'w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md',
          'bg-[#041128] text-white',
          canSubmit
            ? 'hover:bg-[#112244] hover:shadow-lg cursor-pointer'
            : 'opacity-35 cursor-not-allowed'
        )}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>RECORDING VOTE...</span>
          </>
        ) : (
          <span>CAST VOTE</span>
        )}
      </button>

      {!idCardVerified && (
        <p className="text-center text-[#848C9B] text-xs">
          Verify physical ID card above to unlock voting controls.
        </p>
      )}
    </form>
  );
}
