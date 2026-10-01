import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { HeroSection } from '@/components/public/HeroSection';
import { FeaturedSection } from '@/components/public/FeaturedSection';
import { ProjectGrid } from '@/components/public/ProjectGrid';
import { PageContainer } from '@/components/ui/PageContainer';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Department, Project } from '@/types';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
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
      {/* ── 1. GLOBAL NAVBAR ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── 2. HERO SECTION ── */}
        <HeroSection />

        {/* ── 3. EXPLORE BY DEPARTMENT SECTION ── */}
        <section id="departments" className="py-16 sm:py-20 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
          <PageContainer>
            {/* Header: Eyebrow + DM Serif Heading + View All link */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-[1.5px] bg-[#5277A8]" />
                  <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                    EXPLORE BY DEPARTMENT
                  </span>
                </div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl lg:text-[42px] text-[#041128] tracking-tight leading-tight m-0">
                  Discover Projects Across Departments
                </h2>
              </div>

              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#041128] hover:text-[#5277A8] transition-colors shrink-0"
              >
                <span>View All Projects</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Department selector + Project gallery */}
            <ProjectGrid projects={normalised} departments={departments} />
          </PageContainer>
        </section>

        {/* ── 4. FEATURED PROJECTS CAROUSEL SECTION ── */}
        <FeaturedSection projects={normalised} />

        {/* ── 5. ABOUT SSN BUILD CLUB SECTION ── */}
        <section id="about" className="py-20 sm:py-24 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
          <PageContainer>
            <div className="rounded-[24px] bg-white border border-[#DDE5EE] p-8 sm:p-12 lg:p-16 shadow-[0_10px_30px_rgba(4,17,40,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-[1.5px] bg-[#5277A8]" />
                  <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                    ABOUT THE EXHIBITION
                  </span>
                </div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl lg:text-[40px] text-[#041128] tracking-tight leading-snug m-0">
                  Where Engineering Ideas Become Tangible Prototypes.
                </h2>
                <p className="mt-4 font-sans text-[#3D5574] text-base sm:text-lg leading-relaxed">
                  BUILD CLUB at SSN College of Engineering fosters hands-on innovation, cross-departmental collaboration, and real-world problem-solving across engineering disciplines.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/projects"
                    className="btn-navy-pill !h-[50px] !text-sm"
                  >
                    <span>Browse All Projects</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  { number: '5', label: 'Departments' },
                  { number: `${normalised.length > 0 ? normalised.length : '30'}+`, label: 'Exhibition Projects' },
                  { number: '100+', label: 'Student Innovators' },
                  { number: '1', label: 'Shared Vision' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-5 sm:p-6 rounded-2xl bg-[#FAF9F5] border border-[rgba(4,17,40,0.06)] text-center"
                  >
                    <div className="font-display text-3xl sm:text-4xl font-normal text-[#041128] tracking-tight">
                      {stat.number}
                    </div>
                    <div className="text-[11px] font-sans font-semibold text-[#848C9B] mt-1 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      {/* ── 6. GLOBAL FOOTER ── */}
      <Footer />
    </div>
  );
}
