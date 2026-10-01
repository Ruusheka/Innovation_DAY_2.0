import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import { ArrowLeft, User, Building2, CheckCircle2 } from 'lucide-react';
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

  if (!data) return { title: 'Project Not Found' };
  return {
    title: `${data.title} (${projectId}) — BUILD CLUB SSN I FOUND`,
    description: data.description ?? `View details for project ${projectId}`,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select(`
      id, project_id, title, description, project_lead, image_url,
      department_id, is_active, created_at, updated_at,
      departments(id, name, code)
    `)
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();

  if (!data) notFound();

  const project = data as unknown as Project & { departments: Department | null };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 pt-[115px] sm:pt-[125px] pb-14">
        <PageContainer>
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#41516B] hover:text-[#041128] mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Projects</span>
          </Link>

          {/* Editorial Header */}
          <div className="mb-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-3.5">
              <span className="px-3 py-1 rounded-full bg-[#041128] text-white font-mono font-semibold text-xs tracking-wider">
                {project.project_id}
              </span>
              {project.departments && (
                <span className="px-3 py-1 rounded-full bg-[#EDF4FC] border border-[#91A9C9]/50 text-[#041128] font-sans font-semibold text-xs tracking-wide">
                  {project.departments.code} — {project.departments.name}
                </span>
              )}
            </div>

            <h1 className="font-display font-normal text-3xl sm:text-5xl lg:text-[54px] text-[#041128] tracking-tight leading-[1.08] m-0">
              {project.title}
            </h1>
          </div>

          {/* Asymmetric Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Content Column (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Project Image (16:10 aspect ratio) */}
              <div className="relative w-full aspect-[16/10] rounded-[22px] overflow-hidden bg-white border border-[#DDE5EE] shadow-[0_10px_30px_rgba(4,17,40,0.05)]">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF4FC] via-[#F5F8FC] to-[#DDE7F3] p-8 text-center relative">
                    <span className="text-[#5277A8] font-mono font-bold text-6xl mb-2">
                      {project.project_id}
                    </span>
                    <span className="text-sm font-sans font-medium text-[#848C9B]">
                      {project.departments?.name ?? 'SSN Engineering'}
                    </span>
                  </div>
                )}
              </div>

              {/* About Project Section */}
              <div className="card-white rounded-[22px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(4,17,40,0.02)]">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-5 h-[1.5px] bg-[#5277A8]" />
                  <h2 className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8] m-0">
                    ABOUT THE PROJECT
                  </h2>
                </div>

                <p className="font-sans text-[#3D5574] text-base sm:text-lg leading-[1.75] whitespace-pre-line">
                  {project.description ||
                    'This innovative engineering project was conceptualized and developed by SSN engineering students as part of the BUILD CLUB SSN I FOUND Project Exhibition.'}
                </p>
              </div>
            </div>

            {/* Right Meta Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[110px]">
              <div className="card-white rounded-[22px] p-7 sm:p-8 shadow-[0_4px_20px_rgba(4,17,40,0.03)] space-y-6">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#041128] pb-3 border-b border-[rgba(4,17,40,0.06)] m-0">
                  Project Details
                </h3>

                {/* Lead */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EDF4FC] flex items-center justify-center text-[#5277A8] shrink-0 mt-0.5">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-sans text-[#848C9B] font-medium">Project Lead</div>
                    <div className="text-[15.5px] font-sans font-semibold text-[#041128] mt-0.5">
                      {project.project_lead}
                    </div>
                  </div>
                </div>

                {/* Department */}
                {project.departments && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EDF4FC] flex items-center justify-center text-[#5277A8] shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-sans text-[#848C9B] font-medium">Department</div>
                      <div className="text-[15.5px] font-sans font-semibold text-[#041128] mt-0.5">
                        {project.departments.name} ({project.departments.code})
                      </div>
                    </div>
                  </div>
                )}

                {/* Exhibition Status */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-sans text-[#848C9B] font-medium">Exhibition Status</div>
                    <div className="text-[15.5px] font-sans font-semibold text-[#041128] mt-0.5">
                      Active Exhibit
                    </div>
                  </div>
                </div>

                {/* Registration Desk Note */}
                <div className="pt-4 border-t border-[rgba(4,17,40,0.06)]">
                  <div className="text-xs font-sans font-semibold text-[#041128]">
                    SSN I FOUND — BUILD CLUB
                  </div>
                  <div className="text-xs font-sans text-[#848C9B] mt-1 leading-relaxed">
                    Voting takes place at the physical registration desk by verified students.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
