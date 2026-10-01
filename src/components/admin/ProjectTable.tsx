'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Power, Loader2, AlertTriangle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { projectSchema, type ProjectSchemaInput } from '@/lib/validations/project';
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
  const [deactivating, setDeactivating] = useState(false);
  const [voteCount, setVoteCount] = useState<Record<string, number>>({});

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
      p.project_lead.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || p.department_id === filterDept;
    return matchSearch && matchDept;
  });

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      const res = await fetch(`/api/admin/projects/${deactivateTarget.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !deactivateTarget.is_active }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? 'Failed to update project status.');
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
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848C9B]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 py-2.5 text-sm w-full sm:w-64"
            />
          </div>
          {/* Dept filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="input-base py-2.5 text-sm w-full sm:w-44"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </div>
        {/* Add button */}
        <button
          onClick={() => { setEditProject(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#91A9C9] text-[#040411] font-semibold rounded-xl hover:opacity-90 transition-all text-sm whitespace-nowrap"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-[#848C9B]">
            <Loader2 size={18} className="animate-spin" />
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#848C9B]">
            {search || filterDept ? 'No projects match your search.' : 'No projects yet. Add one to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Title', 'Department', 'Lead', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[#848C9B] text-xs uppercase tracking-widest font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-[#91A9C9] font-mono text-xs font-medium">
                        {project.project_id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm font-medium max-w-[200px] truncate">
                        {project.title}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#848C9B] text-sm">
                        {project.departments?.code ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#848C9B] text-sm">{project.project_lead}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          project.is_active
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-white/5 text-[#848C9B] border border-white/10'
                        )}
                      >
                        {project.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditProject(project); setShowForm(true); }}
                          className="p-2 rounded-lg text-[#848C9B] hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeactivateTarget(project)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            project.is_active
                              ? 'text-[#848C9B] hover:text-red-400 hover:bg-red-400/5'
                              : 'text-[#848C9B] hover:text-green-400 hover:bg-green-400/5'
                          )}
                          title={project.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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

      {/* Deactivate Confirm */}
      <AnimatePresence>
        {deactivateTarget && (
          <ConfirmDialog
            title={deactivateTarget.is_active ? `Deactivate ${deactivateTarget.project_id}?` : `Reactivate ${deactivateTarget.project_id}?`}
            description={
              deactivateTarget.is_active
                ? 'This project will be removed from active voting. Historical vote records will be preserved.'
                : 'This project will be restored to active voting.'
            }
            confirmLabel={deactivateTarget.is_active ? 'Deactivate' : 'Reactivate'}
            confirmClass={deactivateTarget.is_active ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}
            loading={deactivating}
            onConfirm={handleDeactivate}
            onCancel={() => setDeactivateTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Project Form Modal ──────────────────────────────────────────────────────
interface ProjectFormModalProps {
  project: ProjectWithDept | null;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}

function ProjectFormModal({ project, departments, onClose, onSaved }: ProjectFormModalProps) {
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProjectSchemaInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          project_id: project.project_id,
          department_id: project.department_id,
          title: project.title,
          description: project.description ?? '',
          project_lead: project.project_lead,
          image_url: project.image_url ?? '',
          is_active: project.is_active,
        }
      : { is_active: true, description: '', image_url: '' },
  });

  const imageUrl = watch('image_url');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Upload failed.'); return; }
      setValue('image_url', json.data.url);
      toast.success('Image uploaded.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProjectSchemaInput) => {
    try {
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';
      const method = project ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Failed to save project.'); return; }
      toast.success(project ? 'Project updated.' : 'Project created.');
      onSaved();
    } catch {
      toast.error('Network error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">
            {project ? 'Edit Project' : 'Add Project'}
          </h2>
          <button onClick={onClose} className="text-[#848C9B] hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project ID" error={errors.project_id?.message}>
              <input
                {...register('project_id')}
                placeholder="P001"
                className="input-base text-sm font-mono uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            </Field>
            <Field label="Department" error={errors.department_id?.message}>
              <select {...register('department_id')} className="input-base text-sm">
                <option value="">Select...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Project Title" error={errors.title?.message}>
            <input {...register('title')} placeholder="Smart Campus" className="input-base text-sm" />
          </Field>

          <Field label="Project Lead" error={errors.project_lead?.message}>
            <input {...register('project_lead')} placeholder="Rahul Kumar" className="input-base text-sm" />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="Brief description of the project..."
              rows={3}
              className="input-base text-sm resize-none"
            />
          </Field>

          <Field label="Project Image">
            <div className="space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="text-sm text-[#848C9B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#91A9C9]/10 file:text-[#91A9C9] file:text-xs file:font-medium hover:file:bg-[#91A9C9]/20 transition-all cursor-pointer"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-[#848C9B]">
                  <Loader2 size={12} className="animate-spin" />
                  Uploading...
                </div>
              )}
              {imageUrl && (
                <div className="text-xs text-green-400 truncate">✓ Image set</div>
              )}
            </div>
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-[#848C9B] hover:text-white hover:border-white/20 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 py-3 rounded-xl bg-[#91A9C9] text-[#040411] font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" />Saving...</>
              ) : (
                project ? 'Save Changes' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Reusable form field ─────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-sm"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-[#848C9B] text-sm mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#848C9B] hover:text-white text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2', confirmClass)}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
