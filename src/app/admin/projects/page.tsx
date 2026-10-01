import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canManageProjects } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { ProjectTable } from '@/components/admin/ProjectTable';
import type { Department } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (!canManageProjects(session.admin.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">You do not have permission to manage projects.</p>
      </div>
    );
  }

  const supabase = createServiceClient();
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .eq('is_active', true)
    .order('code');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Projects</h1>
        <p className="text-[#848C9B] text-sm mt-1">
          Manage exhibition projects. Add, edit, or deactivate projects.
        </p>
      </div>

      <ProjectTable departments={(departments ?? []) as Department[]} />
    </div>
  );
}
