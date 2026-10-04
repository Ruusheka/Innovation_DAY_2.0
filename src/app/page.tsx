import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { HeroSection } from '@/components/public/HeroSection';
import { DepartmentMarquee } from '@/components/public/DepartmentMarquee';
import { PageContainer } from '@/components/ui/PageContainer';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Trophy, Layers, Sparkles } from 'lucide-react';
import type { Department, Project } from '@/types';
import { EventIntro } from '@/components/public/EventIntro';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
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
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] scroll-smooth font-primary">
      <EventIntro />
      {/* ── 1. FLOATING GLASS PILL NAVBAR ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── 2. HERO SECTION (#hero) ── */}
        <HeroSection />

        {/* ── 3. ABOUT SECTION (#about) ── */}
        <section id="about" className="py-20 sm:py-28 bg-[#F8F7F3] border-t border-[rgba(4,17,40,0.06)] relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 right-1/4 w-[450px] h-[450px] rounded-full bg-[#EDF4FC]/60 blur-3xl -z-10" />

          <PageContainer>
            {/* Header: Editorial Eyebrow + Heading */}
            <div className="max-w-3xl mb-12 sm:mb-16">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-[1.5px] bg-[#FF9D00]" />
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                  ABOUT BUILD CLUB &bull; LAKSHYA INNOVATION DAY
                </span>
              </div>
              <h2 className="font-normal text-3xl sm:text-5xl lg:text-[54px] text-[#041128] tracking-tight leading-[1.08] m-0">
                Building ideas. Engineering solutions. Creating impact.
              </h2>
              <p className="mt-5 text-[#3D5574] text-base sm:text-lg leading-relaxed">
                The Build Club × Lakshya Innovation Day Project Exhibition is a student-driven initiative hosted at SSN College of Engineering. We unite young engineers across all disciplines to solve tangible engineering challenges through hands-on fabrication and rapid prototyping.
              </p>
            </div>

            {/* 4 Feature Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                {
                  icon: Layers,
                  title: `${departments.length || 10} Disciplines`,
                  desc: 'Cross-functional engineering spanning CSE, IT, M.Tech CSE, ECE, EEE, MECH, CIVIL, CHEM, BME, and GPP.',
                },
                {
                  icon: Sparkles,
                  title: 'Hands-on Innovation',
                  desc: 'Working physical prototypes, algorithmic pipelines, hardware systems, and multi-disciplinary solutions.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Desk Verification',
                  desc: 'Physical ID card verification at voting desks ensures one student, one vote.',
                },
                {
                  icon: Trophy,
                  title: 'Real-time Leaderboard',
                  desc: 'Live exhibition tally showcasing top student innovations per department.',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-6 sm:p-7 shadow-[0_12px_40px_rgba(4,17,40,0.06)] hover:shadow-[0_16px_48px_rgba(4,17,40,0.1)] hover:border-[#91A9C9] transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-5 group-hover:bg-[#041128] group-hover:text-white transition-colors duration-300">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-semibold text-xl text-[#041128] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#41516B] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Exhibition Impact Banner */}
            <div className="rounded-[26px] bg-[#041128] text-white p-8 sm:p-12 lg:p-14 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center lg:text-left">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                  STUDENT PROJECT EXHIBITION
                </span>
                <h3 className="font-normal text-2xl sm:text-4xl text-white tracking-tight mt-2">
                  Discover What SSN Students Are Creating.
                </h3>
                <p className="text-sm sm:text-base text-[#FAF9F5]/75 mt-3 leading-relaxed">
                  Browse live prototypes, research demonstrations, and engineering hardware built by the next generation of engineers.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 sm:gap-10 shrink-0 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl text-white font-bold">
                    {departments.length > 0 ? departments.length : 10}
                  </div>
                  <div className="text-[11px] font-semibold text-[#91A9C9] uppercase tracking-wider mt-1">
                    Departments
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl text-white font-bold">
                    {normalised.length > 0 ? `${normalised.length}+` : '30+'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#91A9C9] uppercase tracking-wider mt-1">
                    Projects
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl text-white font-bold">100+</div>
                  <div className="text-[11px] font-semibold text-[#91A9C9] uppercase tracking-wider mt-1">
                    Innovators
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── 4. PROJECTS SECTION (#projects) ── */}
        <section id="projects" className="py-20 sm:py-28 bg-[#F8F7F3] border-t border-[rgba(4,17,40,0.06)]">
          <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-[1.5px] bg-[#5277A8]" />
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                    EXHIBITION SHOWCASE &bull; DEPARTMENT TRACKS
                  </span>
                </div>
                <h2 className="font-normal text-3xl sm:text-4xl lg:text-[44px] text-[#041128] tracking-tight leading-tight m-0">
                  Projects by Department
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#41516B] max-w-xl">
                  Each engineering department features an infinite showcase track moving in alternating directions. Hover over any card to pause the track and explore details.
                </p>
              </div>

              <Link
                href="/projects"
                className="btn-secondary-pill !h-[46px] !px-5 !text-xs shrink-0 self-start sm:self-end"
              >
                <span>Browse Project Directory</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </PageContainer>

          {/* Department-by-Department Alternating Infinite Horizontal Marquee */}
          <DepartmentMarquee projects={normalised} departments={departments} />
        </section>
      </main>

      {/* ── 5. GLOBAL FOOTER ── */}
      <Footer />
    </div>
  );
}
