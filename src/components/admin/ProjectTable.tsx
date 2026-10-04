'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Plus, Search, Edit2, Power, Trash2, Loader2, X, Upload, ImageIcon, Users, UserCheck, Tag, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { projectSchema, type ProjectSchemaInput } from '@/lib/validations/project';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import { cn } from '@/lib/utils/cn';
import type { Project, Department } from '@/types';

interface ProjectTableProps {
  departments: Department[];
}

type ProjectWithDept = Project & { departments: Department | null };

export function ProjectTable({ departments }: ProjectTableProps) {
  const [projects, setProjects] = useState<ProjectWithDept[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<ProjectWithDept | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ProjectWithDept | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithDept | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/projects');
      const json = await res.json();
      setProjects(json.data ?? []);
    } catch {
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.project_id.toLowerCase().includes(search.toLowerCase()) ||
      p.project_lead.toLowerCase().includes(search.toLowerCase()) ||
      (p.project_supervisor && p.project_supervisor.toLowerCase().includes(search.toLowerCase())) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) ||
      (p.team_members && p.team_members.some((m) => m.toLowerCase().includes(search.toLowerCase())));
    const matchDept = !filterDept || p.department_id === filterDept;
    return matchSearch && matchDept;
  });

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${deactivateTarget.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !deactivateTarget.is_active }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? 'Failed to update status.');
        return;
      }
      toast.success(
        deactivateTarget.is_active
          ? `${deactivateTarget.project_id} deactivated.`
          : `${deactivateTarget.project_id} reactivated.`
      );
      setDeactivateTarget(null);
      fetchProjects();
    } catch {
      toast.error('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to delete project.');
        return;
      }
      toast.success('Project deleted successfully.');
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-primary">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#848C9B]" />
            <input
              type="text"
              placeholder="Search title, lead, tags, supervisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#D9E1EA] text-[#041128] placeholder-[#848C9B] focus:outline-none focus:border-[#041128]"
            />
          </div>

          {/* Dept filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl bg-white border border-[#D9E1EA] text-[#041128] focus:outline-none focus:border-[#041128]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
            ))}
          </select>
        </div>

        {/* Add Project CTA */}
        <button
          onClick={() => { setEditProject(null); setShowForm(true); }}
          className="btn-navy-pill !h-[44px] !px-5 !text-sm flex items-center gap-2 shrink-0"
        >
          <Plus size={16} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white/80 backdrop-blur-[20px] rounded-[26px] border border-white/85 overflow-hidden shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-[#848C9B]">
            <Loader2 size={20} className="animate-spin text-[#041128]" />
            <span>Loading exhibition projects...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#848C9B]">
            {search || filterDept ? 'No projects match your filter criteria.' : 'No projects found. Click "+ Add Project" to create one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D9E1EA] bg-[#FAF9F5]/70 text-xs uppercase tracking-wider text-[#848C9B]">
                  <th className="px-6 py-4 font-semibold">Project ID</th>
                  <th className="px-5 py-4 font-semibold">Title & Tags</th>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Team & Advisor</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1EA]/60 text-sm">
                {filtered.map((project) => {
                  const deptMeta = getDepartmentMeta(project.departments?.code);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-[#FAF9F5]/60 transition-colors"
                    >
                      {/* Project ID */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-xs text-[#041128] px-2.5 py-1 rounded-full bg-[#EDF4FC]">
                          {project.project_id}
                        </span>
                      </td>

                      {/* Title & Tags */}
                      <td className="px-5 py-4">
                        <div className="text-[#041128] font-semibold max-w-[260px] truncate">
                          {project.title}
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {project.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="text-[10px] text-[#848C9B] self-center">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'font-semibold text-xs px-2.5 py-1 rounded-full border',
                            deptMeta.badgeBg,
                            deptMeta.badgeText
                          )}
                          style={{ borderColor: deptMeta.border }}
                        >
                          {project.departments?.code ?? '—'}
                        </span>
                      </td>

                      {/* Team & Advisor */}
                      <td className="px-5 py-4">
                        <div className="text-[#041128] font-medium text-xs">
                          <span className="text-[#848C9B]">Lead:</span> {project.project_lead}
                        </div>
                        {project.team_members && project.team_members.length > 0 && (
                          <div className="text-[#5277A8] text-[11px] truncate max-w-[180px] mt-0.5">
                            <span className="text-[#848C9B]">Team:</span> {project.team_members.join(', ')}
                          </div>
                        )}
                        {project.project_supervisor && (
                          <div className="text-[#059669] text-[11px] truncate max-w-[180px] mt-0.5">
                            <span className="text-[#848C9B]">Advisor:</span> {project.project_supervisor}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                            project.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {project.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditProject(project); setShowForm(true); }}
                            className="p-2 rounded-lg text-[#41516B] hover:text-[#041128] hover:bg-[#EDF4FC] transition-colors cursor-pointer"
                            title="Edit project"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeactivateTarget(project)}
                            className={cn(
                              'p-2 rounded-lg transition-colors cursor-pointer',
                              project.is_active
                                ? 'text-[#848C9B] hover:text-amber-600 hover:bg-amber-50'
                                : 'text-[#848C9B] hover:text-green-600 hover:bg-green-50'
                            )}
                            title={project.is_active ? 'Deactivate project' : 'Reactivate project'}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(project)}
                            className="p-2 rounded-lg text-[#848C9B] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <ProjectFormModal
            project={editProject}
            departments={departments}
            onClose={() => { setShowForm(false); setEditProject(null); }}
            onSaved={() => { setShowForm(false); setEditProject(null); fetchProjects(); }}
          />
        )}
      </AnimatePresence>

      {/* Deactivate Dialog */}
      <AnimatePresence>
        {deactivateTarget && (
          <ConfirmDialog
            title={deactivateTarget.is_active ? `Deactivate ${deactivateTarget.project_id}?` : `Reactivate ${deactivateTarget.project_id}?`}
            description={
              deactivateTarget.is_active
                ? 'This project will be hidden from active voting and public gallery. Historical vote records will be safely preserved.'
                : 'This project will be restored to active voting and display.'
            }
            confirmLabel={deactivateTarget.is_active ? 'Deactivate' : 'Reactivate'}
            confirmClass={deactivateTarget.is_active ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-[#041128] text-white hover:bg-[#112244]'}
            loading={actionLoading}
            onConfirm={handleDeactivate}
            onCancel={() => setDeactivateTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title={`Delete ${deleteTarget.project_id}?`}
            description="Are you sure you want to permanently delete this project? Projects that have existing votes cannot be deleted to preserve voting integrity."
            confirmLabel="Delete Project"
            confirmClass="bg-red-600 text-white hover:bg-red-700"
            loading={actionLoading}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal Form with Team Members, Supervisor, Tags & Image Upload ──────────
interface ProjectFormModalProps {
  project: ProjectWithDept | null;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}

function ProjectFormModal({ project, departments, onClose, onSaved }: ProjectFormModalProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(project?.image_url ?? null);
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMb: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic chips states for Team Members & Tags
  const [teamMembers, setTeamMembers] = useState<string[]>(
    Array.isArray(project?.team_members) ? project.team_members : []
  );
  const [newMemberInput, setNewMemberInput] = useState('');

  const [tags, setTags] = useState<string[]>(
    Array.isArray(project?.tags) ? project.tags : []
  );
  const [newTagInput, setNewTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProjectSchemaInput>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: project
      ? {
          project_id: project.project_id,
          department_id: project.department_id,
          title: project.title,
          description: project.description ?? '',
          project_lead: project.project_lead,
          team_members: Array.isArray(project.team_members) ? project.team_members : [],
          project_supervisor: project.project_supervisor ?? '',
          tags: Array.isArray(project.tags) ? project.tags : [],
          image_url: project.image_url ?? '',
          is_active: project.is_active,
        }
      : {
          is_active: true,
          description: '',
          image_url: '',
          project_supervisor: '',
          team_members: [],
          tags: [],
        },
  });

  // Synchronize team_members and tags with React Hook Form
  useEffect(() => {
    setValue('team_members', teamMembers);
  }, [teamMembers, setValue]);

  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newMemberInput.trim();
    if (!clean) return;
    if (teamMembers.includes(clean)) {
      toast.error('Team member already added.');
      return;
    }
    setTeamMembers([...teamMembers, clean]);
    setNewMemberInput('');
  };

  const handleRemoveMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      toast.error('Tag already exists.');
      return;
    }
    setTags([...tags, clean]);
    setNewTagInput('');
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setFileMeta({
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    });

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Image upload failed. Please try again.');
        return;
      }

      setValue('image_url', json.data.url);
      toast.success('Image uploaded and linked successfully.');
    } catch {
      toast.error('Network error during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setLocalPreview(null);
    setFileMeta(null);
    setValue('image_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: ProjectSchemaInput) => {
    if (uploading) {
      toast.error('Please wait for the image upload to complete.');
      return;
    }

    try {
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';
      const method = project ? 'PATCH' : 'POST';

      const payload = {
        ...data,
        team_members: teamMembers,
        tags: tags,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to save project.');
        return;
      }

      toast.success(project ? 'Project updated successfully.' : 'Project created successfully.');
      onSaved();
    } catch {
      toast.error('Network error while saving project.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-primary">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#041128]/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative bg-white/95 backdrop-blur-[24px] rounded-[26px] border border-white/90 p-7 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_24px_60px_rgba(4,17,40,0.18)]"
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(4,17,40,0.06)]">
          <div>
            <h2 className="font-primary font-normal text-2xl text-[#041128]">
              {project ? 'Edit Exhibition Project' : 'Add Exhibition Project'}
            </h2>
            <p className="text-xs text-[#848C9B] mt-0.5">
              Enter project specifications, student leads, team members, supervisor, and tags.
            </p>
          </div>
          <button onClick={onClose} className="text-[#848C9B] hover:text-[#041128] p-1 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project ID & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Project ID *
              </label>
              <input
                {...register('project_id')}
                placeholder="e.g. GPP-01 or CSE-01"
                className="input-clean text-sm font-mono uppercase"
              />
              {errors.project_id && <p className="text-red-600 text-xs mt-1">{errors.project_id.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select {...register('department_id')} className="input-clean text-sm">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
              {errors.department_id && <p className="text-red-600 text-xs mt-1">{errors.department_id.message}</p>}
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input {...register('title')} placeholder="e.g. Smart Campus IoT Sensor Network" className="input-clean text-sm" />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Project Lead & Supervisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Project Lead (Student) *
              </label>
              <input {...register('project_lead')} placeholder="e.g. Rahul Kumar" className="input-clean text-sm" />
              {errors.project_lead && <p className="text-red-600 text-xs mt-1">{errors.project_lead.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Project Supervisor / Advisor
              </label>
              <input {...register('project_supervisor')} placeholder="e.g. Dr. K. Ramanathan" className="input-clean text-sm" />
              {errors.project_supervisor && <p className="text-red-600 text-xs mt-1">{errors.project_supervisor.message}</p>}
            </div>
          </div>

          {/* ── TEAM MEMBERS CHIPS INPUT ── */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#D9E1EA] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#041128] uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-[#5277A8]" />
                <span>Team Members</span>
              </label>
              <span className="text-[11px] text-[#848C9B]">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} added
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter team member name..."
                value={newMemberInput}
                onChange={(e) => setNewMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="input-clean text-xs flex-1 bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddMember()}
                className="px-4 py-2 rounded-xl bg-[#041128] text-white text-xs font-semibold hover:bg-[#112244] shrink-0"
              >
                Add Member
              </button>
            </div>

            {teamMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {teamMembers.map((member, mIdx) => (
                  <span
                    key={mIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9E1EA] text-xs text-[#041128] font-medium shadow-2xs"
                  >
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(mIdx)}
                      className="text-[#848C9B] hover:text-red-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── PROJECT TAGS CHIPS INPUT ── */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#D9E1EA] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#041128] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[#5277A8]" />
                <span>Project Tags</span>
              </label>
              <span className="text-[11px] text-[#848C9B]">
                {tags.length} tag{tags.length !== 1 ? 's' : ''} added
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AI, IoT, Healthcare, Embedded Systems..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="input-clean text-xs flex-1 bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-4 py-2 rounded-xl bg-[#041128] text-white text-xs font-semibold hover:bg-[#112244] shrink-0"
              >
                Add Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FC] border border-[#91A9C9]/50 text-xs text-[#041128] font-medium shadow-2xs"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tIdx)}
                      className="text-[#848C9B] hover:text-red-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Describe the problem, prototype, and engineering implementation..."
              rows={3}
              className="input-clean text-sm resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-2">
              Project Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="hidden"
            />

            {!localPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelect(f);
                }}
                className="rounded-2xl border-2 border-dashed border-[#D9E1EA] hover:border-[#5277A8] bg-[#FAF9F5] p-5 text-center cursor-pointer transition-all hover:bg-[#EDF4FC]/50 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#EDF4FC] group-hover:bg-[#041128] text-[#5277A8] group-hover:text-white flex items-center justify-center mx-auto mb-2 transition-colors">
                  <Upload size={16} />
                </div>
                <div className="text-sm font-semibold text-[#041128]">
                  Upload Project Image
                </div>
                <div className="text-xs text-[#848C9B] mt-0.5">
                  JPG, PNG or WEBP • Max 5 MB
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#D9E1EA] bg-[#FAF9F5] p-3.5 space-y-2.5">
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#EDF4FC] border border-[#D9E1EA]">
                  <Image
                    src={localPreview}
                    alt="Project preview"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="450px"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-[#041128]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                      <Loader2 size={24} className="animate-spin mb-1.5" />
                      <span className="text-xs font-semibold">Uploading image...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="truncate max-w-[200px] text-[#41516B] font-medium flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#5277A8] shrink-0" />
                    <span className="truncate">{fileMeta?.name ?? 'project-image.webp'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1 rounded-lg border border-[#D9E1EA] bg-white text-[#041128] font-semibold text-xs hover:bg-[#EDF4FC] transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploading}
                      className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgba(4,17,40,0.06)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="btn-navy-pill flex-1 !h-[48px] !text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : project ? (
                <span>Save Changes</span>
              ) : (
                <span>Create Project</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmClass,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-primary">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#041128]/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white/95 backdrop-blur-[24px] rounded-[26px] border border-white/90 p-6 sm:p-8 max-w-md w-full shadow-[0_24px_60px_rgba(4,17,40,0.18)] space-y-4"
      >
        <h3 className="font-primary font-normal text-2xl text-[#041128]">{title}</h3>
        <p className="text-sm text-[#41516B] leading-relaxed">{description}</p>
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary-pill flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 h-[48px] rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm',
              confirmClass
            )}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
