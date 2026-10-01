'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';
import type { StudentInfo } from './StudentSearch';

interface VoteFormProps {
  student: StudentInfo;
  onSuccess: (studentName: string, projectName: string) => void;
}

const VALID_DEPT_CODES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export function VoteForm({ student, onSuccess }: VoteFormProps) {
  const [idCardVerified, setIdCardVerified] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load departments on mount and filter to the 5 valid departments
  useEffect(() => {
    fetch('/api/public/departments')
      .then((r) => r.json())
      .then((json) => {
        const allDepts = (json.data ?? []) as Department[];
        setDepartments(allDepts.filter((d) => VALID_DEPT_CODES.includes(d.code.toUpperCase())));
      })
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

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowConfirmModal(true);
  };

  const handleExecuteVote = async () => {
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
            description: `Student ID ${student.student_id} has already cast a vote.`,
          });
        } else {
          toast.error(json.error ?? 'Failed to record vote.');
        }
        setShowConfirmModal(false);
        return;
      }

      const selectedProj = projects.find((p) => p.id === selectedProjectId);
      toast.success('Vote recorded successfully.');
      setShowConfirmModal(false);
      onSuccess(student.name, selectedProj?.title ?? 'Project');
    } catch {
      toast.error('Network error. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDept = departments.find((d) => d.id === selectedDeptId);
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <>
      <form onSubmit={handleOpenConfirm} className="space-y-6">
        {/* ── 1. ID CARD VERIFICATION ── */}
        <div className="p-5 rounded-[18px] border border-[#D9E1EA] bg-white shadow-sm">
          <div className="text-xs font-sans font-semibold uppercase tracking-wider text-[#041128] mb-3">
            Physical ID Card Verification
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
              <div className="text-sm font-sans font-semibold text-[#041128]">
                I have verified the student&apos;s physical college ID card.
              </div>
              <div className="text-xs font-sans text-[#848C9B] mt-0.5">
                Admin confirms physical inspection of ID for Roll No:{' '}
                <span className="font-mono text-[#041128] font-bold">{student.student_id}</span>
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
              className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2"
            >
              Vote For Department
            </label>
            <select
              id="dept-select"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              disabled={loadingDepts || !idCardVerified}
              className={cn(
                'input-clean text-sm font-sans font-medium',
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
              className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2"
            >
              Select Project
            </label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!selectedDeptId || loadingProjects || !idCardVerified}
              className={cn(
                'input-clean text-sm font-sans font-medium',
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
            'w-full h-14 rounded-full font-sans font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-md',
            'bg-[#041128] text-white',
            canSubmit
              ? 'hover:bg-[#0b1e42] hover:shadow-lg cursor-pointer'
              : 'opacity-35 cursor-not-allowed'
          )}
        >
          <span>CAST VOTE</span>
        </button>

        {!idCardVerified && (
          <p className="text-center font-sans text-[#848C9B] text-xs">
            Verify student&apos;s physical ID card above to unlock voting controls.
          </p>
        )}
      </form>

      {/* ── 4. CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#041128]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#D9E1EA] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display font-normal text-2xl text-[#041128]">
              Confirm Vote Submission
            </h3>
            <p className="font-sans text-xs text-[#848C9B] mt-1 mb-5">
              Please verify all details carefully before casting this vote:
            </p>

            <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-[#D9E1EA] text-sm font-sans mb-6">
              <div className="flex justify-between">
                <span className="text-[#848C9B]">Student Name:</span>
                <span className="font-semibold text-[#041128]">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848C9B]">Student ID:</span>
                <span className="font-mono font-bold text-[#041128]">{student.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848C9B]">Department:</span>
                <span className="font-semibold text-[#041128]">{currentDept?.code} — {currentDept?.name}</span>
              </div>
              <div className="flex justify-between border-t border-[rgba(4,17,40,0.06)] pt-2">
                <span className="text-[#848C9B]">Project Choice:</span>
                <span className="font-semibold text-[#041128] text-right truncate max-w-[200px]">
                  {currentProject?.project_id} — {currentProject?.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="btn-secondary-pill flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteVote}
                disabled={submitting}
                className="btn-navy-pill flex-1 !h-[48px] !text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <span>Confirm Vote</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
