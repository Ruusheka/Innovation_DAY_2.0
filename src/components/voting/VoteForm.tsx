'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Check, AlertCircle, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';

interface VoteFormProps {
  onSuccess: (studentName: string, projectName: string) => void;
}

const DEPARTMENTS_LIST = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

export function VoteForm({ onSuccess }: VoteFormProps) {
  // Step 1: Student ID Check
  const [studentId, setStudentId] = useState('');
  const [checkingId, setCheckingId] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  // Step 2: Student Information
  const [studentName, setStudentName] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('');
  const [idCardVerified, setIdCardVerified] = useState(false);

  // Step 3: Project Selection
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectDepartment, setProjectDepartment] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Step 4: Submission & Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const studentNameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus Student ID input on mount
  useEffect(() => {
    studentIdInputRef.current?.focus();
  }, []);

  // Fetch all active projects on mount
  useEffect(() => {
    setLoadingProjects(true);
    fetch('/api/public/projects')
      .then((r) => r.json())
      .then((json) => setAllProjects(json.data ?? []))
      .catch(() => toast.error('Failed to load exhibition projects.'))
      .finally(() => setLoadingProjects(false));
  }, []);

  // Filter projects by selected project department
  const filteredProjects = allProjects.filter((p: any) => {
    if (!projectDepartment) return false;
    const target = projectDepartment.trim().toUpperCase();
    const deptCode = (p.department?.code || p.departments?.code || '')?.toUpperCase();
    const deptName = (p.department?.name || p.departments?.name || '')?.toUpperCase();
    return deptCode === target || deptName === target || deptName.includes(target);
  });

  // Handle Check ID
  const handleCheckId = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = studentId.trim();
    if (!cleanId) {
      toast.error('Please enter a Student ID.');
      return;
    }
    if (!/^\d{6}$/.test(cleanId)) {
      toast.error('Student ID must be exactly 6 digits.');
      return;
    }

    setCheckingId(true);
    setCheckMessage('');
    setAlreadyVoted(false);
    setIdChecked(false);

    try {
      const res = await fetch(`/api/admin/votes/check?studentId=${encodeURIComponent(cleanId)}`);
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to check Student ID.');
        return;
      }

      setIdChecked(true);
      if (json.alreadyVoted) {
        setAlreadyVoted(true);
        setCheckMessage('This Student ID has already cast a vote.');
      } else {
        setAlreadyVoted(false);
        setCheckMessage('Student ID available');
        // Auto-focus student name field
        setTimeout(() => studentNameInputRef.current?.focus(), 100);
      }
    } catch {
      toast.error('Network error checking Student ID.');
    } finally {
      setCheckingId(false);
    }
  };

  // Reset form to initial ready state
  const handleReset = () => {
    setStudentId('');
    setIdChecked(false);
    setAlreadyVoted(false);
    setCheckMessage('');
    setStudentName('');
    setStudentDepartment('');
    setIdCardVerified(false);
    setProjectDepartment('');
    setSelectedProjectId('');
    setShowConfirmModal(false);
    studentIdInputRef.current?.focus();
  };

  // Open confirmation modal
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast.error('Please enter a Student ID.');
      return;
    }
    if (!/^\d{6}$/.test(studentId.trim())) {
      toast.error('Student ID must be exactly 6 digits.');
      return;
    }
    if (!idChecked || alreadyVoted) {
      toast.error('Please check that the Student ID is available.');
      return;
    }
    if (!studentName.trim()) {
      toast.error("Please enter the student's name.");
      return;
    }
    if (!studentDepartment) {
      toast.error("Please select the student's department.");
      return;
    }
    if (!idCardVerified) {
      toast.error('Please verify the physical college ID card.');
      return;
    }
    if (!projectDepartment) {
      toast.error('Please select a project department.');
      return;
    }
    if (!selectedProjectId) {
      toast.error('Please select a project to vote for.');
      return;
    }

    setShowConfirmModal(true);
  };

  // Submit vote to backend
  const handleExecuteVote = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId.trim(),
          studentName: studentName.trim(),
          studentDepartment: studentDepartment.trim(),
          projectDepartment: projectDepartment.trim(),
          projectUuid: selectedProjectId,
          idCardVerified: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 || json.code === 'ALREADY_VOTED') {
          setAlreadyVoted(true);
          setCheckMessage('This Student ID has already voted.');
          toast.error('This Student ID has already voted.');
        } else {
          toast.error(json.error ?? 'Unable to record the vote. Please try again.');
        }
        setShowConfirmModal(false);
        return;
      }

      const votedProject = allProjects.find((p) => p.id === selectedProjectId);
      toast.success('Vote Recorded Successfully');
      setShowConfirmModal(false);
      onSuccess(studentName.trim(), votedProject?.title ?? 'Exhibition Project');
      handleReset();
    } catch {
      toast.error('Unable to record the vote. Please check your network and try again.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProjectObj = allProjects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-8">
      {/* ── STEP 1: STUDENT ID VERIFICATION ── */}
      <div className="p-6 rounded-[20px] bg-white border border-[#D9E1EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-bold flex items-center justify-center font-sans">
              1
            </span>
            <h3 className="font-sans font-bold text-sm text-[#041128] uppercase tracking-wider">
              Student ID Verification
            </h3>
          </div>
          <span className="text-xs font-sans text-[#848C9B]">
            Operator visually inspects college ID card
          </span>
        </div>

        <form onSubmit={handleCheckId} className="flex gap-3">
          <div className="relative flex-1">
            <input
              ref={studentIdInputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={studentId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setStudentId(val);
                if (idChecked) {
                  setIdChecked(false);
                  setAlreadyVoted(false);
                  setCheckMessage('');
                }
              }}
              placeholder="Enter 6-digit Student ID (e.g. 123456)"
              disabled={checkingId || submitting}
              className="w-full input-clean font-mono text-base font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={!studentId.trim() || checkingId || submitting}
            className="btn-navy-pill !h-[48px] !px-6 !text-sm shrink-0"
          >
            {checkingId ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>CHECK ID</span>
            )}
          </button>
        </form>

        {/* Status Feedback for Step 1 */}
        {idChecked && alreadyVoted && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 animate-in fade-in duration-200">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Already Voted</div>
              <div className="text-xs text-amber-800 mt-0.5">
                {checkMessage || 'This Student ID has already cast a vote.'}
              </div>
            </div>
          </div>
        )}

        {idChecked && !alreadyVoted && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between text-green-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <span className="text-xs font-sans font-semibold">
                Student ID available ✓ Ready to collect details
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-green-900 px-2 py-0.5 bg-green-100/60 rounded">
              {studentId.trim()}
            </span>
          </div>
        )}
      </div>

      {/* ── STEP 2: STUDENT INFORMATION (Unlocked when ID is available) ── */}
      <div
        className={cn(
          'p-6 rounded-[20px] bg-white border border-[#D9E1EA] shadow-sm space-y-5 transition-opacity',
          !idChecked || alreadyVoted ? 'opacity-40 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-bold flex items-center justify-center font-sans">
            2
          </span>
          <h3 className="font-sans font-bold text-sm text-[#041128] uppercase tracking-wider">
            Student Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2">
              Student Full Name *
            </label>
            <input
              ref={studentNameInputRef}
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={!idChecked || alreadyVoted || submitting}
              className="input-clean text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2">
              Student Department *
            </label>
            <select
              value={studentDepartment}
              onChange={(e) => setStudentDepartment(e.target.value)}
              disabled={!idChecked || alreadyVoted || submitting}
              className="input-clean text-sm font-sans"
            >
              <option value="">Select Department ▼</option>
              {DEPARTMENTS_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Physical ID Card Checkbox Confirmation */}
        <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D9E1EA]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={idCardVerified}
                onChange={(e) => setIdCardVerified(e.target.checked)}
                disabled={!idChecked || alreadyVoted || submitting}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                  idCardVerified
                    ? 'bg-[#041128] border-[#041128]'
                    : 'border-[rgba(4,17,40,0.3)] bg-white'
                )}
              >
                {idCardVerified && <Check size={14} className="text-white stroke-[3]" />}
              </div>
            </div>
            <div>
              <div className="text-sm font-sans font-semibold text-[#041128] flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#5277A8]" />
                Physical College ID Card Verified
              </div>
              <div className="text-xs font-sans text-[#848C9B] mt-0.5">
                Admin operator confirms inspecting the student&apos;s physical ID card at the desk.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* ── STEP 3: PROJECT SELECTION ── */}
      <div
        className={cn(
          'p-6 rounded-[20px] bg-white border border-[#D9E1EA] shadow-sm space-y-5 transition-opacity',
          !idChecked || alreadyVoted || !idCardVerified
            ? 'opacity-40 pointer-events-none'
            : 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-bold flex items-center justify-center font-sans">
            3
          </span>
          <h3 className="font-sans font-bold text-sm text-[#041128] uppercase tracking-wider">
            Select Project
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project Department Selector */}
          <div>
            <label className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2">
              Project Department *
            </label>
            <select
              value={projectDepartment}
              onChange={(e) => {
                setProjectDepartment(e.target.value);
                setSelectedProjectId('');
              }}
              disabled={!idChecked || alreadyVoted || !idCardVerified || submitting}
              className="input-clean text-sm font-sans"
            >
              <option value="">Select Project Department ▼</option>
              {DEPARTMENTS_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selector (Filtered) */}
          <div>
            <label className="block text-xs font-sans font-semibold text-[#041128] uppercase tracking-wider mb-2">
              Project *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!projectDepartment || loadingProjects || submitting}
              className="input-clean text-sm font-sans"
            >
              <option value="">
                {loadingProjects
                  ? 'Loading projects...'
                  : !projectDepartment
                  ? 'Select department first'
                  : filteredProjects.length === 0
                  ? 'No active projects in department'
                  : 'Select Project ▼'}
              </option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_id} — {p.title} ({p.project_lead})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Project Card Preview */}
        {selectedProjectObj && (
          <div className="p-4 rounded-xl bg-[#EDF4FC] border border-[#91A9C9]/40 flex items-center justify-between text-xs font-sans">
            <div>
              <span className="font-mono font-bold text-[#041128] px-2 py-0.5 bg-white rounded shadow-2xs mr-2">
                {selectedProjectObj.project_id}
              </span>
              <span className="font-semibold text-[#041128] text-sm">
                {selectedProjectObj.title}
              </span>
              <span className="text-[#848C9B] ml-2">Lead: {selectedProjectObj.project_lead}</span>
            </div>
            <span className="font-bold text-[#5277A8] uppercase tracking-wider">
              {projectDepartment}
            </span>
          </div>
        )}

        {/* ── CAST VOTE BUTTON ── */}
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={
            !idChecked ||
            alreadyVoted ||
            !studentName.trim() ||
            !studentDepartment ||
            !idCardVerified ||
            !projectDepartment ||
            !selectedProjectId ||
            submitting
          }
          className="btn-navy-pill w-full !h-[54px] !text-sm !tracking-wider flex items-center justify-center gap-2"
        >
          <span>REVIEW & CAST VOTE</span>
          <ChevronRight size={17} />
        </button>
      </div>

      {/* ── STEP 4: CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#041128]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#D9E1EA] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display font-normal text-2xl sm:text-3xl text-[#041128] m-0">
              CONFIRM VOTE
            </h3>
            <p className="font-sans text-xs text-[#848C9B] mt-1.5 mb-6">
              Please review student identity and project choice before final submission:
            </p>

            <div className="space-y-3.5 bg-[#FAF9F5] p-5 rounded-2xl border border-[#D9E1EA] text-sm font-sans mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Student ID:</span>
                <span className="font-mono font-bold text-[#041128] text-base">{studentId.trim()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Student Name:</span>
                <span className="font-semibold text-[#041128]">{studentName.trim()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Student Department:</span>
                <span className="font-semibold text-[#041128]">{studentDepartment}</span>
              </div>

              <div className="border-t border-[rgba(4,17,40,0.06)] pt-3 flex justify-between items-start gap-4">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold shrink-0">Selected Project:</span>
                <span className="font-semibold text-[#041128] text-right truncate">
                  {selectedProjectObj?.project_id} — {selectedProjectObj?.title}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Project Department:</span>
                <span className="font-semibold text-[#5277A8]">{projectDepartment}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="btn-secondary-pill flex-1"
              >
                CANCEL
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
                    <span>Recording Vote...</span>
                  </>
                ) : (
                  <span>CONFIRM VOTE</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
