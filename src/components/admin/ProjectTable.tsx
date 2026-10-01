'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Power, Loader2, AlertTriangle, X, Upload } from 'lucide-react';
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
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#848C9B]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[rgba(4,17,40,0.12)] text-[#041128] placeholder-[#848C9B] focus:outline-none focus:border-[#041128]"
            />
          </div>

          {/* Dept filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl bg-white border border-[rgba(4,17,40,0.12)] text-[#041128] focus:outline-none focus:border-[#041128]"
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
          className="flex items-center gap-2 px-6 py-2.5 bg-[#041128] text-white font-semibold rounded-xl hover:bg-[#112244] transition-all text-sm cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[22px] border border-[rgba(4,17,40,0.08)] overflow-hidden shadow-[0_4px_20px_rgba(4,17,40,0.02)]">
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
                <tr className="border-b border-[rgba(4,17,40,0.06)] bg-[#FAF9F5] text-xs uppercase tracking-wider text-[#848C9B]">
                  <th className="px-6 py-4 font-semibold">Project ID</th>
                  <th className="px-5 py-4 font-semibold">Title</th>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Project Lead</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(4,17,40,0.04)] text-sm">
                {filtered.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-[#FAF9F5] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-[#041128] px-2.5 py-1 rounded bg-[#EBF1F8]">
                        {project.project_id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[#041128] font-semibold max-w-[240px] truncate">
                        {project.title}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#41516B] font-medium text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {project.departments?.code ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#41516B] font-medium">
                      {project.project_lead}
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditProject(project); setShowForm(true); }}
                          className="p-2 rounded-lg text-[#41516B] hover:text-[#041128] hover:bg-[#EBF1F8] transition-colors cursor-pointer"
                          title="Edit project"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeactivateTarget(project)}
                          className={cn(
                            'p-2 rounded-lg transition-colors cursor-pointer',
                            project.is_active
                              ? 'text-[#848C9B] hover:text-red-600 hover:bg-red-50'
                              : 'text-[#848C9B] hover:text-green-600 hover:bg-green-50'
                          )}
                          title={project.is_active ? 'Deactivate project' : 'Reactivate project'}
                        >
                          <Power size={15} />
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

      {/* Deactivate Warning Dialog */}
      <AnimatePresence>
        {deactivateTarget && (
          <ConfirmDialog
            title={deactivateTarget.is_active ? `Deactivate ${deactivateTarget.project_id}?` : `Reactivate ${deactivateTarget.project_id}?`}
            description={
              deactivateTarget.is_active
                ? 'This project will be removed from active voting and exhibition display. Historical vote records will be safely preserved.'
                : 'This project will be restored to active voting and display.'
            }
            confirmLabel={deactivateTarget.is_active ? 'Deactivate' : 'Reactivate'}
            confirmClass={deactivateTarget.is_active ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#041128] text-white hover:bg-[#112244]'}
            loading={deactivating}
            onConfirm={handleDeactivate}
            onCancel={() => setDeactivateTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal Form ──────────────────────────────────────────────────────────────
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
      toast.success('Image uploaded successfully.');
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative bg-white rounded-[24px] border border-[rgba(4,17,40,0.1)] p-7 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(4,17,40,0.06)]">
          <h2 className="text-[#041128] font-bold text-xl">
            {project ? 'Edit Project' : 'Add Exhibition Project'}
          </h2>
          <button onClick={onClose} className="text-[#848C9B] hover:text-[#041128] p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Project ID
              </label>
              <input
                {...register('project_id')}
                placeholder="P001"
                className="input-clean text-sm font-mono uppercase"
              />
              {errors.project_id && <p className="text-red-600 text-xs mt-1">{errors.project_id.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select {...register('department_id')} className="input-clean text-sm">
                <option value="">Select...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code}</option>
                ))}
              </select>
              {errors.department_id && <p className="text-red-600 text-xs mt-1">{errors.department_id.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
              Project Title
            </label>
            <input {...register('title')} placeholder="Smart Campus IoT Hub" className="input-clean text-sm" />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
              Project Lead (Student)
            </label>
            <input {...register('project_lead')} placeholder="Rahul Kumar" className="input-clean text-sm" />
            {errors.project_lead && <p className="text-red-600 text-xs mt-1">{errors.project_lead.message}</p>}
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-1.5">
              Project Image (Supabase Storage)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="text-xs text-[#848C9B] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#EBF1F8] file:text-[#041128] file:text-xs file:font-semibold hover:file:bg-[#DCE6F2] transition-all cursor-pointer"
            />
            {uploading && <p className="text-xs text-[#848C9B] mt-1">Uploading image...</p>}
            {imageUrl && <p className="text-xs text-green-700 mt-1">✓ Image linked successfully</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[rgba(4,17,40,0.06)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[rgba(4,17,40,0.12)] text-[#41516B] font-semibold text-sm hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 py-3 rounded-xl bg-[#041128] text-white font-semibold text-sm hover:bg-[#112244] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : project ? 'Save Changes' : 'Create Project'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-[22px] p-7 w-full max-w-sm border border-[rgba(4,17,40,0.1)] shadow-2xl"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-[#041128]">{title}</h3>
            <p className="text-xs text-[#41516B] mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[rgba(4,17,40,0.12)] text-[#41516B] text-xs font-semibold hover:bg-[#FAF9F5] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn('flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2', confirmClass)}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
