import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { HeroSection } from '@/components/public/HeroSection';
import { FeaturedSection } from '@/components/public/FeaturedSection';
import { ProjectGrid } from '@/components/public/ProjectGrid';
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
      {/* ── 1. NAVBAR ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── 2. HERO SECTION ── */}
        <HeroSection />

        {/* ── 3. EXPLORE BY DEPARTMENT SECTION ── */}
        <section id="departments" className="py-16 sm:py-20 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-[1.5px] bg-[#91A9C9]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                    EXPLORE BY DEPARTMENT
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#041128] tracking-tight leading-tight">
                  Discover Projects Across Departments
                </h2>
              </div>

              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#041128] hover:text-[#41516B] transition-colors shrink-0"
              >
                <span>View All Projects</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Department tabs & Project gallery */}
            <ProjectGrid projects={normalised} departments={departments} />
          </div>
        </section>

        {/* ── 4. FEATURED PROJECTS CAROUSEL SECTION ── */}
        <FeaturedSection projects={normalised} />

        {/* ── 5. ABOUT SSN BUILD CLUB SECTION ── */}
        <section id="about" className="py-20 bg-[#FAF9F5] border-t border-[rgba(4,17,40,0.06)]">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="rounded-[24px] bg-white border border-[rgba(4,17,40,0.08)] p-8 sm:p-12 lg:p-16 shadow-[0_10px_30px_rgba(4,17,40,0.04)] grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-[1.5px] bg-[#91A9C9]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                    ABOUT THE EXHIBITION
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#041128] tracking-tight leading-snug">
                  Where Engineering Ideas Become Tangible Prototypes.
                </h2>
                <p className="mt-4 text-[#41516B] text-base sm:text-lg leading-relaxed">
                  BUILD CLUB at SSN College of Engineering fosters hands-on innovation, interdisciplinary collaboration, and real-world problem-solving across departments.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/projects"
                    className="btn-navy-pill text-sm"
                  >
                    <span>Browse All Projects</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  { number: '6+', label: 'Departments' },
                  { number: '30+', label: 'Active Projects' },
                  { number: '100+', label: 'Student Innovators' },
                  { number: '1', label: 'Shared Vision' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-[#FAF9F5] border border-[rgba(4,17,40,0.06)] text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-[#041128] tracking-tight">
                      {stat.number}
                    </div>
                    <div className="text-xs font-medium text-[#848C9B] mt-1 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 6. FOOTER ── */}
      <Footer />
    </div>
  );
}
