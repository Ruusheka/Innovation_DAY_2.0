import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ProjectGrid } from '@/components/public/ProjectGrid';
import { createClient } from '@/lib/supabase/server';
import type { Department, Project } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'All Projects — BUILD CLUB SSN I FOUND',
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 pt-[110px] sm:pt-[130px] pb-24">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-[1.5px] bg-[#91A9C9]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                EXHIBITION DIRECTORY
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-[#041128] tracking-tight">
              All Projects
            </h1>
            <p className="mt-3 text-[#41516B] text-base max-w-xl">
              Explore {rawProjects.length} innovative student project{rawProjects.length !== 1 ? 's' : ''} developed across {departments.length} engineering departments.
            </p>
          </div>

          {/* Grid + Filter */}
          <ProjectGrid projects={normalised} departments={departments} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
