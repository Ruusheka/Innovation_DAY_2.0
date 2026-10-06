'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  XCircle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn';
import type { Department, Project } from '@/types';

// Matches student_registry table schema exactly
interface VerifiedStudent {
  digital_id: string; // TEXT PRIMARY KEY — the canonical identifier
  name: string;
  batch: string;
  degree: string;
  dept: string;       // e.g. "CSE", "ECE" — plain text, not FK
  email: string | null;
}

type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found' | 'already_voted' | 'error';

interface VoteFormProps {
  onSuccess: (studentName: string, projectName: string) => void;
}

export function VoteForm({ onSuccess }: VoteFormProps) {
  // ── Digital ID input ───────────────────────────────────────
  const [digitalId, setDigitalId]       = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [lookupMessage, setLookupMessage] = useState('');

  // ── Verified student (from student_registry) ───────────────
  const [verifiedStudent, setVerifiedStudent] = useState<VerifiedStudent | null>(null);

  // ── Editable name/email (operator may correct, but Digital ID stays locked) ──
  const [displayName, setDisplayName]   = useState('');
  const [displayEmail, setDisplayEmail] = useState('');

  // ── Physical ID card confirmation ──────────────────────────
  const [idCardVerified, setIdCardVerified] = useState(false);

  // ── Project selection ──────────────────────────────────────
  const [allProjects, setAllProjects]         = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectDepartment, setProjectDepartment] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // ── Departments from DB (for project filtering) ────────────
  const [dbDepartments, setDbDepartments] = useState<Department[]>([]);

  // ── Submission state ───────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting]             = useState(false);

  const digitalIdInputRef = useRef<HTMLInputElement>(null);
  const debounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus Digital ID field on mount
  useEffect(() => {
    digitalIdInputRef.current?.focus();
  }, []);

  // Load projects & departments once on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/public/projects').then((r) => r.json()),
      fetch('/api/public/departments').then((r) => r.json()),
    ])
      .then(([projectsJson, deptsJson]) => {
        if (!isMounted) return;
        setAllProjects(projectsJson.data ?? []);
        setDbDepartments(deptsJson.data ?? []);
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load exhibition data.');
      })
      .finally(() => {
        if (isMounted) setLoadingProjects(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Unique department codes for project-department dropdown
  const availableDepts = Array.from(
    new Set([
      ...dbDepartments.map((d) => (d.code || '').trim().toUpperCase()),
      ...allProjects
        .map((p) => (p.department?.code || (p as any).departments?.code || '').trim().toUpperCase())
        .filter(Boolean),
    ])
  ).filter(Boolean).sort();

  // Projects filtered by the chosen project department
  const filteredProjects = allProjects.filter((p) => {
    if (!projectDepartment) return false;
    const target      = projectDepartment.trim().toUpperCase();
    const deptCode    = (p.department?.code || (p as any).departments?.code || '').trim().toUpperCase();
    const deptId      = p.department_id || p.department?.id || (p as any).departments?.id;
    const matchedDept = dbDepartments.find((d) => d.code.toUpperCase() === target);
    return deptCode === target || (matchedDept && deptId === matchedDept.id);
  });

  // ── Student lookup (hits student_registry via API) ─────────
  const performLookup = useCallback(async (id: string) => {
    const cleanId = id.trim();
    if (!cleanId || !/^\d{7,20}$/.test(cleanId)) return;

    setLookupStatus('searching');
    setLookupMessage('');
    setVerifiedStudent(null);
    setDisplayName('');
    setDisplayEmail('');
    setIdCardVerified(false);
    setProjectDepartment('');
    setSelectedProjectId('');

    try {
      const res  = await fetch(`/api/admin/students/${encodeURIComponent(cleanId)}`);
      const json = await res.json();

      if (!res.ok) {
        setLookupStatus('error');
        setLookupMessage(json.error ?? 'Unable to verify Digital ID.');
        return;
      }

      if (!json.found) {
        setLookupStatus('not_found');
        setLookupMessage(
          json.message ?? 'Digital ID not found. Please verify the student\'s Digital ID.'
        );
        return;
      }

      if (json.alreadyVoted) {
        setLookupStatus('already_voted');
        setLookupMessage('This student has already cast a vote.');
        return;
      }

      // Found and eligible — auto-populate from student_registry
      const s: VerifiedStudent = json.student;
      setVerifiedStudent(s);
      setDisplayName(s.name);
      setDisplayEmail(s.email ?? '');
      setLookupStatus('found');
      setLookupMessage('');
    } catch {
      setLookupStatus('error');
      setLookupMessage('Network error. Please try again.');
    }
  }, []);

  // Debounced lookup on every keystroke (300 ms)
  const handleDigitalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 20);
    setDigitalId(val);

    // Immediately invalidate previous verification when ID changes
    if (verifiedStudent || lookupStatus !== 'idle') {
      setVerifiedStudent(null);
      setDisplayName('');
      setDisplayEmail('');
      setIdCardVerified(false);
      setProjectDepartment('');
      setSelectedProjectId('');
      setLookupStatus('idle');
      setLookupMessage('');
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length >= 7) {
      debounceRef.current = setTimeout(() => performLookup(val), 300);
    }
  };

  // Lookup on Enter / button click
  const handleLookupSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performLookup(digitalId);
  };

  // Full form reset (after successful vote or manual clear)
  const handleReset = () => {
    setDigitalId('');
    setLookupStatus('idle');
    setLookupMessage('');
    setVerifiedStudent(null);
    setDisplayName('');
    setDisplayEmail('');
    setIdCardVerified(false);
    setProjectDepartment('');
    setSelectedProjectId('');
    setShowConfirmModal(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    digitalIdInputRef.current?.focus();
  };

  // Open confirmation modal — all guards checked here too
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedStudent || lookupStatus !== 'found') {
      toast.error('Please verify the Digital ID first.');
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

  // Submit vote — server re-validates everything from student_registry
  const handleExecuteVote = async () => {
    if (submitting || !verifiedStudent) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId:     verifiedStudent.digital_id, // Digital ID — server re-validates
          projectUuid:   selectedProjectId,
          idCardVerified: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 || json.code === 'ALREADY_VOTED') {
          setLookupStatus('already_voted');
          setLookupMessage('This student has already cast a vote.');
          setVerifiedStudent(null);
          toast.error('This student has already cast a vote.');
        } else if (json.code === 'STUDENT_NOT_FOUND') {
          setLookupStatus('not_found');
          setLookupMessage('Digital ID not found. Please re-verify.');
          setVerifiedStudent(null);
          toast.error('Digital ID verification failed. Please re-lookup.');
        } else {
          toast.error(json.error ?? 'Unable to record the vote. Please try again.');
        }
        setShowConfirmModal(false);
        return;
      }

      const votedProject = allProjects.find((p) => p.id === selectedProjectId);
      toast.success('Vote Recorded Successfully');
      setShowConfirmModal(false);
      onSuccess(
        displayName.trim() || verifiedStudent.name,
        votedProject?.title ?? 'Exhibition Project'
      );
      handleReset();
    } catch {
      toast.error('Unable to record the vote. Please check your network and try again.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProjectObj = allProjects.find((p) => p.id === selectedProjectId);
  const isEligible  = lookupStatus === 'found' && !!verifiedStudent;
  const isSearching = lookupStatus === 'searching';

  return (
    <div className="space-y-8 font-primary">

      {/* ── STEP 1: DIGITAL ID VERIFICATION ── */}
      <div className="p-7 rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-normal flex items-center justify-center font-primary">
              1
            </span>
            <h3 className="font-primary text-sm text-[#041128] uppercase tracking-wider font-normal">
              Digital ID Verification
            </h3>
          </div>
          <span className="text-xs font-primary text-[#5277A8]">
            Operator visually inspects college ID card
          </span>
        </div>

        <form onSubmit={handleLookupSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              ref={digitalIdInputRef}
              type="text"
              inputMode="numeric"
              maxLength={20}
              value={digitalId}
              onChange={handleDigitalIdChange}
              placeholder="Enter Digital ID (e.g. 23XXXXXXXX)"
              disabled={isSearching || submitting}
              className="w-full input-clean font-mono text-base font-semibold"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={!digitalId.trim() || isSearching || submitting}
            className="btn-navy-pill !h-[48px] !px-6 !text-sm shrink-0"
          >
            {isSearching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>VERIFY</span>
              </>
            )}
          </button>
        </form>

        {/* Status feedback */}
        {lookupStatus === 'searching' && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-blue-800 animate-in fade-in duration-200">
            <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />
            <span className="text-xs font-semibold">Verifying Digital ID against student registry...</span>
          </div>
        )}

        {lookupStatus === 'found' && verifiedStudent && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between text-green-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">✓ Student verified in official registry</span>
                <span className="text-xs text-green-700">
                  {verifiedStudent.name} · {verifiedStudent.dept} · {verifiedStudent.degree} · Batch {verifiedStudent.batch}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-green-900 px-2 py-0.5 bg-green-100/60 rounded">
              {verifiedStudent.digital_id}
            </span>
          </div>
        )}

        {lookupStatus === 'not_found' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 animate-in fade-in duration-200">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Digital ID Not Found</div>
              <div className="text-xs text-red-800 mt-0.5">
                {lookupMessage || 'This Digital ID is not in the official student registry. Please verify the ID.'}
              </div>
            </div>
          </div>
        )}

        {lookupStatus === 'already_voted' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 animate-in fade-in duration-200">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Already Voted</div>
              <div className="text-xs text-amber-800 mt-0.5">
                This student has already cast a vote. One Digital ID = One Vote.
              </div>
            </div>
          </div>
        )}

        {lookupStatus === 'error' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 animate-in fade-in duration-200">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Verification Error</div>
              <div className="text-xs text-red-800 mt-0.5">
                {lookupMessage || 'Unable to verify Digital ID. Please try again.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 2: STUDENT INFORMATION (auto-populated, Digital ID locked) ── */}
      <div
        className={cn(
          'p-7 rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)] space-y-5 transition-opacity',
          !isEligible ? 'opacity-40 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-normal flex items-center justify-center font-primary">
            2
          </span>
          <h3 className="font-primary text-sm text-[#041128] uppercase tracking-wider font-normal">
            Student Information
          </h3>
          {isEligible && (
            <span className="ml-auto text-xs text-green-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> Auto-populated from official registry
            </span>
          )}
        </div>

        {/* Row 1: Digital ID (locked) + Dept (locked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Digital ID <span className="text-[#5277A8] normal-case">(verified — locked)</span>
            </label>
            <input
              type="text"
              value={verifiedStudent?.digital_id ?? '—'}
              readOnly
              disabled
              className="input-clean font-mono text-sm bg-[#F0F4FA] text-[#5277A8] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Department <span className="text-[#5277A8] normal-case">(from registry)</span>
            </label>
            <input
              type="text"
              value={verifiedStudent?.dept ?? '—'}
              readOnly
              disabled
              className="input-clean text-sm bg-[#F0F4FA] text-[#5277A8] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row 2: Batch (locked) + Degree (locked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Batch <span className="text-[#5277A8] normal-case">(from registry)</span>
            </label>
            <input
              type="text"
              value={verifiedStudent?.batch ?? '—'}
              readOnly
              disabled
              className="input-clean text-sm bg-[#F0F4FA] text-[#5277A8] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Degree <span className="text-[#5277A8] normal-case">(from registry)</span>
            </label>
            <input
              type="text"
              value={verifiedStudent?.degree ?? '—'}
              readOnly
              disabled
              className="input-clean text-sm bg-[#F0F4FA] text-[#5277A8] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row 3: Name (editable) + Email (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Student Full Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Auto-populated from registry"
              disabled={!isEligible || submitting}
              className="input-clean text-sm font-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Email <span className="text-[#848C9B] normal-case font-light">(optional)</span>
            </label>
            <input
              type="email"
              value={displayEmail}
              onChange={(e) => setDisplayEmail(e.target.value)}
              placeholder="Not in registry"
              disabled={!isEligible || submitting}
              className="input-clean text-sm font-primary"
            />
          </div>
        </div>

        {/* Physical ID Card Checkbox */}
        <div className="p-4 rounded-2xl bg-white/60 border border-[#D9E1EA]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={idCardVerified}
                onChange={(e) => setIdCardVerified(e.target.checked)}
                disabled={!isEligible || submitting}
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
              <div className="text-sm font-primary font-normal text-[#041128] flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#5277A8]" />
                Physical College ID Card Verified
              </div>
              <div className="text-xs font-primary text-[#848C9B] mt-0.5">
                Admin operator confirms inspecting the student&apos;s physical ID card at the desk.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* ── STEP 3: PROJECT SELECTION ── */}
      <div
        className={cn(
          'p-7 rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)] space-y-5 transition-opacity',
          !isEligible || !idCardVerified ? 'opacity-40 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#041128] text-white text-xs font-normal flex items-center justify-center font-primary">
            3
          </span>
          <h3 className="font-primary text-sm text-[#041128] uppercase tracking-wider font-normal">
            Select Project
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Project Department *
            </label>
            <select
              value={projectDepartment}
              onChange={(e) => {
                setProjectDepartment(e.target.value);
                setSelectedProjectId('');
              }}
              disabled={!isEligible || !idCardVerified || submitting}
              className="input-clean text-sm font-primary"
            >
              <option value="">Select Project Department ▼</option>
              {availableDepts.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-primary font-normal text-[#041128] uppercase tracking-wider mb-2">
              Project *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!projectDepartment || loadingProjects || submitting}
              className="input-clean text-sm font-primary"
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

        {/* Selected project preview */}
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

        {/* Cast Vote Button */}
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={
            !isEligible ||
            !idCardVerified ||
            !projectDepartment ||
            !selectedProjectId ||
            submitting
          }
          className="btn-navy-pill w-full !h-[54px] !text-sm !tracking-wider flex items-center justify-center gap-2"
        >
          <span>REVIEW &amp; CAST VOTE</span>
          <ChevronRight size={17} />
        </button>
      </div>

      {/* ── STEP 4: CONFIRMATION MODAL ── */}
      {showConfirmModal && verifiedStudent && (
        <div className="fixed inset-0 z-50 bg-[#041128]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-[24px] rounded-[26px] max-w-md w-full p-6 sm:p-8 shadow-[0_24px_60px_rgba(4,17,40,0.18)] border border-white/90 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-primary font-normal text-2xl sm:text-3xl text-[#041128] m-0">
              CONFIRM VOTE
            </h3>
            <p className="text-xs text-[#848C9B] mt-1.5 mb-6">
              Please review the verified student identity and project:
            </p>

            <div className="space-y-3.5 bg-[#FAF9F5] p-5 rounded-2xl border border-[#D9E1EA] text-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Digital ID:</span>
                <span className="font-bold text-[#041128] text-base font-mono">
                  {verifiedStudent.digital_id}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Name:</span>
                <span className="font-semibold text-[#041128]">{displayName || verifiedStudent.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Department:</span>
                <span className="font-semibold text-[#041128]">{verifiedStudent.dept}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">Degree / Batch:</span>
                <span className="font-semibold text-[#041128]">
                  {verifiedStudent.degree} · Batch {verifiedStudent.batch}
                </span>
              </div>

              <div className="border-t border-[rgba(4,17,40,0.06)] pt-3 flex justify-between items-start gap-4">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold shrink-0">
                  Selected Project:
                </span>
                <span className="font-semibold text-[#041128] text-right truncate">
                  {selectedProjectObj?.project_id} — {selectedProjectObj?.title}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848C9B] text-xs uppercase tracking-wider font-semibold">
                  Project Dept:
                </span>
                <span className="font-semibold text-[#5277A8]">{projectDepartment}</span>
              </div>
            </div>

            <p className="text-xs text-[#5277A8] mb-5 font-semibold text-center">
              ⚠ This vote cannot be undone. One Digital ID = One Vote.
            </p>

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
