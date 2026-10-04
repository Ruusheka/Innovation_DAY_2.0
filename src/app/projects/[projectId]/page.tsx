import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import { BackToProjectsButton } from '@/components/public/BackButton';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { User, Users, GraduationCap, Building2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import type { Project, Department } from '@/types';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('title, description')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();

  if (!data) return { title: 'Project Not Found | Build Club Innovation Day' };
  return {
    title: `${data.title} | Build Club Innovation Day`,
    description: data.description ?? `Explore ${data.title} at Build Club Innovation Day, SSN College of Engineering.`,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select(`
      id, project_id, title, description, project_lead, team_members, project_supervisor, tags, image_url,
      department_id, is_active, created_at, updated_at,
      departments(id, name, code, color, accent_color)
    `)
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();

  if (!data) notFound();

  const project = data as unknown as Project & { departments: Department | null };
  const deptCode = project.departments?.code;
  const deptMeta = getDepartmentMeta(deptCode);

  const teamMembers = Array.isArray(project.team_members) ? project.team_members.filter(Boolean) : [];
  const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
  const supervisor = project.project_supervisor;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] font-primary">
      <Navbar />

      <main className="flex-1 pt-[105px] sm:pt-[118px] pb-16">
        <PageContainer>
          {/* ── 1. WORKING BACK BUTTON ── */}
          <div className="mb-6 sm:mb-8">
            <BackToProjectsButton />
          </div>

          {/* ── 2. COMPACT EDITORIAL HEADER: TITLE + DEPARTMENT + TAGS ── */}
          <div className="max-w-4xl mb-6">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-[#041128] text-white text-xs font-normal tracking-wider font-mono">
                {project.project_id}
              </span>

              {project.departments && (
                <span
                  className="px-3.5 py-1 rounded-full border text-xs font-semibold tracking-wide"
                  style={{
                    backgroundColor: deptMeta.badgeBg.includes('#') ? deptMeta.badgeBg : '#EDF4FC',
                    borderColor: deptMeta.border,
                    color: deptMeta.primary,
                  }}
                >
                  {project.departments.code} &bull; {project.departments.name}
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Exhibition Entry</span>
              </span>
            </div>

            <h1 className="font-normal text-3xl sm:text-4xl lg:text-5xl text-[#041128] tracking-tight leading-[1.12] m-0">
              {project.title}
            </h1>

            {/* Project Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#D9E1EA] text-xs text-[#041128] font-medium shadow-2xs"
                  >
                    <Tag size={12} className="text-[#5277A8]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. MAIN SECTION: IMAGE + DETAILS SIDE-BY-SIDE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
            
            {/* Left: Project Image */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[16/10] max-h-[400px] rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-[20px] border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
                <ProjectImage
                  src={project.image_url}
                  alt={`${project.title} - Build Club Innovation Day exhibition project`}
                  deptCode={deptCode}
                  deptName={project.departments?.name}
                  projectId={project.project_id}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/35 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Key Details Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[24px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-6 sm:p-7 shadow-[0_12px_40px_rgba(4,17,40,0.06)] space-y-5">
                <h3 className="text-xs uppercase tracking-widest text-[#5277A8] font-semibold pb-3 border-b border-[rgba(4,17,40,0.06)] m-0">
                  Project Leadership &amp; Team
                </h3>

                {/* Lead */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center shrink-0 mt-0.5">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-[#848C9B] font-medium uppercase tracking-wider">Project Lead</div>
                    <div className="text-base text-[#041128] font-semibold mt-0.5">
                      {project.project_lead}
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {teamMembers.length > 0 && (
                  <div className="flex items-start gap-3.5 pt-2 border-t border-[rgba(4,17,40,0.06)]">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center shrink-0 mt-0.5">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-[#848C9B] font-medium uppercase tracking-wider">Team Members</div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {teamMembers.map((member, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#D9E1EA] text-xs font-medium text-[#041128]"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Supervisor / Advisor */}
                {supervisor && (
                  <div className="flex items-start gap-3.5 pt-2 border-t border-[rgba(4,17,40,0.06)]">
                    <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-[#848C9B] font-medium uppercase tracking-wider">Project Supervisor / Advisor</div>
                      <div className="text-base text-[#041128] font-semibold mt-0.5">
                        {supervisor}
                      </div>
                    </div>
                  </div>
                )}

                {/* Department */}
                {project.departments && (
                  <div className="flex items-start gap-3.5 pt-2 border-t border-[rgba(4,17,40,0.06)]">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-[#848C9B] font-medium uppercase tracking-wider">Department</div>
                      <div className="text-sm text-[#041128] font-semibold mt-0.5">
                        {project.departments.name} ({project.departments.code})
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Desk Verification Note */}
                <div className="pt-2 flex items-center gap-2.5 text-xs text-[#848C9B] border-t border-[rgba(4,17,40,0.06)]">
                  <ShieldCheck size={15} className="text-[#5277A8] shrink-0" />
                  <span>Physical voting verified at registration desks.</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── 4. CONTINUOUS READABLE PROJECT DESCRIPTION ── */}
          <div className="rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-7 sm:p-10 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8] m-0">
                PROJECT OVERVIEW &amp; TECHNICAL SPECIFICATIONS
              </h2>
            </div>

            <div className="text-[#3D5574] text-base sm:text-lg leading-[1.75] font-normal">
              <p className="whitespace-pre-line m-0">
                {project.description ||
                  'This innovative engineering project was conceptualized, designed, and developed by SSN engineering students as part of the BUILD CLUB SSN Innovation Day Project Exhibition.'}
              </p>
            </div>
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
