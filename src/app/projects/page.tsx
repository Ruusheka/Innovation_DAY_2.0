import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ProjectGrid } from '@/components/public/ProjectGrid';
import { createClient } from '@/lib/supabase/server';
import type { Department, Project } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Projects — BUILD CLUB SSN I FOUND',
  description: 'Browse all student projects at the SSN I FOUND project exhibition.',
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [projectsRes, deptsRes] = await Promise.all([
    supabase
      .from('projects')
      .select(`id, project_id, title, description, project_lead, image_url, department_id, is_active, created_at, updated_at, departments(id, name, code)`)
      .eq('is_active', true)
      .order('project_id', { ascending: true }),
    supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('code'),
  ]);

  const rawProjects = (projectsRes.data ?? []) as unknown as Array<
    Project & { departments: Department | null }
  >;
  const departments = (deptsRes.data ?? []) as Department[];

  const normalised = rawProjects.map((p) => ({
    ...p,
    department: p.departments ?? undefined,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page header */}
          <div className="mb-12" id="departments">
            <p className="text-[#91A9C9] text-xs font-medium tracking-[0.2em] uppercase mb-3">
              SSN I FOUND
            </p>
            <h1 className="text-white text-4xl sm:text-5xl font-bold">
              All Projects
            </h1>
            <p className="text-[#848C9B] mt-3 max-w-xl">
              {rawProjects.length} project{rawProjects.length !== 1 ? 's' : ''} across {departments.length} departments.
              Filter by department to explore.
            </p>
          </div>

          <ProjectGrid projects={normalised} departments={departments} />
        </div>
      </main>
      <Footer />
    </>
  );
}
