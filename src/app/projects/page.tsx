import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ProjectGrid } from '@/components/public/ProjectGrid';
import { PageContainer } from '@/components/ui/PageContainer';
import { createClient } from '@/lib/supabase/server';
import type { Department, Project } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Explore Projects — BUILD CLUB SSN Innovation Day',
  description: 'Browse all student engineering projects at the SSN Innovation Day project exhibition.',
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [projectsRes, deptsRes] = await Promise.all([
    supabase
      .from('projects')
      .select(`
        id, project_id, title, description, project_lead, team_members, project_supervisor, tags, image_url,
        department_id, is_active, created_at, updated_at,
        departments(id, name, code, color, accent_color)
      `)
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
    team_members: Array.isArray(p.team_members) ? p.team_members : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    department: p.departments ?? undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-primary">
      <Navbar />

      <main className="flex-1 pt-[115px] sm:pt-[125px] pb-16">
        <PageContainer>
          {/* Page Hero Header with Stats */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16 pb-8 border-b border-[rgba(4,17,40,0.06)]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-[1.5px] bg-[#5277A8]" />
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                  OUR PROJECTS &amp; TEAMS
                </span>
              </div>
              <h1 className="font-normal text-4xl sm:text-5xl lg:text-6xl text-[#041128] tracking-tight leading-tight m-0">
                Explore Innovative Projects
              </h1>
              <p className="mt-3.5 text-[#3D5574] text-base sm:text-lg leading-relaxed font-normal">
                Discover the creative and technical solutions built by talented students across various engineering departments and disciplines.
              </p>
            </div>

            {/* Right-Side Real Stats */}
            <div className="flex items-center gap-6 sm:gap-10 shrink-0">
              <div>
                <div className="text-3xl sm:text-4xl text-[#041128] font-bold">
                  {normalised.length}
                </div>
                <div className="text-[11.5px] font-semibold text-[#848C9B] uppercase tracking-wider mt-0.5">
                  Total Projects
                </div>
              </div>

              <div className="w-[1px] h-10 bg-[#D9E1EA]" />

              <div>
                <div className="text-3xl sm:text-4xl text-[#041128] font-bold">
                  {departments.length}
                </div>
                <div className="text-[11.5px] font-semibold text-[#848C9B] uppercase tracking-wider mt-0.5">
                  Departments
                </div>
              </div>

              <div className="w-[1px] h-10 bg-[#D9E1EA]" />

              <div>
                <div className="text-3xl sm:text-4xl text-[#041128] font-bold">
                  {normalised.length * 3}+
                </div>
                <div className="text-[11.5px] font-semibold text-[#848C9B] uppercase tracking-wider mt-0.5">
                  Contributors
                </div>
              </div>
            </div>
          </div>

          {/* Grid + Filter Area */}
          <ProjectGrid projects={normalised} departments={departments} />
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
